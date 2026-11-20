import { NextResponse } from 'next/server'
import { getQueueCapacity } from '@/lib/queueCapacity'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

/**
 * GET /api/queue/status — queue capacity for the create wizard: whether
 * the Waiting Room (Sponsored) and the Normal broadcast queue still
 * accept new messages. Display-only: the create action re-validates
 * server-side, so this route degrades open (nothing full) on any read
 * failure.
 */
export async function GET() {
  try {
    const capacity = await getQueueCapacity()
    return NextResponse.json(capacity)
  } catch (e) {
    console.error('/api/queue/status failed:', e)
    return NextResponse.json({
      waitingRoom: { count: 0, capacity: 100, full: false },
      normalQueue: { minutesAhead: 0, capMinutes: 1440, full: false },
    })
  }
}
