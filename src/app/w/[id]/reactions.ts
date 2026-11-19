'use server'

import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { isAllowedReactionEmoji } from '@/lib/reactionEmojis'

/**
 * Device-gated reaction writes (server-only).
 * Reads the anonymous device id from the `wow_device_id` cookie (shared with
 * the client-side getDeviceId helper) and performs all writes with the
 * service role, so the open anon INSERT/DELETE RLS policies could be revoked.
 *
 * Model (WhatsApp/Instagram style): ONE reaction per device per message.
 * The stored reaction_type is the emoji character itself; rows written by
 * the old 5-type system hold legacy ids (LOVE, CELEBRATE, ...) and are
 * replaced wholesale the next time that device reacts.
 */

const DEVICE_COOKIE = 'wow_device_id'
// Flood guard: max writes per device per rolling minute.
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX = 30

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function getOrCreateDeviceId(): string {
  const store = cookies()
  let id = store.get(DEVICE_COOKIE)?.value
  if (!id) {
    id = randomUUID()
    store.set(DEVICE_COOKIE, id, {
      path: '/',
      maxAge: 10 * 365 * 24 * 60 * 60, // 10 years, mirrors client helper
      sameSite: 'lax',
    })
  }
  return id
}

function getDeviceIdOrNull(): string | null {
  try {
    return cookies().get(DEVICE_COOKIE)?.value ?? null
  } catch {
    return null
  }
}

/**
 * DAT-3: returns the CALLER's own reactions on a message (id + type).
 * Replaces shipping every reactor's device_id to every browser, where
 * the id doubles as the ownership credential — a client now only ever
 * learns about its own rows.
 */
export async function getMyReactions(messageId: string) {
  if (!messageId) return { reactions: [] as { id: string; type: string }[] }
  const deviceId = getDeviceIdOrNull()
  if (!deviceId) return { reactions: [] as { id: string; type: string }[] }
  const supabaseAdmin = getAdmin()
  const { data } = await supabaseAdmin
    .from('reactions')
    .select('id, reaction_type')
    .eq('message_id', messageId)
    .eq('device_id', deviceId)
  return {
    reactions: ((data as any[]) || []).map(r => ({ id: r.id as string, type: r.reaction_type as string })),
  }
}

async function checkRateLimit(
  supabaseAdmin: ReturnType<typeof getAdmin>,
  deviceId: string
): Promise<boolean> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
  const { count } = await supabaseAdmin
    .from('reactions')
    .select('id', { count: 'exact', head: true })
    .eq('device_id', deviceId)
    .gt('created_at', since)
  return (count ?? 0) < RATE_LIMIT_MAX
}

/**
 * Set the caller's single reaction on a message to `emoji`, replacing any
 * previous one (including legacy-type rows). Picking a different emoji is
 * a change, not an addition — the message's total only grows when a new
 * device reacts.
 */
export async function setReaction(messageId: string, emoji: string) {
  if (!messageId || !isAllowedReactionEmoji(emoji)) {
    return { error: 'Invalid reaction.' }
  }
  const deviceId = getOrCreateDeviceId()
  const supabaseAdmin = getAdmin()

  if (!(await checkRateLimit(supabaseAdmin, deviceId))) {
    return { error: 'Too many reactions. Please slow down.' }
  }

  // Replace semantics: clear every row this device has on the message,
  // then insert the single new one.
  const { error: deleteError } = await supabaseAdmin
    .from('reactions')
    .delete()
    .eq('message_id', messageId)
    .eq('device_id', deviceId)
  if (deleteError) return { error: 'Failed to set reaction.' }

  const { data, error } = await supabaseAdmin
    .from('reactions')
    .insert({ message_id: messageId, reaction_type: emoji, device_id: deviceId })
    .select('id')
    .single()

  if (error) return { error: 'Failed to set reaction.' }
  return { id: (data as any).id }
}

/** Remove the caller's reaction (whatever type/emoji it is) from a message. */
export async function removeMyReaction(messageId: string) {
  if (!messageId) return { error: 'Invalid reaction.' }
  const deviceId = getOrCreateDeviceId()
  const supabaseAdmin = getAdmin()

  const { data, error } = await supabaseAdmin
    .from('reactions')
    .delete()
    .eq('message_id', messageId)
    .eq('device_id', deviceId)
    .select('id')

  if (error) return { error: 'Failed to remove reaction.' }
  if (!data || (data as any[]).length === 0) return { error: 'Reaction not found.' }
  return { success: true }
}
