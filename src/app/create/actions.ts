'use server'

import { createClient } from '@supabase/supabase-js'
import { sanitizeHtmlText } from '@/lib/sanitize'
import {
  BASE_NORMAL_MINS,
  MAX_NORMAL_MINS,
  calculateNormalMinBid,
  calculateSpecialPrice,
} from '@/lib/constants/pricing'
import { STANDARD_TEMPLATES } from '@/lib/constants/templates'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createMessage(data: {
  categorySlug: string
  templateId: string
  content: string
  identityType: string
  customName: string
  recipient: string
  bidAmount?: number
  isReservedSlot?: boolean
  styleConfig?: string
}) {
  // Find category by slug (active only — inactive slugs are rejected)
  const { data: category, error: catError } = await supabaseAdmin
    .from('categories')
    .select('id')
    .eq('slug', data.categorySlug)
    .eq('status', 'ACTIVE')
    .single()

  if (catError || !category) {
    return { error: 'Invalid category' }
  }

  // Content validation
  const trimmedContent = (data.content || '').trim()
  if (!trimmedContent) {
    return { error: 'Message content cannot be empty.' }
  }
  if (trimmedContent.length > 1500) {
    return { error: 'Message content exceeds the 1,500 character limit.' }
  }
  const words = trimmedContent.split(/\s+/).filter(Boolean).length
  if (words > 150) {
    return { error: `Message cannot exceed 150 words (currently ${words} words).` }
  }

  // 12-hour auto-cleanup of stale waiting room entries before checking capacity
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  await supabaseAdmin
    .from('messages')
    .update({ status: 'EXPIRED' })
    .eq('status', 'PENDING_PAYMENT')
    .lt('created_at', twelveHoursAgo)

  // Enforce max waiting list count of 100
  const { count: waitingCount } = await supabaseAdmin
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'PENDING_PAYMENT')

  if (waitingCount !== null && waitingCount >= 100) {
    return { error: 'The Waiting Room has reached its maximum capacity of 100 messages. Please wait until space opens or an existing message is sponsored.' }
  }

  // Identity and recipient validation
  const signature = data.identityType === 'custom' 
    ? (data.customName ? data.customName.trim().slice(0, 50) : 'Anonymous')
    : null
  const recipient = data.recipient ? data.recipient.trim().slice(0, 50) : null

  // StyleConfig parsing and sanitization
  let parsedStyle: Record<string, any> = {}
  if (data.styleConfig) {
    if (data.styleConfig.length > 50000) {
      return { error: 'Style configuration is too large.' }
    }
    try {
      parsedStyle = JSON.parse(data.styleConfig)
    } catch {
      return { error: 'Invalid style configuration format.' }
    }
  }

  // Sanitize rich text HTML to prevent Stored XSS
  if (typeof parsedStyle.html === 'string' && parsedStyle.html.trim().length > 0) {
    parsedStyle.html = sanitizeHtmlText(parsedStyle.html)
  }

  // Sanitize stickers array
  if (Array.isArray(parsedStyle.stickers)) {
    parsedStyle.stickers = parsedStyle.stickers.slice(0, 10).map((s: any) => ({
      id: typeof s.id === 'string' ? s.id.slice(0, 50) : `stk_${Date.now()}`,
      emoji: typeof s.emoji === 'string' ? s.emoji.slice(0, 10) : undefined,
      url: typeof s.url === 'string' && (s.url.startsWith('/') || s.url.startsWith('https://')) ? s.url.slice(0, 300) : undefined,
      x: typeof s.x === 'number' ? Math.max(0, Math.min(100, s.x)) : 50,
      y: typeof s.y === 'number' ? Math.max(0, Math.min(100, s.y)) : 50,
      size: typeof s.size === 'number' ? Math.max(0.5, Math.min(12, s.size)) : 3.5,
    })).filter((s: any) => Boolean(s.emoji || s.url))
  }

  // Sanitize brand info if present
  if (parsedStyle.brandName && typeof parsedStyle.brandName === 'string') {
    parsedStyle.brandName = parsedStyle.brandName.trim().slice(0, 50)
  }
  if (parsedStyle.brandUrl && typeof parsedStyle.brandUrl === 'string') {
    const trimmedUrl = parsedStyle.brandUrl.trim().slice(0, 200)
    // Only allow http or https URLs
    if (/^https?:\/\//i.test(trimmedUrl)) {
      parsedStyle.brandUrl = trimmedUrl
    } else {
      parsedStyle.brandUrl = ''
    }
  }

  // Reminder email is private PII: stored in its own column (never selected
  // by anon-facing queries) instead of the publicly-readable style_config.
  let reminderEmail: string | null = null
  if (parsedStyle.reminderEmail && typeof parsedStyle.reminderEmail === 'string') {
    reminderEmail = parsedStyle.reminderEmail.trim().slice(0, 100) || null
  }
  delete (parsedStyle as any).reminderEmail

  // Template allowlist: only classic styles are offered in the UI. VIP and
  // unknown ids are forced back to the default so premium styling can't be
  // claimed at normal price via direct action calls.
  const templateId = STANDARD_TEMPLATES.some(t => t.id === data.templateId)
    ? data.templateId
    : 'a'

  // Server-side pricing: never trust the client bid. Normal messages are
  // floored to the duration-based minimum; reserved messages are priced
  // exactly from the selected slot count (and must carry selected slots).
  const isReserved = data.isReservedSlot || false
  let bidAmount: number
  if (isReserved) {
    const selectedSlots = Array.isArray(parsedStyle.selectedSlots)
      ? parsedStyle.selectedSlots
      : []
    if (selectedSlots.length === 0) {
      return { error: 'Select at least one time slot for Special messages.' }
    }
    bidAmount = calculateSpecialPrice(Math.min(selectedSlots.length, 3)).finalPrice
  } else {
    const durationSecs = Number(parsedStyle.durationSecs) || BASE_NORMAL_MINS * 60
    const durationMins = Math.max(
      BASE_NORMAL_MINS,
      Math.min(MAX_NORMAL_MINS, Math.round(durationSecs / 60))
    )
    const minBid = calculateNormalMinBid(durationMins)
    const candidate = Number(data.bidAmount)
    bidAmount = !isNaN(candidate) && candidate > minBid ? candidate : minBid
  }

  // Insert message
  const { data: message, error: msgError } = await supabaseAdmin
    .from('messages')
    .insert({
      category_id: category.id,
      template_id: templateId,
      content: trimmedContent,
      signature: signature,
      recipient: recipient,
      status: 'PENDING_PAYMENT',
      bid_amount: bidAmount,
      is_reserved_slot: isReserved,
      style_config: parsedStyle,
      reminder_email: reminderEmail,
    })
    .select('id')
    .single()

  if (msgError) {
    console.error('Error creating message:', msgError)
    return { error: 'Failed to create message' }
  }

  return { success: true, messageId: message.id }
}


