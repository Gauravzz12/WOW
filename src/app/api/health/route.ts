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

      // Test 1: filter on is_reserved_slot
      const { data: t1 } = await admin.from('messages').select('id').eq('status', 'PENDING_PAYMENT').eq('is_reserved_slot', false)
      // Test 2: join on category
      const { data: t2, error: t2Err } = await admin.from('messages').select('id, category:categories(name, slug)').eq('status', 'PENDING_PAYMENT')
      // Test 3: order by created_at
      const { data: t3 } = await admin.from('messages').select('id').eq('status', 'PENDING_PAYMENT').order('created_at', { ascending: false })
      // Test 4: select raw is_reserved_slot values
      const { data: t4 } = await admin.from('messages').select('id, is_reserved_slot, category_id').eq('status', 'PENDING_PAYMENT')

      return NextResponse.json({
        status: 'ok',
        serviceKeyRole,
        adminQueryCount,
        t1_reservedSlotFilter_count: t1?.length ?? -1,
        t2_categoryJoin_count: t2?.length ?? -1,
        t2_error: t2Err ? t2Err.message : null,
        t3_order_count: t3?.length ?? -1,
        t4_sample: t4?.slice(0, 3),
      })
    } catch (e: any) {
      return NextResponse.json({ status: 'error', error: e.message })
    }
  }

  return NextResponse.json({ status: 'missing-keys' })
}
