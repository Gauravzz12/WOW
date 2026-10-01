'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

/** Unpaid waiting-room messages are swept 12h after creation (see queueAdvance + page sweep). */
export const WAITING_ROOM_TTL_MS = 12 * 60 * 60 * 1000

function formatRemaining(ms: number): string {
  const totalSecs = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Live countdown showing how long an unpaid message has left before the
 * 12-hour sweep removes it. Renders a static placeholder until mounted to
 * avoid server/client hydration mismatch.
 */
export function WaitingRoomTimer({ createdAt }: { createdAt: string }) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  if (now === null) {
    return (
      <div className="flex items-center gap-1 text-xs text-secondary bg-background px-2 py-1 rounded border border-primary/10">
        <Clock size={12} />
        <span className="font-mono font-bold tabular-nums">--:--:--</span>
      </div>
    )
  }

  const remaining = new Date(createdAt).getTime() + WAITING_ROOM_TTL_MS - now
  const expired = remaining <= 0
  const urgent = !expired && remaining < 60 * 60 * 1000 // under 1h left

  return (
    <div
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${
        expired
          ? 'text-secondary bg-background border-primary/10'
          : urgent
          ? 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/30'
          : 'text-secondary bg-background border-primary/10'
      }`}
      title={expired ? 'Past the 12-hour window — awaiting removal' : 'Time left before this unpaid message is removed'}
    >
      <Clock size={12} />
      <span className="font-mono font-bold tabular-nums">
        {expired ? 'Expired' : formatRemaining(remaining)}
      </span>
    </div>
  )
}
