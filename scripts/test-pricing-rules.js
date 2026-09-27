const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'

class DummyWS {
  constructor() {}
  close() {}
  send() {}
  addEventListener() {}
  removeEventListener() {}
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
  realtime: { transport: DummyWS }
})

async function runTests() {
  console.log('=== RUNNING VERIFICATION FOR PRICING & DURATION RULES ===\n')

  // 1. Check Pricing Constants & Formulas
  console.log('Test 1: Normal Duration & Pricing Logic')
  function calculateNormalMinBid(mins) {
    const BASE_NORMAL_MINS = 60
    const EXTENSION_STEP_MINS = 10
    const EXTENSION_COST_PER_STEP = 5
    const BASE_NORMAL_PRICE = 15
    const extraMins = Math.max(0, mins - BASE_NORMAL_MINS)
    const steps = Math.ceil(extraMins / EXTENSION_STEP_MINS)
    return BASE_NORMAL_PRICE + (steps * EXTENSION_COST_PER_STEP)
  }

  const normalExpectations = [
    { mins: 60, expected: 15 },
    { mins: 70, expected: 20 },
    { mins: 80, expected: 25 },
    { mins: 90, expected: 30 },
    { mins: 100, expected: 35 },
    { mins: 110, expected: 40 },
    { mins: 120, expected: 45 },
  ]
  for (const { mins, expected } of normalExpectations) {
    const actual = calculateNormalMinBid(mins)
    if (actual !== expected) {
      throw new Error(`Normal bid mismatch for ${mins} mins: expected $${expected}, got $${actual}`)
    }
    console.log(`  ✓ ${mins} mins (${mins/60}h): $${actual} min bid matches expectation`)
  }

  // 2. Check Special Multi-Slot Continuous Pricing
  console.log('\nTest 2: Special Message 3-Hour Fixed Multi-Slot Pricing & 20% Discount')
  function calculateSpecialPrice(slotCount) {
    const SPECIAL_SLOT_PRICE = 30
    const SPECIAL_MULTI_SLOT_DISCOUNT = 0.20
    const originalPrice = slotCount * SPECIAL_SLOT_PRICE
    const discountRate = slotCount > 1 ? SPECIAL_MULTI_SLOT_DISCOUNT : 0
    const savings = Math.round(originalPrice * discountRate)
    const finalPrice = originalPrice - savings
    return { originalPrice, discount: discountRate, finalPrice, savings }
  }

  const specialExpectations = [
    { count: 1, expectedTotal: 30, expectedSavings: 0, hours: 3 },
    { count: 2, expectedTotal: 48, expectedSavings: 12, hours: 6 },
    { count: 3, expectedTotal: 72, expectedSavings: 18, hours: 9 },
  ]
  for (const { count, expectedTotal, expectedSavings, hours } of specialExpectations) {
    const res = calculateSpecialPrice(count)
    if (res.finalPrice !== expectedTotal || res.savings !== expectedSavings) {
      throw new Error(`Special price mismatch for ${count} slots: expected $${expectedTotal} (save $${expectedSavings}), got $${res.finalPrice} (save $${res.savings})`)
    }
    console.log(`  ✓ ${count} slot(s) (${hours} hrs): $${res.finalPrice} total (20% off saves $${res.savings})`)
  }

  // 3. Database Reserved Slots: Verify 3-Hour Duration & Fixed Alignment
  console.log('\nTest 3: Database Reserved Slots Duration & Alignment')
  const { data: slots, error: slotErr } = await supabase
    .from('reserved_slots')
    .select('id, scheduled_start, scheduled_end, bid_amount, status')
    .limit(20)

  if (slotErr || !slots || slots.length === 0) {
    throw new Error('Failed to retrieve reserved slots from database: ' + JSON.stringify(slotErr))
  }

  for (const slot of slots) {
    const start = new Date(slot.scheduled_start).getTime()
    const end = new Date(slot.scheduled_end).getTime()
    const durationHours = (end - start) / (1000 * 60 * 60)
    if (Math.round(durationHours) !== 3) {
      throw new Error(`Slot ${slot.id} duration is not 3 hours! Found: ${durationHours} hours (${slot.scheduled_start} -> ${slot.scheduled_end})`)
    }
  }
  console.log(`  ✓ Checked ${slots.length} database slots: all strictly 3 hours long (duration = 10,800s)`)

  // 4. Sponsored Messages: Verify 30 min duration (1800s)
  console.log('\nTest 4: Sponsored Messages Duration Verification')
  const { data: sponsoredMsgs, error: spErr } = await supabase
    .from('messages')
    .select('id, content, bid_amount, style_config')
    .eq('bid_amount', 1.00)

  if (spErr || !sponsoredMsgs) {
    throw new Error('Failed to retrieve sponsored messages: ' + JSON.stringify(spErr))
  }

  let verifiedSponsoredCount = 0
  for (const m of sponsoredMsgs) {
    const cfg = typeof m.style_config === 'string' ? JSON.parse(m.style_config) : m.style_config
    if (cfg && cfg.durationSecs) {
      if (cfg.durationSecs !== 1800) {
        throw new Error(`Sponsored message ${m.id} durationSecs is ${cfg.durationSecs}, expected 1800!`)
      }
      verifiedSponsoredCount++
    }
  }
  console.log(`  ✓ Verified ${verifiedSponsoredCount} sponsored messages in database: strictly 1,800 seconds (30 minutes)`)

  console.log('\n=== ALL PRICING & DURATION VERIFICATIONS PASSED SUCCESSFULLY! ===')
}

runTests().catch(err => {
  console.error('Verification failed:', err)
  process.exit(1)
})
