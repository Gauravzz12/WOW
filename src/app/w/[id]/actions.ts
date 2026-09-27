'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Post-pay shoutout edit: sponsor pays on a locked teaser, then sees the full
 * message and can add/edit their 12-word dedication + name.
 * Anonymous model (like comments/reactions) — anyone can set it on a sponsored
 * (bid < 2, non-reserved, paid) message. Pre-pay value is optional and editable.
 */
export async function updateSponsorShoutout(
  messageId: string,
  data: { sponsorName?: string; sponsorNote?: string }
) {
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
    return { error: 'Pay $1 to reveal this message before adding your shoutout.' }
  }
  if ((msg as any).is_reserved_slot || ((msg as any).bid_amount ?? 0) >= 2) {
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
