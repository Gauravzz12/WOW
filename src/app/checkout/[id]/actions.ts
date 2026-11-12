'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { calculateSpecialPrice, calculateNormalMinBid, BASE_NORMAL_MINS, MAX_NORMAL_MINS, SPONSORED_PRICE, SPONSORED_DURATION_SECS, isCanonicalSlotWindow } from '@/lib/constants/pricing'
import { issueSponsorEditToken, sponsorTokenCookieName } from '@/lib/sponsorToken'
import { validateContentModeration } from '@/lib/moderation'

import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { SITE_URL } from '@/lib/site'
import { DODO_ENVIRONMENT } from '@/lib/dodo'

const supabaseAdmin = getSupabaseAdmin()

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
    .select('id, status, is_reserved_slot, bid_amount, style_config, content, reminder_email')
    .eq('id', messageId)
    .single()

  if (msgFetchError || !currentMsg) {
    return { error: 'Message not found.' }
  }

  if (currentMsg.status !== 'PENDING_PAYMENT') {
    return { error: 'This order has already been processed or has expired.' }
  }

  // Pre-payment Moderation Gate: Fast safety verification (Jev already screened content before style selection)
  const modCheck = validateContentModeration(currentMsg.content || '')
  if (!modCheck.allowed) {
    return { error: modCheck.reason || 'Message content violates our Community Guidelines and cannot be processed for payment.' }
  }

  if (sponsorData?.sponsorNote) {
    const noteMod = validateContentModeration(sponsorData.sponsorNote)
    if (!noteMod.allowed) {
      return { error: 'Sponsor note violates our Community Guidelines.' }
    }
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
      // SLOT-1: this fallback used to manufacture AVAILABLE rows from
      // whatever times the client stored at create. Only canonical fixed
      // 3-hour windows may be materialised — anything else is forgery.
      if (style.selectedSlots.some((s: any) => !isCanonicalSlotWindow(s?.scheduled_start, s?.scheduled_end))) {
        return { error: 'Invalid time slot selection.' }
      }
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

    // SLOT-1 (UUID path): rows fetched by id must also be canonical —
    // a poisoned or legacy row with forged times is not bookable.
    if (slots.some(s => !isCanonicalSlotWindow(s.scheduled_start, s.scheduled_end))) {
      return { error: 'Invalid time slot selection.' }
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

    // 4. Record atomic reservation status (but keep PENDING_PAYMENT until webhook succeeds)
    style.durationSecs = resolvedSlotIds.length * 3 * 3600 // 3 hours per slot (10800s, 21600s, or 32400s)
    style.slotCount = resolvedSlotIds.length
    style.slotIds = resolvedSlotIds
    style.selectedSlots = slots

    const { data: updatedMsg, error: msgError } = await supabaseAdmin
      .from('messages')
      .update({
        is_reserved_slot: true,
        bid_amount: officialVipPrice,
        scheduled_start: slots[0].scheduled_start,
        scheduled_end: slots[slots.length - 1].scheduled_end,
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

    // CREATE DODO PAYMENTS CHECKOUT SESSION FOR RESERVED SLOTS
    const DodoPayments = (await import('dodopayments')).default
    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: DODO_ENVIRONMENT
    })

    try {
      const session = await client.checkoutSessions.create({
        product_cart: [{
          product_id: process.env.NEXT_PUBLIC_DODO_PAYMENTS_PRODUCT_ID!,
          quantity: 1,
          amount: Math.round(officialVipPrice * 100),
        }],
        billing_currency: 'USD',
        return_url: `${SITE_URL}/?tab=SPECIAL`,
        ...(currentMsg.reminder_email ? { customer: { email: currentMsg.reminder_email } } : {}),
        metadata: {
          messageId,
          isReservedSlot: 'true',
          slotIds: resolvedSlotIds.join(','),
          usdAmount: officialVipPrice.toString(),
          userEmail: currentMsg.reminder_email || '',
          userMessage: (currentMsg.content || '').slice(0, 200),
        }
      })
      return { success: true, redirectUrl: session.checkout_url }
    } catch (err: any) {
      console.error('Checkout error:', err)
      return { error: `Failed to initialize checkout session: ${err.message || err}` }
    }

  } else {
    // --- STANDARD QUEUE PATH ---
    let officialTotal: number
    // Self-served Sponsored tier has no pay-and-broadcast: these rows wait in
    // the Waiting Room until someone sponsors them via ?mode=sponsor.
    const isSponsoredTier =
      !currentMsg.is_reserved_slot &&
      (style as any)?.isSponsored === true
    if (isSponsoredTier && !isSponsorMode) {
      return { error: 'Sponsored messages cannot be paid for directly — they go live once someone sponsors them from the Waiting Room.' }
    }

    if (isSponsorMode) {
      // Disallow sponsoring VIP reserved slot messages
      if (currentMsg.is_reserved_slot) {
        return { error: 'Reserved slot messages cannot be sponsored through the community pool.' }
      }
      // Sponsoring exists ONLY for the Sponsored tier — a Normal post must
      // never be converted into a $3 sponsored grid message.
      if (!isSponsoredTier) {
        return { error: 'Only Sponsored posts can be sponsored. This post must be paid for by its owner.' }
      }
      // Sponsor cost is strictly SPONSORED_PRICE
      officialTotal = SPONSORED_PRICE

      style.durationSecs = SPONSORED_DURATION_SECS // Sponsored messages are always 30 min long
      if (sponsorData?.sponsorName?.trim()) {
        style.sponsorName = sponsorData.sponsorName.trim().slice(0, 50)
      }
      if (sponsorData?.sponsorNote?.trim()) {
        const words = sponsorData.sponsorNote.trim().split(/\s+/).filter(Boolean)
        style.sponsorNote = words.slice(0, 12).join(' ').slice(0, 150)
      }
    } else {
      // Normal queue message: calculate minimum bid based on duration minutes
      const durationSecs = Number(style.durationSecs) || BASE_NORMAL_MINS * 60
      const durationMins = Math.max(BASE_NORMAL_MINS, Math.min(MAX_NORMAL_MINS, Math.round(durationSecs / 60)))
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

    // CREATE DODO PAYMENTS CHECKOUT SESSION FOR STANDARD BIDS
    const DodoPayments = (await import('dodopayments')).default
    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: DODO_ENVIRONMENT
    })

    try {
      let returnUrl = `${SITE_URL}/?tab=NORMAL`
      let initialBumpToken: string | null = null
      let sponsorToken: string | null = null

      if (isSponsorMode) {
        sponsorToken = await issueSponsorEditToken(messageId)
        cookies().set(sponsorTokenCookieName(messageId), sponsorToken, {
          path: '/',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        })
        // PAY-7: the sponsor token is a bearer credential — it travels in
        // the httpOnly cookie set above and in the confirmation email,
        // never in a URL that lands in dashboards, logs and history.
        returnUrl = `${SITE_URL}/sponsor/${messageId}`
      } else {
        // Standard priority queue bid: generate secret bump token
        const { generateBumpToken, hashBumpToken } = await import('@/lib/bumpToken')
        initialBumpToken = generateBumpToken()
        style.bumpTokenHash = hashBumpToken(initialBumpToken)
        style.bumpCount = 0

        await supabaseAdmin
          .from('messages')
          .update({
            style_config: style,
          })
          .eq('id', messageId)

        returnUrl = `${SITE_URL}/?tab=NORMAL`
      }

      const session = await client.checkoutSessions.create({
        product_cart: [{
          product_id: process.env.NEXT_PUBLIC_DODO_PAYMENTS_PRODUCT_ID!,
          quantity: 1,
          amount: Math.round(officialTotal * 100),
        }],
        // Charge in USD, always. Without this, Dodo's Adaptive Currency
        // converts to the customer's local currency (e.g. INR) and the
        // webhook's exact USD amount verification can never match —
        // every paid order was rejected on 2026-11-12 because of this.
        billing_currency: 'USD',
        return_url: returnUrl,
        ...(currentMsg.reminder_email ? { customer: { email: currentMsg.reminder_email } } : {}),
        metadata: {
          messageId,
          isSponsorMode: isSponsorMode.toString(),
          usdAmount: officialTotal.toString(),
          bumpToken: initialBumpToken || '',
          sponsorToken: sponsorToken || '',
          userEmail: currentMsg.reminder_email || '',
          userMessage: (currentMsg.content || '').slice(0, 200),
        }
      })

      return { success: true, redirectUrl: session.checkout_url }
    } catch (err: any) {
      console.error('Checkout error:', err)
      return { error: `Failed to initialize checkout session: ${err.message || err}` }
    }
  }
}
