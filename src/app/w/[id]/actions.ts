'use server'

import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import {
  sponsorTokenCookieName,
  verifySponsorEditToken,
} from '@/lib/sponsorToken'

import { getSupabaseAdmin } from '@/lib/supabase/admin'

const supabaseAdmin = getSupabaseAdmin()

/**
 * Post-pay shoutout edit: the sponsor pays on a locked teaser, then sees the
 * full message and can add/edit their 12-word dedication + name.
 * Gated by a per-message edit token issued at sponsorship time (stored hashed
 * server-side, raw value in the sponsor's httpOnly cookie). Without it, anyone
 * could deface any message's attribution.
 */
export async function updateSponsorShoutout(
  messageId: string,
  data: { sponsorName?: string; sponsorNote?: string }
) {
  if (!messageId) {
    return { error: 'Message not found.' }
  }
  if (
    (data.sponsorName !== undefined && typeof data.sponsorName !== 'string') ||
    (data.sponsorNote !== undefined && typeof data.sponsorNote !== 'string')
  ) {
    return { error: 'Invalid shoutout.' }
  }

  const token = cookies().get(sponsorTokenCookieName(messageId))?.value
  if (!(await verifySponsorEditToken(messageId, token))) {
    return { error: 'Only the sponsor of this message can edit this shoutout.' }
  }

  const { data: msg, error: fetchError } = await supabaseAdmin
    .from('messages')
    .select('id, status, bid_amount, is_reserved_slot, style_config')
    .eq('id', messageId)
    .single()

  if (fetchError || !msg) {
    return { error: 'Message not found.' }
  }

  // Only paid sponsored messages can carry a shoutout — never PENDING_PAYMENT.
  if ((msg as any).status === 'PENDING_PAYMENT') {
    return { error: 'Pay $3 to reveal this message before adding your shoutout.' }
  }
  if ((msg as any).is_reserved_slot || ((msg as any).bid_amount ?? 0) >= 10) {
    return { error: 'Only community sponsored messages carry a sponsor shoutout.' }
  }

  let style = (msg as any).style_config || {}
  if (typeof style === 'string') {
    try { style = JSON.parse(style) } catch { style = {} }
  }

  if (data.sponsorName !== undefined) {
    style.sponsorName = data.sponsorName.trim().slice(0, 30)
  }
  if (data.sponsorNote !== undefined) {
    const words = data.sponsorNote.trim().split(/\s+/).filter(Boolean)
    style.sponsorNote = words.slice(0, 12).join(' ').slice(0, 150)
  }

  const { error: updateError } = await supabaseAdmin
    .from('messages')
    .update({ style_config: style })
    .eq('id', messageId)

  if (updateError) {
    return { error: 'Failed to save shoutout.' }
  }

  revalidatePath(`/w/${messageId}`)
  revalidatePath('/')
  return { success: true }
}
