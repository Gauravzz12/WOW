'use server'

import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'

/**
 * Device-gated reaction writes (server-only).
 * Reads the anonymous device id from the `wow_device_id` cookie (shared with
 * the client-side getDeviceId helper) and performs all writes with the
 * service role, so the open anon INSERT/DELETE RLS policies could be revoked.
 */

const REACTION_TYPES = ['LOVE', 'CELEBRATE', 'SUPPORT', 'FEEL_THIS', 'RESPECT'] as const
export type ReactionType = (typeof REACTION_TYPES)[number]

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

function isValidType(type: string): type is ReactionType {
  return (REACTION_TYPES as readonly string[]).includes(type)
}

export async function addReaction(messageId: string, type: string) {
  if (!messageId || !isValidType(type)) {
    return { error: 'Invalid reaction.' }
  }
  const deviceId = getOrCreateDeviceId()
  const supabaseAdmin = getAdmin()

  if (!(await checkRateLimit(supabaseAdmin, deviceId))) {
    return { error: 'Too many reactions. Please slow down.' }
  }

  const { data, error } = await supabaseAdmin
    .from('reactions')
    .insert({ message_id: messageId, reaction_type: type, device_id: deviceId })
    .select('id')
    .single()

  if (error) {
    // Already reacted (unique index) — return the existing row so the
    // client can reconcile instead of sticking a ghost 'temp' state.
    if ((error as any).code === '23505') {
      const { data: existing } = await supabaseAdmin
        .from('reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('device_id', deviceId)
        .eq('reaction_type', type)
        .maybeSingle()
      if (existing) return { id: (existing as any).id, deduped: true }
    }
    return { error: 'Failed to add reaction.' }
  }

  return { id: (data as any).id }
}

export async function removeReaction(messageId: string, type: string) {
  if (!messageId || !isValidType(type)) {
    return { error: 'Invalid reaction.' }
  }
  const deviceId = getOrCreateDeviceId()
  const supabaseAdmin = getAdmin()

  const { data, error } = await supabaseAdmin
    .from('reactions')
    .delete()
    .eq('message_id', messageId)
    .eq('device_id', deviceId)
    .eq('reaction_type', type)
    .select('id')

  if (error) return { error: 'Failed to remove reaction.' }
  if (!data || (data as any[]).length === 0) return { error: 'Reaction not found.' }
  return { success: true }
}
