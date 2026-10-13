import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { runQueueAdvance } from '@/lib/queueAdvance'
import DodoPayments from 'dodopayments'

const supabaseAdmin = getSupabaseAdmin()

const dodoClient = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET,
})

export async function POST(req: Request) {
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  let event: any;
  try {
    event = dodoClient.webhooks.unwrap(payload, { headers });
  } catch (err: any) {
    console.error('DodoPayments Webhook signature verification failed.', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed.' }, { status: 400 })
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
           const additionalAmount = payment.metadata?.usdAmount ? parseFloat(payment.metadata.usdAmount) : (payment.total_amount / 100);
           const { data: currentMsg } = await supabaseAdmin
             .from('messages')
             .select('bid_amount, reminder_email, content, style_config')
             .eq('id', messageId)
             .single();

           const targetTotal = payment.metadata?.newTotalBid 
             ? parseFloat(payment.metadata.newTotalBid) 
             : ((currentMsg?.bid_amount || 0) + additionalAmount);

           const newToken = payment.metadata?.newToken;
           if (newToken) {
             const { rotateBumpToken } = await import('@/lib/bumpToken')
             await rotateBumpToken(messageId, targetTotal, newToken)
           } else {
             await supabaseAdmin.from('messages').update({ bid_amount: targetTotal }).eq('id', messageId);
           }
           
           await supabaseAdmin.from('payments').insert({
             message_id: messageId,
             provider: 'dodopayments',
             provider_payment_id: payment.payment_id,
             amount: additionalAmount,
             currency: payment.currency || 'usd',
             status: 'SUCCESS',
           });

           // Extract customer email provided to DodoPayments during checkout
           const emailTo = 
             payment.customer?.email || 
             payment.customer_email || 
             payment.billing?.email || 
             currentMsg?.reminder_email || 
             payment.metadata?.userEmail;

           if (emailTo) {
             await supabaseAdmin
               .from('messages')
               .update({ reminder_email: emailTo })
               .eq('id', messageId);
           }

           if (emailTo && newToken) {
             try {
               const { sendBumpTokenEmail } = await import('@/lib/email')
               await sendBumpTokenEmail({
                 to: emailTo,
                 messageContent: currentMsg?.content || payment.metadata?.userMessage || '',
                 bumpToken: newToken,
                 currentBid: targetTotal,
                 isUpdated: true
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
    const amountTotal = payment.metadata?.usdAmount ? parseFloat(payment.metadata.usdAmount) : ((payment.total_amount || 0) / 100)
    
    let style = message.style_config || {}
    if (typeof style === 'string') {
      try { style = JSON.parse(style) } catch (e) { style = {} }
    }

    if (isReserved && targetSlotIds.length > 0) {
      // VIP RESERVED SLOTS FULFILLMENT
      const { data: slots } = await supabaseAdmin
        .from('reserved_slots')
        .select('id, scheduled_start, scheduled_end, status, message_id')
        .in('id', targetSlotIds)
        .order('scheduled_start', { ascending: true })

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
        .filter('bid_amount', isGridTier ? 'lt' : 'gte', 10)

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
            .gte('bid_amount', 10)
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
          })
        } catch (sponsorEmailErr) {
          console.error('[Dodo Webhook] Failed to send sponsor confirmation email:', sponsorEmailErr)
        }
      }
    } else if (!isReserved) {
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
