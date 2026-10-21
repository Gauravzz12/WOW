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

async function testLiveAndOutbid() {
  console.log('--- Testing Live Notification & Outbid Emails via Brevo ---')
  
  // 1. Test Live Broadcast Notification Email
  console.log('\n1. Sending Live Broadcast Alert...')
  const liveRes = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'Words of the World',
        email: process.env.BREVO_SENDER_EMAIL || 'gthakurzzz424@gmail.com',
      },
      to: [{ email: recipient }],
      subject: '🔥 Your message is LIVE right now on Words of the World!',
      htmlContent: `
        <div style="font-family: sans-serif; background: #09090b; color: #fafafa; padding: 32px; border-radius: 12px; max-width: 580px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444, #f97316); padding: 18px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: #fff; margin: 0; font-size: 20px;">🔥 Look Up! You're Live Worldwide!</h1>
          </div>
          <p style="color: #a1a1aa; font-size: 14px;">Your message is currently broadcasting on the global billboard.</p>
          <div style="background: #18181b; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h2 style="margin: 0; color: #fff; font-style: italic;">"Hello World! Live on the big screen right now."</h2>
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://wow-murex-nu.vercel.app" style="background: linear-gradient(135deg, #ef4444, #f97316); color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-weight: bold; display: inline-block;">
              🌍 Watch Live Screen Now →
            </a>
          </div>
        </div>
      `,
    }),
  })
  const liveData = await liveRes.json()
  console.log('Live Alert Result:', liveData)

  // 2. Test Outbid Alert Email
  console.log('\n2. Sending Outbid Alert...')
  const outbidRes = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'Words of the World',
        email: process.env.BREVO_SENDER_EMAIL || 'gthakurzzz424@gmail.com',
      },
      to: [{ email: recipient }],
      subject: "⚠️ You've been outbid! (New Rank: #2)",
      htmlContent: `
        <div style="font-family: sans-serif; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px; max-width: 580px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 18px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: #fff; margin: 0; font-size: 20px;">⚠️ Your Queue Position Dropped</h1>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">Someone just placed a higher bid on their message, pushing yours down the queue.</p>
          <div style="background: #2d2616; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
            <span style="color: #fbbf24; font-size: 16px; font-weight: bold;">Your new estimated rank is: #2</span>
          </div>
          <div style="text-align: center; margin-top: 24px;">
            <a href="https://wow-murex-nu.vercel.app" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-weight: bold; display: inline-block;">
              ⚡ Bump My Bid & Reclaim #1 →
            </a>
          </div>
        </div>
      `,
    }),
  })
  const outbidData = await outbidRes.json()
  console.log('Outbid Alert Result:', outbidData)
}

testLiveAndOutbid()
