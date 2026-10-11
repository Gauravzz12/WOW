import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock, X } from 'lucide-react'
import { CommentSection } from './CommentSection'
import { ReactionBar } from './ReactionBar'
import { MessageViewTracker } from './MessageViewTracker'
import { SponsorShoutoutEditor } from './SponsorShoutoutEditor'
import {
  sponsorTokenCookieName,
  verifySponsorEditToken,
} from '@/lib/sponsorToken'
import { ShareMenu } from '@/components/ShareMenu'
import { getCategoryStyles, resolveCardStyles } from '@/lib/utils/colors'
import { getSponsoredTeaser } from '@/lib/masking'
import { FullscreenMessage } from '@/components/MessageFullscreen'
import { FrameDecorator } from '@/components/FrameDecorator'
import { getFrameClass } from '@/lib/constants/frames'
import { BumpBidButton } from './BumpBidButton'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: message } = await supabase
    .from('messages')
    .select('content, status, category:categories(name)')
    .eq('id', params.id)
    .single()

  if (!message) return { title: 'Not Found' }

  // Paywall: PENDING_PAYMENT rows are invisible to anon RLS (null here).
  // Even if visible, never put full unpaid content in metadata/crawlers.
  if ((message as any).status === 'PENDING_PAYMENT') {
    return {
      title: 'Locked message — sponsor to reveal | Words.World',
      description: 'This community message is waiting for sponsorship. Pay $3 to broadcast it.',
    }
  }

  return {
    title: `"${message.content}" on Words.World`,
    description: `A ${(message.category as any)?.name || 'message'} broadcasted to the world.`,
  }
}

