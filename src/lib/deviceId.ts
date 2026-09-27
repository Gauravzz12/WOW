'use client'

const DEVICE_STORAGE_KEY = 'wow_device_id'

/**
 * Returns a stable unique anonymous device ID.
 * Persisted in both localStorage and long-lived cookies.
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return ''

  // 1. Try localStorage
  let deviceId: string | null = null
  try {
    deviceId = localStorage.getItem(DEVICE_STORAGE_KEY)
  } catch {}

  // 2. Try cookie fallback
  if (!deviceId) {
    try {
      const match = document.cookie.match(new RegExp('(^| )' + DEVICE_STORAGE_KEY + '=([^;]+)'))
      if (match) {
        deviceId = match[2]
      }
    } catch {}
  }

  // 3. Generate if missing
  if (!deviceId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      deviceId = crypto.randomUUID()
    } else {
      deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
    }
  }

  // 4. Persist in both localStorage and cookie (10 years)
  try {
    localStorage.setItem(DEVICE_STORAGE_KEY, deviceId)
    const expires = new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toUTCString()
    document.cookie = `${DEVICE_STORAGE_KEY}=${deviceId}; path=/; expires=${expires}; SameSite=Lax`
  } catch {}

  return deviceId
}

/**
 * Retrieve all reactions this device has for a specific message from localStorage.
 * Returns Record<reactionType, reactionId>, e.g. { LOVE: "uuid-1", CELEBRATE: "uuid-2" }
 */
export function getStoredReactions(messageId: string): Record<string, string> {
  if (typeof window === 'undefined' || !messageId) return {}
  try {
    const raw = localStorage.getItem(`wow_reactions_${messageId}`)
    if (raw) return JSON.parse(raw)
    // Backward compatibility with previous single reaction key
    const single = localStorage.getItem(`wow_reaction_${messageId}`)
    if (single) {
      const parsed = JSON.parse(single)
      return { [parsed.type]: parsed.id }
    }
    return {}
  } catch {
    return {}
  }
}

/**
 * Save a specific reaction type for a message in localStorage.
 */
export function setStoredReaction(messageId: string, type: string, reactionId: string) {
  if (typeof window === 'undefined' || !messageId) return
  try {
    const current = getStoredReactions(messageId)
    current[type] = reactionId
    localStorage.setItem(`wow_reactions_${messageId}`, JSON.stringify(current))
  } catch {}
}

/**
 * Remove a specific reaction type for a message from localStorage.
 */
export function removeStoredReaction(messageId: string, type: string) {
  if (typeof window === 'undefined' || !messageId) return
  try {
    const current = getStoredReactions(messageId)
    delete current[type]
    localStorage.setItem(`wow_reactions_${messageId}`, JSON.stringify(current))
  } catch {}
}

/**
 * Bulk sync all reactions for a message.
 */
export function syncStoredReactions(messageId: string, reactions: Record<string, string>) {
  if (typeof window === 'undefined' || !messageId) return
  try {
    localStorage.setItem(`wow_reactions_${messageId}`, JSON.stringify(reactions))
  } catch {}
}
