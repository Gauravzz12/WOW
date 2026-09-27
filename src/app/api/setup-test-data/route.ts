import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data: category } = await supabaseAdmin.from('categories').select('*').limit(1).single()
    
    const messages = []
    
    // Generate 6 sponsored messages to test the 5 limit + 1 queued
    for (let i = 1; i <= 6; i++) {
      messages.push({
        content: `Sponsored Test Message ${i}`,
        bid_amount: 1, // Sponsored
        status: 'QUEUED',
        category_id: category.id,
        template_id: 'g',
        is_reserved_slot: false,
        style_config: { bg: 'bg-black/50', font: 'font-serif' }
      })
    }

    // Generate 2 normal messages 
    for (let i = 1; i <= 2; i++) {
      messages.push({
        content: `Normal Test Message ${i}`,
        bid_amount: 5 + i, // Normal > 1
        status: 'QUEUED',
        category_id: category.id,
        template_id: 'g',
        is_reserved_slot: false,
        style_config: { bg: 'bg-black/50', font: 'font-sans' }
      })
    }
    
    const { error: insertError } = await supabaseAdmin.from('messages').insert(messages)
    if (insertError) throw new Error(insertError.message)

    // Run the advance logic to promote them instantly
    await fetch(new URL('/api/queue/advance', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').toString(), { method: 'POST' }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Test data inserted and queue advanced!' })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) })
  }
}
