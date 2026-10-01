import { createClient } from '@/lib/supabase/server'
import { LeaderboardView, LeaderboardItem } from './LeaderboardView'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LeaderboardPage() {
  const supabase = createClient()
  
  // 1. Fetch top messages by reactions via RPC
  const { data: leaderboardQueue } = await supabase.rpc('get_leaderboard')
  const rawList = (leaderboardQueue || []) as LeaderboardItem[]

  // 2. Fetch delivery tier details (is_reserved_slot, bid_amount) for accurate classification
  let enrichedList: LeaderboardItem[] = rawList
  if (rawList.length > 0) {
    const ids = rawList.map((m) => m.id)
    const { data: details } = await supabase
      .from('messages')
      .select('id, is_reserved_slot, bid_amount')
      .in('id', ids)

    const detailsMap = new Map((details || []).map((d: any) => [d.id, d]))
    enrichedList = rawList.map((m) => {
      const detail: any = detailsMap.get(m.id)
      return {
        ...m,
        is_reserved_slot: detail?.is_reserved_slot ?? false,
        bid_amount: detail?.bid_amount ?? 0,
      }
    })
  }

  return <LeaderboardView items={enrichedList} />
}
