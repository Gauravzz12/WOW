'use server'

import { createClient } from '@supabase/supabase-js'
import { sanitizeHtmlText } from '@/lib/sanitize'
import { validateContentModeration, validateContentModerationAsync } from '@/lib/moderation'
import {
  BASE_NORMAL_MINS,
  BASE_NORMAL_PRICE,
  MAX_NORMAL_MINS,
  PROMO_FREE_LIMIT,
  calculateNormalMinBid,
  calculateSpecialPrice,
  isCanonicalSlotWindow,
  SPONSORED_PRICE,
  SPONSORED_DURATION_SECS,
} from '@/lib/constants/pricing'
import { ALL_TEMPLATES } from '@/lib/constants/templates'
import { FRAMES } from '@/lib/constants/frames'

import { getSupabaseAdmin } from '@/lib/supabase/admin'

const supabaseAdmin = getSupabaseAdmin()

export async function createMessage(data: {
  categorySlug: string
  templateId: string
  content: string
  identityType: string
  customName: string
  recipient: string
  bidAmount?: number
  isReservedSlot?: boolean
  isSponsored?: boolean
  styleConfig?: string
  usePromoFree?: boolean
  deviceId?: string
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

  // Fast synchronous safety check (script/charset level).
  const contentMod = validateContentModeration(trimmedContent)
  if (!contentMod.allowed) {
    return { error: contentMod.reason || 'Message violates our Community Safety & Content Guidelines.' }
  }

  // CRE-2: semantic (Jev) moderation is enforced HERE, server-side, for
  // every create. It used to run only in the browser wizard, so a direct
  // action call skipped it entirely — and promo rows go straight to
  // QUEUED with no later gate. The wizard check remains as UX only.
  const jevMod = await validateContentModerationAsync(trimmedContent)
  if (!jevMod.allowed) {
    return { error: jevMod.reason || 'Message violates our Community Safety & Content Guidelines.' }
  }

  if (data.customName) {
    const sigMod = validateContentModeration(data.customName)
    if (!sigMod.allowed) {
      return { error: 'Author signature contains prohibited content.' }
    }
  }

  if (data.recipient) {
    const recMod = validateContentModeration(data.recipient)
    if (!recMod.allowed) {
      return { error: 'Recipient name contains prohibited content.' }
    }
  }

  // 12-hour auto-cleanup of stale waiting room entries before checking capacity
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  const { data: staleRows } = await supabaseAdmin
    .from('messages')
    .update({ status: 'EXPIRED' })
    .eq('status', 'PENDING_PAYMENT')
    .lt('created_at', twelveHoursAgo)
    .select('id')
  // PAY-3: expiring a PENDING message must also release any Special slots
  // it booked at checkout start, or they stay BOOKED forever.
  if (staleRows && staleRows.length > 0) {
    await supabaseAdmin
      .from('reserved_slots')
      .update({ status: 'AVAILABLE', message_id: null, bid_amount: 0 })
      .in('message_id', staleRows.map(r => r.id))
      .eq('status', 'BOOKED')
  }

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

  // Sanitize stickers array (dropped entirely for Sponsored messages)
  if (parsedStyle.isSponsored) {
    delete parsedStyle.stickers
  } else if (Array.isArray(parsedStyle.stickers)) {
    parsedStyle.stickers = parsedStyle.stickers.slice(0, 10).map((s: any) => ({
      id: typeof s.id === 'string' ? s.id.slice(0, 50) : `stk_${Date.now()}`,
      emoji: typeof s.emoji === 'string' ? s.emoji.slice(0, 10) : undefined,
      url: typeof s.url === 'string' && (s.url.startsWith('/') || s.url.startsWith('https://')) ? s.url.slice(0, 300) : undefined,
      x: typeof s.x === 'number' ? Math.max(0, Math.min(100, s.x)) : 50,
      y: typeof s.y === 'number' ? Math.max(0, Math.min(100, s.y)) : 50,
      size: typeof s.size === 'number' ? Math.max(0.5, Math.min(12, s.size)) : 3.5,
    })).filter((s: any) => Boolean(s.emoji || s.url))
  }

  // Sanitize brand info if present (link label capped at 40 chars, matching the UI)
  if (parsedStyle.brandName && typeof parsedStyle.brandName === 'string') {
    parsedStyle.brandName = parsedStyle.brandName.trim().slice(0, 40)
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

  // Template allowlist: unified templates for all modes (Normal, Special, Sponsored)
  const templateId = ALL_TEMPLATES.some(t => t.id === data.templateId)
    ? data.templateId
    : 'a'

  // Re-derive visual fields from the allowlisted template definition
  const templateDef = ALL_TEMPLATES.find(t => t.id === templateId)
  if (templateDef) {
    parsedStyle.bg = templateDef.bg
    parsedStyle.font = templateDef.font
    parsedStyle.textColor = templateDef.textColor
    if (templateDef.cardBorder) parsedStyle.cardBorder = templateDef.cardBorder
    else delete parsedStyle.cardBorder
    if (templateDef.accent) parsedStyle.accent = templateDef.accent
    else delete parsedStyle.accent
    delete parsedStyle.isVip
    delete parsedStyle.vipBadge
    delete parsedStyle.vipIcon
    delete parsedStyle.vipTagline
    parsedStyle.templateId = templateId
  }

  // Server-side pricing: never trust the client bid. Reserved messages are
  // priced exactly from the selected slot count (and must carry selected
  // slots); self-served Sponsored messages are a flat $3 for 30 minutes;
  // normal messages are floored to the duration-based minimum.
  const isReserved = data.isReservedSlot || false
  const isSponsored = !isReserved && (data.isSponsored === true || parsedStyle.isSponsored === true)
  let bidAmount: number
  let promoApplied = false
  let promoDeviceId: string | null = null
  if (isReserved) {
    const selectedSlots = Array.isArray(parsedStyle.selectedSlots)
      ? parsedStyle.selectedSlots
      : []
    if (selectedSlots.length === 0) {
      return { error: 'Select at least one time slot for Special messages.' }
    }
    if (selectedSlots.length > 3) {
      return { error: 'Special messages are limited to 3 slots.' }
    }
    // SLOT-1: slot windows must be canonical fixed 3-hour windows —
    // never price or store client-forged times.
    const seenStarts = new Set<string>()
    for (const s of selectedSlots) {
      if (!isCanonicalSlotWindow(s?.scheduled_start, s?.scheduled_end) || seenStarts.has(s.scheduled_start)) {
        return { error: 'Invalid time slot selection.' }
      }
      seenStarts.add(s.scheduled_start)
    }
    parsedStyle.selectedSlots = selectedSlots.map((s: any) => ({
      scheduled_start: s.scheduled_start,
      scheduled_end: s.scheduled_end,
    }))
    bidAmount = calculateSpecialPrice(Math.min(selectedSlots.length, 3)).finalPrice
  } else if (isSponsored) {
    bidAmount = SPONSORED_PRICE
    parsedStyle.isSponsored = true
    parsedStyle.durationSecs = SPONSORED_DURATION_SECS
    delete parsedStyle.stickers
    delete parsedStyle.frameId
  } else {
    const durationSecs = Number(parsedStyle.durationSecs) || BASE_NORMAL_MINS * 60
    const durationMins = Math.max(
      BASE_NORMAL_MINS,
      Math.min(MAX_NORMAL_MINS, Math.round(durationSecs / 60))
    )
    // CRE-1: write the clamped duration back — expiry/display consume
    // style_config.durationSecs raw, so pricing from a clamped copy
    // while storing the client's value sold unbounded airtime for $17.
    parsedStyle.durationSecs = durationMins * 60
    const minBid = calculateNormalMinBid(durationMins)
    const candidate = Number(data.bidAmount)
    bidAmount = !isNaN(candidate) && candidate > minBid ? candidate : minBid

    // Launch promo — first 500 Normal broadcasts free. Eligibility is
    // re-validated here, never trusted from the client: Normal tier, base
    // duration only (no extensions), no raised bid, no earlier promo from
    // the same device, and (CRE-5 mitigation) none from the same reminder
    // email when one is supplied. The counts below are only a fast path:
    // enforcement is the atomic claim_promo_slot() counter plus the
    // unique partial indexes on device_id / reminder_email (migration
    // 20261107000001), because count-then-insert races (CRE-4).
    // Ineligible requests silently fall through to the paid path.
    if (
      data.usePromoFree === true &&
      durationMins === BASE_NORMAL_MINS &&
      bidAmount === minBid &&
      typeof data.deviceId === 'string' &&
      data.deviceId.trim().length > 0
    ) {
      const deviceId = data.deviceId.trim().slice(0, 100)
      const isZeroCount = (count: number | null) =>
        typeof count === 'number' && Number.isFinite(count) && count === 0
      const { count: deviceCount } = await supabaseAdmin
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('is_promo_free', true)
        .eq('device_id', deviceId)
        .neq('status', 'REJECTED')
      let emailClear = true
      if (reminderEmail) {
        const { count: emailCount } = await supabaseAdmin
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('is_promo_free', true)
          .ilike('reminder_email', reminderEmail)
          .neq('status', 'REJECTED')
        emailClear = isZeroCount(emailCount)
      }
      // Fail closed on unreadable counts: no promo without proof of room.
      if (isZeroCount(deviceCount) && emailClear) {
        promoApplied = true
        promoDeviceId = deviceId
      }
    }
  }

  // Frame validation: unknown ids and retired picker-hidden frames are dropped
  // All active occasion frames are unlocked for everyone.
  if (typeof parsedStyle.frameId === 'string' && parsedStyle.frameId) {
    const frame = FRAMES.find(f => f.id === parsedStyle.frameId)
    if (!frame || (frame as any).pickerHidden || isSponsored) {
      delete parsedStyle.frameId
    }
  }

  // CRE-4: claim the promo slot atomically BEFORE inserting. The counter
  // (migration 20261107000001) increments only while claimed <
  // PROMO_FREE_LIMIT, so parallel creates cannot overshoot the cap. If
  // the claim fails, the request silently becomes a paid one.
  let promoClaimed = false
  if (promoApplied) {
    const { data: claimed, error: claimError } = await supabaseAdmin.rpc('claim_promo_slot')
    if (!claimError && claimed === true) {
      promoClaimed = true
    } else {
      promoApplied = false
      promoDeviceId = null
    }
  }

  // Insert message. Promo broadcasts skip payment entirely: they enter the
  // queue directly (QUEUED) with bid_amount = BASE_NORMAL_PRICE so bid-based
  // tier classification keeps reading them as Normal, flagged is_promo_free.
  const insertRow = (asPromo: boolean) =>
    supabaseAdmin
      .from('messages')
      .insert({
        category_id: category.id,
        template_id: templateId,
        content: trimmedContent,
        signature: signature,
        recipient: recipient,
        status: asPromo ? 'QUEUED' : 'PENDING_PAYMENT',
        bid_amount: asPromo ? BASE_NORMAL_PRICE : bidAmount,
        is_reserved_slot: isReserved,
        is_promo_free: asPromo,
        device_id: asPromo ? promoDeviceId : null,
        style_config: parsedStyle,
        reminder_email: reminderEmail,
      })
      .select('id')
      .single()

  let { data: message, error: msgError } = await insertRow(promoApplied)

  if (msgError && promoClaimed) {
    // Release the claim either way; a unique violation (23505) means a
    // racing create won this device/email — fall through to a paid row.
    await supabaseAdmin.rpc('release_promo_slot')
    promoClaimed = false
    if ((msgError as any).code === '23505') {
      promoApplied = false
      promoDeviceId = null
      const retry = await insertRow(false)
      message = retry.data
      msgError = retry.error
    }
  }

  if (msgError || !message) {
    console.error('Error creating message:', msgError)
    return { error: 'Failed to create message' }
  }

  return { success: true, messageId: message.id, promoApplied }
}

/**
 * Jev Content Moderation pre-check (UX): evaluates the message when the
 * user clicks "Choose a Style & Template" so the wizard can stop early.
 * This is NOT the enforcement point — createMessage re-runs the same
 * evaluation server-side on every submission (CRE-2).
 */
export async function verifyMessageWithJev(content: string) {
  const trimmed = (content || '').trim()
  if (!trimmed) {
    return { allowed: false, reason: 'Message content cannot be empty.' }
  }
  return await validateContentModerationAsync(trimmed)
}
