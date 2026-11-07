import { cookies } from 'next/headers'

const COOKIE_NAME = 'admin_session'

// Fail closed: there are NO fallback credentials. If ADMIN_PASSWORD or
// ADMIN_SESSION_SECRET is not configured, admin login is disabled entirely
// (verifyAdminPassword always returns false and no session token can match).
export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || ''
}

export function getAdminSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || ''
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET)
}

// API-3: the session token used to be a static SHA-256 of
// password:secret — deterministic, never expiring server-side, and
// unrevocable (logout only cleared the browser cookie; a copied token
// stayed valid until both env values rotated). Tokens are now
// HMAC-signed, expiring payloads: `v1.<exp>.<hmac>` where the HMAC key
// is ADMIN_SESSION_SECRET and the signed payload binds the expiry AND
// the current password, so rotating either env value kills every
// outstanding token, and every token dies on its own within 24h.
const SESSION_TTL_SECONDS = 60 * 60 * 24 // 24 hours

async function hmacHex(key: string, payload: string): Promise<string> {
  const encoder = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payload))
  return Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}

/**
 * Mints a fresh expiring admin session token (login only).
 */
export async function createAdminSessionToken(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS
  const payload = `v1.${exp}`
  const sig = await hmacHex(getAdminSecret(), `${payload}:${getAdminPassword()}`)
  return `${payload}.${sig}`
}

/**
 * Validates an admin session token: well-formed, unexpired, and with a
 * valid HMAC over the expiry + current password.
 */
export async function verifyAdminSessionToken(token?: string | null): Promise<boolean> {
  if (!token) return false
  if (!isAdminConfigured()) return false
  const parts = token.split('.')
  if (parts.length !== 3 || parts[0] !== 'v1') return false
  const exp = Number(parts[1])
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) return false
  const expected = await hmacHex(getAdminSecret(), `v1.${exp}:${getAdminPassword()}`)
  return timingSafeEqual(parts[2], expected)
}

/**
 * Verifies if the entered password matches the configured ADMIN_PASSWORD.
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password) return false
  if (!isAdminConfigured()) return false
  return timingSafeEqual(password, getAdminPassword())
}

export const ADMIN_COOKIE_CONFIG = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS, // matches the token's own 24h expiry
  },
}
