import { createClient as createAdminClient } from '@supabase/supabase-js'
import { notFound, redirect } from 'next/navigation'
import { CheckoutForm } from './CheckoutForm'
import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'
import { getSponsoredTeaser, stripHtml } from '@/lib/masking'

export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function CheckoutPage({ 
  params,
  searchParams 
}: { 
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Service-role: PENDING_PAYMENT rows are no longer readable via anon RLS.
  const supabase = getSupabaseAdmin()

  const { data: message } = await supabase
    .from('messages')
    .select('id, status, bid_amount, is_reserved_slot, content, style_config, category:categories(name, slug)')
    .eq('id', params.id)
    .single()

  if (!message) {
    notFound()
  }

  if (message.status !== 'PENDING_PAYMENT') {
    redirect('/')
  }

  const isSponsorMode = searchParams.mode === 'sponsor'
  const categoryName = (message.category as any)?.name || 'Message'
  // Paywall: never render full content. Sponsors see a short teaser + length only.
  // Full text unlocks after the $1 payment moves the row to QUEUED/ACTIVE.
  const plain = stripHtml(message.content || '')
  const { teaser, totalLength } = getSponsoredTeaser(plain)

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Back link */}
      <div className="w-full max-w-md mb-4">
        <Link href="/" className="inline-flex items-center gap-2 text-secondary hover:text-primary text-sm transition-colors">
          <ArrowLeft size={16} />
          <span>Back to World</span>
        </Link>
      </div>

      <div className="max-w-md w-full bg-background-elevated border border-primary/10 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-serif">
            {isSponsorMode ? 'Sponsor this Message' : 'Complete Your Order'}
          </h1>
          {isSponsorMode && (
            <p className="text-xs text-secondary mt-1">
              Amplify an authentic community voice to the global stage
            </p>
          )}
        </div>

        {isSponsorMode && (
          <div className="mb-6 p-4 rounded-2xl bg-background border border-primary/10 text-center">
            <span className="text-[10px] uppercase font-bold tracking-widest text-secondary block mb-1.5">
              Message to Broadcast ({categoryName})
            </span>
            <p className="font-serif italic text-primary text-sm leading-relaxed">
              &ldquo;{teaser}&hellip;&rdquo;
            </p>
            <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-secondary">
              <Lock size={11} />
              <span>Locked preview ({totalLength} chars) — full message reveals after you sponsor for $1</span>
            </p>
          </div>
        )}
        
        {await (async () => {
          let initialSlots: any[] = []
          const style = typeof message.style_config === 'string'
            ? JSON.parse(message.style_config || '{}')
            : (message.style_config || {})

          if (message.is_reserved_slot) {
            const rawSlots = searchParams.slots || style.slotIds
            const candidateIds = rawSlots 
              ? (typeof rawSlots === 'string' ? rawSlots.split(',').filter(Boolean) : (Array.isArray(rawSlots) ? rawSlots : []))
              : []

            // 1. Try fetching by IDs if they look like UUIDs
            const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            const validUuids = candidateIds.filter((id: string) => uuidPattern.test(id))

            if (validUuids.length > 0) {
              const { data: dbSlots } = await supabase
                .from('reserved_slots')
                .select('id, scheduled_start, scheduled_end, status, bid_amount')
                .in('id', validUuids)
                .order('scheduled_start', { ascending: true })

              if (dbSlots && dbSlots.length === validUuids.length) {
                initialSlots = dbSlots
              }
            }

            // 2. Fallback: match by scheduled_start from style.selectedSlots
            if (initialSlots.length === 0 && Array.isArray(style.selectedSlots) && style.selectedSlots.length > 0) {
              const startTimes = style.selectedSlots.map((s: any) => new Date(s.scheduled_start).toISOString())
              const { data: dbSlots } = await supabase
                .from('reserved_slots')
                .select('id, scheduled_start, scheduled_end, status, bid_amount')
                .in('scheduled_start', startTimes)
                .order('scheduled_start', { ascending: true })

              if (dbSlots && dbSlots.length > 0) {
                initialSlots = dbSlots
              } else {
                initialSlots = style.selectedSlots
              }
            }
          }

          const rawSlots = searchParams.slots || style.slotIds
          const initialSlotIds = initialSlots.length > 0 
            ? initialSlots.map(s => s.id)
            : (rawSlots ? (typeof rawSlots === 'string' ? rawSlots.split(',').filter(Boolean) : rawSlots) : [])

          return (
            <CheckoutForm 
              messageId={message.id} 
              baseAmount={message.bid_amount}
              isReservedSlot={message.is_reserved_slot}
              isSponsorMode={isSponsorMode}
              initialSlotIds={initialSlotIds}
              initialSlots={initialSlots}
            />
          )
        })()}
      </div>
    </div>
  )
}

