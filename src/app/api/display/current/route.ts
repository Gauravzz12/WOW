import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const now = new Date()
  const nowIso = now.toISOString()

  // ── Housekeeping: auto-expire PENDING_PAYMENT messages older than 30 min ──
  await supabaseAdmin
    .from('messages')
    .update({ status: 'REMOVED' })
    .eq('status', 'PENDING_PAYMENT')
    .lt('created_at', new Date(now.getTime() - 30 * 60 * 1000).toISOString())

  // ── 1. Check if there's a currently ACTIVE message ──
  const { data: activeMessage } = await supabaseAdmin
    .from('messages')
    .select('id, content, actual_start, scheduled_start, scheduled_end, is_reserved_slot, style_config, category:categories(slug, name, base_duration)')
    .eq('status', 'ACTIVE')
    .single()

  let shouldFindNext = false

  if (activeMessage) {
    const categoryData = Array.isArray(activeMessage.category) ? activeMessage.category[0] : activeMessage.category
    const config = typeof activeMessage.style_config === 'string' ? JSON.parse(activeMessage.style_config || '{}') : (activeMessage.style_config || {})
    const durationSecs = activeMessage.is_reserved_slot && activeMessage.scheduled_end && activeMessage.scheduled_start
      ? Math.max(0, Math.floor((new Date(activeMessage.scheduled_end).getTime() - new Date(activeMessage.scheduled_start).getTime()) / 1000))
      : (config.durationSecs || categoryData?.base_duration || (activeMessage.is_reserved_slot ? 10800 : 3600))
    const startTime = activeMessage.actual_start ? new Date(activeMessage.actual_start).getTime() : now.getTime()
    const endTime = activeMessage.is_reserved_slot && activeMessage.scheduled_end
      ? new Date(activeMessage.scheduled_end).getTime()
      : startTime + durationSecs * 1000

    if (now.getTime() >= endTime) {
      // Message time has expired
      await supabaseAdmin
        .from('messages')
        .update({ status: 'COMPLETED', actual_end: nowIso })
        .eq('id', activeMessage.id)

      // Also mark the reserved slot as completed if it was one
      if (activeMessage.is_reserved_slot) {
        await supabaseAdmin
          .from('reserved_slots')
          .update({ status: 'AVAILABLE' })
          .eq('message_id', activeMessage.id)
      }

      shouldFindNext = true
    } else {
      return NextResponse.json({
        message: {
          ...activeMessage,
          category: categoryData,
          durationSecs,
        }
      })
    }
  } else {
    shouldFindNext = true
  }

  if (shouldFindNext) {
    // ── 2. Check for a VIP reserved slot whose time has come ──
    const { data: vipSlots } = await supabaseAdmin
      .from('reserved_slots')
      .select('id, message_id, scheduled_start, scheduled_end')
      .eq('status', 'BOOKED')
      .lte('scheduled_start', nowIso)
      .gte('scheduled_end', nowIso)
      .order('bid_amount', { ascending: false }) // highest bid wins if multiple
      .limit(1)

    if (vipSlots && vipSlots.length > 0) {
      const vipSlot = vipSlots[0]

      // Activate the VIP message
      const { data: vipMessage } = await supabaseAdmin
        .from('messages')
        .update({ status: 'ACTIVE', actual_start: nowIso })
        .eq('id', vipSlot.message_id)
        .eq('status', 'QUEUED') // only activate if still queued (safety)
        .select('id, content, style_config, category:categories(slug, name, base_duration)')
        .single()

      if (vipMessage) {
        const categoryData = Array.isArray(vipMessage.category) ? vipMessage.category[0] : vipMessage.category
        const vipConfig = typeof vipMessage.style_config === 'string' ? JSON.parse(vipMessage.style_config || '{}') : (vipMessage.style_config || {})
        const durationSecs = vipConfig.durationSecs || 10800
        return NextResponse.json({
          message: {
            ...vipMessage,
            category: categoryData,
            actual_start: nowIso,
            durationSecs,
            isSpecialMoment: true,
          }
        })
      }
    }

    // ── 3. Pop next standard QUEUED message ──
    const { data: queuedMessages } = await supabaseAdmin
      .from('messages')
      .select('id, content, user_id, style_config, category:categories(slug, name, base_duration)')
      .eq('status', 'QUEUED')
      .eq('is_reserved_slot', false) // Exclude reserved slot messages from standard queue pop
      .order('bid_amount', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)

    if (queuedMessages && queuedMessages.length > 0) {
      const nextMessage = queuedMessages[0]
      const categoryData = Array.isArray(nextMessage.category) ? nextMessage.category[0] : nextMessage.category
      const nextConfig = typeof nextMessage.style_config === 'string' ? JSON.parse(nextMessage.style_config || '{}') : (nextMessage.style_config || {})
      const durationSecs = nextConfig.durationSecs || (categoryData as any)?.base_duration || 3600

      await supabaseAdmin
        .from('messages')
        .update({ status: 'ACTIVE', actual_start: nowIso })
        .eq('id', nextMessage.id)

      // Try to send email for non-anonymous messages
      if (nextMessage.user_id) {
        try {
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(nextMessage.user_id)
          if (userData?.user?.email) {
            const { sendLiveNotificationEmail } = await import('@/lib/email')
            await sendLiveNotificationEmail(userData.user.email, nextMessage.content)
          }
        } catch (err) {
          console.error('Failed to send live notification:', err)
        }
      }

      return NextResponse.json({
        message: {
          id: nextMessage.id,
          content: nextMessage.content,
          style_config: nextMessage.style_config,
          actual_start: nowIso,
          category: categoryData,
          durationSecs,
          isSpecialMoment: false,
        }
      })
    }
  }

  return NextResponse.json({ message: null })
}
