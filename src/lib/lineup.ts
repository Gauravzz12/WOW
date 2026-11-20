import { getSupabaseAdmin } from './supabase/admin'
import { MIN_NORMAL_BID } from './constants/pricing'

/**
 * The Normal stage runs on a DAILY LOCK (product decision, 2026-11-20):
 * every Normal broadcast is exactly 1 hour. Once a day, at 12:00 PM noon
 * US Eastern, the top 24 bids in the pool are locked into that day's
 * lineup and air sequentially in bid order (slot 1 first). Bids that
 * don't make the cut stay in the pool and compete again at the next
 * lock — nothing expires and no paid post can be jumped once it's
 * locked in.
 *
 * A "lineup mark" lives in style_config.lineup: { windowId, slot,
 * lockedAt }. windowId is the US-Eastern calendar date of the lock
 * instant. The lock is applied lazily by the queue-advance sweep (and
 * topped up whenever a later sweep finds the day's lineup short of 24
 * with pool posts waiting — top-ups only ever APPEND slots in rank
 * order, so a locked post's slot can never be taken or moved).
 */
export const LINEUP_SLOTS_PER_DAY = 24
export const LINEUP_TIMEZONE = 'America/New_York'
/** The daily lock instant: 12:00 PM (noon) in the lock timezone. */
export const LINEUP_LOCK_HOUR = 12
const HOUR_MS = 60 * 60 * 1000

export interface LineupMark {
  windowId: string
  slot: number
  lockedAt: string
}

export function parseStyleConfig(style: any): Record<string, any> {
  if (!style) return {}
  if (typeof style === 'string') {
    try {
      return JSON.parse(style || '{}')
    } catch {
      return {}
    }
  }
  return style
}

export function getLineupMark(styleConfig: any): LineupMark | null {
  const mark = parseStyleConfig(styleConfig)?.lineup
  if (mark && typeof mark.windowId === 'string' && typeof mark.slot === 'number') {
    return mark as LineupMark
  }
  return null
}

interface ZonedParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

function zonedParts(ms: number, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(new Date(ms))
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value || 0)
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour') % 24,
    minute: get('minute'),
    second: get('second'),
  }
}

/**
 * The UTC instant (ms) of a wall-clock time in the given IANA zone.
 * Iterates the offset correction; exact across DST transitions for
 * unambiguous wall times (noon always is). Pure — unit-tested.
 */
export function utcMsForZonedTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): number {
  const target = Date.UTC(year, month - 1, day, hour, minute, 0)
  let guess = target
  for (let i = 0; i < 3; i++) {
    const p = zonedParts(guess, timeZone)
    const actual = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
    const diff = target - actual
    if (diff === 0) break
    guess += diff
  }
  return guess
}