export default async function MessageMemoryPage({ params, searchParams }: { params: { id: string }, searchParams?: { [key: string]: string | string[] | undefined } }) {
  const supabase = createClient()
  const isJustSponsored = searchParams?.justSponsored === '1'
  const tokenFromUrl = typeof searchParams?.token === 'string' ? searchParams.token : undefined
  const tokenFromCookie = cookies().get(sponsorTokenCookieName(params.id))?.value
  const sponsorToken = tokenFromUrl || tokenFromCookie
  const isSponsorTokenValid = sponsorToken ? await verifySponsorEditToken(params.id, sponsorToken) : false

  // If token is valid and just sponsored, activate row so paywall does not block
  if (isSponsorTokenValid && isJustSponsored) {
    try {
      const admin = getSupabaseAdmin()
      await admin
        .from('messages')
        .update({
          status: 'ACTIVE',
          actual_start: new Date().toISOString(),
          is_reserved_slot: false,
        })
        .eq('id', params.id)
    } catch {}
  }

  let { data: message, error } = await supabase
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
      actual_end,
      style_config,
      category:categories(name, slug)
    `)
    .eq('id', params.id)
    .single()

  // If anon query failed or returned null (e.g. RLS on pending row), but user has valid sponsor token:
  if ((error || !message) && isSponsorTokenValid) {
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
          actual_end,
          style_config,
          category:categories(name, slug)
        `)
        .eq('id', params.id)
        .single()
      if (adminMsg) {
        message = adminMsg
        error = null
      }
    } catch {}
  }

  if (error || !message) {
    // Anon RLS hides PENDING_PAYMENT (returns no row). Check via admin to render
    // a locked paywall instead of leaking existence details, without exposing content.
    try {
      const admin = getSupabaseAdmin()
      const { data: locked } = await admin
        .from('messages')
        .select('id, status, is_reserved_slot, created_at, category:categories(name, slug)')
        .eq('id', params.id)
        .single()
      if (locked && (locked as any).status === 'PENDING_PAYMENT') {
        const catName = (locked.category as any)?.name || 'MESSAGE'
        // VIP/Special (reserved) can never be sponsored for $3 — owner completes own checkout.
        if ((locked as any).is_reserved_slot) {
          return (
            <div className="min-h-screen bg-background text-primary flex flex-col">
              <header className="p-6">
                <Link href="/" className="inline-flex items-center text-secondary hover:text-primary transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to World
                </Link>
              </header>
              <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-8">
                <div className="bg-background-elevated border border-primary/10 rounded-2xl p-8 md:p-12 text-center shadow-lg">
                  <div className="w-12 h-12 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center mx-auto mb-4 border border-violet-500/20">
                    <Lock size={20} />
                  </div>
                  <p className="text-xs uppercase tracking-widest text-secondary font-bold">{catName} • Special • Locked</p>
                  <h1 className="text-2xl font-serif mt-2">This special message is reserved</h1>
                  <p className="text-sm text-secondary mt-2">Special (VIP) messages cannot be sponsored — the owner completes payment to broadcast.</p>
                  <Link href={`/checkout/${locked.id}`} className="inline-block mt-6 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-full text-sm font-bold transition-colors">
                    Complete payment to broadcast
                  </Link>
                </div>
              </main>
            </div>
          )
        }
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
                <p className="text-sm text-secondary mt-2">Pay $3 to broadcast the full message worldwide. The preview stays locked until then.</p>
                <Link href={`/checkout/${locked.id}?mode=sponsor`} className="inline-block mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold transition-colors">
                  Sponsor for $3 to reveal
                </Link>
              </div>
            </main>
          </div>
        )
      }
    } catch {}
    notFound()
  }

  // Defense-in-depth: even if RLS is bypassed, never render unpaid content here.
  if ((message as any).status === 'PENDING_PAYMENT' && !isSponsorTokenValid) {
    // VIP/Special (reserved) can never be sponsored for $3.
    if ((message as any).is_reserved_slot) {
      return (
        <div className="min-h-screen bg-background text-primary flex flex-col">
          <header className="p-6">
            <Link href="/" className="inline-flex items-center text-secondary hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to World
            </Link>
          </header>
          <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-8">
            <div className="bg-background-elevated border border-primary/10 rounded-2xl p-8 md:p-12 text-center shadow-lg">
              <div className="w-12 h-12 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center mx-auto mb-4 border border-violet-500/20">
                <Lock size={20} />
              </div>
              <p className="text-xs uppercase tracking-widest text-secondary font-bold">{(message.category as any)?.name || 'MESSAGE'} • Special • Locked</p>
              <h1 className="text-2xl font-serif mt-2">This special message is reserved</h1>
              <p className="text-sm text-secondary mt-2">Special (VIP) messages cannot be sponsored — the owner completes payment to broadcast.</p>
              <Link href={`/checkout/${(message as any).id}`} className="inline-block mt-6 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-full text-sm font-bold transition-colors">
                Complete payment to broadcast
              </Link>
            </div>
          </main>
        </div>
      )
    }
    const { teaser } = getSponsoredTeaser((message as any).content || '')
    const categoryNameLocked = (message.category as any)?.name || 'MESSAGE'
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
            <p className="text-xs uppercase tracking-widest text-secondary font-bold">{categoryNameLocked} • Locked preview</p>
            <p className="font-serif italic text-lg mt-3">&ldquo;{teaser}&hellip;&rdquo;</p>
            <p className="text-sm text-secondary mt-2">Full message reveals after sponsorship.</p>
            <Link href={`/checkout/${(message as any).id}?mode=sponsor`} className="inline-block mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-sm font-bold transition-colors">
              Sponsor for $3 to reveal
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const categoryName = (message.category as any)?.name || 'MESSAGE'
  const categorySlug = (message.category as any)?.slug || 'general'
  const shareText = `"${message.content}"\n\n${categoryName} on Words of the World`
  const shareUrl = `https://words.world/w/${message.id}`

  // Shoutout editor is sponsor-only: verified via the edit token issued at
  // sponsorship time.
  const canEditShoutout =
    !(message as any).is_reserved_slot &&
    ((message as any).bid_amount ?? 0) < 10 &&
    isSponsorTokenValid
  
  let currentRank: number | null = null;
  if (message.status === 'QUEUED' && !(message as any).is_reserved_slot) {
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'QUEUED')
      .eq('is_reserved_slot', false)
      .gte('bid_amount', (message as any).bid_amount);
    if (count !== null) currentRank = count;
  }
  const { borderClass: borderColor, accentClass: catTextColor, badgeClass } = getCategoryStyles(categorySlug)
  const { 
    bg, 
    textColor, 
    cardBorder, 
    isVip, 
    isDarkCard, 
    inlineColor, 
    sponsorStyle, 
    sponsorLabelStyle, 
    sponsorNameStyle, 
    sponsorNoteStyle 
  } = resolveCardStyles(message.style_config, message.template_id)

  const contentLength = message.content?.length || 0
  const textSizeClass =
    contentLength > 200
      ? 'text-lg sm:text-xl md:text-2xl'
      : contentLength > 90
      ? 'text-xl sm:text-2xl md:text-3xl'
      : 'text-2xl sm:text-3xl md:text-4xl'

  let fontStyle = message.style_config?.font || 'font-serif italic'
  if (contentLength > 80 && fontStyle.includes('tracking-[')) {
    fontStyle = fontStyle.replace(/tracking-\[[^\]]+\]/, 'tracking-wide')
  }

  return (
    <div className="min-h-screen bg-background text-primary flex flex-col">
      <MessageViewTracker messageId={message.id} categoryName={(message.category as any)?.name} />
      <header className="p-4 md:p-6 max-w-3xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-background-elevated border border-primary/10 hover:border-primary/30 text-secondary hover:text-primary transition-colors text-sm font-medium shadow-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to World</span>
        </Link>
        <Link href="/" aria-label="Close message view" className="p-2 rounded-full bg-background-elevated border border-primary/10 hover:border-primary/30 text-secondary hover:text-primary transition-colors shadow-sm">
          <X className="w-4 h-4" />
        </Link>
      </header>
      
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-6 space-y-8">
        
        {/* Message Presentation */}
        <div className={`${bg || 'bg-background-elevated'} border ${cardBorder || message.style_config?.cardBorder || borderColor} rounded-3xl p-6 sm:p-10 md:p-12 text-center shadow-md relative overflow-hidden transition-colors ${getFrameClass(message.style_config?.frameId)}`}>
          <FrameDecorator frameId={message.style_config?.frameId} />

          {message.status === 'ACTIVE' && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-600 text-[11px] font-bold uppercase tracking-wider rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Now
            </div>
          )}
          
          <div className="flex flex-col items-center gap-2 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border shadow-sm backdrop-blur-md ${isVip ? 'bg-amber-400/20 border-amber-400/40 text-amber-300' : badgeClass}`}>
              {categoryName}
            </span>

            {message.style_config?.vipBadge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-amber-400/20 border border-amber-400/40 text-amber-300 shadow-md">
                <span>{message.style_config.vipIcon || '✦'}</span>
                <span>{message.style_config.vipBadge}</span>
              </span>
            )}
          </div>
          
          <h1 className={`${textSizeClass} ${fontStyle} leading-relaxed mb-6 ${textColor}`} style={{ color: inlineColor }}>
            &quot;{message.content}&quot;
          </h1>

          {/* Brand Showcase Link if present */}
          {message.style_config?.brandUrl && (
            <div className="mb-6">
              <a 
                href={message.style_config.brandUrl.startsWith('http') ? message.style_config.brandUrl : `https://${message.style_config.brandUrl}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-700 dark:text-cyan-300 text-sm font-semibold shadow-sm transition-all hover:scale-105"
              >
                <span>{message.style_config.brandName || 'Open Link'}</span>
                <span>↗</span>
              </a>
            </div>
          )}

          {/* Sponsor Attribution */}
          {(message.style_config?.sponsorName || message.style_config?.sponsorNote) && (
            <div className={`mb-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-2 rounded-2xl border text-xs shadow-sm backdrop-blur-md max-w-xl mx-auto text-center ${sponsorStyle}`}>
              <span className="text-amber-500 shrink-0">✨</span>
              <span className={`${sponsorLabelStyle} text-[10px] uppercase font-bold tracking-wider shrink-0`}>Sponsored by</span>
              <span className={`font-semibold shrink-0 ${sponsorNameStyle}`}>{message.style_config.sponsorName || 'Community'}</span>
              {message.style_config.sponsorNote && (
                <span className={`${sponsorNoteStyle} italic break-words`}>&mdash; &ldquo;{message.style_config.sponsorNote}&rdquo;</span>
              )}
            </div>
          )}

          {/* Post-pay shoutout: sponsor-only editor (token-gated), writes dedication after full reveal */}
          {canEditShoutout && (
            <div className="mb-6 max-w-xl mx-auto text-left">
              <SponsorShoutoutEditor
                messageId={(message as any).id}
                initialName={(message as any).style_config?.sponsorName || ''}
                initialNote={(message as any).style_config?.sponsorNote || ''}
                justSponsored={isJustSponsored}
                messageContent={message.content || ''}
                token={sponsorToken || undefined}
              />
            </div>
          )}

          {currentRank !== null && (
            <div className="mb-6 max-w-xl mx-auto text-left">
              <BumpBidButton messageId={message.id} currentBid={(message as any).bid_amount} />
            </div>
          )}
          
          <div className="text-sm text-secondary flex flex-col items-center gap-5">
            <div>
              {message.actual_start ? (
                <p suppressHydrationWarning>Broadcasted on {new Date(message.actual_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</p>
              ) : (
                <p>Status: {message.status}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <ShareMenu url={shareUrl} text={shareText} isVip={isVip} isDark={isDarkCard} />
              <FullscreenMessage
                message={{
                  content: message.content || '',
                  html: undefined,
                  font: (message as any).style_config?.font,
                  categoryName,
                  brandName: (message as any).style_config?.brandName,
                  brandUrl: (message as any).style_config?.brandUrl,
                  sponsorName: (message as any).style_config?.sponsorName,
                  sponsorNote: (message as any).style_config?.sponsorNote,
                  stickers: undefined,
                  frameId: (message as any).style_config?.frameId,
                }}
                appearance={{
                  bg: bg || 'bg-background-elevated',
                  textColor,
                  cardBorder: cardBorder || (message as any).style_config?.cardBorder || borderColor,
                  inlineColor,
                  isDarkCard,
                  widthClass: 'max-w-3xl',
                  aspectClass: '',
                  paddingClass: 'p-6 sm:p-10 md:p-12',
                  bodyClassName: 'relative z-10 flex-1 min-h-0 w-full overflow-y-auto overscroll-contain custom-scrollbar px-2 py-4 my-2 flex flex-col',
                  bodyInnerClassName: 'my-auto w-full',
                  htmlTextClass: undefined,
                  plainTextClass: `text-center leading-relaxed ${textSizeClass} ${fontStyle} ${textColor}`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Interaction Zone */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pt-2">
          {/* Reactions */}
          <div className="md:col-span-5 space-y-4">
            <h2 className="text-lg font-serif">Reactions</h2>
            <ReactionBar messageId={message.id} />
          </div>

          {/* Comments */}
          <div className="md:col-span-7 space-y-4">
            <h2 className="text-lg font-serif">Comments</h2>
            <CommentSection messageId={message.id} />
          </div>
        </div>

      </main>
    </div>
  )
}
