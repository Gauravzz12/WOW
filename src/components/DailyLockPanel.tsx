'use client'

import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'

/**
 * Daily Lock display for the Normal tier: when the next lock happens
 * (12:00 PM US Eastern), how many of today's 24 slots are filled, and
 * the lineup itself in air order. Data comes from /api/queue/status
 * (display-only; degrades to nothing on a failed fetch).
 *
 * variant "strip" — one-line summary above the homepage stage.
 * variant "panel" — full lineup card for the queue sidebar.
 */

interface LineupEntry {
  id: string
  slot: number
  bidAmount: number
  isPromo: boolean
  status: 'LIVE' | 'QUEUED'
  carriedOver?: boolean
}

interface PoolData {
  slotsPerDay: number
  lockedToday: number
  poolCount: number
  cutoffBid: number | null
  nextLockMs: number
  lineup: LineupEntry[]
}

function usePoolStatus(): PoolData | null {
  const [data, setData] = useState<PoolData | null>(null)
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/queue/status')
        if (!res.ok) return
        const json = await res.json()
        if (!cancelled && json?.normalPool) setData(json.normalPool)
      } catch {
        // Display-only — stay silent on failure.
      }
    }
    load()
    const t = setInterval(load, 30000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [])
  return data
}

function useNow(): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

function formatBid(n: number): string {
  return `$${Number.isInteger(n) ? n : n.toFixed(2)}`
}

export function DailyLockPanel({
  variant,
  data: dataProp,
}: {
  variant: 'strip' | 'panel'
  /** Optional pre-fetched pool status (QueueTabs shares one fetch
   *  between this panel and its locked-row badging). When undefined,
   *  the panel fetches /api/queue/status itself. */
  data?: PoolData | null
}) {
  const fetched = usePoolStatus()
  const now = useNow()
  const data = dataProp !== undefined ? dataProp : fetched
  if (!data || !data.nextLockMs) return null

  const countdown = formatCountdown(data.nextLockMs - now)

  if (variant === 'strip') {
    return (
      <div className="mb-3 flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium shadow-sm">
        <Lock size={12} className="shrink-0" />
        <span>
          Next daily lock in <span className="font-mono font-bold">{countdown}</span>
        </span>
        <span className="opacity-50">·</span>
        <span>
          {data.lockedToday}/{data.slotsPerDay} slots locked
        </span>
        <span className="opacity-50">·</span>
        <span>{data.poolCount} in the pool</span>
      </div>
    )
  }

  return (
    <div className="mt-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/25 text-left shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-emerald-800 dark:text-emerald-300">
          <Lock size={12} />
          Daily Lock
        </span>
        <span className="text-[11px] text-secondary">
          next lock in{' '}
          <span className="font-mono font-bold text-primary">{countdown}</span>
        </span>
      </div>

      <p className="text-[11px] text-secondary mt-1.5 leading-relaxed">
        The top {data.slotsPerDay} bids form today&apos;s lineup and air in
        order, 1 hour each. Open slots fill from the pool as the day goes;
        the lineup resets daily at 12:00 PM ET. Miss the cut and your bid
        rolls over — it never expires.
      </p>

      <div className="flex items-center gap-2 mt-2 text-[10px] font-semibold uppercase tracking-wider text-secondary">
        <span>
          {data.lockedToday}/{data.slotsPerDay} locked today
        </span>
        <span className="opacity-50">·</span>
        <span>{data.poolCount} in pool</span>
        {data.cutoffBid !== null && (
          <>
            <span className="opacity-50">·</span>
            <span>cutoff {formatBid(data.cutoffBid)}</span>
          </>
        )}
      </div>

      {data.lineup.length > 0 ? (
        <div className="mt-2.5 space-y-1 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
          {data.lineup.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] ${
                entry.status === 'LIVE'
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : 'border-primary/10 bg-background/60'
              }`}
            >
              <span className="font-mono font-semibold text-secondary">
                Slot #{entry.slot}
                {entry.carriedOver && (
                  <span className="ml-1.5 font-sans font-normal text-[10px] text-secondary/70">
                    earlier lock
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-mono font-bold">
                  {entry.isPromo ? 'FREE' : formatBid(entry.bidAmount)}
                </span>
                {entry.status === 'LIVE' ? (
                  <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live now
                  </span>
                ) : (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-secondary bg-background-elevated px-1.5 py-0.5 rounded-full border border-primary/10">
                    Locked
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-secondary/80 mt-2">
          No slots locked yet — the next lock fills today&apos;s lineup from
          the pool.
        </p>
      )}
    </div>
  )
}
