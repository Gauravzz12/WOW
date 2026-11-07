import { NextResponse } from 'next/server'
import { runQueueAdvance } from '@/lib/queueAdvance'

export const dynamic = 'force-dynamic'

// Auth model (stated honestly):
// - POST is intentionally callable without a secret: the in-browser client
//   (MainFeedContainer) triggers advances, and runQueueAdvance is idempotent
//   with atomic guards — worst case from abuse is extra no-op sweeps.
//   API-1: a per-instance minimum interval caps how often the expensive
//   sweep can actually run, so caller-chosen frequency cannot amplify cost.
// - GET is the cron entry point (Vercel Cron sends GET with the secret).
//   API-1: like /api/slots/generate, GET FAILS CLOSED in production when
//   CRON_SECRET is unset — it used to fail open in exactly that case.
function hasValidCronSecret(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return process.env.NODE_ENV !== 'production'
  }
  const authHeader = req.headers.get('authorization')
  const customHeader = req.headers.get('x-cron-secret')
  return authHeader === `Bearer ${cronSecret}` || customHeader === cronSecret
}

const MIN_ADVANCE_INTERVAL_MS = 10_000
let lastAdvanceAt = 0

export async function POST() {
  const nowMs = Date.now()
  if (nowMs - lastAdvanceAt < MIN_ADVANCE_INTERVAL_MS) {
    return NextResponse.json({ success: true, skipped: 'debounced' })
  }
  lastAdvanceAt = nowMs
  const result = await runQueueAdvance()
  return NextResponse.json(result)
}

export async function GET(req: Request) {
  if (!hasValidCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await runQueueAdvance()
  return NextResponse.json(result)
}
