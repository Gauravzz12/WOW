import { NextResponse } from 'next/server'
import { runQueueAdvance } from '@/lib/queueAdvance'

export const dynamic = 'force-dynamic'

function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    // If CRON_SECRET is not configured (e.g. in local dev), allow execution
    return true
  }
  const authHeader = req.headers.get('authorization')
  const customHeader = req.headers.get('x-cron-secret')
  return authHeader === `Bearer ${cronSecret}` || customHeader === cronSecret
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await runQueueAdvance()
  return NextResponse.json(result)
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const result = await runQueueAdvance()
  return NextResponse.json(result)
}

