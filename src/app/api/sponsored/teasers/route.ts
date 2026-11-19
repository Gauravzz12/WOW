import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { toLockedSponsoredCard } from '@/lib/masking'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('id, content, bid_amount, created_at, style_config, category:categories(name, slug)')
      .eq('status', 'PENDING_PAYMENT')
      .eq('is_reserved_slot', false)
      // Sponsorship is Sponsored-tier only: unpaid Normal posts are
      // owner-paid and must never surface as sponsorable teasers. (This
      // filter was missing here — the homepage SSR query and the Waiting
      // Room page had it, this API did not, so the live-refreshed grid
      // re-added Normal posts as "awaiting a sponsor".)
      .eq('style_config->>isSponsored', 'true')
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) {
      return NextResponse.json({ teasers: [], error: error.message }, { status: 500 })
    }

    // Strip full content — only teaser + length leave the server.
    // Defense-in-depth: re-check the tier in JS, as the SSR query does.
    const teasers = (data || [])
      .filter((msg: any) => {
        const sc = typeof msg.style_config === 'string'
          ? (() => { try { return JSON.parse(msg.style_config) } catch { return {} } })()
          : (msg.style_config || {})
        return sc.isSponsored === true
      })
      .map((msg: any) =>
        toLockedSponsoredCard({
          id: msg.id,
          content: msg.content || '',
          bid_amount: msg.bid_amount,
          created_at: msg.created_at,
          category: msg.category,
        })
      )

    return NextResponse.json({ teasers }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (e: any) {
    return NextResponse.json({ teasers: [], error: e?.message || 'failed' }, { status: 500 })
  }
}
