import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025,
  secure: false, // true for 465, false for other ports
})

export async function sendReceiptEmail(to: string, messageContent: string, amount: number) {
  try {
    const info = await transporter.sendMail({
      from: '"Words of the World" <noreply@wordsoftheworld.com>',
      to,
      subject: 'Receipt: Your message has been queued!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Thank you for your purchase!</h2>
          <p>Your message has been successfully queued and will be displayed on the billboard soon.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-style: italic; color: #555;">"${messageContent}"</p>
          </div>
          
          <p><strong>Total Paid:</strong> $${amount.toFixed(2)}</p>
          <p style="color: #777; font-size: 12px; margin-top: 30px;">
            You will receive another email the moment your message goes live.
          </p>
        </div>
      `,
    })
    console.log('Receipt email sent: %s', info.messageId)
  } catch (error) {
    console.error('Error sending receipt email:', error)
  }
}

export async function sendLiveNotificationEmail(to: string, messageContent: string) {
  try {
    const info = await transporter.sendMail({
      from: '"Words of the World" <noreply@wordsoftheworld.com>',
      to,
      subject: '🔥 Your message is LIVE right now!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #FAFAFA;">
          <h2 style="color: #090909;">It's happening!</h2>
          <p style="color: #090909;">Look up! Your message is currently being broadcasted on the big screen.</p>
          
          <div style="background-color: #FFFFFF; border: 1px solid #E5E5E5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h1 style="margin: 0; font-style: italic; color: #090909;">"${messageContent}"</h1>
          </div>
          
          <p style="color: #777; font-size: 12px; margin-top: 30px;">
            This broadcast will end automatically when the duration is up.
          </p>
        </div>
      `,
    })
    console.log('Live notification email sent: %s', info.messageId)
  } catch (error) {
    console.error('Error sending live notification email:', error)
  }
}

export async function sendOutbidEmail(to: string, messageContent: string, newRank: number, messageId: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wow-murex-nu.vercel.app'
  const bumpUrl = `${siteUrl}/w/${messageId}`
  const subject = `⚠️ You've been outbid! (New Rank: #${newRank})`
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #d97706; margin-top: 0;">Your Queue Position Dropped</h2>
      <p style="color: #4b5563;">Someone just placed a higher bid on their message, pushing yours down the priority queue.</p>
      
      <div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 15px; border-radius: 12px; margin: 20px 0;">
        <p style="margin: 0; font-size: 16px; color: #b45309;">Your new estimated rank is: <strong>#${newRank}</strong></p>
      </div>

      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 14px; border-radius: 10px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 13px; color: #4b5563; font-style: italic;">
          "${messageContent.slice(0, 160)}${messageContent.length > 160 ? '...' : ''}"
        </p>
      </div>
      
      <p style="margin-top: 20px; color: #374151; font-size: 14px;">
        Want to regain your spot? Use your secret bump token or click below to boost your bid.
      </p>
      <div style="text-align: center; margin-top: 15px;">
        <a href="${bumpUrl}" style="display: inline-block; background-color: #f59e0b; color: white; padding: 12px 28px; text-decoration: none; border-radius: 9999px; font-weight: bold; font-size: 14px;">
          ⚡ Bump My Bid
        </a>
      </div>
    </div>
  `

  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Words of the World <noreply@words.world>',
          to: [to],
          subject,
          html,
        }),
      })
      if (res.ok) {
        console.log('[Email] Outbid email sent via Resend to', to)
        return
      }
    } catch (e) {
      console.error('[Email] Resend outbid error:', e)
    }
  }

  try {
    const info = await transporter.sendMail({
      from: '"Words of the World" <noreply@wordsoftheworld.com>',
      to,
      subject,
      html,
    })
    console.log('Outbid email sent via SMTP: %s', info.messageId)
  } catch (error) {
    console.error('Error sending outbid email:', error)
  }
}

export async function sendBumpTokenEmail({
  to,
  messageContent,
  bumpToken,
  currentBid,
  isUpdated = false
}: {
  to: string
  messageContent: string
  bumpToken: string
  currentBid: number
  isUpdated?: boolean
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wow-murex-nu.vercel.app'
  const bumpUrl = `${siteUrl}/?bumpToken=${encodeURIComponent(bumpToken)}`

  const subject = isUpdated
    ? `⚡ Your bid was bumped to $${currentBid.toFixed(2)}! (New Bump Token inside)`
    : `⚡ Secret Bump Token for your message on Words of the World`

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 28px;">⚡</span>
        <h2 style="color: #111827; margin: 8px 0 4px; font-size: 22px;">
          ${isUpdated ? 'Your Bid Was Bumped!' : 'Your Secret Bump Token'}
        </h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          Keep this token safe. You can use it anytime to boost your message in the queue.
        </p>
      </div>

      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 13px; color: #4b5563; font-style: italic;">
          "${messageContent.slice(0, 160)}${messageContent.length > 160 ? '...' : ''}"
        </p>
        <p style="margin: 8px 0 0; font-size: 13px; font-weight: bold; color: #047857;">
          Current Priority Bid: $${currentBid.toFixed(2)}
        </p>
      </div>

      <div style="background-color: #fef3c7; border: 1px solid #fde68a; padding: 18px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #92400e; display: block; margin-bottom: 6px;">
          ${isUpdated ? 'YOUR NEW SECRET TOKEN (OLD TOKEN IS INVALID)' : 'YOUR SECRET TOKEN'}
        </span>
        <code style="font-family: monospace; font-size: 18px; font-weight: bold; color: #78350f; background: #fff; padding: 6px 14px; border-radius: 8px; border: 1px solid #fde68a; display: inline-block;">
          ${bumpToken}
        </code>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${bumpUrl}" style="background-color: #d97706; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 9999px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ⚡ Bump Your Bid (1-Click)
        </a>
      </div>

      <p style="color: #9ca3af; font-size: 11px; text-align: center; line-height: 1.5; margin: 0;">
        You can also click "Bump Your Bid" at the top of the Priority Queue on Words of the World and paste this token directly.
      </p>
    </div>
  `

  // 1. Try Resend if API key is present
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'Words of the World <noreply@words.world>',
          to: [to],
          subject,
          html,
        }),
      })
      if (res.ok) {
        console.log('[Email] Bump token sent via Resend to', to)
        return
      }
    } catch (e) {
      console.error('[Email] Resend error:', e)
    }
  }

  // 2. Fallback to nodemailer transporter
  try {
    await transporter.sendMail({
      from: '"Words of the World" <noreply@wordsoftheworld.com>',
      to,
      subject,
      html,
    })
    console.log('[Email] Bump token sent via SMTP to', to)
  } catch (error) {
    console.warn('[Email] Could not send email (SMTP offline):', (error as any)?.message || error)
  }
}

