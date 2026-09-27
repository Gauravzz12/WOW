import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Generates fixed 3-hour slots for the next 15 days if they don't exist yet.
export async function POST() {
  const now = new Date()
  now.setSeconds(0, 0)
  now.setMinutes(0)

  const slotsToInsert: { scheduled_start: string; scheduled_end: string; bid_amount: number; status: string }[] = []

  for (let day = 0; day < 15; day++) {
    for (let hour = 0; hour < 24; hour += 3) {
      const slotStart = new Date(now)
      slotStart.setDate(slotStart.getDate() + day)
      slotStart.setHours(hour, 0, 0, 0)

      // Skip slots in the past
      if (slotStart <= new Date()) continue

      const slotEnd = new Date(slotStart)
      slotEnd.setHours(slotEnd.getHours() + 3)

      slotsToInsert.push({
        scheduled_start: slotStart.toISOString(),
        scheduled_end: slotEnd.toISOString(),
        bid_amount: 30,
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
