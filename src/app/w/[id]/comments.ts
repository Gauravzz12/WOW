'use server'

import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { validateContentModeration } from '@/lib/moderation'

/**
 * Device-gated comment writes (server-only).
 * Validates length server-side and rate-limits per device, so the open anon
 * INSERT policy could be revoked. Deletes are owner-only via device match,
 * giving anonymous authors a way to remove their own comments.
 */

const DEVICE_COOKIE = 'wow_device_id'
const MAX_LEN = 300
// Flood guard: max comments per device per rolling window.
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000
const RATE_LIMIT_MAX = 10

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
      maxAge: 10 * 365 * 24 * 60 * 60,
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

export async function addComment(messageId: string, content: string) {
  if (!messageId || typeof content !== 'string') {
    return { error: 'Invalid comment.' }
  }
  const trimmed = content.trim()
  if (!trimmed || trimmed.length > MAX_LEN) {
    return { error: `Comments must be 1–${MAX_LEN} characters.` }
  }

  // Content moderation check
  const modCheck = validateContentModeration(trimmed)
  if (!modCheck.allowed) {
    return { error: modCheck.reason || 'Comment violates our Community Guidelines.' }
  }

  const deviceId = getOrCreateDeviceId()
  const supabaseAdmin = getAdmin()

  // Only live/paid messages accept comments — never locked paywall rows.
  const { data: message } = await supabaseAdmin
    .from('messages')
    .select('id, status')
    .eq('id', messageId)
    .maybeSingle()
  if (!message) return { error: 'Message not found.' }
  if ((message as any).status === 'PENDING_PAYMENT') {
    return { error: 'Comments open after this message goes live.' }
  }

  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
  const { count } = await supabaseAdmin
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('device_id', deviceId)
    .gt('created_at', since)
  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    return { error: 'Too many comments. Please slow down.' }
  }

  const { data, error } = await supabaseAdmin
    .from('comments')
    .insert({ message_id: messageId, content: trimmed, device_id: deviceId })
    .select('id, content, created_at, device_id')
    .single()

  if (error) return { error: 'Failed to post comment.' }
  return { comment: data }
}

export async function deleteComment(messageId: string, commentId: string) {
  if (!messageId || !commentId) {
    return { error: 'Invalid comment.' }
  }
  const deviceId = getDeviceIdOrNull()
  if (!deviceId) return { error: 'Not found.' }

  const supabaseAdmin = getAdmin()
  const { data, error } = await supabaseAdmin
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('message_id', messageId)
    .eq('device_id', deviceId)
    .select('id')

  if (error) return { error: 'Failed to delete comment.' }
  if (!data || (data as any[]).length === 0) return { error: 'Not found.' }
  return { success: true }
}
