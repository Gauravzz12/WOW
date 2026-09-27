import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getFixedSlotsForUtcDate, SPECIAL_SLOT_PRICE } from '@/lib/constants/pricing'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Generates fixed 3-hour slots for the next 15 UTC days if they don't exist.
// Uses the same UTC-day generator as the picker/pricing helpers so slot
// boundaries always align (a previous version used server-local setHours,
// producing misaligned slots on non-UTC hosts).
export async function POST() {
  const now = new Date()
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

  const slotsToInsert: { scheduled_start: string; scheduled_end: string; bid_amount: number; status: string }[] = []

  for (let day = 0; day < 15; day++) {
    const date = new Date(todayUtc)
    date.setUTCDate(date.getUTCDate() + day)
    for (const s of getFixedSlotsForUtcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())) {
      const slotStart = new Date(s.scheduled_start)
      // Skip slots already in the past
      if (slotStart <= now) continue
      slotsToInsert.push({
        scheduled_start: s.scheduled_start,
        scheduled_end: s.scheduled_end,
        bid_amount: SPECIAL_SLOT_PRICE,
        status: 'AVAILABLE'
      })
    }
  }

  if (slotsToInsert.length === 0) {
    return NextResponse.json({ message: 'No new slots to generate.' })
  }

  // Upsert using the named unique constraint on scheduled_start
  const { error } = await supabaseAdmin
    .from('reserved_slots')
    .upsert(slotsToInsert, { onConflict: 'scheduled_start', ignoreDuplicates: true })

  if (error) {
    console.error('Slot generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: `Generated ${slotsToInsert.length} slots.` })
}

// GET: Trigger slot generation on first load too
export async function GET() {
  return POST()
}
