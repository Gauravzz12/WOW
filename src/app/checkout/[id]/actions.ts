'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { calculateSpecialPrice, calculateNormalMinBid } from '@/lib/constants/pricing'
import {
  issueSponsorEditToken,
  sponsorTokenCookieName,
} from '@/lib/sponsorToken'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function processPayment(
  messageId: string, 
  slotId: string | string[] | null, 
  total: number, 
  isSponsorMode: boolean = false,
  sponsorData?: { sponsorName?: string; sponsorNote?: string }
) {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // 1. Fetch current message record to verify status and server-side pricing parameters
  const { data: currentMsg, error: msgFetchError } = await supabaseAdmin
    .from('messages')
    .select('id, status, is_reserved_slot, bid_amount, style_config')
    .eq('id', messageId)
    .single()

  if (msgFetchError || !currentMsg) {
    return { error: 'Message not found.' }
  }

  if (currentMsg.status !== 'PENDING_PAYMENT') {
    return { error: 'This order has already been processed or has expired.' }
  }

  let style = currentMsg.style_config || {}
  if (typeof style === 'string') {
    try { style = JSON.parse(style) } catch (e) { style = {} }
  }

  const targetSlotIds: string[] = Array.isArray(slotId) ? slotId : (slotId ? [slotId] : [])

  if (targetSlotIds.length > 0) {
    // --- VIP RESERVED SLOT PATH (1 to 3 continuous 3-hour fixed slots) ---
    if (targetSlotIds.length > 3) {
      return { error: 'A maximum of 3 continuous slots can be booked together.' }
    }

    // Server-side calculated price (client 'total' is strictly ignored to prevent price spoofing)
    const { finalPrice: officialVipPrice } = calculateSpecialPrice(targetSlotIds.length)

    // 1. Verify all requested slots exist and are AVAILABLE
    let slots: any[] = []
    const isRealUuids = targetSlotIds.length > 0 && targetSlotIds.every(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))

    if (isRealUuids) {
      const { data: dbSlots } = await supabaseAdmin
        .from('reserved_slots')
        .select('id, status, scheduled_start, scheduled_end')
        .in('id', targetSlotIds)
        .order('scheduled_start', { ascending: true })

      if (dbSlots && dbSlots.length === targetSlotIds.length) {
        slots = dbSlots
      }
    }

    // Fallback: If slots weren't resolved by UUIDs, resolve by scheduled_start from style.selectedSlots
    if (slots.length === 0 && Array.isArray(style.selectedSlots) && style.selectedSlots.length > 0) {
      // Ensure records exist in database
      const slotsToUpsert = style.selectedSlots.map((s: any) => ({
        scheduled_start: new Date(s.scheduled_start).toISOString(),
        scheduled_end: new Date(s.scheduled_end).toISOString(),
        bid_amount: officialVipPrice / style.selectedSlots.length,
        status: 'AVAILABLE'
      }))
      await supabaseAdmin
        .from('reserved_slots')
        .upsert(slotsToUpsert, { onConflict: 'scheduled_start', ignoreDuplicates: true })

      const minStart = new Date(Math.min(...style.selectedSlots.map((s: any) => new Date(s.scheduled_start).getTime()))).toISOString()
      const maxEnd = new Date(Math.max(...style.selectedSlots.map((s: any) => new Date(s.scheduled_end).getTime()))).toISOString()

      const { data: slotsByRange } = await supabaseAdmin
        .from('reserved_slots')
        .select('id, status, scheduled_start, scheduled_end')
        .gte('scheduled_start', minStart)
        .lte('scheduled_start', maxEnd)
        .order('scheduled_start', { ascending: true })

      if (slotsByRange) {
        const timeMap = new Map(slotsByRange.map(s => [new Date(s.scheduled_start).getTime(), s]))
        const matched = style.selectedSlots.map((s: any) => timeMap.get(new Date(s.scheduled_start).getTime())).filter(Boolean)
        if (matched.length === style.selectedSlots.length) {
          slots = matched
        }
      }
    }

    const expectedCount = targetSlotIds.length > 0 ? targetSlotIds.length : (style.selectedSlots?.length || 0)
    if (!slots || slots.length === 0 || slots.length !== expectedCount) {
      return { error: 'One or more selected slots could not be found. Please try again.' }
    }

    const anyBooked = slots.some(s => s.status === 'BOOKED')
    if (anyBooked) {
      return { error: 'Sorry, one or more selected slots were just booked. Please choose other slots.' }
    }

    // 2. Verify continuity if multiple slots
    for (let i = 0; i < slots.length - 1; i++) {
      if (new Date(slots[i].scheduled_end).getTime() !== new Date(slots[i + 1].scheduled_start).getTime()) {
        return { error: 'Selected slots must be continuous without gaps.' }
      }
    }

    const resolvedSlotIds = slots.map(s => s.id)

    // 3. Book all slots atomically — link to message, mark as BOOKED only if AVAILABLE
    const { data: updatedSlots, error: slotError } = await supabaseAdmin
      .from('reserved_slots')
      .update({
        status: 'BOOKED',
        message_id: messageId,
        bid_amount: officialVipPrice / resolvedSlotIds.length,
      })
      .in('id', resolvedSlotIds)
      .eq('status', 'AVAILABLE') // Atomic condition: updates 0 rows if taken
      .select('id')

    if (slotError || !updatedSlots || updatedSlots.length !== resolvedSlotIds.length) {
      return { error: 'Sorry, one or more time slots were just claimed by another user. Your payment was not processed.' }
    }

    const now = Date.now()
    const isCurrentLiveSlot = new Date(slots[0].scheduled_start).getTime() <= now && now < new Date(slots[slots.length - 1].scheduled_end).getTime()

    // 4. Update style_config and transition message atomically from PENDING_PAYMENT to ACTIVE or QUEUED
    style.durationSecs = resolvedSlotIds.length * 3 * 3600 // 3 hours per slot (10800s, 21600s, or 32400s)
    style.slotCount = resolvedSlotIds.length
    style.slotIds = resolvedSlotIds
    style.selectedSlots = slots

    const targetStatus = isCurrentLiveSlot ? 'ACTIVE' : 'QUEUED'

    const { data: updatedMsg, error: msgError } = await supabaseAdmin
      .from('messages')
      .update({
        status: targetStatus,
        is_reserved_slot: true,
        bid_amount: officialVipPrice,
        scheduled_start: slots[0].scheduled_start,
        scheduled_end: slots[slots.length - 1].scheduled_end,
        actual_start: isCurrentLiveSlot ? new Date().toISOString() : null,
        style_config: style,
      })
      .eq('id', messageId)
      .eq('status', 'PENDING_PAYMENT') // Idempotency guard
      .select('id')

    if (msgError || !updatedMsg || updatedMsg.length === 0) {
      // Rollback booked slots if message update failed
      await supabaseAdmin
        .from('reserved_slots')
        .update({ status: 'AVAILABLE', message_id: null, bid_amount: 0 })
        .in('id', resolvedSlotIds)
      return { error: 'Failed to finalize reservation or order was already processed.' }
    }

    // 5. Record payment transaction
    await supabaseAdmin.from('payments').insert({
      message_id: messageId,
      provider: 'mock',
      provider_payment_id: `mock_vip_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      amount: officialVipPrice,
      currency: 'usd',
      status: 'SUCCESS',
    })

    revalidatePath('/')
    revalidatePath('/waiting-room')
    return { success: true }

  } else {
    // --- STANDARD QUEUE PATH ---
    let officialTotal: number

    if (isSponsorMode) {
      // Disallow sponsoring VIP reserved slot messages
      if (currentMsg.is_reserved_slot) {
        return { error: 'Reserved slot messages cannot be sponsored through the community pool.' }
      }
      // Sponsor cost is strictly $1.00
      officialTotal = 1.00

      style.durationSecs = 1800 // Sponsored messages are always 30 min long
      if (sponsorData?.sponsorName?.trim()) {
        style.sponsorName = sponsorData.sponsorName.trim().slice(0, 50)
      }
      if (sponsorData?.sponsorNote?.trim()) {
        const words = sponsorData.sponsorNote.trim().split(/\s+/).filter(Boolean)
        style.sponsorNote = words.slice(0, 12).join(' ').slice(0, 150)
      }
    } else {
      // Normal queue message: calculate minimum bid based on duration minutes
      const durationSecs = Number(style.durationSecs) || 3600
      const durationMins = Math.max(60, Math.min(120, Math.round(durationSecs / 60)))
      const minBid = calculateNormalMinBid(durationMins)

      // Ensure bid is at least minimum; allow higher bids for priority
      const candidateBid = Number(total)
      officialTotal = !isNaN(candidateBid) && candidateBid >= minBid 
        ? Math.round(candidateBid * 100) / 100 
        : minBid
    }

    const { data: updatedMsg, error } = await supabaseAdmin
      .from('messages')
      .update({
        status: 'QUEUED',
        is_reserved_slot: false,
        bid_amount: officialTotal,
        style_config: style,
      })
      .eq('id', messageId)
      .eq('status', 'PENDING_PAYMENT') // Idempotency guard
      .select('id')

    if (error || !updatedMsg || updatedMsg.length === 0) {
      return { error: 'Failed to process payment: order already processed or expired.' }
    }

    // Record payment transaction
    await supabaseAdmin.from('payments').insert({
      message_id: messageId,
      provider: 'mock',
      provider_payment_id: `mock_${isSponsorMode ? 'sponsor' : 'normal'}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      amount: officialTotal,
      currency: 'usd',
      status: 'SUCCESS',
    })

    // --- INSTANT ACTIVATION CHECK ---
    const { data: actives } = await supabaseAdmin
      .from('messages')
      .select('id')
      .eq('status', 'ACTIVE')
      .eq('is_reserved_slot', false)
      .filter('bid_amount', isSponsorMode ? 'lt' : 'gte', 2)

    const canActivate = isSponsorMode ? (!actives || actives.length < 10) : (!actives || actives.length === 0)

    if (canActivate) {
      if (isSponsorMode) {
        await supabaseAdmin
          .from('messages')
          .update({ status: 'ACTIVE', actual_start: new Date().toISOString() })
          .eq('id', messageId)
          .eq('status', 'QUEUED')
      } else {
        // Query the highest priority normal queued message
        const { data: topQueued } = await supabaseAdmin
          .from('messages')
          .select('id')
          .eq('status', 'QUEUED')
          .eq('is_reserved_slot', false)
          .gte('bid_amount', 2)
          .order('bid_amount', { ascending: false })
          .order('created_at', { ascending: true })
          .limit(1)

        const targetId = (topQueued && topQueued.length > 0) ? topQueued[0].id : messageId
        // Atomic update: only activate if target is still strictly QUEUED
        await supabaseAdmin
          .from('messages')
          .update({ status: 'ACTIVE', actual_start: new Date().toISOString() })
          .eq('id', targetId)
          .eq('status', 'QUEUED')
      }
    }

    revalidatePath('/')
    revalidatePath('/waiting-room')

    // Sponsor edit token: lets this browser (and only it) edit the shoutout
    // later. Raw token in an httpOnly cookie, hash stored server-side.
    if (isSponsorMode) {
      try {
        const token = await issueSponsorEditToken(messageId)
        cookies().set(sponsorTokenCookieName(messageId), token, {
          path: '/',
          maxAge: 30 * 24 * 60 * 60,
          sameSite: 'lax',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        })
      } catch {}
    }

    return { success: true }
  }
}

