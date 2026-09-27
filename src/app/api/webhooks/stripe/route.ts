import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { runQueueAdvance } from '@/lib/queueAdvance'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-08-26.dahlia' as any,
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing webhook signature or secret.' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err: any) {
    console.error(`[Stripe Webhook] Error: ${err.message}`)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const messageId = session.metadata?.messageId
    const userId = session.metadata?.userId || null
    const isSponsorMode = session.metadata?.isSponsorMode === 'true'
    const sponsorName = session.metadata?.sponsorName
    const sponsorNote = session.metadata?.sponsorNote

    if (!messageId) {
      console.warn('[Stripe Webhook] Received session without messageId in metadata:', session.id)
      return NextResponse.json({ received: true, warning: 'No messageId' })
    }

    // 1. Idempotency Check: prevent duplicate processing of the same Stripe session
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('provider_payment_id', session.id)
      .maybeSingle()

    if (existingPayment) {
      return NextResponse.json({ received: true, note: 'Already processed' })
    }

    // 2. Fetch the target message
    const { data: message, error: fetchErr } = await supabaseAdmin
      .from('messages')
      .select('id, status, is_reserved_slot, style_config')
      .eq('id', messageId)
      .single()

    if (fetchErr || !message) {
      console.error('[Stripe Webhook] Message not found for messageId:', messageId)
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const amountTotal = (session.amount_total || 0) / 100
    let style = message.style_config || {}
    if (typeof style === 'string') {
      try { style = JSON.parse(style) } catch (e) { style = {} }
    }

    const isReserved = session.metadata?.isReservedSlot === 'true' || message.is_reserved_slot
    const rawSlots = session.metadata?.slotIds || style.slotIds
    const targetSlotIds: string[] = Array.isArray(rawSlots) 
      ? rawSlots 
      : (typeof rawSlots === 'string' ? rawSlots.split(',').filter(Boolean) : [])

    if (isReserved && targetSlotIds.length > 0) {
      // --- VIP RESERVED SLOTS FULFILLMENT ---
      const { data: slots } = await supabaseAdmin
        .from('reserved_slots')
        .select('id, scheduled_start, scheduled_end')
        .in('id', targetSlotIds)
        .order('scheduled_start', { ascending: true })

      if (slots && slots.length === targetSlotIds.length) {
        // Book all slots
        await supabaseAdmin
          .from('reserved_slots')
          .update({
            status: 'BOOKED',
            message_id: messageId,
            bid_amount: amountTotal / targetSlotIds.length,
          })
          .in('id', targetSlotIds)
          .eq('status', 'AVAILABLE')

        style.durationSecs = targetSlotIds.length * 3 * 3600
        style.slotCount = targetSlotIds.length
        style.slotIds = targetSlotIds

        await supabaseAdmin
          .from('messages')
          .update({
            status: 'QUEUED',
            is_reserved_slot: true,
            bid_amount: amountTotal,
            scheduled_start: slots[0].scheduled_start,
            scheduled_end: slots[slots.length - 1].scheduled_end,
            style_config: style,
          })
          .eq('id', messageId)

        // Advance queue immediately if the booked slot includes the current time
        await runQueueAdvance().catch((err) => {
          console.error('[stripe] VIP runQueueAdvance error:', err)
        })
      }
    } else {
      // --- STANDARD OR SPONSORED QUEUE FULFILLMENT ---
      if (isSponsorMode) {
        style.durationSecs = 1800
        if (sponsorName?.trim()) style.sponsorName = sponsorName.trim().slice(0, 50)
        if (sponsorNote?.trim()) {
          const words = sponsorNote.trim().split(/\s+/).filter(Boolean)
          style.sponsorNote = words.slice(0, 12).join(' ').slice(0, 150)
        }
      }

      await supabaseAdmin
        .from('messages')
        .update({
          status: 'QUEUED',
          is_reserved_slot: false,
          bid_amount: amountTotal,
          style_config: style,
        })
        .eq('id', messageId)

      // Instant activation check
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
          await supabaseAdmin
            .from('messages')
            .update({ status: 'ACTIVE', actual_start: new Date().toISOString() })
            .eq('id', targetId)
            .eq('status', 'QUEUED')
        }
      }
    }

    // 3. Insert payment audit record
    await supabaseAdmin.from('payments').insert({
      user_id: userId,
      message_id: messageId,
      provider: 'stripe',
      provider_payment_id: session.id,
      amount: amountTotal,
      currency: session.currency || 'usd',
      status: 'SUCCESS',
    })

    // Sponsor edit token for the real-gateway path. A webhook has no browser
    // context, so the token cannot be cookie-set here: when wiring the
    // Checkout Session creation, pass the issued token back via the success
    // URL (e.g. ?st=...) and set the cookie from a server component/action.
    if (isSponsorMode) {
      try {
        const { issueSponsorEditToken } = await import('@/lib/sponsorToken')
        await issueSponsorEditToken(messageId)
      } catch {}
    }
  }

  return NextResponse.json({ received: true })
}

