import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { PROMO_FREE_LIMIT } from '@/lib/constants/pricing'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const supabaseAdmin = getSupabaseAdmin()

/**
 * GET /api/promo/status?deviceId=... — launch promo availability for the
 * create wizard: how many of the first-500 free Normal broadcasts are
 * claimed, and whether this device already used one.
 *
 * Display-only: the create action re-validates eligibility server-side,
 * so this route degrades open (full availability) on any read failure.
 */
export async function GET(req: Request) {
  const deviceId = (new URL(req.url).searchParams.get('deviceId') || '').slice(0, 100)

  try {
    const { count, error } = await supabaseAdmin
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('is_promo_free', true)
      .neq('status', 'REJECTED')
    if (error) throw error

    // Guard against non-finite counts (some PostgREST proxies report '*'
    // totals, which supabase-js surfaces as NaN rather than null).
    const claimed = typeof count === 'number' && Number.isFinite(count) ? count : 0

    let deviceUsed = false
    if (deviceId) {
      const { count: deviceCount } = await supabaseAdmin
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('is_promo_free', true)
        .eq('device_id', deviceId)
        .neq('status', 'REJECTED')
      deviceUsed = typeof deviceCount === 'number' && Number.isFinite(deviceCount) && deviceCount > 0
    }

    return NextResponse.json({
      claimed,
      remaining: Math.max(0, PROMO_FREE_LIMIT - claimed),
      limit: PROMO_FREE_LIMIT,
      deviceUsed,
    })
  } catch {
    return NextResponse.json({
      claimed: 0,
      remaining: PROMO_FREE_LIMIT,
      limit: PROMO_FREE_LIMIT,
      deviceUsed: false,
    })
  }
}
