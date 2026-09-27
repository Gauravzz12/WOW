'use server'

import { createClient } from '@supabase/supabase-js'
import { sanitizeHtmlText } from '@/lib/sanitize'

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
  // Find category by slug
  const { data: category, error: catError } = await supabaseAdmin
    .from('categories')
    .select('id')
    .eq('slug', data.categorySlug)
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

  // Sanitize reminder email if present
  if (parsedStyle.reminderEmail && typeof parsedStyle.reminderEmail === 'string') {
    parsedStyle.reminderEmail = parsedStyle.reminderEmail.trim().slice(0, 100)
  }

  // Insert message
  const { data: message, error: msgError } = await supabaseAdmin
    .from('messages')
    .insert({
      category_id: category.id,
      template_id: data.templateId,
      content: trimmedContent,
      signature: signature,
      recipient: recipient,
      status: 'PENDING_PAYMENT',
      bid_amount: data.bidAmount || 15,
      is_reserved_slot: data.isReservedSlot || false,
      style_config: parsedStyle,
    })
    .select('id')
    .single()

  if (msgError) {
    console.error('Error creating message:', msgError)
    return { error: 'Failed to create message' }
  }

  return { success: true, messageId: message.id }
}


