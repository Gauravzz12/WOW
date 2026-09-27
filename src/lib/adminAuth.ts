import { cookies } from 'next/headers'

const COOKIE_NAME = 'admin_session'

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'admin123'
}

export function getAdminSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || 'wow_admin_secret_salt_2026'
}

/**
 * Computes a deterministic SHA-256 hash using Web Crypto API.
 * Compatible with Edge runtime, Node.js server components, and server actions.
 */
export async function hashToken(password: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(`${password}:${secret}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generates the expected valid session token based on the admin password and salt.
 */
export async function getExpectedAdminToken(): Promise<string> {
  return await hashToken(getAdminPassword(), getAdminSecret())
}

/**
 * Validates whether the given token matches the expected admin session hash.
 */
export async function verifyAdminSessionToken(token?: string | null): Promise<boolean> {
  if (!token) return false
  const expected = await getExpectedAdminToken()
  return token === expected
}

/**
 * Verifies if the entered password matches the configured ADMIN_PASSWORD.
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password) return false
  return password === getAdminPassword()
}

export const ADMIN_COOKIE_CONFIG = {
  name: COOKIE_NAME,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}
