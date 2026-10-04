import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runQueueAdvance } from '@/lib/queueAdvance'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  let event: any;
  try {
    event = await req.json();
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Handle DodoPayments webhook event
  if (event.data?.metadata?.messageId) {
    const payment = event.data;
    const messageId = payment.metadata?.messageId;
    
    // Process payment success (same logic as Stripe)
    console.log('[Dodo Webhook] Processing payment success for message:', messageId);
    
    // Idempotency Check
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('provider_payment_id', payment.payment_id)
      .maybeSingle()

    if (existingPayment) {
      return NextResponse.json({ received: true, note: 'Already processed' })
    }

    const { data: message, error: fetchErr } = await supabaseAdmin
      .from('messages')
      .select('id, status, is_reserved_slot, style_config')
      .eq('id', messageId)
      .single()

    if (fetchErr || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if ((message as any).status !== 'PENDING_PAYMENT') {
       // Wait, if it's a bump bid, the status will be QUEUED!
       if (payment.metadata?.isBump === 'true' && (message as any).status === 'QUEUED') {
           const additionalAmount = payment.metadata?.usdAmount ? parseFloat(payment.metadata.usdAmount) : (payment.total_amount / 100);
           const { data: currentMsg } = await supabaseAdmin.from('messages').select('bid_amount').eq('id', messageId).single();
           const newTotal = (currentMsg?.bid_amount || 0) + additionalAmount;
           await supabaseAdmin.from('messages').update({ bid_amount: newTotal }).eq('id', messageId);
           
           await supabaseAdmin.from('payments').insert({
             message_id: messageId,
             provider: 'dodopayments',
             provider_payment_id: payment.payment_id,
             amount: additionalAmount,
             currency: payment.currency || 'usd',
             status: 'SUCCESS',
           });
           return NextResponse.json({ received: true, note: 'Bump processed' });
       }

      return NextResponse.json({ received: true, note: 'Already processed or wrong status' })
    }

    const isSponsorMode = payment.metadata?.isSponsorMode === 'true'
    const isReserved = payment.metadata?.isReservedSlot === 'true'
    const targetSlotIds = payment.metadata?.slotIds ? payment.metadata.slotIds.split(',') : []
    const amountTotal = payment.metadata?.usdAmount ? parseFloat(payment.metadata.usdAmount) : ((payment.total_amount || 0) / 100)
    
    let style = message.style_config || {}
    if (typeof style === 'string') {
      try { style = JSON.parse(style) } catch (e) { style = {} }
    }

    if (isReserved && targetSlotIds.length > 0) {
      // VIP RESERVED SLOTS FULFILLMENT
      const { data: slots } = await supabaseAdmin
        .from('reserved_slots')
        .select('id, scheduled_start, scheduled_end')
        .in('id', targetSlotIds)
        .order('scheduled_start', { ascending: true })

      if (!slots || slots.length !== targetSlotIds.length) {
        return NextResponse.json({ error: 'Slots not found' }, { status: 400 })
      }

      const { data: bookedSlots, error: bookError } = await supabaseAdmin
        .from('reserved_slots')
        .update({
          status: 'BOOKED',
          message_id: messageId,
          bid_amount: amountTotal / targetSlotIds.length,
        })
        .in('id', targetSlotIds)
        .eq('status', 'AVAILABLE')
        .select('id')

      if (bookError || !bookedSlots || bookedSlots.length !== targetSlotIds.length) {
        return NextResponse.json({ error: 'Slots claimed by another buyer.' }, { status: 409 })
      }

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

      await runQueueAdvance().catch(console.error)
    } else {
      // STANDARD QUEUE FULFILLMENT
      if (isSponsorMode) {
        style.durationSecs = 1800
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

      const isGridTier = isSponsorMode
      const { data: actives } = await supabaseAdmin
        .from('messages')
        .select('id')
        .eq('status', 'ACTIVE')
        .eq('is_reserved_slot', false)
        .filter('bid_amount', isGridTier ? 'lt' : 'gte', 2)

      const canActivate = isGridTier ? (!actives || actives.length < 10) : (!actives || actives.length === 0)

      if (canActivate) {
        if (isGridTier) {
          await supabaseAdmin
            .from('messages')
            .update({ status: 'ACTIVE', actual_start: new Date().toISOString() })
            .eq('id', messageId)
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
        }
      }
    }

    await supabaseAdmin.from('payments').insert({
      message_id: messageId,
      provider: 'dodopayments',
      provider_payment_id: payment.payment_id,
      amount: amountTotal,
      currency: payment.currency || 'usd',
      status: 'SUCCESS',
    })

    if (isSponsorMode) {
      try {
        const { issueSponsorEditToken } = await import('@/lib/sponsorToken')
        await issueSponsorEditToken(messageId)
      } catch {}
    }
  }

  return NextResponse.json({ received: true })
}
