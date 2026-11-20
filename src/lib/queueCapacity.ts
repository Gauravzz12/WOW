import { getSupabaseAdmin } from './supabase/admin'
import { BASE_NORMAL_MINS, MIN_NORMAL_BID } from './constants/pricing'

/**
 * Capacity limits for the two open-ended queues.
 *
 * WAITING_ROOM_CAPACITY — how many Sponsored messages may sit unpaid in
 * the Waiting Room at once. Matches the Waiting Room page's own display
 * limit (it fetches at most this many), so a message beyond the cap
 * could never even be seen by a potential sponsor.
 *
 * NORMAL_QUEUE_CAP_MINUTES — how much Normal-stage airtime may be
 * committed (ACTIVE remainder + everything QUEUED) before new Normal
 * broadcasts are refused. Only one Normal message airs at a time and
 * promotion is bid-ordered (paid first, then highest bid, then FIFO),
 * so an unbounded queue can starve a base-bid payer indefinitely: every
 * higher bid leapfrogs them, their paid turn never comes, and QUEUED
 * rows never expire. 24h of committed airtime bounds the worst-case
 * wait for the last message in line to about a day.
 */
export const WAITING_ROOM_CAPACITY = 100
export const NORMAL_QUEUE_CAP_MINUTES = 24 * 60

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

function durationSecsOf(styleConfig: any): number {
  let cfg = styleConfig
  if (typeof cfg === 'string') {
    try { cfg = JSON.parse(cfg) } catch { cfg = {} }
  }
  const secs = Number((cfg || {}).durationSecs)
  return Number.isFinite(secs) && secs > 0 ? secs : BASE_NORMAL_MINS * 60
}

/**
 * Minutes of Normal-stage airtime already committed: the remaining
 * runtime of the ACTIVE Normal broadcast plus the full durations of
 * every QUEUED Normal message (paid and promo — both consume stage
 * time). Normal classification mirrors queueAdvance: not a reserved
 * slot and bid_amount >= MIN_NORMAL_BID. Returns null on a read error.
 */
export async function getNormalQueueMinutes(nowMs: number = Date.now()): Promise<number | null> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('status, style_config, actual_start')
    .in('status', ['ACTIVE', 'QUEUED'])
    .eq('is_reserved_slot', false)
    .gte('bid_amount', MIN_NORMAL_BID)
  if (error || !data) {
    if (error) console.error('getNormalQueueMinutes failed:', error)
    return null
  }
  let secs = 0
  for (const row of data as any[]) {
    const dur = durationSecsOf(row.style_config)
    if (row.status === 'ACTIVE' && row.actual_start) {
      const elapsed = (nowMs - new Date(row.actual_start).getTime()) / 1000
      secs += Math.max(0, dur - (Number.isFinite(elapsed) ? elapsed : 0))
    } else {
      secs += dur
    }
  }
  return Math.round(secs / 60)
}

/** Combined snapshot for /api/queue/status and other display surfaces. */
export async function getQueueCapacity() {
  const [waitingCount, queueMinutes] = await Promise.all([
    countWaitingRoom(),
    getNormalQueueMinutes(),
  ])
  return {
    waitingRoom: {
      count: waitingCount ?? 0,
      capacity: WAITING_ROOM_CAPACITY,
      full: waitingCount !== null && waitingCount >= WAITING_ROOM_CAPACITY,
    },
    normalQueue: {
      minutesAhead: queueMinutes ?? 0,
      capMinutes: NORMAL_QUEUE_CAP_MINUTES,
      full: queueMinutes !== null && queueMinutes >= NORMAL_QUEUE_CAP_MINUTES,
    },
  }
}
