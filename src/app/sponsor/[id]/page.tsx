import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, PartyPopper, Radio } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { sponsorTokenCookieName, verifySponsorEditToken } from '@/lib/sponsorToken'
import { getCategoryStyles, resolveCardStyles } from '@/lib/utils/colors'
import { FrameDecorator } from '@/components/FrameDecorator'
import { getFrameClass } from '@/lib/constants/frames'
import { SponsorShoutoutForm } from './SponsorShoutoutForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function generateMetadata({ params }: { params: { id: string } }) {
  return {
    title: 'Sponsor shoutout | Words.World',
    description: 'You sponsored a community voice — add your shoutout to the worldwide broadcast.',
  }
}

export default async function SponsorShoutoutPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const messageId = params.id
  const tokenFromUrl = typeof searchParams?.token === 'string' ? searchParams.token : undefined
  const tokenFromCookie = cookies().get(sponsorTokenCookieName(messageId))?.value
  const sponsorToken = tokenFromUrl || tokenFromCookie
  const isSponsorTokenValid = sponsorToken ? await verifySponsorEditToken(messageId, sponsorToken) : false

  // Activate PENDING_PAYMENT rows for verified sponsors so the reveal never blocks
  // on webhook timing (same guarantee as the legacy ?justSponsored landing).
  if (isSponsorTokenValid) {
    try {
      const admin = getSupabaseAdmin()
      await admin
        .from('messages')
        .update({
          status: 'ACTIVE',
          actual_start: new Date().toISOString(),
          is_reserved_slot: false,
        })
        .eq('id', messageId)
        .eq('status', 'PENDING_PAYMENT')
    } catch {}
  }

  // Persist a URL-passed token into the httpOnly cookie so later edits from
  // /w/[id] keep working without the query param.
  if (tokenFromUrl && isSponsorTokenValid) {
    try {
      cookies().set(sponsorTokenCookieName(messageId), tokenFromUrl, {
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    } catch {}
  }

  const supabase = createClient()
  let { data: message } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      template_id,
      status,
      bid_amount,
      is_reserved_slot,
      created_at,
      actual_start,
      style_config,
      category:categories(name, slug)
    `)
    .eq('id', messageId)
    .single()

  // Anon RLS hides PENDING_PAYMENT rows — verified sponsors read via admin.
  if (!message && isSponsorTokenValid) {
    try {
      const admin = getSupabaseAdmin()
      const { data: adminMsg } = await admin
        .from('messages')
        .select(`
          id,
          content,
          template_id,
          status,
          bid_amount,
          is_reserved_slot,
          created_at,
          actual_start,
          style_config,
          category:categories(name, slug)
        `)
        .eq('id', messageId)
        .single()
      if (adminMsg) message = adminMsg as any
    } catch {}
  }

  if (!message) {
    // Check via admin whether this is a locked unpaid message (paywall, no leak).
    try {
      const admin = getSupabaseAdmin()
      const { data: locked } = await admin
        .from('messages')
        .select('id, status, is_reserved_slot, category:categories(name)')
        .eq('id', messageId)
        .single()
      if (locked && (locked as any).status === 'PENDING_PAYMENT') {
        const catName = (locked.category as any)?.name || 'MESSAGE'
        return (
          <div className="min-h-screen bg-background text-primary flex flex-col">
            <header className="p-6">
              <Link href="/waiting-room" className="inline-flex items-center text-secondary hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Waiting Room
              </Link>
            </header>
            <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-8">
              <div className="bg-background-elevated border border-primary/10 rounded-2xl p-8 md:p-12 text-center shadow-lg">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                  <Lock size={20} />
                </div>
                <p className="text-xs uppercase tracking-widest text-secondary font-bold">{catName} • Locked</p>
                <h1 className="text-2xl font-serif mt-2">This message is waiting for sponsorship</h1>
                <p className="text-sm text-secondary mt-2">Pay $3 to unlock the shoutout screen and broadcast the full message worldwide.</p>
                <Link href={`/checkout/${(locked as any).id}?mode=sponsor`} className="inline-block mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold transition-colors">
                  Sponsor for $3 to continue
                </Link>
              </div>
            </main>
          </div>
        )
      }
    } catch {}
    notFound()
  }

  // VIP / non-sponsored rows have no shoutout screen.
  if ((message as any).is_reserved_slot || ((message as any).bid_amount ?? 0) >= 10) {
    redirect(`/w/${messageId}`)
  }

  // Still locked and no valid sponsor token → paywall.
  if ((message as any).status === 'PENDING_PAYMENT' && !isSponsorTokenValid) {
    const catName = (message.category as any)?.name || 'MESSAGE'
    return (
      <div className="min-h-screen bg-background text-primary flex flex-col">
        <header className="p-6">
          <Link href="/waiting-room" className="inline-flex items-center text-secondary hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Waiting Room
          </Link>
        </header>
        <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-8">
          <div className="bg-background-elevated border border-primary/10 rounded-2xl p-8 md:p-12 text-center shadow-lg">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
              <Lock size={20} />
            </div>
            <p className="text-xs uppercase tracking-widest text-secondary font-bold">{catName} • Locked</p>
            <h1 className="text-2xl font-serif mt-2">This message is waiting for sponsorship</h1>
            <p className="text-sm text-secondary mt-2">Pay $3 to unlock the shoutout screen and broadcast the full message worldwide.</p>
            <Link href={`/checkout/${(message as any).id}?mode=sponsor`} className="inline-block mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold transition-colors">
              Sponsor for $3 to continue
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const categoryName = (message.category as any)?.name || 'MESSAGE'
  const categorySlug = (message.category as any)?.slug || 'general'
  const { badgeClass } = getCategoryStyles(categorySlug)
  const {
    bg,
    textColor,
    cardBorder,
    inlineColor,
    sponsorStyle,
    sponsorLabelStyle,
    sponsorNameStyle,
    sponsorNoteStyle,
  } = resolveCardStyles((message as any).style_config, (message as any).template_id)

  const contentLength = (message as any).content?.length || 0
  const textSizeClass =
    contentLength > 200
      ? 'text-lg sm:text-xl md:text-2xl'
      : contentLength > 90
      ? 'text-xl sm:text-2xl md:text-3xl'
      : 'text-2xl sm:text-3xl md:text-4xl'

  let fontStyle = (message as any).style_config?.font || 'font-serif italic'
  if (contentLength > 80 && fontStyle.includes('tracking-[')) {
    fontStyle = fontStyle.replace(/tracking-\[[^\]]+\]/, 'tracking-wide')
  }

  return (
    <div className="min-h-screen bg-background text-primary flex flex-col">
      <header className="p-4 md:p-6 max-w-3xl w-full mx-auto flex items-center justify-between">
        <Link href="/?tab=SPONSORED" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-background-elevated border border-primary/10 hover:border-primary/30 text-secondary hover:text-primary transition-colors text-sm font-medium shadow-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>World</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Sponsorship confirmed
        </span>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 pb-16">
        {/* Celebration hero */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-14 h-14 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-sm">
            <PartyPopper size={26} />
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-secondary font-bold">
            Sponsor shoutout
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold leading-tight">
            You just broadcast a voice to the world
          </h1>
          <p className="text-sm text-secondary max-w-xl mx-auto leading-relaxed">
            The full message is now revealed below — live for 30 minutes. Add your name and
            dedication to appear alongside it.
          </p>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-mono text-secondary bg-background-elevated border border-primary/10 rounded-full px-3 py-1">
            <Radio size={12} />
            Live now · 30 min broadcast
          </p>
        </div>

        {/* Revealed message card */}
        <div className={`${bg || 'bg-background-elevated'} border ${cardBorder || (message as any).style_config?.cardBorder || 'border-primary/10'} rounded-3xl p-6 sm:p-10 md:p-12 text-center shadow-md relative overflow-hidden transition-colors ${getFrameClass((message as any).style_config?.frameId)}`}>
          <FrameDecorator frameId={(message as any).style_config?.frameId} />
          <div className="flex flex-col items-center gap-2 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border shadow-sm backdrop-blur-md ${badgeClass}`}>
              {categoryName}
            </span>
          </div>

          <h2 className={`${textSizeClass} ${fontStyle} leading-relaxed mb-6 ${textColor}`} style={{ color: inlineColor }}>
            &quot;{(message as any).content}&quot;
          </h2>

          {((message as any).style_config?.brandUrl) && (
            <div className="mb-6">
              <a
                href={((message as any).style_config.brandUrl as string).startsWith('http') ? (message as any).style_config.brandUrl : `https://${(message as any).style_config.brandUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-700 dark:text-cyan-300 text-sm font-semibold shadow-sm transition-all hover:scale-105"
              >
                <span>{(message as any).style_config.brandName || 'Open Link'}</span>
                <span>↗</span>
              </a>
            </div>
          )}

          {((message as any).style_config?.sponsorName || (message as any).style_config?.sponsorNote) && (
            <div className={`mb-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 rounded-2xl border text-xs shadow-sm backdrop-blur-md max-w-xl mx-auto text-center ${sponsorStyle}`}>
              <span className="text-amber-500 shrink-0">✨</span>
              <span className={`${sponsorLabelStyle} text-[10px] uppercase font-bold tracking-wider shrink-0`}>Sponsored by</span>
              <span className={`font-semibold shrink-0 ${sponsorNameStyle}`}>{(message as any).style_config.sponsorName || 'Community'}</span>
              {(message as any).style_config.sponsorNote && (
                <span className={`${sponsorNoteStyle} italic break-words`}>&mdash; &ldquo;{(message as any).style_config.sponsorNote}&rdquo;</span>
              )}
            </div>
          )}
        </div>

        {/* Shoutout form (dedicated screen — no modal) */}
        {isSponsorTokenValid ? (
          <SponsorShoutoutForm
            messageId={(message as any).id}
            initialName={(message as any).style_config?.sponsorName || ''}
            initialNote={(message as any).style_config?.sponsorNote || ''}
            token={sponsorToken || undefined}
          />
        ) : (
          <div className="bg-background-elevated border border-primary/10 rounded-3xl p-6 md:p-8 text-center shadow-lg space-y-3">
            <h2 className="text-lg font-serif font-bold">Shoutout editing needs your sponsor link</h2>
            <p className="text-sm text-secondary">
              The message is live, but this browser isn&apos;t holding the sponsor edit token.
              Open the link from your checkout confirmation email — or view the live broadcast.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href={`/w/${(message as any).id}`} className="px-6 py-2.5 bg-background border border-primary/20 rounded-full text-sm font-bold hover:bg-background-muted transition-colors">
                View live broadcast
              </Link>
              <Link href="/?tab=SPONSORED" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-full text-sm font-bold transition-colors">
                Explore sponsored
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
