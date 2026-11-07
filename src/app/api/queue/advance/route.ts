import { NextResponse } from 'next/server'
import { runQueueAdvance } from '@/lib/queueAdvance'

export const dynamic = 'force-dynamic'

// Auth model (stated honestly):
// - POST is intentionally callable without a secret: the in-browser client
//   (MainFeedContainer) triggers advances, and runQueueAdvance is idempotent
//   with atomic guards — worst case from abuse is extra no-op sweeps.
// - GET is the cron entry point (Vercel Cron sends GET with the secret), so
//   GET requires CRON_SECRET whenever one is configured.
function hasValidCronSecret(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    // No secret configured (local dev): allow.
    return true
  }
  const authHeader = req.headers.get('authorization')
  const customHeader = req.headers.get('x-cron-secret')
  return authHeader === `Bearer ${cronSecret}` || customHeader === cronSecret
}

export async function POST() {
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
