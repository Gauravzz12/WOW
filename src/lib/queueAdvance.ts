import { getSupabaseAdmin } from './supabase/admin'
import { getMessageEndTimeMs } from './messageExpiry'

const supabaseAdmin = getSupabaseAdmin()

import { sendLiveNotificationEmail } from './email'

async function sendReminderEmail(to: string, messageContent: string, messageId?: string) {
  try {
    await sendLiveNotificationEmail(to, messageContent, messageId)
  } catch (e) {
    console.error('[advance] Failed to send reminder email:', e)
  }
}

export async function runQueueAdvance() {
  const now = new Date()
  const nowIso = now.toISOString()

  // 0. Expire PENDING_PAYMENT messages older than 12 hours (waiting room cleanup)
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString()
  const { data: expiredWaiting } = await supabaseAdmin
    .from('messages')
    .update({ status: 'EXPIRED' })
    .eq('status', 'PENDING_PAYMENT')
    .lt('created_at', twelveHoursAgo)
    .select('id')

  // 1. Check all ACTIVE messages and mark them COMPLETED if expired
  const { data: activeMessages } = await supabaseAdmin
    .from('messages')
    .select('id, actual_start, scheduled_start, scheduled_end, is_reserved_slot, style_config, content, reminder_email, category:categories(slug, name, base_duration), bid_amount')
    .eq('status', 'ACTIVE')

  const currentActives = {
    normal: 0,
    special: 0,
    sponsored: 0,
  }

  if (activeMessages) {
    // Fetch leaderboard once to check top 50 liked posts
    const { data: leaderboard } = await supabaseAdmin.rpc('get_leaderboard')
    const top50Ids = new Set((leaderboard || []).map((m: any) => m.id))

    for (const msg of activeMessages) {
      const endTime = getMessageEndTimeMs(msg as any, now.getTime())

      if (now.getTime() >= endTime) {
        // Message time has expired

        // Always delete comments when post time is over
        await supabaseAdmin.from('comments').delete().eq('message_id', msg.id)

        if (top50Ids.has(msg.id)) {
          // Retain post if in top 50 liked posts
          await supabaseAdmin
            .from('messages')
            .update({ status: 'COMPLETED', actual_end: nowIso })
            .eq('id', msg.id)
            .eq('status', 'ACTIVE') // Atomic guard: only complete if still active
        } else {
          // Otherwise, delete the post entirely
          await supabaseAdmin
            .from('messages')
            .delete()
            .eq('id', msg.id)
            .eq('status', 'ACTIVE')
        }

        // Release the reserved slot only if its window is still in the
        // future. Past slots stay BOOKED (history) so they can never be
        // re-booked for elapsed time.
        if (msg.is_reserved_slot) {
          const slotEnd = msg.scheduled_end ? new Date(msg.scheduled_end).getTime() : 0
          if (slotEnd > now.getTime()) {
            await supabaseAdmin
              .from('reserved_slots')
              .update({ status: 'AVAILABLE' })
              .eq('message_id', msg.id)
          }
        }
      } else {
        // Still active — categorize using same thresholds as client (>= 10 = normal, < 10 = sponsored)
        if (msg.is_reserved_slot) {
          currentActives.special++
        } else if (msg.bid_amount < 10) {
          currentActives.sponsored++
        } else {
          currentActives.normal++
        }
      }
    }
  }

  // 2. Promote next queued messages if slots are empty
  const promoted: string[] = []

  // Normal Queue Promotion — highest bid wins, then FIFO for ties
  if (currentActives.normal === 0) {
    // Re-verify that no active normal message exists before promoting (concurrency guard)
    const { data: latestActiveNormal } = await supabaseAdmin
      .from('messages')
      .select('id')
      .eq('status', 'ACTIVE')
      .eq('is_reserved_slot', false)
      .gte('bid_amount', 10)
      .limit(1)

    if (!latestActiveNormal || latestActiveNormal.length === 0) {
      const { data: topNormal } = await supabaseAdmin
        .from('messages')
        .select('id, style_config, content, reminder_email')
        .eq('status', 'QUEUED')
        .eq('is_reserved_slot', false)
        .gte('bid_amount', 10)
        .order('bid_amount', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(1)

      if (topNormal && topNormal.length > 0) {
        // Atomic promotion: only succeeds if message is still strictly QUEUED
        const { data: updated } = await supabaseAdmin
          .from('messages')
          .update({ status: 'ACTIVE', actual_start: nowIso })
          .eq('id', topNormal[0].id)
          .eq('status', 'QUEUED')
          .select('id')

        if (updated && updated.length > 0) {
          promoted.push(topNormal[0].id)
          currentActives.normal = 1

          // Send reminder email if the user opted in (private column; legacy style_config fallback)
          const cfg = typeof topNormal[0].style_config === 'string' 
            ? JSON.parse(topNormal[0].style_config || '{}') 
            : (topNormal[0].style_config || {})
          const reminderTo = (topNormal[0] as any).reminder_email || cfg.reminderEmail
          if (reminderTo) {
            await sendReminderEmail(reminderTo, topNormal[0].content || '', topNormal[0].id)
          }
        }
      }
    }
  }

  // Sponsored Queue Promotion — bid < 10 threshold, FIFO order (up to 10 active at once in grid)
  if (currentActives.sponsored < 10) {
    // Re-verify the live count first (concurrency guard, mirrors normal/VIP):
    // two overlapping runs must not both promote up to the cap.
    const { data: latestActiveSponsored } = await supabaseAdmin
      .from('messages')
      .select('id')
      .eq('status', 'ACTIVE')
      .eq('is_reserved_slot', false)
      .lt('bid_amount', 10)
      .limit(10)

    const liveSponsored = latestActiveSponsored?.length ?? currentActives.sponsored
    const needed = 10 - liveSponsored
    if (needed > 0) {
    const { data: topSponsored } = await supabaseAdmin
      .from('messages')
      .select('id, style_config, content, reminder_email')
      .eq('status', 'QUEUED')
      .eq('is_reserved_slot', false)
      .lt('bid_amount', 10)
      .order('created_at', { ascending: true })
      .limit(needed)

    if (topSponsored && topSponsored.length > 0) {
      for (const sm of topSponsored) {
        // Atomic promotion guard
        const { data: updated } = await supabaseAdmin
          .from('messages')
          .update({ status: 'ACTIVE', actual_start: nowIso })
          .eq('id', sm.id)
          .eq('status', 'QUEUED')
          .select('id')

        if (updated && updated.length > 0) {
          promoted.push(sm.id)
          currentActives.sponsored++

          // Send reminder email if opted in
          const cfg = typeof sm.style_config === 'string' 
            ? JSON.parse(sm.style_config || '{}') 
            : (sm.style_config || {})
          const reminderTo = (sm as any).reminder_email || cfg.reminderEmail
          if (reminderTo) {
            await sendReminderEmail(reminderTo, sm.content || '', sm.id)
          }
        }
      }
    }
    }
  }

  // VIP Special Queue Promotion
  // 1. Expire any queued VIP slots whose scheduled end time has already elapsed.
  //    Their slots intentionally stay BOOKED (never re-released for elapsed
  //    time); only future-windowed releases happen on the ACTIVE path above.
  const { data: expiredVip } = await supabaseAdmin
    .from('messages')
    .update({ status: 'EXPIRED' })
    .eq('status', 'QUEUED')
    .eq('is_reserved_slot', true)
    .lte('scheduled_end', nowIso)
    .select('id, scheduled_end')

  if (expiredVip && expiredVip.length > 0) {
    const releasable = expiredVip
      .filter((m: any) => m.scheduled_end && new Date(m.scheduled_end).getTime() > now.getTime())
      .map((m: any) => m.id)
    if (releasable.length > 0) {
      await supabaseAdmin
        .from('reserved_slots')
        .update({ status: 'AVAILABLE' })
        .in('message_id', releasable)
        .eq('status', 'BOOKED')
    }
  }

  if (!currentActives.special) {
    const { data: latestActiveVip } = await supabaseAdmin
      .from('messages')
      .select('id')
      .eq('status', 'ACTIVE')
      .eq('is_reserved_slot', true)
      .limit(1)

    if (!latestActiveVip || latestActiveVip.length === 0) {
      // Only promote if scheduled time has arrived and slot has not yet ended
      const { data: topVip } = await supabaseAdmin
        .from('messages')
        .select('id, style_config, content, reminder_email, scheduled_start, scheduled_end')
        .eq('status', 'QUEUED')
        .eq('is_reserved_slot', true)
        .lte('scheduled_start', nowIso)
        .or(`scheduled_end.is.null,scheduled_end.gt.${nowIso}`)
        .order('scheduled_start', { ascending: true })
        .limit(1)

      if (topVip && topVip.length > 0) {
        // Atomic promotion guard
        const { data: updated } = await supabaseAdmin
          .from('messages')
          .update({ status: 'ACTIVE', actual_start: nowIso })
          .eq('id', topVip[0].id)
          .eq('status', 'QUEUED')
          .select('id')

        if (updated && updated.length > 0) {
          promoted.push(topVip[0].id)
          currentActives.special = 1

          // Send reminder email if opted in
          const cfg = typeof topVip[0].style_config === 'string' 
            ? JSON.parse(topVip[0].style_config || '{}') 
            : (topVip[0].style_config || {})
          const reminderTo = (topVip[0] as any).reminder_email || cfg.reminderEmail
          if (reminderTo) {
            await sendReminderEmail(reminderTo, topVip[0].content || '', topVip[0].id)
          }
        }
      }
    }
  }

  return { success: true, promoted, expiredWaiting: expiredWaiting?.length ?? 0 }
}
