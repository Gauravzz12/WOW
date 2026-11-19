'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getDeviceId } from '@/lib/deviceId'

type PromoStatus = {
  claimed: number
  remaining: number
  limit: number
  deviceUsed: boolean
  perDeviceLimit: number
}

/**
 * Launch-promo banner for the homepage. The same offer used to be visible
 * only at Step 4 of the create wizard — most visitors never got there, so
 * they never learned Normal posts are free right now. Rendered above the
 * feed in MainFeedContainer, outside the per-tab views, so it shows on
 * every tab (Normal / Special / Sponsored).
 *
 * Live counts come from /api/promo/status (the wizard's own source).
 * Renders nothing until the status loads, and nothing once the offer is
 * fully claimed — a dead offer shouldn't take up the homepage.
 */
export default function FreePromoBanner() {
  const [status, setStatus] = useState<PromoStatus | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/promo/status?deviceId=${encodeURIComponent(getDeviceId())}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d && typeof d.remaining === 'number') setStatus(d)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  if (!status || status.remaining <= 0) return null

  return (
    <div className="w-full max-w-2xl shrink-0 z-30 mb-6 md:mb-10 overflow-hidden rounded-xl border border-emerald-600/30 bg-emerald-500/[0.08]">
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="text-3xl shrink-0" aria-hidden="true">🎉</div>
        <div className="flex-1 min-w-0">
          {status.deviceUsed ? (
            <>
              <p className="font-serif text-lg sm:text-xl text-primary leading-snug">
                You&rsquo;ve used your {status.perDeviceLimit ?? 5} free broadcasts
              </p>
              <p className="text-sm text-secondary mt-0.5">
                That&rsquo;s the per-device limit — {status.remaining} of {status.limit} are still up for grabs for everyone else.
              </p>
            </>
          ) : (
            <>
              <p className="font-serif text-lg sm:text-xl text-primary leading-snug">
                <span className="font-bold text-emerald-700 dark:text-emerald-300">{status.remaining} free messages</span> left — post yours free
              </p>
              <p className="text-sm text-secondary mt-0.5">
                We&rsquo;re covering the first {status.limit} Normal posts. No card, no catch.
              </p>
            </>
          )}
        </div>
        {!status.deviceUsed && (
          <Link
            href="/create"
            className="shrink-0 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 active:scale-95 transition-all"
          >
            Post free
          </Link>
        )}
      </div>
      <div
        className="h-1.5 bg-emerald-600/15"
        role="progressbar"
        aria-valuenow={status.claimed}
        aria-valuemin={0}
        aria-valuemax={status.limit}
        aria-label={`${status.claimed} of ${status.limit} free messages claimed`}
      >
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{ width: `${Math.min(100, Math.max(0, (status.claimed / status.limit) * 100))}%` }}
        />
      </div>
    </div>
  )
}
