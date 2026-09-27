import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/slots/available
// Body: { slots: [{ scheduled_start, scheduled_end, bid_amount }] }
// Guarantees all 8 fixed 3-hour slots exist in the database and returns them with their current status and id.
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const requestedSlots: Array<{ scheduled_start: string; scheduled_end: string; bid_amount?: number }> = body.slots || []

    if (!requestedSlots.length) {
      return NextResponse.json({ error: 'No slots provided' }, { status: 400 })
    }

    const minStart = new Date(Math.min(...requestedSlots.map(s => new Date(s.scheduled_start).getTime()))).toISOString()
    const maxEnd = new Date(Math.max(...requestedSlots.map(s => new Date(s.scheduled_end).getTime()))).toISOString()

    // 1. Fetch any existing slots in this time window
    const { data: existingSlots, error: fetchError } = await supabaseAdmin
      .from('reserved_slots')
      .select('id, scheduled_start, scheduled_end, status, bid_amount')
      .gte('scheduled_start', minStart)
      .lte('scheduled_start', maxEnd)

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const existingMap = new Map((existingSlots || []).map(s => [new Date(s.scheduled_start).getTime(), s]))
    const slotsToCreate = []

    for (const r of requestedSlots) {
      const rTime = new Date(r.scheduled_start).getTime()
      if (!existingMap.has(rTime)) {
        slotsToCreate.push({
          scheduled_start: new Date(r.scheduled_start).toISOString(),
          scheduled_end: new Date(r.scheduled_end).toISOString(),
          bid_amount: r.bid_amount || 30,
          status: 'AVAILABLE'
        })
      }
    }

    if (slotsToCreate.length > 0) {
      await supabaseAdmin
        .from('reserved_slots')
        .upsert(slotsToCreate, { onConflict: 'scheduled_start', ignoreDuplicates: true })
    }

    // Always re-fetch all requested slots to guarantee real database UUID ids and current status
    const { data: allSlots } = await supabaseAdmin
      .from('reserved_slots')
      .select('id, scheduled_start, scheduled_end, status, bid_amount')
      .gte('scheduled_start', minStart)
      .lte('scheduled_start', maxEnd)

    const finalMap = new Map((allSlots || []).map(s => [new Date(s.scheduled_start).getTime(), s]))
    const result = requestedSlots.map(r => {
      const dbSlot = finalMap.get(new Date(r.scheduled_start).getTime())
      return dbSlot ? {
        id: dbSlot.id,
        scheduled_start: r.scheduled_start,
        scheduled_end: r.scheduled_end,
        status: dbSlot.status || 'AVAILABLE',
        bid_amount: dbSlot.bid_amount || 30
      } : r
    })
    return NextResponse.json({ slots: result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET /api/slots/available?start=...&end=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const startStr = searchParams.get('start')
  const endStr = searchParams.get('end')

  if (!startStr || !endStr) {
    return NextResponse.json({ error: 'Missing start or end param' }, { status: 400 })
  }

  const dayStart = new Date(startStr)
  const dayEnd = new Date(endStr)

  // Fetch all slots in this range
  const { data: slots, error } = await supabaseAdmin
    .from('reserved_slots')
    .select('id, scheduled_start, scheduled_end, status, bid_amount')
    .gte('scheduled_start', dayStart.toISOString())
    .lte('scheduled_start', dayEnd.toISOString())
    .order('scheduled_start', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ slots: slots || [] })
}
