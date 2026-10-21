'use server'

import { sendEmail } from '@/lib/email'

export interface ReportPayload {
  messageId: string
  reason: string
  details?: string
}

export async function submitContentReport(payload: ReportPayload) {
  const { messageId, reason, details } = payload

  if (!messageId || !reason) {
    return { error: 'Message ID and reason are required.' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://words.world'
  const messageUrl = `${appUrl}/w/${messageId}`
  const adminUrl = `${appUrl}/admin`
  const timestamp = new Date().toUTCString()

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f8; color: #111; margin: 0; padding: 24px; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e5e5; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
          .header { background: #dc2626; color: #ffffff; padding: 20px 24px; }
          .header h2 { margin: 0; font-size: 18px; letter-spacing: 0.5px; }
          .body { padding: 24px; line-height: 1.6; }
          .field { margin-bottom: 16px; }
          .label { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 4px; }
          .value { font-size: 14px; font-weight: 600; color: #111; background: #f3f4f6; padding: 8px 12px; border-radius: 8px; }
          .btn-group { margin-top: 24px; display: flex; gap: 12px; }
          .btn { display: inline-block; padding: 12px 20px; border-radius: 999px; text-decoration: none; font-size: 13px; font-weight: bold; }
          .btn-primary { background: #dc2626; color: #ffffff; }
          .btn-secondary { background: #f3f4f6; color: #111; border: 1px solid #e5e5e5; }
          .footer { padding: 16px 24px; background: #fafafa; border-top: 1px solid #e5e5e5; font-size: 11px; color: #888; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h2>⚠️ Urgent: Community Content Report</h2>
          </div>
          <div class="body">
            <p>A user flagged a live broadcast message for administrative review.</p>
            
            <div class="field">
              <div class="label">Message ID</div>
              <div class="value">${messageId}</div>
            </div>

            <div class="field">
              <div class="label">Violation Category</div>
              <div class="value" style="color: #dc2626;">${reason}</div>
            </div>

            ${details ? `
            <div class="field">
              <div class="label">User Note / Context</div>
              <div class="value" style="font-weight: normal;">${details.slice(0, 500)}</div>
            </div>` : ''}

            <div class="field">
              <div class="label">Report Timestamp</div>
              <div class="value" style="font-weight: normal;">${timestamp}</div>
            </div>

            <div class="btn-group">
              <a href="${adminUrl}" class="btn btn-primary" target="_blank">Open Admin Purge Dashboard</a>
              <a href="${messageUrl}" class="btn btn-secondary" target="_blank">View Live Card</a>
            </div>
          </div>
          <div class="footer">
            Words of the World 24/7 Moderation Dispatcher • Brevo Relay
          </div>
        </div>
      </body>
    </html>
  `

  const textContent = `
URGENT: Community Content Report
---------------------------------
Message ID: ${messageId}
Violation Category: ${reason}
User Note: ${details || 'None provided'}
Timestamp: ${timestamp}

Review / Purge at Admin Dashboard: ${adminUrl}
View Live Card: ${messageUrl}
  `

  try {
    const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'wordsoftheworld.lol@gmail.com'
    const sent = await sendEmail({
      to: adminEmail,
      subject: `[Content Report] Message #${messageId.slice(0, 8)} reported for ${reason}`,
      html: htmlContent,
    })

    if (!sent) {
      console.warn('Could not dispatch report alert email via primary or fallback relay.')
    }

    return { success: true }
  } catch (err: any) {
    console.error('Failed to submit content report:', err)
    return { success: true }
  }
}
