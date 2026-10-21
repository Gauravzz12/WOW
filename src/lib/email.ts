import nodemailer from 'nodemailer'

// SMTP Transporter Fallback
const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    })
  : nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false,
    })

/**
 * Brevo (Sendinblue) Transactional REST API
 * Primary email dispatch provider
 */
async function sendViaBrevo({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    return false
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_FROM || 'gthakurzzz424@gmail.com'
  const senderName = process.env.BREVO_SENDER_NAME || 'Words of the World'

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html,
      }),
    })

    if (res.ok) {
      const data = await res.json().catch(() => null)
      console.log('[Email] Delivered via Brevo to', to, data?.messageId ? `(MessageID: ${data.messageId})` : '')
      return true
    }

    const errData = await res.json().catch(() => null)
    console.warn('[Email] Brevo API error response:', errData)

    if (errData?.message?.includes('unrecognised IP address')) {
      console.error(
        '[Email] ⚠️ Brevo IP Whitelist restriction is active! To send emails, please authorise your IP address or disable IP restriction in Brevo at: https://app.brevo.com/security/authorised_ips'
      )
    }
  } catch (err) {
    console.error('[Email] Brevo network error:', err)
  }
  return false
}

/**
 * Resend Email Dispatch (Fallback)
 */
async function sendViaResend({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return false

  const from = process.env.EMAIL_FROM || 'Words of the World <onboarding@resend.dev>'

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    })

    if (res.ok) {
      console.log('[Email] Delivered via Resend fallback to', to)
      return true
    }

    const errData = await res.json().catch(() => null)
    console.warn('[Email] Resend API error response:', errData)

    // Check if error is Sandbox recipient restriction (testing mode only permits account owner)
    const match = errData?.message?.match(/\(([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\)/)
    const sandboxAllowed = match ? match[1] : (process.env.RESEND_ACCOUNT_EMAIL || 'gthakurzzz424@gmail.com')

    if ((res.status === 403 || errData?.statusCode === 403) && sandboxAllowed && sandboxAllowed !== to) {
      console.log(`[Email] Resend sandbox fallback: redirecting to account owner (${sandboxAllowed})`)
      const retryRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from,
          to: [sandboxAllowed],
          subject: `${subject} [Sandbox Test: For ${to}]`,
          html: `
            <div style="padding: 12px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; margin-bottom: 16px; font-size: 13px; color: #92400e; font-family: sans-serif;">
              <strong>Sandbox Delivery Notice:</strong> In Resend test mode, emails can only be sent to your registered account (<em>${sandboxAllowed}</em>). This email was generated for <strong>${to}</strong>.
            </div>
            ${html}
          `,
        }),
      })

      if (retryRes.ok) {
        console.log('[Email] Resend sandbox delivery succeeded to', sandboxAllowed)
        return true
      }
      const retryErr = await retryRes.json().catch(() => null)
      console.warn('[Email] Resend sandbox retry also failed:', retryErr)
    }
  } catch (err) {
    console.error('[Email] Resend network error:', err)
  }
  return false
}

/**
 * Universal Email Sender:
 * 1. Brevo (Primary)
 * 2. Resend (Fallback)
 * 3. SMTP (Local/Server Fallback)
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<boolean> {
  // 1. Try Brevo
  const brevoSuccess = await sendViaBrevo({ to, subject, html })
  if (brevoSuccess) return true

  // 2. Try Resend
  const resendSuccess = await sendViaResend({ to, subject, html })
  if (resendSuccess) return true

  // 3. Fallback to SMTP
  try {
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_FROM || 'noreply@words.world'
    const info = await transporter.sendMail({
      from: `"${process.env.BREVO_SENDER_NAME || 'Words of the World'}" <${senderEmail}>`,
      to,
      subject,
      html,
    })
    console.log('[Email] Delivered via SMTP to', to, info.messageId)
    return true
  } catch (error) {
    console.warn('[Email] SMTP fallback failed:', (error as any)?.message || error)
  }

  return false
}

/**
 * Standard Queue / Priority Bid Payment Completion Email (Includes Secret Bump Token)
 */
