'use server'

import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { verifyBumpToken } from '@/lib/bumpToken'
import {
  validateContentModeration,
  validateContentModerationAsync,
} from '@/lib/moderation'
import { parseStyleConfig } from '@/lib/lineup'

/**
 * Owner message editing (2026-11-20): the same secret token that powers
 * bid bumps (bmp_..., issued in the receipt email) also authorizes
 * editing the message text — but only while the message has NOT gone
 * live. verifyBumpToken only matches QUEUED, non-reserved messages, so
 * a live or finished broadcast can never be edited through here; the
 * guarded update below re-checks status at write time to close the
 * verify→write race.
 *
 * The replacement text runs the FULL create-time content filter:
 * length + word limits, the synchronous script check, and the Jev
 * semantic screen (validateContentModerationAsync).
 */
export async function editMessageAction(
  token: string,
  newContent: string,
): Promise<{ success?: boolean; error?: string; content?: string }> {
  try {
    const verification = await verifyBumpToken(token)
    if (verification.error || !verification.message) {
      return {
        error:
          verification.error ||
          'Token is invalid, or this message has already gone live and can no longer be edited.',
      }
    }
    const msg = verification.message

    const trimmed = (newContent || '').trim()
    if (!trimmed) {
      return { error: 'Message content cannot be empty.' }
    }
    if (trimmed.length > 1500) {
      return { error: 'Message content exceeds the 1,500 character limit.' }
    }
    const words = trimmed.split(/\s+/).filter(Boolean).length
    if (words > 150) {
      return { error: `Message cannot exceed 150 words (currently ${words} words).` }
    }
    if (trimmed === (msg.content || '').trim()) {
      return { error: 'No changes — the new text is identical to your current message.' }
    }

    // Full content filter, identical to create (create/actions.ts).
    const syncMod = validateContentModeration(trimmed)
    if (!syncMod.allowed) {
      return { error: syncMod.reason || 'Message violates our Community Safety & Content Guidelines.' }
    }
    const jevMod = await validateContentModerationAsync(trimmed)
    if (!jevMod.allowed) {
      return { error: jevMod.reason || 'Message violates our Community Safety & Content Guidelines.' }
    }

    const supabase = getSupabaseAdmin()
    const { data: row, error: fetchErr } = await supabase
      .from('messages')
      .select('style_config, status')
      .eq('id', msg.id)
      .single()
    if (fetchErr || !row) {
      return { error: 'Message not found.' }
    }
    if (row.status !== 'QUEUED') {
      return { error: 'This message has already gone live and can no longer be edited.' }
    }

    // Preserve the whole style_config (it carries the bump token hash,
    // the lineup mark, template styling…). The one field an edit must
    // clear is `html`: displays render it INSTEAD of `content` when
    // present, so a stale rich-text copy would hide the edit. The
    // edited text is stored and rendered as plain text.
    const cfg = parseStyleConfig(row.style_config)
    delete cfg.html

    const { data: updated, error: updateErr } = await supabase
      .from('messages')
      .update({ content: trimmed, style_config: cfg })
      .eq('id', msg.id)
      .eq('status', 'QUEUED')
      .select('id')
    if (updateErr) {
      console.error('editMessageAction update failed:', updateErr)
      return { error: 'Failed to save your edit. Please try again.' }
    }
    if (!updated || updated.length === 0) {
      return { error: 'This message has already gone live and can no longer be edited.' }
    }

    return { success: true, content: trimmed }
  } catch (err: any) {
    console.error('editMessageAction failed:', err)
    return { error: err?.message || 'Failed to edit the message.' }
  }
}
