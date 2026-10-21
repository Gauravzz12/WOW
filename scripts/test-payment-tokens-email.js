const fs = require('fs')
const path = require('path')

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
    }
  })
}

const recipient = process.argv[2] || process.env.BREVO_SENDER_EMAIL || 'gthakurzzz424@gmail.com'

console.log('Sending full Payment Completion + Secret Bump Token email test...')

const testPayload = {
  sender: {
    name: process.env.BREVO_SENDER_NAME || 'Words of the World',
    email: process.env.BREVO_SENDER_EMAIL || 'gthakurzzz424@gmail.com',
  },
  to: [{ email: recipient }],
  subject: '🎟️ Payment Confirmed: Your message is queued! (Secret Bump Token inside)',
  htmlContent: `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #0f172a; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);">
              <tr>
                <td style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 24px 32px; text-align: center;">
                  <span style="font-size: 28px;">⚡</span>
                  <h1 style="margin: 8px 0 0; color: #ffffff; font-size: 22px; font-weight: 800;">Words of the World</h1>
                  <p style="margin: 4px 0 0; color: #fef3c7; font-size: 13px;">Payment Confirmed & Message Queued</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 24px 32px 16px;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 16px;">
                    <tr>
                      <td style="padding: 8px 12px;">
                        <span style="font-size: 11px; text-transform: uppercase; color: #94a3b8; display: block;">Payment Status</span>
                        <strong style="color: #10b981; font-size: 15px;">✓ PAID & VERIFIED</strong>
                      </td>
                      <td align="right" style="padding: 8px 12px;">
                        <span style="font-size: 11px; text-transform: uppercase; color: #94a3b8; display: block;">Current Priority Bid</span>
                        <strong style="color: #f59e0b; font-size: 18px;">$15.00 USD</strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 32px 20px;">
                  <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #94a3b8; display: block; margin-bottom: 8px;">Your Broadcast Message</span>
                  <div style="background-color: #0f172a; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px;">
                    <p style="margin: 0; font-size: 15px; color: #f8fafc; font-style: italic;">
                      "Hello World from the Words of the World global billboard! Testing Brevo transactional emails."
                    </p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 32px 24px;">
                  <div style="background: linear-gradient(180deg, #2d2616 0%, #1e1e1a 100%); border: 1px solid #78350f; border-radius: 12px; padding: 20px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #fbbf24; display: block; margin-bottom: 8px;">
                      🔒 YOUR SECRET BUMP TOKEN
                    </span>
                    <p style="color: #cbd5e1; font-size: 12px; margin: 0 0 12px;">
                      Keep this token safe. It is your private key to boost your priority in the queue anytime.
                    </p>
                    <code style="display: inline-block; font-family: monospace; font-size: 18px; font-weight: 700; color: #fef08a; background-color: #0f172a; padding: 8px 18px; border-radius: 8px; border: 1px dashed #f59e0b;">
                      wow_bump_a7f920bc
                    </code>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 32px 28px; text-align: center;">
                  <a href="https://wow-murex-nu.vercel.app/?bumpToken=wow_bump_a7f920bc" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); padding: 14px 32px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 9999px;">
                    ⚡ Boost Queue Rank (1-Click)
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 32px; background-color: #0f172a; border-top: 1px solid #334155;">
                  <div style="color: #64748b; font-size: 11px; line-height: 1.5;">
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
  `,
}

fetch('https://api.brevo.com/v3/smtp/email', {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'api-key': process.env.BREVO_API_KEY,
  },
  body: JSON.stringify(testPayload),
})
  .then(res => res.json())
  .then(data => {
    console.log('Result from Brevo:', data)
  })
  .catch(err => {
    console.error('Error sending:', err)
  })
