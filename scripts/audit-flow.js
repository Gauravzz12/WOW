const fs = require('fs')
const path = require('path')

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
}

async function audit() {
  console.log('=== SYSTEM AUDIT START ===\n')

  // 1. RPC functions
  console.log('1. Checking get_leaderboard RPC...')
  const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/get_leaderboard`, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  })
  const rpcData = await rpcRes.json()
  if (rpcRes.ok) {
    console.log('✓ get_leaderboard RPC exists and works! Rows returned:', Array.isArray(rpcData) ? rpcData.length : rpcData)
  } else {
    console.warn('⚠️ get_leaderboard RPC warning/error:', rpcData)
  }

  // 2. Check comments table
  console.log('\n2. Checking comments table...')
  const commentsRes = await fetch(`${supabaseUrl}/rest/v1/comments?limit=1`, { headers })
  const commentsData = await commentsRes.json()
  if (commentsRes.ok) {
    console.log('✓ comments table exists. Columns:', Object.keys(commentsData[0] || {}))
  } else {
    console.warn('⚠️ comments table error:', commentsData)
  }

  // 3. Check categories table
  console.log('\n3. Checking categories table...')
  const catRes = await fetch(`${supabaseUrl}/rest/v1/categories`, { headers })
  const catData = await catRes.json()
  if (catRes.ok) {
    console.log('✓ categories count:', catData.length, 'Slugs:', catData.map(c => c.slug))
  } else {
    console.warn('⚠️ categories error:', catData)
  }

  // 4. Check Brevo configuration
  console.log('\n4. Checking Brevo Configuration...')
  const brevoKey = process.env.BREVO_API_KEY
  console.log('BREVO_API_KEY set:', !!brevoKey)
  console.log('BREVO_SENDER_EMAIL set:', process.env.BREVO_SENDER_EMAIL)
  console.log('BREVO_SENDER_NAME set:', process.env.BREVO_SENDER_NAME)

  // 5. Check DodoPayments configuration
  console.log('\n5. Checking DodoPayments Configuration...')
  console.log('DODO_PAYMENTS_API_KEY set:', !!process.env.DODO_PAYMENTS_API_KEY)
  console.log('NEXT_PUBLIC_DODO_PAYMENTS_PRODUCT_ID set:', process.env.NEXT_PUBLIC_DODO_PAYMENTS_PRODUCT_ID)
  console.log('DODO_PAYMENTS_WEBHOOK_SECRET set:', !!process.env.DODO_PAYMENTS_WEBHOOK_SECRET)

  // 6. Check Dodo client live ping
  try {
    const DodoPayments = require('dodopayments').default
    const client = new DodoPayments({
      bearerToken: process.env.DODO_PAYMENTS_API_KEY,
      environment: 'test_mode',
    })
    const products = await client.products.list()
    console.log('✓ DodoPayments API connected! Found products count:', products.items?.length ?? products.length ?? 'yes')
  } catch (err) {
    console.warn('⚠️ DodoPayments API check note:', err.message)
  }

  // 7. Check Stripe configuration
  console.log('\n7. Checking Stripe Configuration...')
  console.log('STRIPE_SECRET_KEY set:', !!process.env.STRIPE_SECRET_KEY)
  console.log('STRIPE_WEBHOOK_SECRET set:', !!process.env.STRIPE_WEBHOOK_SECRET)

  console.log('\n=== SYSTEM AUDIT COMPLETE ===')
}

audit().catch(console.error)
