import { getSupabaseAdmin } from './supabase/admin'
import { getNormalPoolStats } from './lineup'

/**
 * Capacity snapshots for the create wizard.
 *
 * WAITING_ROOM_CAPACITY — how many Sponsored messages may sit unpaid in
 * the Waiting Room at once. Matches the Waiting Room page's own display
 * limit (it fetches at most this many), so a message beyond the cap
 * could never even be seen by a potential sponsor.
 *
 * The Normal queue is no longer airtime-capped: since the daily-lock
 * lineup (lib/lineup.ts), Normal posts join a bid pool and the top 24
 * lock in each day at midnight IST. The wizard shows pool stats (slots
 * locked today, pool size, current cutoff bid) instead of a full/open
 * gate — a post that misses today's cut simply rolls to the next lock.
 */
export const WAITING_ROOM_CAPACITY = 100

const supabaseAdmin = getSupabaseAdmin()

/**
 * Waiting Room occupancy, counted exactly as the Waiting Room page
 * defines its rows: PENDING_PAYMENT, not a reserved slot, and
 * style_config.isSponsored = true. Returns null on a read error —
 * callers fail open (the DB trigger from migration 20261120000001 is
 * the hard backstop for the Sponsored cap).
 */
export async function countWaitingRoom(): Promise<number | null> {
  const { count, error } = await supabaseAdmin
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'PENDING_PAYMENT')
    .eq('is_reserved_slot', false)
    .eq('style_config->>isSponsored', 'true')
  if (error) {
    console.error('countWaitingRoom failed:', error)
    return null
  }
  return typeof count === 'number' && Number.isFinite(count) ? count : null
}

/** Combined snapshot for /api/queue/status and other display surfaces. */
export async function getQueueCapacity() {
  const [waitingCount, pool] = await Promise.all([
    countWaitingRoom(),
    getNormalPoolStats().catch((e) => {
      console.error('getNormalPoolStats failed:', e)
      return null
    }),
  ])
  return {
    waitingRoom: {
      count: waitingCount ?? 0,
      capacity: WAITING_ROOM_CAPACITY,
      full: waitingCount !== null && waitingCount >= WAITING_ROOM_CAPACITY,
    },
    normalPool: pool ?? {
      windowId: '',
      slotsPerDay: 24,
      lockedToday: 0,
      poolCount: 0,
      cutoffBid: null,
      nextLockMs: 0,
    },
  }
}
