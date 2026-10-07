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
  let queryB_count = -1
  let queryB_error = null
  let queryB_sample = null

  if (url && serviceKey) {
    try {
      const admin = createClient(url, serviceKey)
      const { data, error, count } = await admin
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('status', 'PENDING_PAYMENT')

      adminQueryCount = count !== null ? count : (data?.length ?? 0)
      adminQueryError = error ? error.message : null

      // Query B: the exact query used by waiting-room and teasers
      const { data: bData, error: bError } = await admin
        .from('messages')
        .select('id, content, bid_amount, is_reserved_slot, created_at, category:categories(name, slug)')
        .eq('status', 'PENDING_PAYMENT')
        .eq('is_reserved_slot', false)
        .order('created_at', { ascending: false })
        .limit(100)

      queryB_count = bData?.length ?? -1
      queryB_error = bError ? bError.message : null
      queryB_sample = bData && bData.length > 0 ? { id: bData[0].id, category: bData[0].category } : null
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
    queryB_count,
    queryB_error,
    queryB_sample,
    dodoConfigured: Boolean(process.env.DODO_PAYMENTS_API_KEY && process.env.DODO_PAYMENTS_WEBHOOK_SECRET),
  })
}
