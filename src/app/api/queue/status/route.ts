import { NextResponse } from 'next/server'
import { getQueueCapacity } from '@/lib/queueCapacity'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

/**
 * GET /api/queue/status — capacity + pool snapshot for the create
 * wizard: whether the Waiting Room (Sponsored) still accepts new
 * messages, and the Normal bid-pool state (slots locked today, pool
 * size, current cutoff bid for the daily lock). Display-only: the
 * create action re-validates server-side, so this route degrades open
 * on any read failure.
 */
export async function GET() {
  try {
    const capacity = await getQueueCapacity()
    return NextResponse.json(capacity)
  } catch (e) {
    console.error('/api/queue/status failed:', e)
    return NextResponse.json({
      waitingRoom: { count: 0, capacity: 100, full: false },
      normalPool: { windowId: '', slotsPerDay: 24, lockedToday: 0, poolCount: 0, cutoffBid: null, nextLockMs: 0, lineup: [] },
    })
  }
}