function dateId(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/**
 * The current lineup window: starts at the most recent lock instant
 * (12:00 PM US Eastern) and runs until the next one. Because of DST a
 * window can be 23 or 25 hours long — slot start times are nominal
 * (the stage airs the lineup back-to-back regardless). Pure —
 * unit-tested, including both DST transitions.
 */
export function lineupWindowFor(now: Date): {
  windowId: string
  startMs: number
  nextLockMs: number
} {
  // Testing hook: LINEUP_WINDOW_MINUTES (server env) collapses the lock
  // period to N-minute buckets aligned to the UTC epoch, so the daily
  // lock/rollover cycle can be exercised end-to-end in minutes during a
  // test-mode session. Unset (production) = the daily noon-ET schedule.
  const overrideMins = Number(process.env.LINEUP_WINDOW_MINUTES)
  if (Number.isFinite(overrideMins) && overrideMins > 0) {
    const period = overrideMins * 60_000
    const startMs = Math.floor(now.getTime() / period) * period
    return { windowId: new Date(startMs).toISOString(), startMs, nextLockMs: startMs + period }
  }
  const p = zonedParts(now.getTime(), LINEUP_TIMEZONE)
  let wy = p.year
  let wm = p.month
  let wd = p.day
  let startMs = utcMsForZonedTime(wy, wm, wd, LINEUP_LOCK_HOUR, 0, LINEUP_TIMEZONE)
  if (now.getTime() < startMs) {
    // Before today's lock — the current window began at yesterday's noon.
    const prev = new Date(Date.UTC(wy, wm - 1, wd - 1))
    wy = prev.getUTCFullYear()
    wm = prev.getUTCMonth() + 1
    wd = prev.getUTCDate()
    startMs = utcMsForZonedTime(wy, wm, wd, LINEUP_LOCK_HOUR, 0, LINEUP_TIMEZONE)
  }
  const next = new Date(Date.UTC(wy, wm - 1, wd + 1))
  const nextLockMs = utcMsForZonedTime(
    next.getUTCFullYear(),
    next.getUTCMonth() + 1,
    next.getUTCDate(),
    LINEUP_LOCK_HOUR,
    0,
    LINEUP_TIMEZONE,
  )
  return { windowId: dateId(wy, wm, wd), startMs, nextLockMs }
}

/** Nominal start of a 1-based slot within its window (display/estimate). */
export function slotStartMs(windowStartMs: number, slot: number): number {
  return windowStartMs + (slot - 1) * HOUR_MS
}

/** e.g. "1:00 PM EST" — a slot's nominal start in the lock timezone. */
export function formatLockTime(ms: number): string {
  try {
    return new Date(ms).toLocaleTimeString('en-US', {
      timeZone: LINEUP_TIMEZONE,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    })
  } catch {
    return ''
  }
}

export interface NormalQueueRow {
  id: string
  content: string
  bid_amount: number
  is_promo_free: boolean
  created_at: string
  reminder_email: string | null
  style_config: any
}

/**
 * Every QUEUED Normal message (paid and promo), in lock rank order:
 * paid before promo-free, then highest bid, then oldest first. This is
 * the single ordering used by the lock, by promotion, and by the pool
 * stats the wizard displays — they can never disagree.
 */
export async function fetchNormalQueue(
  admin = getSupabaseAdmin(),
): Promise<NormalQueueRow[]> {
  const { data, error } = await admin
    .from('messages')
    .select('id, content, bid_amount, is_promo_free, created_at, reminder_email, style_config')
    .eq('status', 'QUEUED')
    .eq('is_reserved_slot', false)
    .gte('bid_amount', MIN_NORMAL_BID)
    .order('is_promo_free', { ascending: true })
    .order('bid_amount', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(500)
  if (error) {
    console.error('fetchNormalQueue failed:', error)
    return []
  }
  return (data as any[]) ?? []
}

/**
 * Fill the current window's lineup from the pool, in rank order, up to
 * LINEUP_SLOTS_PER_DAY. Idempotent and append-only: posts already locked
 * into this window keep their slots; posts locked into an OLD window
 * (locked but never aired) re-enter the pool and are re-locked fresh.
 * Returns the posts locked by THIS call (for notifications).
 */
export async function ensureLineupLocked(
  now: Date = new Date(),
  admin = getSupabaseAdmin(),
): Promise<{
  windowId: string
  windowStartMs: number
  lockedCount: number
  newlyLocked: { row: NormalQueueRow; slot: number }[]
}> {
  const win = lineupWindowFor(now)
  const queue = await fetchNormalQueue(admin)

  const takenSlots = new Set<number>()
  let lockedCount = 0
  for (const row of queue) {
    const mark = getLineupMark(row.style_config)
    if (mark && mark.windowId === win.windowId) {
      takenSlots.add(mark.slot)
      lockedCount++
    }
  }

  const newlyLocked: { row: NormalQueueRow; slot: number }[] = []
  if (lockedCount < LINEUP_SLOTS_PER_DAY) {
    let nextSlot = 1
    for (const row of queue) {
      if (lockedCount >= LINEUP_SLOTS_PER_DAY) break
      const mark = getLineupMark(row.style_config)
      if (mark && mark.windowId === win.windowId) continue
      while (takenSlots.has(nextSlot)) nextSlot++
      const slot = nextSlot
      const cfg = parseStyleConfig(row.style_config)
      cfg.lineup = { windowId: win.windowId, slot, lockedAt: now.toISOString() }
      // Guarded write: only lock a row that is still QUEUED.
      const { data: updated } = await admin
        .from('messages')
        .update({ style_config: cfg })
        .eq('id', row.id)
        .eq('status', 'QUEUED')
        .select('id')
      if (updated && updated.length > 0) {
        takenSlots.add(slot)
        nextSlot++
        lockedCount++
        newlyLocked.push({ row, slot })
      }
    }
  }

  return { windowId: win.windowId, windowStartMs: win.startMs, lockedCount, newlyLocked }
}

/**
 * The next message to air: the earliest locked post (oldest window,
 * then lowest slot). Null when nothing is locked — the stage idles
 * rather than promoting an unlocked pool post out of turn.
 */
export function nextInLineup(queue: NormalQueueRow[]): NormalQueueRow | null {
  let best: NormalQueueRow | null = null
  let bestMark: LineupMark | null = null
  for (const row of queue) {
    const mark = getLineupMark(row.style_config)
    if (!mark) continue
    if (
      !bestMark ||
      mark.windowId < bestMark.windowId ||
      (mark.windowId === bestMark.windowId && mark.slot < bestMark.slot)
    ) {
      best = row
      bestMark = mark
    }
  }
  return best
}

/**
 * Pool snapshot for the create wizard and /api/queue/status: how many
 * posts are already locked into today's lineup, how many are waiting in
 * the pool, and the bid currently needed to take the last open slot.
 */
export async function getNormalPoolStats(now: Date = new Date()) {
  const win = lineupWindowFor(now)
  const queue = await fetchNormalQueue()
  let lockedToday = 0
  const pool: NormalQueueRow[] = []
  for (const row of queue) {
    const mark = getLineupMark(row.style_config)
    if (mark && mark.windowId === win.windowId) lockedToday++
    else pool.push(row)
  }
  const openSlots = Math.max(0, LINEUP_SLOTS_PER_DAY - lockedToday)
  // If today's lineup is already full, the pool competes for tomorrow's
  // 24 slots instead — the cutoff is then the 24th pool bid.
  const needed = openSlots > 0 ? openSlots : LINEUP_SLOTS_PER_DAY
  const cutoffBid =
    pool.length >= needed && needed > 0 ? pool[needed - 1].bid_amount : null
  return {
    windowId: win.windowId,
    slotsPerDay: LINEUP_SLOTS_PER_DAY,
    lockedToday,
    poolCount: pool.length,
    cutoffBid,
    nextLockMs: win.nextLockMs,
  }
}
