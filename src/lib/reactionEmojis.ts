/**
 * Emoji reactions (WhatsApp/Instagram style): ONE reaction per person per
 * message. The stored `reaction_type` for new reactions is the emoji
 * character itself; rows written before this module existed store one of
 * the five legacy type ids, mapped to their emoji for display.
 *
 * The picker itself is the emoji-picker-react library (see
 * components/EmojiPicker.tsx) — this module only owns the reaction
 * bookkeeping: the legacy mapping, server-side validation, and the
 * compact count format.
 */

export const LEGACY_REACTION_EMOJI: Record<string, string> = {
  LOVE: '❤️',
  CELEBRATE: '🎉',
  SUPPORT: '🫂',
  FEEL_THIS: '😢',
  RESPECT: '🙏',
}

/** WhatsApp's quick-reaction row — the classic defaults. */
export const QUICK_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

const EMOJI_PATTERN = /\p{Extended_Pictographic}/u
const FLAG_PATTERN = /^\p{Regional_Indicator}{2}$/u
const KEYCAP_PATTERN = /^[0-9#*]\uFE0F\u20E3$/

/**
 * Server-side validation for new reactions. The library picker offers
 * ~1,900 emojis; a hardcoded allow-list would reject legitimate picks, so
 * instead accept exactly ONE emoji grapheme — including ZWJ sequences
 * (❤️‍🔥), flags, and skin-tone variants — and nothing else.
 */
export function isAllowedReactionEmoji(value: string): boolean {
  if (!value || value.length > 16) return false
  if (
    !EMOJI_PATTERN.test(value) &&
    !FLAG_PATTERN.test(value) &&
    !KEYCAP_PATTERN.test(value)
  )
    return false
  const segments = [
    ...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(
      value,
    ),
  ]
  return segments.length === 1
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
