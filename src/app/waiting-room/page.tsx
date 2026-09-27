import { createClient as createAdminClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ArrowLeft, Clock, Lock } from 'lucide-react'
import { getCategoryStyles } from '@/lib/utils/colors'
import { toLockedSponsoredCard } from '@/lib/masking'

export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export default async function WaitingRoomPage() {
  // Service-role: anon RLS no longer allows reading PENDING_PAYMENT rows.
  // We fetch server-side then strip full `content` before rendering.
  const supabase = getSupabaseAdmin()
  
  // 0. Auto-expire messages older than 12 hours
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  await supabase
    .from('messages')
    .update({ status: 'EXPIRED' })
    .eq('status', 'PENDING_PAYMENT')
    .lt('created_at', twelveHoursAgo)

  // Fetch unpaid messages capped at 100
  const { data: unpaidMessages } = await supabase
    .from('messages')
    .select('id, content, bid_amount, created_at, category:categories(name, slug)')
    .eq('status', 'PENDING_PAYMENT')
    .order('created_at', { ascending: false })
    .limit(100)

  // Server-side masking: NEVER forward full `content` to the client.
  // Only teaser + length + masked placeholder are exposed — full text unlocks after payment.
  const maskedMessages = (unpaidMessages || []).map(msg =>
    toLockedSponsoredCard({
      id: msg.id,
      content: msg.content || '',
      bid_amount: msg.bid_amount,
      created_at: msg.created_at,
      category: msg.category,
    })
  )

  return (
    <div className="min-h-screen bg-background text-primary p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/" className="inline-flex items-center text-secondary hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to World
          </Link>
          <h1 className="text-4xl font-serif">The Waiting Room</h1>
          <p className="text-secondary mt-2">These messages are waiting to be heard. Pay their fee to broadcast them worldwide.</p>
        </div>
        
        <div className="flex items-center gap-2 self-start md:self-auto px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-mono text-blue-700 dark:text-blue-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span>Waiting List: {maskedMessages.length} / 100 max</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {maskedMessages.map(msg => {
          const categoryName = (msg.category as any)?.name || 'Message'
          const categorySlug = (msg.category as any)?.slug || 'general'
          const { borderClass, bgClass, badgeClass } = getCategoryStyles(categorySlug)

          return (
            <div key={msg.id} className={`flex flex-col border ${borderClass} bg-background-elevated rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all min-h-[320px]`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm backdrop-blur-md ${badgeClass}`}>
                  {categoryName}
                </span>
                <div className="flex items-center gap-1 text-xs text-secondary bg-background px-2 py-1 rounded border border-primary/10">
                  <Clock size={12} />
                  <span>Waiting</span>
                </div>
              </div>

              {/* Locked teaser — full text reveals only after $1 sponsorship */}
              <div className="flex-1 my-4 max-h-48 overflow-y-auto overscroll-contain custom-scrollbar pr-2">
                <p className="text-xl font-serif leading-relaxed">
                  <span>{msg.teaser}</span>
                  <span className="opacity-30 blur-[4px] select-none text-secondary">{"█".repeat(Math.min(24, Math.max(0, msg.contentLength - msg.teaser.length)))}</span>
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-secondary">
                  <Lock size={11} />
                  <span>Locked preview ({msg.contentLength} chars) — sponsor for $1 to reveal the full message</span>
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-primary/10 flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm shrink-0 flex items-center gap-1.5">
                  <span className="text-secondary font-medium">Unpaid Bid:</span>
                  <span className="font-bold font-mono bg-blue-600 text-white dark:bg-blue-500 dark:text-black px-2.5 py-0.5 rounded-md shadow-sm text-xs">${msg.bid_amount}</span>
                </div>
                <Link href={`/checkout/${msg.id}?mode=sponsor`} className="shrink-0">
                  <button className="px-4 py-2 bg-primary text-background rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
                    Sponsor this Message
                  </button>
                </Link>
              </div>
            </div>
          )
        })}

        {maskedMessages.length === 0 && (
          <div className="col-span-full py-20 text-center text-secondary border border-dashed border-primary/20 rounded-3xl">
            <p>The waiting room is empty.</p>
          </div>
        )}
      </div>
    </div>
  )
}