export async function sendBumpTokenEmail({
  to,
  messageContent,
  bumpToken,
  currentBid,
  isUpdated = false,
  messageId,
}: {
  to: string
  messageContent: string
  bumpToken: string
  currentBid: number
  isUpdated?: boolean
  messageId?: string
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wow-murex-nu.vercel.app'
  const bumpUrl = `${siteUrl}/?bumpToken=${encodeURIComponent(bumpToken)}`
  const broadcastUrl = messageId ? `${siteUrl}/w/${messageId}` : `${siteUrl}`

  const subject = isUpdated
    ? `⚡ Payment Confirmed: Your bid is bumped to $${currentBid.toFixed(2)}! (New Secret Token inside)`
    : `🎟️ Payment Confirmed: Your message is queued! (Secret Bump Token inside)`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #0f172a; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);">
              
              <!-- Header Bar -->
              <tr>
                <td style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 24px 32px; text-align: center;">
                  <span style="display: inline-block; font-size: 28px; line-height: 1;">⚡</span>
                  <h1 style="margin: 8px 0 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">
                    Words of the World
                  </h1>
                  <p style="margin: 4px 0 0; color: #fef3c7; font-size: 13px; font-weight: 500;">
                    ${isUpdated ? 'Bid Boost Payment Received' : 'Payment Confirmed & Message Queued'}
                  </p>
                </td>
              </tr>

              <!-- Receipt Badge -->
              <tr>
                <td style="padding: 24px 32px 16px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px;">
                    <tr>
                      <td style="padding: 8px 12px;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; display: block;">Payment Status</span>
                        <strong style="color: #10b981; font-size: 15px;">✓ PAID & VERIFIED</strong>
                      </td>
                      <td align="right" style="padding: 8px 12px;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; display: block;">Current Priority Bid</span>
                        <strong style="color: #f59e0b; font-size: 18px;">$${currentBid.toFixed(2)} USD</strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Message Preview -->
              <tr>
                <td style="padding: 0 32px 20px;">
                  <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: block; margin-bottom: 8px;">
                    Your Broadcast Message
                  </span>
                  <div style="background-color: #0f172a; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px;">
                    <p style="margin: 0; font-size: 15px; color: #f8fafc; font-style: italic; line-height: 1.5;">
                      "${messageContent.slice(0, 220)}${messageContent.length > 220 ? '...' : ''}"
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Secret Bump Token Section -->
              <tr>
                <td style="padding: 0 32px 24px;">
                  <div style="background: linear-gradient(180deg, #2d2616 0%, #1e1e1a 100%); border: 1px solid #78350f; border-radius: 12px; padding: 20px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #fbbf24; display: block; margin-bottom: 8px;">
                      🔒 ${isUpdated ? 'YOUR NEW SECRET BUMP TOKEN (OLD TOKEN VOID)' : 'YOUR SECRET BUMP TOKEN'}
                    </span>
                    <p style="color: #cbd5e1; font-size: 12px; margin: 0 0 12px;">
                      Keep this token safe. It is your private key to boost your priority in the queue anytime.
                    </p>
                    <code style="display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 18px; font-weight: 700; color: #fef08a; background-color: #0f172a; padding: 8px 18px; border-radius: 8px; border: 1px dashed #f59e0b; letter-spacing: 0.05em;">
                      ${bumpToken}
                    </code>
                  </div>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td style="padding: 0 32px 28px; text-align: center;">
                  <table cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                    <tr>
                      <td style="border-radius: 9999px; background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);">
                        <a href="${bumpUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 9999px;">
                          ⚡ Boost Queue Rank (1-Click)
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 12px 0 0; font-size: 12px; color: #94a3b8;">
                    Or visit <a href="${broadcastUrl}" style="color: #fbbf24; text-decoration: underline;">Words of the World</a> and paste your token.
                  </p>
                </td>
              </tr>

              <!-- What Happens Next / Response Info -->
              <tr>
                <td style="padding: 20px 32px; background-color: #0f172a; border-top: 1px solid #334155;">
                  <h3 style="margin: 0 0 8px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #cbd5e1;">
                    What Happens Next?
                  </h3>
                  <ul style="margin: 0; padding-left: 18px; color: #94a3b8; font-size: 12px; line-height: 1.6;">
                    <li>Your message will climb the priority queue based on your bid amount ($${currentBid.toFixed(2)}).</li>
                    <li>If someone outbids your spot, we will instantly notify you via email so you can boost back up.</li>
                    <li>The instant your message goes live on the global billboard, you will receive a live broadcast alert!</li>
                  </ul>
                  
                  <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid #1e293b; color: #64748b; font-size: 11px;">
                    💬 <strong>Need support or have questions?</strong> Simply reply directly to this email and our team will assist you.
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

/**
 * Sponsor Mode Payment Confirmation Email (Includes Sponsor Edit Token)
 */
export async function sendSponsorConfirmationEmail({
  to,
  messageId,
  messageContent,
  sponsorToken,
  amountPaid = 3.0,
}: {
  to: string
  messageId: string
  messageContent: string
  sponsorToken?: string
  amountPaid?: number
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wow-murex-nu.vercel.app'
  const shoutoutUrl = sponsorToken
    ? `${siteUrl}/sponsor/${messageId}?token=${encodeURIComponent(sponsorToken)}`
    : `${siteUrl}/sponsor/${messageId}`
  const broadcastUrl = `${siteUrl}/w/${messageId}`

  const subject = `✨ Payment Confirmed: You just broadcasted a community voice worldwide!`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #0f172a; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);">
              
              <!-- Header Bar -->
              <tr>
                <td style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 24px 32px; text-align: center;">
                  <span style="display: inline-block; font-size: 28px; line-height: 1;">✨</span>
                  <h1 style="margin: 8px 0 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">
                    Thank You for Sponsoring a Voice!
                  </h1>
                  <p style="margin: 4px 0 0; color: #fdf2f8; font-size: 13px; font-weight: 500;">
                    Payment Confirmed · 30-Minute Live Worldwide Broadcast
                  </p>
                </td>
              </tr>

              <!-- Receipt Badge -->
              <tr>
                <td style="padding: 24px 32px 16px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px;">
                    <tr>
                      <td style="padding: 8px 12px;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; display: block;">Payment Status</span>
                        <strong style="color: #10b981; font-size: 15px;">✓ $${amountPaid.toFixed(2)} PAID</strong>
                      </td>
                      <td align="right" style="padding: 8px 12px;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; display: block;">Broadcast Duration</span>
                        <strong style="color: #c084fc; font-size: 16px;">30 Minutes Live</strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Sponsored Message Preview -->
              <tr>
                <td style="padding: 0 32px 20px;">
                  <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: block; margin-bottom: 8px;">
                    Sponsored Message
                  </span>
                  <div style="background-color: #0f172a; border-left: 4px solid #ec4899; border-radius: 8px; padding: 16px;">
                    <p style="margin: 0; font-size: 15px; color: #f8fafc; font-style: italic; line-height: 1.5;">
                      "${messageContent.slice(0, 220)}${messageContent.length > 220 ? '...' : ''}"
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Sponsor Edit Token Section -->
              ${sponsorToken ? `
              <tr>
                <td style="padding: 0 32px 24px;">
                  <div style="background: linear-gradient(180deg, #271a2e 0%, #1a1622 100%); border: 1px solid #86198f; border-radius: 12px; padding: 20px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #f472b6; display: block; margin-bottom: 8px;">
                      🎟️ YOUR SECRET SPONSOR EDIT TOKEN
                    </span>
                    <p style="color: #cbd5e1; font-size: 12px; margin: 0 0 12px;">
                      Use this token anytime to update your sponsor name and custom dedication message.
                    </p>
                    <code style="display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 16px; font-weight: 700; color: #fbcfe8; background-color: #0f172a; padding: 8px 18px; border-radius: 8px; border: 1px dashed #ec4899; word-break: break-all;">
                      ${sponsorToken}
                    </code>
                  </div>
                </td>
              </tr>
              ` : ''}

              <!-- CTA Buttons -->
              <tr>
                <td style="padding: 0 32px 28px; text-align: center;">
                  <table cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                    <tr>
                      <td style="border-radius: 9999px; background: linear-gradient(135deg, #ec4899, #8b5cf6); box-shadow: 0 4px 12px rgba(236, 72, 153, 0.35);">
                        <a href="${shoutoutUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 9999px;">
                          ✨ Add Your Sponsor Dedication & Name
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 12px 0 0; font-size: 12px; color: #94a3b8;">
                    Or view the <a href="${broadcastUrl}" style="color: #f472b6; text-decoration: underline;">Live Broadcast Memory Page →</a>
                  </p>
                </td>
              </tr>

              <!-- Response Info Footer -->
              <tr>
                <td style="padding: 20px 32px; background-color: #0f172a; border-top: 1px solid #334155;">
                  <div style="color: #64748b; font-size: 11px; line-height: 1.5;">
                    💬 <strong>Questions or need help?</strong> Reply directly to this email and our team will get right back to you.
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

/**
 * VIP Reserved Slot Payment Confirmation Email
 */
export async function sendVipReservationEmail({
  to,
  messageId,
  messageContent,
  amountPaid,
  scheduledStart,
  scheduledEnd,
  slotCount = 1,
}: {
  to: string
  messageId: string
  messageContent: string
  amountPaid: number
  scheduledStart?: string | null
  scheduledEnd?: string | null
  slotCount?: number
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wow-murex-nu.vercel.app'
  const broadcastUrl = `${siteUrl}/w/${messageId}`

  const startDateFormatted = scheduledStart
    ? new Date(scheduledStart).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }) + ' UTC'
    : 'Upcoming Guaranteed Slot'

  const endDateFormatted = scheduledEnd
    ? new Date(scheduledEnd).toLocaleString('en-US', { timeStyle: 'short', timeZone: 'UTC' }) + ' UTC'
    : ''

  const subject = `💎 Payment Confirmed: Your VIP Billboard Broadcast is Locked In!`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #0f172a; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);">
              
              <!-- Header Bar -->
              <tr>
                <td style="background: linear-gradient(135deg, #0284c7, #2563eb); padding: 24px 32px; text-align: center;">
                  <span style="display: inline-block; font-size: 28px; line-height: 1;">💎</span>
                  <h1 style="margin: 8px 0 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">
                    VIP Billboard Slot Confirmed!
                  </h1>
                  <p style="margin: 4px 0 0; color: #e0f2fe; font-size: 13px; font-weight: 500;">
                    Guaranteed Full-Screen Broadcast · Words of the World
                  </p>
                </td>
              </tr>

              <!-- Receipt Badge -->
              <tr>
                <td style="padding: 24px 32px 16px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px;">
                    <tr>
                      <td style="padding: 8px 12px;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; display: block;">Payment Status</span>
                        <strong style="color: #10b981; font-size: 15px;">✓ $${amountPaid.toFixed(2)} PAID</strong>
                      </td>
                      <td align="right" style="padding: 8px 12px;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; display: block;">Blocks Reserved</span>
                        <strong style="color: #38bdf8; font-size: 16px;">${slotCount} Slot${slotCount > 1 ? 's' : ''} (${slotCount * 3} Hours)</strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Scheduled Window -->
              <tr>
                <td style="padding: 0 32px 20px;">
                  <div style="background-color: #0369a120; border: 1px solid #0284c7; border-radius: 12px; padding: 16px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #38bdf8; display: block; margin-bottom: 4px;">
                      ⏰ RESERVED BROADCAST TIME
                    </span>
                    <strong style="font-size: 16px; color: #ffffff;">
                      ${startDateFormatted} ${endDateFormatted ? `to ${endDateFormatted}` : ''}
                    </strong>
                    <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">
                      Your message has a dedicated guaranteed slot on the billboard.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Message Preview -->
              <tr>
                <td style="padding: 0 32px 24px;">
                  <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; display: block; margin-bottom: 8px;">
                    Broadcast Message Preview
                  </span>
                  <div style="background-color: #0f172a; border-left: 4px solid #38bdf8; border-radius: 8px; padding: 16px;">
                    <p style="margin: 0; font-size: 15px; color: #f8fafc; font-style: italic; line-height: 1.5;">
                      "${messageContent.slice(0, 220)}${messageContent.length > 220 ? '...' : ''}"
                    </p>
                  </div>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td style="padding: 0 32px 28px; text-align: center;">
                  <table cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                    <tr>
                      <td style="border-radius: 9999px; background: linear-gradient(135deg, #0284c7, #2563eb); box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);">
                        <a href="${broadcastUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 9999px;">
                          💎 View Broadcast & Memory Page
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Response Info Footer -->
              <tr>
                <td style="padding: 20px 32px; background-color: #0f172a; border-top: 1px solid #334155;">
                  <div style="color: #64748b; font-size: 11px; line-height: 1.5;">
                    💬 <strong>Have questions or special requests for your VIP slot?</strong> Simply reply directly to this email and our team will get in touch with you immediately.
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

/**
 * Live Broadcast Notification Email (When message goes live on screen)
 */
export async function sendLiveNotificationEmail(to: string, messageContent: string, messageId?: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wow-murex-nu.vercel.app'
  const viewUrl = messageId ? `${siteUrl}/w/${messageId}` : siteUrl
  const subject = '🔥 Your message is LIVE right now on Words of the World!'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #fafafa;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #09090b; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #18181b; border-radius: 16px; border: 1px solid #27272a; overflow: hidden;">
              
              <tr>
                <td style="background: linear-gradient(135deg, #ef4444, #f97316); padding: 24px 32px; text-align: center;">
                  <span style="font-size: 32px;">🔥</span>
                  <h1 style="margin: 8px 0 0; color: #ffffff; font-size: 24px; font-weight: 800;">
                    Look Up! You're Live Worldwide!
                  </h1>
                  <p style="margin: 4px 0 0; color: #ffedd5; font-size: 14px;">
                    Your message is currently broadcasting on the big screen.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding: 28px 32px;">
                  <div style="background-color: #09090b; border: 2px solid #ef4444; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                    <h2 style="margin: 0; font-size: 20px; color: #fafafa; font-style: italic; line-height: 1.4;">
                      "${messageContent}"
                    </h2>
                  </div>

                  <div style="text-align: center;">
                    <a href="${viewUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #ef4444, #f97316); color: #ffffff; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 14px;">
                      🌍 Watch Live Screen Now →
                    </a>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding: 16px 32px; background-color: #09090b; border-top: 1px solid #27272a; text-align: center; font-size: 12px; color: #71717a;">
                  Words of the World · Live Global Billboard · <a href="${siteUrl}" style="color: #a1a1aa;">${siteUrl}</a>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

/**
 * Outbid Notification Email (When queue position drops)
 */
export async function sendOutbidEmail(to: string, messageContent: string, newRank: number, messageId: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wow-murex-nu.vercel.app'
  const bumpUrl = `${siteUrl}/w/${messageId}`
  const subject = `⚠️ You've been outbid! (New Rank: #${newRank})`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e2e8f0;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #0f172a; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden;">
              
              <tr>
                <td style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 24px 32px; text-align: center;">
                  <span style="font-size: 32px;">⚠️</span>
                  <h1 style="margin: 8px 0 0; color: #ffffff; font-size: 22px; font-weight: 800;">
                    Your Queue Position Dropped
                  </h1>
                  <p style="margin: 4px 0 0; color: #fef3c7; font-size: 13px;">
                    Someone just placed a higher bid on their message.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding: 24px 32px;">
                  <div style="background-color: #fef3c715; border: 1px solid #f59e0b; padding: 16px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
                    <p style="margin: 0; font-size: 15px; color: #fbbf24;">
                      Your new estimated rank is: <strong>#${newRank}</strong>
                    </p>
                  </div>

                  <div style="background-color: #0f172a; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 13px; color: #cbd5e1; font-style: italic;">
                      "${messageContent.slice(0, 160)}${messageContent.length > 160 ? '...' : ''}"
                    </p>
                  </div>

                  <div style="text-align: center; margin-bottom: 12px;">
                    <a href="${bumpUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #ffffff; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);">
                      ⚡ Bump My Bid & Reclaim Top Rank
                    </a>
                  </div>
                </td>
              </tr>

              <tr>
                <td style="padding: 16px 32px; background-color: #0f172a; border-top: 1px solid #334155; font-size: 11px; color: #64748b; text-align: center;">
                  💬 Have questions? Simply reply to this email for customer support.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  return sendEmail({ to, subject, html })
}

/**
 * Generic Receipt Email
 */
export async function sendReceiptEmail(to: string, messageContent: string, amount: number) {
  const subject = 'Receipt: Your message has been queued!'
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #333;">Thank you for your purchase!</h2>
      <p>Your message has been successfully queued and will be displayed on the billboard soon.</p>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-style: italic; color: #555;">"${messageContent}"</p>
      </div>
      
      <p><strong>Total Paid:</strong> $${amount.toFixed(2)} USD</p>
      <p style="color: #777; font-size: 12px; margin-top: 30px;">
        You will receive another email the moment your message goes live. Questions? Reply directly to this email.
      </p>
    </div>
  `

  return sendEmail({ to, subject, html })
}
