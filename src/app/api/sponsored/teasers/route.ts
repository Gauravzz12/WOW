import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { toLockedSponsoredCard } from '@/lib/masking'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('id, content, bid_amount, created_at, category:categories(name, slug)')
      .eq('status', 'PENDING_PAYMENT')
      .eq('is_reserved_slot', false)
      .order('created_at', { ascending: true })
      .limit(100)

    if (error) {
      return NextResponse.json({ teasers: [], error: error.message }, { status: 500 })
    }

    // Strip full content — only teaser + length leave the server.
    const teasers = (data || []).map((msg: any) =>
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
