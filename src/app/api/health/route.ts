import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  let serviceKeyRole = 'missing'
  try {
    if (serviceKey) {
      const parts = serviceKey.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'))
        serviceKeyRole = payload.role || 'no-role'
      }
    }
  } catch (e: any) {
    serviceKeyRole = 'parse-error: ' + e.message
  }

  let adminQueryCount = -1
  let adminQueryError = null

  if (url && serviceKey) {
    try {
      const admin = createClient(url, serviceKey)
      const { data, error, count } = await admin
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('status', 'PENDING_PAYMENT')

      adminQueryCount = count !== null ? count : (data?.length ?? 0)
      adminQueryError = error ? error.message : null
    } catch (e: any) {
      adminQueryError = e.message
    }
  }

  return NextResponse.json({
    status: 'ok',
    hasSupabaseUrl: Boolean(url),
    hasAnonKey: Boolean(anonKey),
    hasServiceKey: Boolean(serviceKey),
    serviceKeyRole, // Should be 'service_role', NOT 'anon'
    adminQueryCount,
    adminQueryError,
    dodoConfigured: Boolean(process.env.DODO_PAYMENTS_API_KEY && process.env.DODO_PAYMENTS_WEBHOOK_SECRET),
  })
}
