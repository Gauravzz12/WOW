import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { runQueueAdvance } from '@/lib/queueAdvance'
import {
  MIN_NORMAL_BID,
  SPONSORED_PRICE,
  calculateNormalMinBid,
  calculateSpecialPrice,
  BASE_NORMAL_MINS,
  MAX_NORMAL_MINS,
} from '@/lib/constants/pricing'
import DodoPayments from 'dodopayments'

const supabaseAdmin = getSupabaseAdmin()

// Lazy: constructing the SDK at module scope can throw while `next build`
// imports the route to collect page data (e.g. with no env vars set).
let _dodoClient: DodoPayments | null = null
function getDodoClient(): DodoPayments {
  if (!_dodoClient) {
    _dodoClient = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET,
    })
  }
  return _dodoClient
}

export async function POST(req: Request) {
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  let event: any;
  try {
    event = getDodoClient().webhooks.unwrap(payload, { headers });
  } catch (err: any) {
    console.error('DodoPayments Webhook signature verification failed.', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 })
  }

  // Only process successful payment events
  if (event.type && event.type !== 'payment.succeeded') {
    console.log('[Dodo Webhook] Ignoring event type:', event.type)
    return NextResponse.json({ received: true, ignored: event.type })
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
      .select('id, status, is_reserved_slot, style_config, content, reminder_email, bid_amount')
      .eq('id', messageId)
      .single()

    if (fetchErr || !message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if ((message as any).status !== 'PENDING_PAYMENT') {
       if (payment.metadata?.isBump === 'true' && (message as any).status === 'QUEUED') {
           // PAY-1 (bump path): account from what was ACTUALLY paid
           // (total_amount), never from caller-supplied metadata amounts.
           const additionalAmount = Math.round((payment.total_amount || 0)) / 100;
           const { data: currentMsg } = await supabaseAdmin
             .from('messages')
             .select('bid_amount, reminder_email, content, style_config')
             .eq('id', messageId)
             .single();

           const targetTotal = Math.round(((currentMsg?.bid_amount || 0) + additionalAmount) * 100) / 100;

           let newToken = payment.metadata?.newToken;
           if (!newToken) {
             const { generateBumpToken } = await import('@/lib/bumpToken')
             newToken = generateBumpToken()
           }
           const { rotateBumpToken } = await import('@/lib/bumpToken')
           await rotateBumpToken(messageId, targetTotal, newToken)
           
           await supabaseAdmin.from('payments').insert({
             message_id: messageId,
             provider: 'dodopayments',
             provider_payment_id: payment.payment_id,
             amount: additionalAmount,
             currency: payment.currency || 'usd',
             status: 'SUCCESS',
           });

           // PAY-2: the rotated bump token belongs to the message OWNER.
           // It is emailed only to the reminder address already on file —
           // never to the payer's checkout email, and the stored
           // reminder_email is never overwritten from payer data. (With
           // the tokenless bumpBid action deleted, bumps originate from
           // the token-verified action, whose payer already holds a
           // token; this keeps any residual path from hijacking one.)
           const emailTo = currentMsg?.reminder_email || null;

           if (emailTo && newToken) {
             try {
               const { sendBumpTokenEmail } = await import('@/lib/email')
               await sendBumpTokenEmail({
                 to: emailTo,
                 messageContent: currentMsg?.content || payment.metadata?.userMessage || '',
                 bumpToken: newToken,
                 currentBid: targetTotal,
                 isUpdated: true,
                  messageId,
               })
             } catch (emailErr) {
               console.error('[Bump Webhook] Failed to send email:', emailErr)
             }
           }

           // Notify any queued messages that were outbid by this higher bump
           try {
             const { checkAndNotifyOutbids } = await import('@/lib/outbidService')
             await checkAndNotifyOutbids(targetTotal)
           } catch (outbidErr) {
             console.error('[Bump Webhook] Outbid check error:', outbidErr)
           }

           return NextResponse.json({ received: true, note: 'Bump processed and token rotated' });
       }

      return NextResponse.json({ received: true, note: 'Already processed or wrong status' })
    }

    const isSponsorMode = payment.metadata?.isSponsorMode === 'true'
    const isReserved = payment.metadata?.isReservedSlot === 'true'
    const targetSlotIds = payment.metadata?.slotIds ? payment.metadata.slotIds.split(',') : []
    // Display/audit amount = what was actually paid (PAY-1: metadata
    // amounts are caller-influenced and never authoritative).
    const amountTotal = (payment.total_amount || 0) / 100
    
    let style = message.style_config || {}
    if (typeof style === 'string') {
      try { style = JSON.parse(style) } catch (e) { style = {} }
    }

    // PAY-1: bind the amount ACTUALLY paid (payment.total_amount, set by
    // the provider) to this message's price before any state changes.
    // Metadata amounts are caller-influenced and were previously the only
    // check — combined with processPayment overwriting bid_amount on each
    // call, paying a stale $5 session fulfilled a later $100 stored bid.
    // Normal therefore requires paid == CURRENT stored bid (and >= the
    // duration minimum); sponsor/reserved require their exact prices.
    const paidCents = Math.round(payment.total_amount || 0)
    let amountError: string | null = null
    if (isSponsorMode && (style as any)?.isSponsored !== true) {
      // Sponsorship is a Sponsored-tier feature only. A sponsor payment
      // against a Normal post must never convert it into a grid message.
      amountError = 'Sponsor payments are only valid for Sponsored-tier messages.'
    } else if (isSponsorMode) {
      if (paidCents !== Math.round(SPONSORED_PRICE * 100)) {
        amountError = `Sponsor amount must be exactly $${SPONSORED_PRICE.toFixed(2)}.`
      }
    } else if (isReserved) {
      const count = targetSlotIds.length
      const official = calculateSpecialPrice(Math.min(Math.max(count, 1), 3)).finalPrice
      if (count < 1 || count > 3 || paidCents !== Math.round(official * 100)) {
        amountError = `Reserved amount must be exactly $${official.toFixed(2)} for ${count} slot(s).`
      }
    } else {
      const dSecs = Number(style.durationSecs) || BASE_NORMAL_MINS * 60
      const dMins = Math.max(BASE_NORMAL_MINS, Math.min(MAX_NORMAL_MINS, Math.round(dSecs / 60)))
      const minCents = Math.round(calculateNormalMinBid(dMins) * 100)
      const bidCents = Math.round((Number((message as any).bid_amount) || 0) * 100)
      if (paidCents < minCents || paidCents !== bidCents) {
        amountError = `Paid $${(paidCents / 100).toFixed(2)} does not match the current bid of $${(bidCents / 100).toFixed(2)}.`
      }
    }
    if (amountError) {
      console.error('[Dodo Webhook] Amount verification failed:', amountError, 'message:', messageId)
      return NextResponse.json({ error: amountError }, { status: 400 })
    }

    // Extract customer email provided to DodoPayments during checkout
    const dodoCustomerEmail = 
      payment.customer?.email || 
      payment.customer_email || 
      payment.billing?.email || 
      payment.metadata?.userEmail || 
      (message as any)?.reminder_email;

    if (dodoCustomerEmail) {
      await supabaseAdmin
        .from('messages')
        .update({ reminder_email: dodoCustomerEmail })
        .eq('id', messageId);
    }

    let vipSlots: any[] = []
    if (isReserved && targetSlotIds.length > 0) {
      // VIP RESERVED SLOTS FULFILLMENT
      const { data: slots } = await supabaseAdmin
        .from('reserved_slots')
        .select('id, scheduled_start, scheduled_end, status, message_id')
        .in('id', targetSlotIds)
        .order('scheduled_start', { ascending: true })

      vipSlots = slots || []

      if (!slots || slots.length !== targetSlotIds.length) {
        return NextResponse.json({ error: 'Slots not found' }, { status: 400 })
      }

      // Check if slots are correctly booked by this message
      const invalidSlots = slots.filter(s => s.message_id !== messageId)
      if (invalidSlots.length > 0) {
        return NextResponse.json({ error: 'Slots claimed by another buyer.' }, { status: 409 })
      }

      style.durationSecs = targetSlotIds.length * 3 * 3600
      style.slotCount = targetSlotIds.length
      style.slotIds = targetSlotIds

      const { error: vipUpdateErr } = await supabaseAdmin
        .from('messages')
        .update({
          status: 'QUEUED',
          is_reserved_slot: true,
          scheduled_start: slots[0].scheduled_start,
          scheduled_end: slots[slots.length - 1].scheduled_end,
          style_config: style,
        })
        .eq('id', messageId)

      if (vipUpdateErr) {
        console.error('[Dodo Webhook] VIP message update error:', vipUpdateErr)
      }

      await runQueueAdvance().catch(console.error)
    } else {
      // STANDARD QUEUE FULFILLMENT
      if (isSponsorMode) {
        style.durationSecs = 1800
      }

      const { error: stdUpdateErr } = await supabaseAdmin
        .from('messages')
        .update({
          status: 'QUEUED',
          is_reserved_slot: false,
          style_config: style,
        })
        .eq('id', messageId)

      if (stdUpdateErr) {
        console.error('[Dodo Webhook] Standard message update error:', stdUpdateErr)
      }

      const isGridTier = isSponsorMode
      const { data: actives } = await supabaseAdmin
        .from('messages')
        .select('id')
        .eq('status', 'ACTIVE')
        .eq('is_reserved_slot', false)
        .filter('bid_amount', isGridTier ? 'lt' : 'gte', MIN_NORMAL_BID)

      const canActivate = isGridTier ? (!actives || actives.length < 10) : (!actives || actives.length === 0)

      if (canActivate) {
        if (isGridTier) {
          await supabaseAdmin
            .from('messages')
            .update({ status: 'ACTIVE', actual_start: new Date().toISOString() })
            .eq('id', messageId)

          if (dodoCustomerEmail) {
            try {
              const { sendLiveNotificationEmail } = await import('@/lib/email')
              await sendLiveNotificationEmail(dodoCustomerEmail, (message as any)?.content || '', messageId)
            } catch (liveErr) {
              console.error('[Dodo Webhook] Failed to send live notification email:', liveErr)
            }
          }
        } else {
          const { data: topQueued } = await supabaseAdmin
            .from('messages')
            .select('id, content, reminder_email')
            .eq('status', 'QUEUED')
            .eq('is_reserved_slot', false)
            .gte('bid_amount', MIN_NORMAL_BID)
            .order('is_promo_free', { ascending: true })
            .order('bid_amount', { ascending: false })
            .order('created_at', { ascending: true })
            .limit(1)

          const targetMsg = (topQueued && topQueued.length > 0) ? topQueued[0] : message
          await supabaseAdmin
            .from('messages')
            .update({ status: 'ACTIVE', actual_start: new Date().toISOString() })
            .eq('id', targetMsg.id)

          const liveEmailTo = targetMsg.id === messageId ? dodoCustomerEmail : (targetMsg as any).reminder_email
          if (liveEmailTo) {
            try {
              const { sendLiveNotificationEmail } = await import('@/lib/email')
              await sendLiveNotificationEmail(liveEmailTo, targetMsg.content || '', targetMsg.id)
            } catch (liveErr) {
              console.error('[Dodo Webhook] Failed to send live notification email:', liveErr)
            }
          }
        }
      }
    }

    const { error: paymentInsertError } = await supabaseAdmin.from('payments').insert({
      message_id: messageId,
      provider: 'dodopayments',
      provider_payment_id: payment.payment_id,
      amount: amountTotal,
      currency: payment.currency || 'usd',
      status: 'SUCCESS',
    })
    if (paymentInsertError) {
      // Fulfillment already happened above; never 400 (Dodo would retry and
      // hit the idempotent path), but make a missing ledger row loud.
      console.error('[Dodo Webhook] payments insert failed:', paymentInsertError.message, 'message:', messageId, 'payment:', payment.payment_id)
    }



    if (isSponsorMode) {
      // Send sponsor confirmation email to customer email provided to DodoPayments
      if (dodoCustomerEmail) {
        try {
          const { sendSponsorConfirmationEmail } = await import('@/lib/email')
          await sendSponsorConfirmationEmail({
            to: dodoCustomerEmail,
            messageId,
            messageContent: (message as any)?.content || payment.metadata?.userMessage || '',
            sponsorToken: payment.metadata?.sponsorToken || undefined,
            amountPaid: amountTotal,
          })
        } catch (sponsorEmailErr) {
          console.error('[Dodo Webhook] Failed to send sponsor confirmation email:', sponsorEmailErr)
        }
      }
    } else if (isReserved) {
      // VIP Reserved slot confirmation email
      if (dodoCustomerEmail) {
        try {
          const { sendVipReservationEmail } = await import('@/lib/email')
          await sendVipReservationEmail({
            to: dodoCustomerEmail,
            messageId,
            messageContent: (message as any)?.content || payment.metadata?.userMessage || '',
            amountPaid: amountTotal,
            scheduledStart: vipSlots && vipSlots[0] ? vipSlots[0].scheduled_start : null,
            scheduledEnd: vipSlots && vipSlots.length > 0 ? vipSlots[vipSlots.length - 1].scheduled_end : null,
            slotCount: targetSlotIds.length,
          })
        } catch (vipEmailErr) {
          console.error('[Dodo Webhook] Failed to send VIP confirmation email:', vipEmailErr)
        }
      }
    } else {
      // Standard priority queue message: send secret bump token email
      try {
        let tokenToSend = payment.metadata?.bumpToken || payment.metadata?.initialBumpToken || style?.bumpToken || null
        if (!tokenToSend) {
          const { generateBumpToken, hashBumpToken } = await import('@/lib/bumpToken')
          tokenToSend = generateBumpToken()
          style.bumpTokenHash = hashBumpToken(tokenToSend)
          await supabaseAdmin
            .from('messages')
            .update({ style_config: style })
            .eq('id', messageId)
        }

        if (dodoCustomerEmail && tokenToSend) {
          const { sendBumpTokenEmail } = await import('@/lib/email')
          await sendBumpTokenEmail({
            to: dodoCustomerEmail,
            messageContent: (message as any)?.content || payment.metadata?.userMessage || '',
            bumpToken: tokenToSend,
            currentBid: amountTotal,
            isUpdated: false,
            messageId,
          })
        }

        // Notify anyone who was outbid by this initial bid
        const { checkAndNotifyOutbids } = await import('@/lib/outbidService')
        await checkAndNotifyOutbids(amountTotal)
      } catch (bumpEmailErr) {
        console.error('[Dodo Webhook] Failed to process standard queue bump token/outbids:', bumpEmailErr)
      }
    }
  }

  return NextResponse.json({ received: true })
}
