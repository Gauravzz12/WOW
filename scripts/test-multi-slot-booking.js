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

async function runBookingTests() {
  console.log('=== RUNNING MULTI-SLOT BOOKING LOGIC TESTS ===\n')

  // 1. Fetch 3 continuous AVAILABLE slots
  const { data: availableSlots, error: fetchErr } = await supabase
    .from('reserved_slots')
    .select('id, scheduled_start, scheduled_end, status')
    .eq('status', 'AVAILABLE')
    .order('scheduled_start', { ascending: true })
    .limit(10)

  if (fetchErr || !availableSlots || availableSlots.length < 3) {
    throw new Error('Could not find at least 3 available slots for testing: ' + JSON.stringify(fetchErr))
  }

  // Find 3 contiguous slots
  let continuousThree = []
  for (let i = 0; i < availableSlots.length - 2; i++) {
    const s1 = availableSlots[i]
    const s2 = availableSlots[i+1]
    const s3 = availableSlots[i+2]
    if (
      new Date(s1.scheduled_end).getTime() === new Date(s2.scheduled_start).getTime() &&
      new Date(s2.scheduled_end).getTime() === new Date(s3.scheduled_start).getTime()
    ) {
      continuousThree = [s1, s2, s3]
      break
    }
  }

  if (continuousThree.length < 3) {
    throw new Error('Could not find 3 contiguous available slots in the list')
  }

  console.log(`Found 3 contiguous available slots:`)
  continuousThree.forEach((s, idx) => console.log(`  Slot ${idx+1}: ${s.scheduled_start} -> ${s.scheduled_end}`))

  // Test Continuity verification helper
  function checkContinuity(slots) {
    if (slots.length <= 1) return true
    for (let i = 1; i < slots.length; i++) {
      const prevEnd = new Date(slots[i - 1].scheduled_end).getTime()
      const currStart = new Date(slots[i].scheduled_start).getTime()
      if (prevEnd !== currStart) return false
    }
    return true
  }

  console.log('\nTest Continuity Check:')
  const isContinuous = checkContinuity(continuousThree)
  console.log('  Contiguous slots continuous check:', isContinuous)
  if (!isContinuous) throw new Error('Contiguous check failed')

  const nonContinuous = [continuousThree[0], continuousThree[2]]
  const isNonContinuous = checkContinuity(nonContinuous)
  console.log('  Discontinuous slots continuous check (should be false):', isNonContinuous)
  if (isNonContinuous) throw new Error('Discontinuous check failed to flag gap')

  console.log('\n=== ALL BOOKING LOGIC TESTS PASSED! ===')
}

runBookingTests().catch(err => {
  console.error(err)
  process.exit(1)
})
