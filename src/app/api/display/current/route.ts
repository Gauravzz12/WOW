import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getMessageDurationSecs, isMessageExpired } from '@/lib/messageExpiry'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/display/current — READ-ONLY legacy display endpoint.
 *
 * Deliberately performs zero writes. Queue expiry, promotion, and unpaid
 * cleanup live in exactly one writer (runQueueAdvance, via /api/queue/advance
 * or page SSR). Earlier versions of this route expired PENDING_PAYMENT rows on
 * a different TTL (30 min REMOVED vs 12 h EXPIRED) and promoted without atomic
 * guards, causing nondeterministic statuses and duplicate ACTIVE messages.
 */
export async function GET() {
  const now = Date.now()

  const { data: activeMessages, error } = await supabaseAdmin
    .from('messages')
    .select('id, content, actual_start, scheduled_start, scheduled_end, is_reserved_slot, style_config, bid_amount, category:categories(slug, name, base_duration)')
    .eq('status', 'ACTIVE')
    .order('actual_start', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const live = (activeMessages || []).filter((msg: any) => !isMessageExpired(msg, now))

  if (live.length === 0) {
    return NextResponse.json({ message: null })
  }

  // Priority: normal track, then special, then sponsored — mirrors the UI.
  const pick =
    live.find((m: any) => !m.is_reserved_slot && m.bid_amount >= 10) ||
    live.find((m: any) => m.is_reserved_slot) ||
    live[0]

  const cat = Array.isArray(pick.category) ? pick.category[0] : pick.category

  return NextResponse.json({
    message: {
      ...pick,
      category: cat,
      durationSecs: getMessageDurationSecs(pick),
    },
  })
}
