import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getFixedSlotsForUtcDate, SPECIAL_SLOT_PRICE } from '@/lib/constants/pricing'

export const dynamic = 'force-dynamic'

const supabaseAdmin = getSupabaseAdmin()

// Generates fixed 3-hour slots for the next 15 UTC days if they don't exist.
// Uses the same UTC-day generator as the picker/pricing helpers so slot
// boundaries always align (a previous version used server-local setHours,
// producing misaligned slots on non-UTC hosts).
function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    // Fail closed in production: slot generation writes rows, so an
    // unconfigured secret must DENY there. Local dev (no secret) is allowed.
    return process.env.NODE_ENV !== 'production'
  }
  const authHeader = req.headers.get('authorization')
  const customHeader = req.headers.get('x-cron-secret')
  return authHeader === `Bearer ${cronSecret}` || customHeader === cronSecret
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
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
export async function GET(req: Request) {
  return POST(req)
}
