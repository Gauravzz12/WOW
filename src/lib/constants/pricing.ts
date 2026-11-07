// Normal Message Pricing & Durations
// Launch pricing: base time 2hrs included. Extendable up to 3 hours at +$2 per 10 minutes.
export const BASE_NORMAL_MINS = 120
export const MAX_NORMAL_MINS = 180
export const EXTENSION_STEP_MINS = 10
export const EXTENSION_COST_PER_STEP = 2
export const BASE_NORMAL_PRICE = 5

/**
 * Tier separator: a non-reserved message is classified as Normal vs
 * Sponsored purely by its bid_amount (Normal >= this, Sponsored below).
 * Sponsored is a flat $3 (below), so the separator must stay above $3 and
 * at or below the Normal floor ($5). Never compare bid_amount against a
 * raw numeric literal — always use this constant, so the classification
 * can't silently break when launch pricing changes.
 */
export const MIN_NORMAL_BID = BASE_NORMAL_PRICE

/**
 * Launch promo: the first 500 Normal broadcasts are free — base duration
 * only (no extensions, no raised bid), one per device, and paid messages
 * always outrank free ones in the queue. Eligibility is re-validated
 * server-side in the create action; /api/promo/status only feeds the UI.
 * Promo rows store bid_amount = BASE_NORMAL_PRICE plus is_promo_free=true
 * (never a $0 bid, which the tier separator above would read as Sponsored).
 */
export const PROMO_FREE_LIMIT = 500

export function calculateNormalMinBid(mins: number): number {
  const extraMins = Math.max(0, mins - BASE_NORMAL_MINS)
  const steps = Math.ceil(extraMins / EXTENSION_STEP_MINS)
  return BASE_NORMAL_PRICE + (steps * EXTENSION_COST_PER_STEP)
}

export interface NormalDurationOption {
  mins: number
  label: string
  minBid: number
  desc: string
  isBase?: boolean
  isMax?: boolean
}

function normalDurationLabel(mins: number): string {
  const hours = Math.floor(mins / 60)
  const rem = mins % 60
  if (rem === 0) return `${hours} Hour${hours === 1 ? '' : 's'}`
  return `${hours}h ${rem}m`
}

// Derived from the pricing constants above — minBid values are computed,
// never hardcoded, so this table can't drift from calculateNormalMinBid.
export const NORMAL_DURATION_OPTIONS: NormalDurationOption[] = (() => {
  const options: NormalDurationOption[] = []
  for (let mins = BASE_NORMAL_MINS; mins <= MAX_NORMAL_MINS; mins += EXTENSION_STEP_MINS) {
    const isBase = mins === BASE_NORMAL_MINS
    const isMax = mins === MAX_NORMAL_MINS
    options.push({
      mins,
      label: normalDurationLabel(mins),
      minBid: calculateNormalMinBid(mins),
      desc: isBase
        ? `Base ${BASE_NORMAL_MINS / 60}-hour broadcast`
        : isMax
          ? `Maximum ${MAX_NORMAL_MINS / 60}-hour broadcast`
          : `+${mins - BASE_NORMAL_MINS} min extension`,
      ...(isBase ? { isBase: true } : {}),
      ...(isMax ? { isMax: true } : {}),
    })
  }
  return options
})()

// Special Messages (Fixed 3-Hour Slots)
// Fixed 3hr slots for $30 each. Buy up to 3 continuous slots with 20% discount.
export const SPECIAL_SLOT_HOURS = 3
export const SPECIAL_SLOT_PRICE = 30
export const SPECIAL_MULTI_SLOT_DISCOUNT = 0.20 // 20% discount on continuous slots
export const MAX_SPECIAL_SLOTS = 3

export function calculateSpecialPrice(slotCount: number): {
  originalPrice: number
  discount: number
  finalPrice: number
  savings: number
} {
  const originalPrice = slotCount * SPECIAL_SLOT_PRICE
  const discountRate = slotCount > 1 ? SPECIAL_MULTI_SLOT_DISCOUNT : 0
  const savings = Math.round(originalPrice * discountRate)
  const finalPrice = originalPrice - savings
  return { originalPrice, discount: discountRate, finalPrice, savings }
}

/**
 * 8 Fixed 3-Hour Time Slots covering every 24-hour day on the Global UTC Master Clock:
 * Slot 1: 0–3 AM UTC (00:00 – 03:00 UTC)
 * Slot 2: 3–6 AM UTC (03:00 – 06:00 UTC)
 * Slot 3: 6–9 AM UTC (06:00 – 09:00 UTC)
 * Slot 4: 9 AM–12 PM UTC (09:00 – 12:00 UTC)
 * Slot 5: 12–3 PM UTC (12:00 – 15:00 UTC)
 * Slot 6: 3–6 PM UTC (15:00 – 18:00 UTC)
 * Slot 7: 6–9 PM UTC (18:00 – 21:00 UTC)
 * Slot 8: 9 PM–12 AM UTC (21:00 – 24:00 UTC)
 */
