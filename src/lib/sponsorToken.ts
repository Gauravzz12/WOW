import { createHash, randomUUID } from 'crypto'
import { getSupabaseAdmin } from './supabase/admin'

/**
 * Sponsor shoutout edit tokens (server-only).
 * Issued once at sponsorship time; the raw token is kept in the sponsor's
 * httpOnly cookie and only its SHA-256 hash is stored server-side.
 * This closes the open-vandalism hole where anyone could overwrite any
 * message's sponsor name/dedication via updateSponsorShoutout.
 */

const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export const SPONSOR_TOKEN_COOKIE_PREFIX = 'sp_tok_'

export function sponsorTokenCookieName(messageId: string): string {
  return `${SPONSOR_TOKEN_COOKIE_PREFIX}${messageId}`
}

function getAdmin() {
  return getSupabaseAdmin()
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function issueSponsorEditToken(messageId: string): Promise<string> {
  const token = randomUUID()
  const supabaseAdmin = getAdmin()
  await supabaseAdmin.from('sponsor_edit_tokens').upsert(
    {
      message_id: messageId,
      token_hash: hashToken(token),
      expires_at: new Date(Date.now() + TOKEN_TTL_MS).toISOString(),
    },
    { onConflict: 'message_id' }
  )
  return token
}

export async function verifySponsorEditToken(
  messageId: string,
  token: string | null | undefined
): Promise<boolean> {
  if (!messageId || !token) return false
  const supabaseAdmin = getAdmin()
  const { data } = await supabaseAdmin
    .from('sponsor_edit_tokens')
    .select('token_hash, expires_at')
    .eq('message_id', messageId)
    .maybeSingle()

  if (!data || new Date(data.expires_at).getTime() <= Date.now()) return false

  const provided = hashToken(token)
  return provided.length === data.token_hash.length && provided === data.token_hash
}
