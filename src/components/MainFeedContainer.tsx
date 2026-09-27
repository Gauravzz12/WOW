'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { LiveFeed } from './LiveFeed'
import { SponsoredGrid } from './SponsoredGrid'
import { VipSpecialView } from './VipSpecialView'
import { QueueTabs } from './QueueTabs'
import { LeftSidebar } from './LeftSidebar'
import { createClient } from '@/lib/supabase/client'
import { Menu, List } from 'lucide-react'
import Link from 'next/link'
import { getMessageDurationSecs, isMessageExpired } from '@/lib/messageExpiry'
import { getCategoryStyles } from '@/lib/utils/colors'

type TabType = 'NORMAL' | 'SPECIAL' | 'SPONSORED'

export function MainFeedContainer({
  initialNormalMsg,
  initialSpecialMsg,
  initialSponsoredMsgs, 
  initialNormalQueue,
  initialSpecialQueue,
  initialSponsoredQueue,
  initialLeaderboardQueue
}: {
  initialNormalMsg: any,
  initialSpecialMsg: any,
  initialSponsoredMsgs: any[],
  initialNormalQueue: any[],
  initialSpecialQueue: any[],
  initialSponsoredQueue: any[],
  initialLeaderboardQueue: any[]
}) {
  const searchParams = useSearchParams()
  
  // Read ?tab= param on first mount (set by post-payment redirect) then strip it from URL
  const getInitialTab = (): TabType => {
    const tab = searchParams?.get('tab')
    if (tab === 'SPECIAL' || tab === 'SPONSORED') return tab
    return 'NORMAL'
  }

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab)
  
  const [isLeftOpen, setIsLeftOpen] = useState(false)
  const [isRightOpen, setIsRightOpen] = useState(false)
  
  const [normalMsg, setNormalMsg] = useState(initialNormalMsg)
  const [specialMsg, setSpecialMsg] = useState(initialSpecialMsg)
  const [sponsoredMsgs, setSponsoredMsgs] = useState<any[]>(initialSponsoredMsgs)
  const [sponsoredIndex, setSponsoredIndex] = useState(0)

  const [normalQueue, setNormalQueue] = useState(initialNormalQueue)
  const [specialQueue, setSpecialQueue] = useState(initialSpecialQueue)
  const [sponsoredQueue, setSponsoredQueue] = useState(initialSponsoredQueue)

  // Stabilize supabase instance — avoids infinite effect re-runs
  const supabase = useMemo(() => createClient(), [])

  // Throttle queue-advance triggers: expiry timers, realtime refetch, and
  // background sync can otherwise fire overlapping POSTs every second and
  // thundering-herd the endpoint across N clients.
  const lastAdvanceAt = useRef(0)
  const postAdvanceThrottled = () => {
    const now = Date.now()
    if (now - lastAdvanceAt.current < 5000) return Promise.resolve(null)
    lastAdvanceAt.current = now
    return fetch('/api/queue/advance', { method: 'POST' })
      .then(r => r.json())
      .catch(() => null)
  }

  // Clean up ?tab= from URL so a page refresh doesn't re-apply the tab
  useEffect(() => {
    const tab = searchParams?.get('tab')
    if (tab) {
      const url = new URL(window.location.href)
      url.searchParams.delete('tab')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  // Real-time synchronization
  useEffect(() => {
    const fetchQueuesAndActive = async () => {
      // 1. Fetch active messages
      const { data: actives } = await supabase
        .from('messages')
        .select('id, content, actual_start, scheduled_start, scheduled_end, is_reserved_slot, style_config, bid_amount, template_id, category:categories(name, slug, base_duration)')
        .eq('status', 'ACTIVE')
        .order('actual_start', { ascending: false })

      let activeNormal: any = null
      let sMsg: any = null

      if (actives) {
        const nowMs = Date.now()
        const isNotExpired = (msg: any) => !isMessageExpired(msg, nowMs)

        // Consistent threshold: >= 2 everywhere (matches client queue fetch)
        const nMsg = actives.find(m => !m.is_reserved_slot && m.bid_amount >= 2 && isNotExpired(m))
        activeNormal = nMsg
        sMsg = actives.find(m => m.is_reserved_slot && isNotExpired(m))
        const spMsgs = actives.filter(m => !m.is_reserved_slot && m.bid_amount < 2 && isNotExpired(m)).slice(0, 10)

        // Always explicitly set — prevents stale messages staying on screen
        setNormalMsg(nMsg ? (() => {
          const cat = Array.isArray(nMsg.category) ? nMsg.category[0] : nMsg.category
          return { ...nMsg, category: cat, durationSecs: getMessageDurationSecs({ ...nMsg, category: cat }) }
        })() : null)

        setSpecialMsg(sMsg ? (() => {
          const cat = Array.isArray(sMsg.category) ? sMsg.category[0] : sMsg.category
          const config = typeof sMsg.style_config === 'string' ? JSON.parse(sMsg.style_config || '{}') : (sMsg.style_config || {})
          const durationSecs = sMsg.scheduled_end && sMsg.scheduled_start
            ? Math.max(0, Math.floor((new Date(sMsg.scheduled_end).getTime() - new Date(sMsg.scheduled_start).getTime()) / 1000))
            : (config.durationSecs || 10800)
          return { ...sMsg, category: cat, durationSecs }
        })() : null)

        setSponsoredMsgs(spMsgs.length > 0 ? spMsgs.map(m => {
          const cat = Array.isArray(m.category) ? m.category[0] : m.category
          return { ...m, category: cat, durationSecs: getMessageDurationSecs({ ...m, category: cat }) }
        }) : [])
      } else {
        setNormalMsg(null)
        setSpecialMsg(null)
        setSponsoredMsgs([])
      }

      // 2. Fetch queues
      const { data: nQueue } = await supabase
        .from('messages')
        .select('id, created_at, bid_amount, template_id, style_config, category:categories(name, slug, base_duration)')
        .eq('status', 'QUEUED')
        .eq('is_reserved_slot', false)
        .gte('bid_amount', 2) // Normal
        // Show highest bids first — matches the actual advance() promotion order
        .order('bid_amount', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(5)
      if (nQueue) setNormalQueue(nQueue)

      const { data: sQueue } = await supabase
        .from('messages')
        .select('id, created_at, scheduled_start, scheduled_end, bid_amount, template_id, style_config, category:categories(name, slug, base_duration)')
        .eq('status', 'QUEUED')
        .eq('is_reserved_slot', true)
        .order('created_at', { ascending: true })
        .limit(5)
      if (sQueue) setSpecialQueue(sQueue)

      // Sponsored: paid-but-low-bid (QUEUED, bid < 2) have full content (safe — paid).
      // Unpaid PENDING_PAYMENT must NEVER be fetched with full `content` via anon —
      // anon RLS now blocks them. Load locked teasers via the masked API instead.
      const { data: spPaidQueue } = await supabase
        .from('messages')
        .select('id, content, created_at, bid_amount, template_id, style_config, category:categories(name, slug, base_duration)')
        .eq('status', 'QUEUED')
        .eq('is_reserved_slot', false)
        .lt('bid_amount', 2)
        .order('created_at', { ascending: true })
        .limit(25)
      let spPendingTeasers: any[] = []
      try {
        const tRes = await fetch('/api/sponsored/teasers', { cache: 'no-store' })
        const tJson = await tRes.json()
        if (Array.isArray(tJson?.teasers)) spPendingTeasers = tJson.teasers
      } catch {}
      setSponsoredQueue([...(spPaidQueue || []), ...spPendingTeasers])

      // Automatic promotion checks for both queues:
      const nowTs = Date.now()
      const needsNormalAdvance = !activeNormal && nQueue && nQueue.length > 0
      const needsSpecialAdvance = !sMsg && sQueue && sQueue.some(m => {
        if (!m.scheduled_start) return false
        const startTs = new Date(m.scheduled_start).getTime()
        const endTs = m.scheduled_end ? new Date(m.scheduled_end).getTime() : startTs + 10800000
        return startTs <= nowTs && endTs > nowTs
      })

      if (needsNormalAdvance || needsSpecialAdvance) {
        try {
          const resJson = await postAdvanceThrottled()
          if (resJson?.promoted?.length > 0) {
            // Re-fetch immediately so the newly promoted message is placed on the stage
            const { data: freshActives } = await supabase
              .from('messages')
              .select('id, content, actual_start, scheduled_start, scheduled_end, is_reserved_slot, style_config, bid_amount, template_id, category:categories(name, slug, base_duration)')
              .eq('status', 'ACTIVE')
              .order('actual_start', { ascending: false })

            if (freshActives) {
              const freshNormal = freshActives.find(m => !m.is_reserved_slot && m.bid_amount >= 2)
              const freshSpecial = freshActives.find(m => m.is_reserved_slot)
              if (freshNormal) {
                const cat = Array.isArray(freshNormal.category) ? freshNormal.category[0] : freshNormal.category
                const config = typeof freshNormal.style_config === 'string' ? JSON.parse(freshNormal.style_config || '{}') : (freshNormal.style_config || {})
                setNormalMsg({ ...freshNormal, category: cat, durationSecs: config.durationSecs || cat?.base_duration || 3600 })
              }
              if (freshSpecial) {
                const cat = Array.isArray(freshSpecial.category) ? freshSpecial.category[0] : freshSpecial.category
                const config = typeof freshSpecial.style_config === 'string' ? JSON.parse(freshSpecial.style_config || '{}') : (freshSpecial.style_config || {})
                const durationSecs = freshSpecial.scheduled_end && freshSpecial.scheduled_start
                  ? Math.max(0, Math.floor((new Date(freshSpecial.scheduled_end).getTime() - new Date(freshSpecial.scheduled_start).getTime()) / 1000))
                  : (config.durationSecs || 10800)
                setSpecialMsg({ ...freshSpecial, category: cat, durationSecs })
              }
            }
          }
        } catch (e) {
          console.error('[advance] queue promotion error:', e)
        }
      }
    }

    // 1. Fetch immediately on mount so client state is guaranteed 100% fresh
    fetchQueuesAndActive()

    const channel = supabase.channel('realtime:all_queues')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        // Whenever a message changes (e.g. goes ACTIVE, QUEUED, or REMOVED), refetch state
        fetchQueuesAndActive()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reserved_slots' }, () => {
        // Whenever a VIP slot is booked or changed, refetch state
        fetchQueuesAndActive()
      })
      .subscribe()

    // Sync on tab focus / visibility return (e.g. after completing checkout)
    const handleSync = () => {
      if (document.visibilityState === 'visible') {
        fetchQueuesAndActive()
      }
    }
    window.addEventListener('visibilitychange', handleSync)
    window.addEventListener('focus', handleSync)

    // Check message expiration every 1 second without mutating queue state unnecessarily
    const expirationInterval = setInterval(() => {
      const now = Date.now()

      // Unified expiry math — no local 60s fallback (that nulled actives early).
      const isExpired = (msg: any) => {
        if (!msg) return false
        return isMessageExpired(msg, now)
      }

      let shouldAdvance = false

      setNormalMsg((prev: any) => {
        if (prev && isExpired(prev)) {
          shouldAdvance = true
          return null
        }
        return prev
      })

      setSpecialMsg((prev: any) => {
        if (prev && isExpired(prev)) {
          shouldAdvance = true
          return null
        }
        return prev
      })

      setSponsoredMsgs((prev: any[]) => {
        if (!prev || prev.length === 0) return prev
        const remaining = prev.filter(m => !isExpired(m))
        // Sponsored expiry also needs a server sweep (marks COMPLETED), so
        // trigger an advance instead of stalling until an unrelated event.
        if (remaining.length !== prev.length) shouldAdvance = true
        return remaining.length === prev.length ? prev : remaining
      })

      // Check if a queued VIP slot's scheduled time has arrived (and not yet ended).
      // Without the end check, an expired-but-still-queued VIP re-triggers an
      // advance POST on every 1s tick forever.
      setSpecialQueue((currentQueue: any[]) => {
        if (!shouldAdvance && currentQueue?.some(m => {
          if (!m.scheduled_start) return false
          const startTs = new Date(m.scheduled_start).getTime()
          const endTs = m.scheduled_end ? new Date(m.scheduled_end).getTime() : startTs + 10800000
          return startTs <= now && endTs > now
        })) {
          shouldAdvance = true
        }
        return currentQueue
      })

      if (shouldAdvance) {
        postAdvanceThrottled()
          .then((resJson) => {
            if (resJson?.promoted?.length > 0) {
              fetchQueuesAndActive()
            }
          })
          .catch(() => {})
      }
    }, 1000)

    // Background sync every 10 seconds to gracefully handle any missed websocket packets
    const backgroundSync = setInterval(() => {
      fetchQueuesAndActive()
    }, 10000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(expirationInterval)
      clearInterval(backgroundSync)
      window.removeEventListener('visibilitychange', handleSync)
      window.removeEventListener('focus', handleSync)
    }
  }, [supabase])

  const activeSponsoredMsg = sponsoredMsgs[sponsoredIndex] || sponsoredMsgs[0] || null

  const currentMsg = 
    activeTab === 'NORMAL' ? normalMsg : 
    activeTab === 'SPECIAL' ? specialMsg : 
    activeSponsoredMsg

  const currentCategorySlug = currentMsg?.category?.slug || 'general'
  const { accentClass } = getCategoryStyles(currentCategorySlug)

  return (
    <>
      <LeftSidebar isOpen={isLeftOpen} onClose={() => setIsLeftOpen(false)} />

      <div className="flex-1 h-[100dvh] flex flex-col items-center pt-6 md:pt-12 px-4 relative w-full overflow-hidden bg-background dark:bg-grid-white/[0.03] bg-grid-black/[0.03]">
        
        {/* Clean architectural backdrop — zero gradients */}
        <div className="fixed inset-0 pointer-events-none opacity-5 bg-grid z-0" />

        {/* Mobile Header */}
        <div className="w-full flex items-center justify-between mb-6 md:hidden shrink-0 z-30">
          <button onClick={() => setIsLeftOpen(true)} className="p-2 bg-background-elevated rounded-full text-secondary hover:text-primary shadow-lg border border-primary/10">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Link href="/leaderboard" className="p-2 bg-amber-500/10 rounded-full text-amber-500 hover:bg-amber-500 hover:text-white shadow-lg border border-amber-500/20 transition-colors">
              <span className="sr-only">Leaderboard</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            </Link>
            <button onClick={() => setIsRightOpen(true)} className="p-2 bg-background-elevated rounded-full text-secondary hover:text-primary shadow-lg border border-primary/10">
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Tablet and Desktop Right Nav (md and up) */}
        <div className="absolute top-8 right-8 z-30 hidden md:flex items-center gap-3">
          <Link href="/about" className="p-2 bg-background-elevated rounded-full text-secondary hover:text-primary shadow-lg border border-primary/10 transition-colors hidden lg:flex" title="About">
            <span className="sr-only">About</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </Link>
          <Link href="/leaderboard" className="p-2 bg-amber-500/10 rounded-full text-amber-500 hover:bg-amber-500 hover:text-white shadow-lg border border-amber-500/20 transition-colors" title="Leaderboard">
            <span className="sr-only">Leaderboard</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
          </Link>
          <button onClick={() => setIsRightOpen(true)} className="p-2 bg-background-elevated rounded-full text-secondary hover:text-primary shadow-lg border border-primary/10 lg:hidden" title="Queue">
            <List size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="z-30 bg-background-elevated/90 backdrop-blur-md rounded-full p-1.5 flex items-center gap-1 border border-primary/10 shadow-sm scale-90 md:scale-100 shrink-0 mb-8 md:mb-12 mt-2 md:mt-4">
          <button 
            onClick={() => setActiveTab('NORMAL')}
            className={`px-5 py-2 rounded-full text-xs font-mono font-medium tracking-wider uppercase transition-all ${
              activeTab === 'NORMAL' ? 'bg-primary text-background shadow-sm' : 'text-secondary hover:text-primary'
            }`}
          >
            Normal
          </button>
          <button 
            onClick={() => setActiveTab('SPECIAL')}
            className={`px-5 py-2 rounded-full text-xs font-mono font-medium tracking-wider uppercase transition-all flex items-center gap-1.5 ${
              activeTab === 'SPECIAL' 
                ? 'bg-violet-700 dark:bg-violet-600 text-white shadow-sm' 
                : 'text-secondary hover:text-violet-600 dark:hover:text-violet-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'SPECIAL' ? 'bg-amber-300' : 'bg-current'}`} />
            <span>✦ Special</span>
          </button>
          <button 
            onClick={() => setActiveTab('SPONSORED')}
            className={`px-5 py-2 rounded-full text-xs font-mono font-medium tracking-wider uppercase transition-all ${
              activeTab === 'SPONSORED' ? 'bg-primary text-background shadow-sm' : 'text-secondary hover:text-primary'
            }`}
          >
            Sponsored
          </button>
        </div>

        {/* Current Active Feed */}
        <div className="w-full max-w-7xl flex-1 relative z-10 flex flex-col items-center overflow-y-auto custom-scrollbar pt-2 md:pt-4 pb-16">
          <div className="w-full flex-1 flex flex-col items-center justify-start min-h-[400px]">
            {activeTab === 'SPONSORED' ? (
              <SponsoredGrid messages={sponsoredMsgs} waitingCount={sponsoredQueue.length} />
            ) : activeTab === 'SPECIAL' ? (
              <VipSpecialView activeSpecialMsg={specialMsg} upcomingVipQueue={specialQueue} />
            ) : (
              <LiveFeed initialMessage={currentMsg} key={currentMsg?.id || activeTab} activeTab={activeTab} />
            )}
          </div>
        </div>
      </div>

      <QueueTabs 
        globalQueue={normalQueue} 
        specialQueue={specialQueue} 
        sponsoredQueue={sponsoredQueue}
        activeTab={activeTab} 
        activeMsg={currentMsg}
        isOpen={isRightOpen}
        onClose={() => setIsRightOpen(false)}
      />
    </>
  )
}