export interface Fixed3HourSlotDef {
  slotNumber: number
  startHour: number
  endHour: number
  label: string
  shortLabel: string
}

export const FIXED_3H_SLOT_DEFINITIONS: Fixed3HourSlotDef[] = [
  { slotNumber: 1, startHour: 0, endHour: 3, label: '00:00 – 03:00 UTC', shortLabel: '0–3 AM UTC' },
  { slotNumber: 2, startHour: 3, endHour: 6, label: '03:00 – 06:00 UTC', shortLabel: '3–6 AM UTC' },
  { slotNumber: 3, startHour: 6, endHour: 9, label: '06:00 – 09:00 UTC', shortLabel: '6–9 AM UTC' },
  { slotNumber: 4, startHour: 9, endHour: 12, label: '09:00 – 12:00 UTC', shortLabel: '9 AM–12 PM UTC' },
  { slotNumber: 5, startHour: 12, endHour: 15, label: '12:00 – 15:00 UTC', shortLabel: '12–3 PM UTC' },
  { slotNumber: 6, startHour: 15, endHour: 18, label: '15:00 – 18:00 UTC', shortLabel: '3–6 PM UTC' },
  { slotNumber: 7, startHour: 18, endHour: 21, label: '18:00 – 21:00 UTC', shortLabel: '6–9 PM UTC' },
  { slotNumber: 8, startHour: 21, endHour: 24, label: '21:00 – 24:00 UTC', shortLabel: '9 PM–12 AM UTC' },
]

/**
 * Generates exact UTC ISO timestamps for a given UTC calendar date.
 * Deterministic worldwide: User in NY, London, Tokyo, or Mumbai generates the identical ISO strings.
 */
export function getFixedSlotsForUtcDate(utcYear: number, utcMonth: number, utcDate: number) {
  return FIXED_3H_SLOT_DEFINITIONS.map(def => {
    const start = new Date(Date.UTC(utcYear, utcMonth, utcDate, def.startHour, 0, 0, 0))
    const end = new Date(Date.UTC(utcYear, utcMonth, utcDate, def.endHour === 24 ? 24 : def.endHour, 0, 0, 0))
    return {
      slotNumber: def.slotNumber,
      startHour: def.startHour,
      endHour: def.endHour,
      label: def.label,
      shortLabel: def.shortLabel,
      scheduled_start: start.toISOString(),
      scheduled_end: end.toISOString(),
    }
  })
}

/**
 * SLOT-1: a slot window is canonical only if it exactly matches one of
 * the fixed 3-hour definitions for its UTC date (start aligned to the
 * grid, end exactly start+3h). Server paths that accept slot times from
 * clients MUST validate with this — never trust supplied windows.
 */
export function isCanonicalSlotWindow(scheduledStart: unknown, scheduledEnd: unknown): boolean {
  if (typeof scheduledStart !== 'string' || typeof scheduledEnd !== 'string') return false
  const start = new Date(scheduledStart)
  if (isNaN(start.getTime())) return false
  const defs = getFixedSlotsForUtcDate(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
  return defs.some(d => d.scheduled_start === scheduledStart && d.scheduled_end === scheduledEnd)
}

// Backwards-compatible alias for Date objects
export function getFixedSlotsForDate(date: Date) {
  return getFixedSlotsForUtcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

/**
 * Finds the slot definition matching a scheduled start ISO string by UTC hour.
 */
export function getSlotLabel(scheduledStartIso: string): Fixed3HourSlotDef {
  const d = new Date(scheduledStartIso)
  const utcHour = d.getUTCHours()
  const found = FIXED_3H_SLOT_DEFINITIONS.find(s => utcHour >= s.startHour && utcHour < s.endHour)
  return found || FIXED_3H_SLOT_DEFINITIONS[0]
}

/**
 * Converts a UTC ISO string into the user's formatted local time with timezone code.
 */
export function formatLocalSlotTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
  } catch {
    return ''
  }
}

/**
 * Gets the user's local timezone abbreviation / name.
 */
export function getUserLocalTimeZone(): string {
  try {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const parts = new Intl.DateTimeFormat([], { timeZoneName: 'short' }).formatToParts(new Date())
      const tzPart = parts.find(p => p.type === 'timeZoneName')
      if (tzPart && tzPart.value) return tzPart.value
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local'
    }
  } catch {}
  return 'Local'
}

// Sponsored Messages (Always 30 min long)
export const SPONSORED_DURATION_MINS = 30
export const SPONSORED_DURATION_SECS = 1800 // Exactly 30 minutes
export const SPONSORED_PRICE = 3.00

