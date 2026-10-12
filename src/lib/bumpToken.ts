import { createHash, randomBytes } from 'crypto'
import { getSupabaseAdmin } from './supabase/admin'

/**
 * Bump Token Utilities.
 * Each standard queued message has a private SHA-256 hash stored in `style_config.bumpTokenHash`.
 * When a user provides their secret token (e.g. `bmp_...`), we hash it and look up the active queued message.
 * Upon a successful bump, the old token is invalidated and a fresh token is issued.
 */

export function generateBumpToken(): string {
  return `bmp_${randomBytes(16).toString('hex')}`
}

export function hashBumpToken(token: string): string {
  return createHash('sha256').update(token.trim()).digest('hex')
}

export interface VerifiedBumpMessage {
  id: string
  content: string
  bid_amount: number
  status: string
  reminder_email: string | null
  currentRank: number
  highestQueuedBid: number
  categoryName: string
}

export async function verifyBumpToken(rawToken: string): Promise<{
  error?: string
  message?: VerifiedBumpMessage
}> {
  if (!rawToken || typeof rawToken !== 'string') {
    return { error: 'Please enter a valid bump token.' }
  }

  const token = rawToken.trim()
  if (!token.startsWith('bmp_') && token.length < 10) {
    return { error: 'Invalid token format. Tokens start with bmp_...' }
  }

  const tokenHash = hashBumpToken(token)
  const supabase = getSupabaseAdmin()

  // 1. Fetch all queued normal messages
  const { data: queuedMessages, error } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      bid_amount,
      status,
      reminder_email,
      is_reserved_slot,
      style_config,
      created_at,
      category:categories(name)
    `)
    .eq('status', 'QUEUED')
    .eq('is_reserved_slot', false)
    .order('bid_amount', { ascending: false })
    .order('created_at', { ascending: true })

  if (error || !queuedMessages || queuedMessages.length === 0) {
    return { error: 'No active messages found in the priority queue.' }
  }

  // 2. Find the message matching this token's hash
  const matchIndex = queuedMessages.findIndex((m: any) => {
    let cfg = m.style_config
    if (typeof cfg === 'string') {
      try { cfg = JSON.parse(cfg) } catch { cfg = {} }
    }
    return cfg?.bumpTokenHash === tokenHash
  })

  if (matchIndex === -1) {
    return {
      error: 'Token not recognized or has already been used/invalidated. Please check your latest email for the updated token.'
    }
  }

  const matched = queuedMessages[matchIndex]
  const highestQueuedBid = queuedMessages[0]?.bid_amount || 0
  const categoryName = (matched.category as any)?.name || 'General'

  return {
    message: {
      id: matched.id,
      content: matched.content,
      bid_amount: matched.bid_amount || 0,
      status: matched.status,
      reminder_email: matched.reminder_email,
      currentRank: matchIndex + 1,
      highestQueuedBid,
      categoryName,
    }
  }
}

export async function rotateBumpToken(
  messageId: string, 
  newTotalBid: number,
  newToken: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdmin()

  const { data: currentMsg, error: fetchErr } = await supabase
    .from('messages')
    .select('id, bid_amount, style_config, reminder_email, content')
    .eq('id', messageId)
    .single()

  if (fetchErr || !currentMsg) {
    return { success: false, error: 'Message not found.' }
  }

  let cfg = currentMsg.style_config || {}
  if (typeof cfg === 'string') {
    try { cfg = JSON.parse(cfg) } catch { cfg = {} }
  }

  const newTokenHash = hashBumpToken(newToken)
  cfg.bumpTokenHash = newTokenHash
  cfg.lastBumpedAt = new Date().toISOString()
  cfg.bumpCount = (cfg.bumpCount || 0) + 1

  const { error: updateErr } = await supabase
    .from('messages')
    .update({
      bid_amount: newTotalBid,
      style_config: cfg,
    })
    .eq('id', messageId)

  if (updateErr) {
    return { success: false, error: 'Failed to update message bid.' }
  }

  return { success: true }
}
