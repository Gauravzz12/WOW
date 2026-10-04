/**
 * Single source of truth for message expiry math.
 * Previously four call sites each had their own fallback chain
 * (queueAdvance, display/current, MainFeedContainer, home page), which
 * drifted: sponsored rows lived 1800s server-side but 3600s on display,
 * multi-slot VIPs showed 3h timers for 9h bookings, and one client fallback
 * expired everything after 60s. All expiry checks must use these helpers.
 */

export interface ExpirableMessage {
  style_config?: any
  category?: any
  is_reserved_slot?: boolean
  bid_amount?: number | null
  actual_start?: string | null
  scheduled_end?: string | null
}

function parseStyleConfig(style: any): Record<string, any> {
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

function categoryOf(category: any): any {
  return Array.isArray(category) ? category[0] : category
}

/**
 * Airtime in seconds: explicit duration → category base → type default
 * (reserved 3h / sponsored 30m / normal 1h).
 */
export function getMessageDurationSecs(msg: ExpirableMessage): number {
  const config = parseStyleConfig(msg.style_config)
  const cat = categoryOf(msg.category)
  return (
    config.durationSecs ||
    cat?.base_duration ||
    (msg.is_reserved_slot ? 10800 : (msg.bid_amount ?? 0) < 10 ? 1800 : 3600)
  )
}

/**
 * Absolute expiry timestamp (ms). Reserved slots end at scheduled_end;
 * everything else ends at actual_start + duration. Rows with no start info
 * resolve to 0 (treated as expired so sweeps clear corrupt actives instead
 * of displaying them forever).
 */
export function getMessageEndTimeMs(msg: ExpirableMessage, nowMs = Date.now()): number {
  void nowMs
  if (msg.is_reserved_slot && (msg as any).scheduled_end) {
    return new Date((msg as any).scheduled_end).getTime()
  }
  if (msg.actual_start) {
    return new Date(msg.actual_start).getTime() + getMessageDurationSecs(msg) * 1000
  }
  return 0
}

export function isMessageExpired(msg: ExpirableMessage, nowMs = Date.now()): boolean {
  return nowMs >= getMessageEndTimeMs(msg, nowMs)
}
