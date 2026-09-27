import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { MainFeedContainer } from '@/components/MainFeedContainer'
import { Suspense } from 'react'
import { runQueueAdvance } from '@/lib/queueAdvance'
import { toLockedSponsoredCard } from '@/lib/masking'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Advance queue so expired messages are archived and due messages are promoted before initial load
  await runQueueAdvance().catch((err) => {
    console.error('[page] runQueueAdvance error:', err)
  })

  const supabase = createClient()
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch all initial data in parallel to minimize Server Response Time (TTFB)
  // NOTE paywall: anon RLS can no longer read PENDING_PAYMENT. Paid QUEUED sponsored
  // (bid<2) remain readable with full content (safe — already paid). Unpaid rows are
  // fetched via service-role and masked to teasers only — full text never leaves server.
  const [
    { data: categories },
    { data: globalQueue },
    { data: specialQueue },
    { data: sponsoredPaidQueue },
    { data: sponsoredPendingRaw },
    { data: leaderboardQueue },
    { data: activeMessages }
  ] = await Promise.all([
    supabase.from('categories').select('id, slug, name').order('name'),
    supabase
      .from('messages')
      .select('id, content, created_at, bid_amount, category:categories(name, slug)')
      .eq('status', 'QUEUED')
      .eq('is_reserved_slot', false)
      .gte('bid_amount', 2)
      .order('bid_amount', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(5),
    supabase
      .from('messages')
      .select('id, content, created_at, scheduled_start, scheduled_end, bid_amount, category:categories(name, slug)')
      .eq('status', 'QUEUED')
      .eq('is_reserved_slot', true)
      .order('created_at', { ascending: true })
      .limit(5),
    supabase
      .from('messages')
      .select('id, content, created_at, bid_amount, category:categories(name, slug)')
      .eq('status', 'QUEUED')
      .eq('is_reserved_slot', false)
      .lt('bid_amount', 2)
      .order('created_at', { ascending: true })
      .limit(25),
    supabaseAdmin
      .from('messages')
      .select('id, content, created_at, bid_amount, category:categories(name, slug)')
      .eq('status', 'PENDING_PAYMENT')
      .eq('is_reserved_slot', false)
      .order('created_at', { ascending: true })
      .limit(100),
    supabase.rpc('get_leaderboard'),
    supabase
      .from('messages')
      .select('id, content, actual_start, scheduled_start, scheduled_end, is_reserved_slot, style_config, bid_amount, template_id, category:categories(name, slug, base_duration)')
      .eq('status', 'ACTIVE')
      .order('actual_start', { ascending: false })
      .limit(20)
  ])

  // Mask unpaid rows: drop `content`, keep teaser + length only.
  const sponsoredPendingTeasers = (sponsoredPendingRaw || []).map((msg: any) =>
    toLockedSponsoredCard({
      id: msg.id,
      content: msg.content || '',
      bid_amount: msg.bid_amount,
      created_at: msg.created_at,
      category: msg.category,
    })
  )
  // Homepage queue = paid QUEUED sponsored (full, safe) + locked pending teasers.
  const sponsoredQueue = [...(sponsoredPaidQueue || []), ...sponsoredPendingTeasers]

  let initialNormalMsg = null
  let initialSpecialMsg = null
  let initialSponsoredMsgs: any[] = []

  if (activeMessages) {
    const isNotExpired = (msg: any) => {
      const cat = Array.isArray(msg.category) ? msg.category[0] : msg.category
      const config = typeof msg.style_config === 'string' ? JSON.parse(msg.style_config || '{}') : (msg.style_config || {})
      // Consistent threshold: normal = bid >= 2, sponsored = bid < 2
      const duration = config.durationSecs || cat?.base_duration || (msg.is_reserved_slot ? 10800 : msg.bid_amount < 2 ? 1800 : 3600)
      const endTime = msg.is_reserved_slot && msg.scheduled_end
        ? new Date(msg.scheduled_end).getTime()
        : (msg.actual_start ? new Date(msg.actual_start).getTime() + duration * 1000 : Date.now() + 1000)
      return Date.now() <= endTime
    }

    const nMsg = activeMessages.find(m => !m.is_reserved_slot && m.bid_amount >= 2 && isNotExpired(m))
    const sMsg = activeMessages.find(m => m.is_reserved_slot && isNotExpired(m))
    const spMsgs = activeMessages.filter(m => !m.is_reserved_slot && m.bid_amount < 2 && isNotExpired(m)).slice(0, 20)

    const processMsg = (msg: any, defaultDuration: number) => {
      const cat = Array.isArray(msg.category) ? msg.category[0] : msg.category
      const config = typeof msg.style_config === 'string' ? JSON.parse(msg.style_config || '{}') : (msg.style_config || {})
      const durationSecs = msg.is_reserved_slot && msg.scheduled_end && msg.scheduled_start
        ? Math.max(0, Math.floor((new Date(msg.scheduled_end).getTime() - new Date(msg.scheduled_start).getTime()) / 1000))
        : (config.durationSecs || cat?.base_duration || defaultDuration)
      return { ...msg, category: cat, durationSecs }
    }

    if (nMsg) initialNormalMsg = processMsg(nMsg, 3600)
    if (sMsg) initialSpecialMsg = processMsg(sMsg, 10800)
    if (spMsgs.length > 0) initialSponsoredMsgs = spMsgs.map(m => processMsg(m, 1800))
  }

  return (
    <main className="min-h-screen bg-background text-primary flex flex-col md:flex-row overflow-hidden relative">
      
      {/* Left Sidebar is now managed by MainFeedContainer */}

      <Suspense fallback={null}>
        <MainFeedContainer 
          initialNormalMsg={initialNormalMsg}
          initialSpecialMsg={initialSpecialMsg}
          initialSponsoredMsgs={initialSponsoredMsgs}
          initialNormalQueue={globalQueue || []}
          initialSpecialQueue={specialQueue || []}
          initialSponsoredQueue={sponsoredQueue || []}
          initialLeaderboardQueue={leaderboardQueue || []}
        />
      </Suspense>
    </main>
  );
}
