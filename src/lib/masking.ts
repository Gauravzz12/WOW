/**
 * Canonical paywall helpers for unpaid (PENDING_PAYMENT) sponsored messages.
 *
 * Rule: full `content` of a PENDING_PAYMENT message must NEVER be sent to
 * an anonymous client. Only a short teaser + metadata may be exposed.
 * Full text becomes readable only after payment (QUEUED / ACTIVE / COMPLETED).
 */

export function stripHtml(input: string): string {
  if (!input) return ''
  return input.replace(/<[^>]*>/g, '').trim()
}

/**
 * Build a teaser that is useful for deciding to sponsor but never the full message.
 * - Strips HTML
 * - Reveals at most TEASER_MAX_CHARS characters from the start
 * - Always marks truncated unless the message is extremely short AND we still hide remainder
 *
 * For very short messages we still truncate to ~25% so the full text isn't free.
 */
export const TEASER_MAX_CHARS = 80
export const TEASER_REVEAL_FRACTION = 0.25

export function getSponsoredTeaser(rawContent: string): {
  teaser: string
  totalLength: number
  isLocked: boolean
} {
  const plain = stripHtml(rawContent || '')
  const totalLength = plain.length
  if (totalLength === 0) {
    return { teaser: '', totalLength: 0, isLocked: true }
  }
  const fractionLen = Math.ceil(totalLength * TEASER_REVEAL_FRACTION)
  // Reveal the smaller of: 25% of message, or TEASER_MAX_CHARS.
  // Enforce a small floor/ceiling so short messages don't leak fully:
  // - never reveal more than 80 chars
  // - for messages <= 32 chars, reveal at most 8 chars (still locked)
  let revealLen: number
  if (totalLength <= 32) {
    revealLen = Math.max(4, Math.ceil(totalLength * TEASER_REVEAL_FRACTION))
  } else {
    revealLen = Math.min(TEASER_MAX_CHARS, fractionLen)
  }
  // Never reveal the whole message — always leave at least 1 char hidden
  // (unless message is <= 4 chars, then show 1 char + lock).
  if (revealLen >= totalLength) {
    revealLen = Math.max(1, totalLength - 1)
  }
  const teaser = plain.substring(0, revealLen)
  return { teaser, totalLength, isLocked: true }
}

/**
 * Server-side only: convert a PENDING_PAYMENT row into a safe public object.
 * Drops `content` and `style_config.html` entirely.
 */
export function toLockedSponsoredCard(msg: {
  id: string
  content: string
  bid_amount?: number
  created_at: string
  category?: any
  style_config?: any
}): {
  id: string
  teaser: string
  contentLength: number
  maskedContent: string
  bid_amount?: number
  created_at: string
  category?: any
  isLocked: true
} {
  const { teaser, totalLength } = getSponsoredTeaser(msg.content || '')
  const maskedContent = teaser + '█'.repeat(Math.max(0, totalLength - teaser.length))
  return {
    id: msg.id,
    teaser,
    contentLength: totalLength,
    maskedContent,
    bid_amount: msg.bid_amount,
    created_at: msg.created_at,
    category: msg.category,
    isLocked: true as const,
  }
}
