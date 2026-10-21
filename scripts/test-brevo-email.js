const fs = require('fs')
const path = require('path')

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split(/\r?\n/).forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      const val = match[2].trim().replace(/^["']|["']$/g, '')
      process.env[key] = val
    }
  })
}

const BREVO_API_KEY = process.env.BREVO_API_KEY
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'gthakurzzz424@gmail.com'
const SENDER_NAME = process.env.BREVO_SENDER_NAME || 'Words of the World'
const RECIPIENT = process.argv[2] || process.env.TEST_EMAIL_FALLBACK || 'gthakurzzz424@gmail.com'

console.log('--- Testing Brevo Transactional Email Integration ---')
console.log('Brevo API Key present:', !!BREVO_API_KEY, BREVO_API_KEY ? `(${BREVO_API_KEY.slice(0, 12)}...)` : '')
console.log('Sender:', `"${SENDER_NAME}" <${SENDER_EMAIL}>`)
console.log('Recipient:', RECIPIENT)

if (!BREVO_API_KEY) {
  console.error('Error: BREVO_API_KEY is not defined in .env.local')
  process.exit(1)
}

async function testBrevo() {
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: SENDER_NAME,
          email: SENDER_EMAIL,
        },
        to: [
          {
            email: RECIPIENT,
          },
        ],
        subject: '⚡ Words of the World: Brevo Integration Test',
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px;">
            <h2 style="color: #f59e0b; margin-top: 0;">Words of the World — Brevo Test</h2>
            <p>Your Brevo transactional email system is now wired up and ready!</p>
            <div style="background: #1e293b; padding: 16px; border-radius: 8px; border: 1px solid #334155;">
              <p style="margin: 0; color: #10b981; font-weight: bold;">✓ Payment Completion Receipts</p>
              <p style="margin: 6px 0; color: #f59e0b; font-weight: bold;">✓ Secret Bump & Sponsor Tokens</p>
              <p style="margin: 6px 0 0; color: #38bdf8; font-weight: bold;">✓ Customer Response & Support Confirmation</p>
            </div>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">Sent via Brevo v3 Transactional API</p>
          </div>
        `,
      }),
    })

    const data = await res.json()
    if (res.ok) {
      console.log('SUCCESS! Email sent successfully via Brevo:')
      console.log(data)
    } else {
      console.error('Brevo API returned error:')
      console.log(JSON.stringify(data, null, 2))
      if (data.message && data.message.includes('unrecognised IP address')) {
        console.log('\n======================================================')
        console.log('ACTION REQUIRED IN BREVO DASHBOARD:')
        console.log('Your Brevo account has Authorised IP address protection enabled.')
        console.log('To allow this machine or server to send emails, visit:')
        console.log('👉 https://app.brevo.com/security/authorised_ips')
        console.log('Add your IP or disable IP restriction to allow cloud deployments (e.g. Vercel).')
        console.log('======================================================\n')
      }
    }
  } catch (err) {
    console.error('Network error during Brevo test:', err)
  }
}

testBrevo()
