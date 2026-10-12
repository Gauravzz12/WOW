'use server'

import { verifyBumpToken, generateBumpToken, hashBumpToken, type VerifiedBumpMessage } from '@/lib/bumpToken'

export async function verifyTokenAction(token: string): Promise<{
  error?: string
  message?: VerifiedBumpMessage
}> {
  try {
    return await verifyBumpToken(token)
  } catch (err: any) {
    return { error: err.message || 'Verification failed.' }
  }
}

export async function createBumpCheckoutAction(token: string, newTotalBid: number): Promise<{
  success?: boolean
  error?: string
  redirectUrl?: string
  newToken?: string
  difference?: number
}> {
  try {
    const verification = await verifyBumpToken(token)
    if (verification.error || !verification.message) {
      return { error: verification.error || 'Token is invalid or message is no longer in queue.' }
    }

    const msg = verification.message
    const candidateBid = Math.round(Number(newTotalBid) * 100) / 100

    if (isNaN(candidateBid) || candidateBid <= msg.bid_amount) {
      return { 
        error: `New bid must be strictly higher than your current bid of $${msg.bid_amount.toFixed(2)}. Bids cannot be reduced.` 
      }
    }

    const difference = Math.round((candidateBid - msg.bid_amount) * 100) / 100
    if (difference < 1) {
      return { error: 'Minimum bid increment is $1.00.' }
    }

    const newToken = generateBumpToken()
    const DodoPayments = (await import('dodopayments')).default
    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: 'test_mode'
    })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wow-murex-nu.vercel.app'
    const returnUrl = `${siteUrl}/?tab=NORMAL&bumpSuccess=1&msgId=${msg.id}&newBid=${candidateBid}&token=${encodeURIComponent(newToken)}`

    const session = await client.checkoutSessions.create({
      product_cart: [{
        product_id: process.env.NEXT_PUBLIC_DODO_PAYMENTS_PRODUCT_ID!,
        quantity: 1,
        amount: Math.round(difference * 100),
      }],
      return_url: returnUrl,
      metadata: {
        messageId: msg.id,
        isBump: 'true',
        newTotalBid: candidateBid.toString(),
        usdAmount: difference.toString(),
        newToken,
        oldTokenHash: hashBumpToken(token),
        userEmail: msg.reminder_email || ''
      }
    })

    return { 
      success: true, 
      redirectUrl: session.checkout_url || undefined,
      newToken,
      difference
    }
  } catch (err: any) {
    console.error('Bump checkout error:', err)
    return { error: err.message || 'Failed to initialize bump checkout session.' }
  }
}
