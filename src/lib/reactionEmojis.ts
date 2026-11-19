/**
 * Emoji reactions (WhatsApp/Instagram style): ONE reaction per person per
 * message. The stored `reaction_type` for new reactions is the emoji
 * character itself; rows written before this module existed store one of
 * the five legacy type ids, mapped to their emoji for display.
 */

export const LEGACY_REACTION_EMOJI: Record<string, string> = {
  LOVE: '❤️',
  CELEBRATE: '🎉',
  SUPPORT: '🫂',
  FEEL_THIS: '😢',
  RESPECT: '🙏',
}

/** WhatsApp's quick-reaction row — shown first in the picker. */
export const QUICK_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

/** The full picker grid (quick row included again in place). */
export const REACTION_EMOJIS = [
  '👍', '❤️', '😂', '😮', '😢', '🙏',
  '😀', '😁', '😄', '😆', '🤣', '😊',
  '😍', '🤩', '😘', '😜', '🤪', '😎',
  '🥳', '🤯', '😳', '🥺', '😭', '😤',
  '😡', '🤔', '🤨', '😐', '🙄', '😴',
  '🤤', '😋', '🤗', '😇', '🫡', '👎',
  '👏', '🙌', '💪', '🤝', '🫂', '🎉',
  '🔥', '💯', '✨', '🎊', '❤️‍🔥', '💔',
  '🧡', '💛', '💚', '💙', '💜', '🖤',
  '🤍', '👑', '💎', '🚀', '🌍', '🕊️',
  '⚡', '🌟', '💡', '🎵', '🍀', '✍️',
  '👀',
]

const ALLOWED = new Set<string>([...REACTION_EMOJIS, ...QUICK_REACTION_EMOJIS])

/** Server-side validation: only picker emojis may be stored as new reactions. */
export function isAllowedReactionEmoji(value: string): boolean {
  return ALLOWED.has(value)
}

/** The emoji to display for a stored reaction_type (emoji char or legacy id). */
export function emojiForStoredType(type: string | null | undefined): string | null {
  if (!type) return null
  if (LEGACY_REACTION_EMOJI[type]) return LEGACY_REACTION_EMOJI[type]
  return type // new rows store the emoji itself
}

/**
 * Compact count for reaction totals: under 1000 as-is; thousands as K and
 * millions as M, one decimal with a trailing .0 trimmed.
 * 999 → "999", 1000 → "1K", 1250 → "1.3K", 999949 → "999.9K", 2500000 → "2.5M"
 */
export function formatReactionCount(n: number): string {
  const count = Math.max(0, Math.floor(n || 0))
  if (count < 1000) return String(count)
  const compact = (value: number, suffix: string) => {
    const fixed = value.toFixed(1)
    return `${fixed.endsWith('.0') ? fixed.slice(0, -2) : fixed}${suffix}`
  }
  if (count < 1_000_000) return compact(count / 1000, 'K')
  return compact(count / 1_000_000, 'M')
}
