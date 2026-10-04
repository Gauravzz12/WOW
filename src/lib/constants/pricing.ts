// Normal Message Pricing & Durations
// Base time: 1hr. Extendable up to 2 hours at +$5 per 10 minutes.
export const BASE_NORMAL_MINS = 60
export const MAX_NORMAL_MINS = 120
export const EXTENSION_STEP_MINS = 10
export const EXTENSION_COST_PER_STEP = 5
export const BASE_NORMAL_PRICE = 15

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

export const NORMAL_DURATION_OPTIONS: NormalDurationOption[] = [
  { mins: 60, label: '1 Hour', minBid: 15, desc: 'Base 1-hour broadcast', isBase: true },
  { mins: 70, label: '1h 10m', minBid: 20, desc: '+10 min extension' },
  { mins: 80, label: '1h 20m', minBid: 25, desc: '+20 min extension' },
  { mins: 90, label: '1h 30m', minBid: 30, desc: '+30 min extension' },
  { mins: 100, label: '1h 40m', minBid: 35, desc: '+40 min extension' },
  { mins: 110, label: '1h 50m', minBid: 40, desc: '+50 min extension' },
  { mins: 120, label: '2 Hours', minBid: 45, desc: 'Maximum 2-hour broadcast', isMax: true },
]

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

