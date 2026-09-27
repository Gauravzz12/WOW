'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  Globe, 
  ArrowUpRight, 
  Check, 
  Share2, 
  Sun, 
  Moon, 
  Sparkles,
  Compass,
  PenTool,
  Maximize2,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react'
import { 
  FIXED_3H_SLOT_DEFINITIONS, 
  SPECIAL_SLOT_PRICE, 
  formatLocalSlotTime 
} from '@/lib/constants/pricing'
import { resolveCardStyles } from '@/lib/utils/colors'
import { InlineInteractions } from './InlineInteractions'

export interface VipSpecialViewProps {
  activeSpecialMsg: any | null
  upcomingVipQueue: any[]
}

// A booking matches a slot card only when it falls inside that card's exact
// UTC day window — hour-only matching wrongly blocked the same slot number on
// all 15 browsable days.
function isBookedOnDay(
  queue: any[],
  def: { startHour: number; endHour: number },
  day: Date
): boolean {
  const windowStart = Date.UTC(
    day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), def.startHour, 0, 0, 0
  )
  const windowEnd = Date.UTC(
    day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), def.endHour, 0, 0, 0
  )
  return queue.some(item => {
    if (!item.scheduled_start) return false
    const t = new Date(item.scheduled_start).getTime()
    return t >= windowStart && t < windowEnd
  })
}

// Simple, marketing-friendly labels for each 3-hour slot
const QUADRANT_METADATA = [
  {
    slot: 1,
    title: 'Late night → early morning',
    cities: 'Auckland · Honolulu · Fiji',
    region: 'Pacific',
    hemisphere: 'Quiet hours — great for surprises',
    night: false
  },
  {
    slot: 2,
    title: 'Morning in Asia & Australia',
    cities: 'Tokyo · Seoul · Sydney',
    region: 'East Asia & Australia',
    hemisphere: 'Morning crowd online',
    night: false
  },
  {
    slot: 3,
    title: 'Midday in Asia & India',
    cities: 'Beijing · Singapore · Mumbai',
    region: 'South & Southeast Asia',
    hemisphere: 'Lunch-time crowd',
    night: false
  },
  {
    slot: 4,
    title: 'Midday in Europe & Africa',
    cities: 'London · Paris · Dubai · Nairobi',
    region: 'Europe, Middle East & Africa',
    hemisphere: 'Peak daytime views',
    night: false
  },
  {
    slot: 5,
    title: 'Morning in Atlantic & Africa',
    cities: 'Dakar · Reykjavik · Azores',
    region: 'Atlantic & West Africa',
    hemisphere: 'Morning in the west',
    night: false
  },
  {
    slot: 6,
    title: 'Daytime in the Americas',
    cities: 'New York · São Paulo · Toronto',
    region: 'Eastern Americas',
    hemisphere: 'Prime daytime in US & Brazil',
    night: false
  },
  {
    slot: 7,
    title: 'Evening in the Americas',
    cities: 'Los Angeles · Mexico City · Lima',
    region: 'Western Americas',
    hemisphere: 'Evening — perfect for love & birthdays',
    night: false
  },
  {
    slot: 8,
    title: 'Night time worldwide',
    cities: 'Hawaii · Alaska · Tahiti',
    region: 'Pacific Night',
    hemisphere: 'Late-night spotlight',
    night: true
  }
]

export function VipSpecialView({ activeSpecialMsg, upcomingVipQueue = [] }: VipSpecialViewProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [utcTime, setUtcTime] = useState<string>('')
  const [currentUtcHour, setCurrentUtcHour] = useState<number>(0)
  const [currentUtcMinute, setCurrentUtcMinute] = useState<number>(0)
  const [currentUtcSecond, setCurrentUtcSecond] = useState<number>(0)
  const [selectedSlotNumber, setSelectedSlotNumber] = useState<number>(1)
  const [userTz, setUserTz] = useState<string>('Local Time')
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [activeTabMode, setActiveTabMode] = useState<'ASTROLABE' | 'TIMELINE'>('ASTROLABE')
  // Fires the expiry advance exactly once per active message (not every 1s tick).
  const advanceFiredForRef = useRef<string | null>(null)

  // Interactive preview state
  const [simulatorOpen, setSimulatorOpen] = useState(false)
  const [testQuote, setTestQuote] = useState<string>(
    '“For 3 hours, this page is all yours. Make it count.”'
  )
  const [testAuthor, setTestAuthor] = useState<string>('Your name')
  const [testFont, setTestFont] = useState<'font-serif' | 'font-sans' | 'font-mono'>('font-serif')

  useEffect(() => {
    setIsMounted(true)
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      setUserTz(tz.replace(/_/g, ' '))
    } catch {}

    const updateClock = () => {
      const now = new Date()
      const h = now.getUTCHours()
      const m = now.getUTCMinutes()
      const s = now.getUTCSeconds()
      
      setCurrentUtcHour(h)
      setCurrentUtcMinute(m)
      setCurrentUtcSecond(s)
      setUtcTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} UTC`)

      if (activeSpecialMsg) {
        let endMs: number
        if (activeSpecialMsg.scheduled_end) {
          endMs = new Date(activeSpecialMsg.scheduled_end).getTime()
        } else if (activeSpecialMsg.actual_start) {
          const durationSecs = activeSpecialMsg.durationSecs || 10800
          endMs = new Date(activeSpecialMsg.actual_start).getTime() + durationSecs * 1000
        } else {
          endMs = Date.now()
        }
        const rem = Math.max(0, Math.floor((endMs - Date.now()) / 1000))
        setTimeLeft(rem)
        if (rem === 0) {
          const msgId = activeSpecialMsg.id || 'unknown'
          if (advanceFiredForRef.current !== msgId) {
            advanceFiredForRef.current = msgId
            fetch('/api/queue/advance', { method: 'POST' }).catch(() => {})
          }
        }
      } else {
        // Calculate remaining seconds in current 3-hour sector
        const now = new Date()
        const currentHour = now.getUTCHours()
        const currentSectorEndHour = Math.floor(currentHour / 3) * 3 + 3
        const sectorEnd = new Date(Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          currentSectorEndHour,
          0,
          0
        ))
        const rem = Math.max(0, Math.floor((sectorEnd.getTime() - now.getTime()) / 1000))
        setTimeLeft(rem)
      }
    }

    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [activeSpecialMsg])

  // Current active slot definition based on live UTC hour
  const currentLiveSlotDef = useMemo(() => {
    return FIXED_3H_SLOT_DEFINITIONS.find(
      s => currentUtcHour >= s.startHour && currentUtcHour < s.endHour
    ) || FIXED_3H_SLOT_DEFINITIONS[0]
  }, [currentUtcHour])

  // Set default selected slot to current live sector on initial load
  useEffect(() => {
    if (currentLiveSlotDef) {
      setSelectedSlotNumber(currentLiveSlotDef.slotNumber)
    }
  }, [currentLiveSlotDef])

  const selectedSlotDef = useMemo(() => {
    return FIXED_3H_SLOT_DEFINITIONS.find(s => s.slotNumber === selectedSlotNumber) || currentLiveSlotDef
  }, [selectedSlotNumber, currentLiveSlotDef])

  const selectedQuadrantMeta = useMemo(() => {
    return QUADRANT_METADATA.find(q => q.slot === selectedSlotNumber) || QUADRANT_METADATA[0]
  }, [selectedSlotNumber])

  const selectedSlotBookedItem = useMemo(() => {
    const today = new Date()
    return upcomingVipQueue.find(item => {
      if (!item.scheduled_start) return false
      const t = new Date(item.scheduled_start).getTime()
      const windowStart = Date.UTC(
        today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(),
        selectedSlotDef.startHour, 0, 0, 0
      )
      const windowEnd = Date.UTC(
        today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(),
        selectedSlotDef.endHour, 0, 0, 0
      )
      return t >= windowStart && t < windowEnd
    })
  }, [upcomingVipQueue, selectedSlotDef])

  const formatCountdown = (secs: number | null) => {
    if (secs === null) return '--:--:--'
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/?tab=SPECIAL`)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  // Trigonometric coordinate calculator for the Astrolabe SVG
  const getCoordinatesForSector = useCallback((index: number, radius: number) => {
    // 8 sectors: index 0 to 7 -> 45 deg each.
    // Starts at -90 deg (12 o'clock UTC 00:00)
    const angleDeg = -90 + index * 45 + 22.5
    const angleRad = (angleDeg * Math.PI) / 180
    return {
      x: 200 + radius * Math.cos(angleRad),
      y: 200 + radius * Math.sin(angleRad),
      angleDeg
    }
  }, [])

  // Precise pointer angle for current UTC minute (00:00 to 24:00)
  const currentHandAngle = useMemo(() => {
    const totalMinutes = currentUtcHour * 60 + currentUtcMinute
    return -90 + (totalMinutes / 1440) * 360
  }, [currentUtcHour, currentUtcMinute])

  const msgCategoryName = activeSpecialMsg?.category?.name || 'Special message'
  const { bg: msgBg, textColor, cardBorder: msgBorder, isDarkCard, inlineColor } = resolveCardStyles(
    activeSpecialMsg?.style_config,
    activeSpecialMsg?.template_id
  )

  return (
    <div className="w-full flex flex-col items-center max-w-5xl mx-auto px-4 sm:px-6 space-y-16 py-6 font-sans relative">
      {/* Special ambience — soft violet + gold glow, distinct from Normal's neutral feed */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[36rem] h-[16rem] rounded-full bg-violet-500/[0.10] dark:bg-violet-500/[0.14] blur-3xl" />
        <div className="absolute top-40 -left-24 w-72 h-72 rounded-full bg-fuchsia-500/[0.07] dark:bg-fuchsia-500/[0.10] blur-3xl" />
        <div className="absolute top-40 -right-24 w-72 h-72 rounded-full bg-amber-400/[0.07] dark:bg-amber-400/[0.10] blur-3xl" />
      </div>

      {/* ── 1. HEADER ───────────────────── */}
      <header className="w-full text-center space-y-4">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center justify-center gap-2.5 px-4 py-1 border border-violet-500/30 rounded-full font-mono text-[11px] tracking-[0.2em] uppercase text-secondary bg-violet-500/[0.08]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
          <span>Special spotlight &middot; <span className="text-amber-600 dark:text-amber-300 font-semibold">$30 for 3 hours</span></span>
          <span className="text-secondary/40">/</span>
          <span suppressHydrationWarning className="text-primary font-semibold">
            {isMounted && utcTime ? utcTime : 'Universal Time'}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-light text-primary tracking-tight leading-[1.08] max-w-3xl mx-auto">
          Your words.{' '}
          <span className="text-violet-700 dark:text-violet-300 underline decoration-amber-400 decoration-[3px] underline-offset-[6px]">
            Center stage
          </span>{' '}
          for 3 hours.
        </h1>

        <p className="text-secondary text-sm md:text-base max-w-xl mx-auto font-serif italic leading-relaxed">
          Pick your exact time. No bidding. No one can bump you off.
        </p>

        {/* Live status badges */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
          <div suppressHydrationWarning className="px-3 py-1 border border-violet-500/30 rounded bg-violet-500/[0.07] text-secondary flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span suppressHydrationWarning className="text-primary font-bold">
              {isMounted ? `LIVE NOW · SLOT #${currentLiveSlotDef.slotNumber}` : 'LIVE NOW'}
            </span>
            <span className="text-secondary/40">|</span>
            <span suppressHydrationWarning>
              {isMounted ? currentLiveSlotDef.label : 'UTC clock'}
            </span>
          </div>

          <div suppressHydrationWarning className="px-3 py-1 border border-amber-400/30 rounded bg-amber-400/[0.08] text-secondary flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
            <span>Ends in:</span>
            <span suppressHydrationWarning className="font-bold text-primary">
              {isMounted ? formatCountdown(timeLeft) : '--:--:--'}
            </span>
          </div>

          <div suppressHydrationWarning className="px-3 py-1 border border-primary/15 rounded bg-background text-secondary flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-secondary" />
            <span>Your time:</span>
            <span suppressHydrationWarning className="text-primary font-medium">
              {isMounted ? userTz : 'Local Time'}
            </span>
          </div>
        </div>
      </header>

      {/* ── 2. THE MONUMENTAL EXHIBITION MONOLITH ───────────────────────── */}
      <section className="w-full flex flex-col items-center">
        {activeSpecialMsg ? (
          /* ACTIVE ARCHIVAL MONOGRAPH */
          <motion.article
            key={activeSpecialMsg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`w-full ${msgBg} border ${msgBorder || 'border-violet-500/30'} ring-1 ring-violet-500/20 rounded-2xl px-6 py-7 sm:px-10 sm:py-10 md:px-14 md:py-12 shadow-sm text-primary relative overflow-hidden flex flex-col justify-between`}
          >
            {/* Solid gold hairline on top — premium marker, no gradient */}
            <span aria-hidden="true" className="absolute top-0 left-10 right-10 h-[2px] bg-amber-400" />

            {/* Top header */}
            <div className={`flex flex-wrap items-center justify-between gap-3 pb-5 border-b text-xs font-mono ${isDarkCard ? 'border-white/15 text-white/60' : 'border-violet-500/15 text-secondary'}`}>
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] px-2.5 py-1 rounded bg-violet-700 dark:bg-violet-600 text-white border border-violet-700 dark:border-violet-500">
                  ✦ {msgCategoryName}
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className={isDarkCard ? 'text-white' : 'text-primary'}>LIVE NOW</span>
                </span>
                <span className={isDarkCard ? 'text-white/40' : 'text-secondary/50'}>· #{activeSpecialMsg.id.slice(0, 8)}</span>
              </div>

              <div suppressHydrationWarning className={`flex items-center gap-2 px-3 py-1 rounded border ${isDarkCard ? 'bg-white/10 border-white/20 text-white' : 'bg-amber-400/[0.10] border-amber-400/30 text-primary'}`}>
                <Clock className={`w-3.5 h-3.5 ${isDarkCard ? 'text-amber-300' : 'text-amber-600 dark:text-amber-300'}`} />
                <span className={isDarkCard ? 'text-white/60' : 'text-secondary'}>Time left:</span>
                <span suppressHydrationWarning className="font-bold font-mono tracking-wider">
                  {isMounted ? formatCountdown(timeLeft) : '--:--:--'}
                </span>
              </div>
            </div>

            {/* Stickers as backdrop décor — always behind text so they never cover words */}
            {Array.isArray(activeSpecialMsg?.style_config?.stickers) && activeSpecialMsg.style_config.stickers.map((sticker: any) => (
              <span
                key={sticker.id}
                aria-hidden="true"
                className="absolute pointer-events-none select-none z-[1] leading-none opacity-90"
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  fontSize: `${Math.min(sticker.size || 2.5, 2.75)}em`,
                  transform: 'translate(-50%, -50%)',
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))',
                }}
              >
                {sticker.emoji}
              </span>
            ))}

            {/* Message — always above stickers, balanced lines, readable over décor */}
            <div className="relative z-10 my-10 sm:my-14 text-center max-w-2xl mx-auto px-2">
              {activeSpecialMsg.style_config?.html ? (
                <div 
                  className={`text-balance leading-[1.3] tracking-tight text-[1.65rem] sm:text-4xl md:text-[2.75rem] ${activeSpecialMsg.style_config?.font || 'font-serif'} ${textColor}`}
                  style={{
                    color: inlineColor,
                    textShadow: isDarkCard ? '0 2px 24px rgba(0,0,0,0.5)' : 'none',
                  }}
                  dangerouslySetInnerHTML={{ __html: activeSpecialMsg.style_config.html }}
                />
              ) : (
                <blockquote
                  className={`text-balance font-serif leading-[1.3] tracking-tight text-[1.65rem] sm:text-4xl md:text-[2.75rem] ${textColor}`}
                  style={{ textShadow: isDarkCard ? '0 2px 24px rgba(0,0,0,0.5)' : 'none' }}
                >
                  &ldquo;{activeSpecialMsg.content}&rdquo;
                </blockquote>
              )}
            </div>

            {/* Single footer: attribution left, copy-link right — one divider only */}
            <div className={`relative z-10 pt-5 border-t flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${isDarkCard ? 'border-white/15 text-white/60' : 'border-violet-500/15 text-secondary'}`}>
              <div className="flex flex-wrap items-center gap-2">
                <span>
                  By <strong className={`font-semibold ${isDarkCard ? 'text-white' : 'text-primary'}`}>{activeSpecialMsg.signature || 'Anonymous'}</strong>
                </span>

                {activeSpecialMsg.recipient && (
                  <>
                    <span className={isDarkCard ? 'text-white/40' : 'text-secondary/40'}>·</span>
                    <span>
                      For <strong className={`font-semibold ${isDarkCard ? 'text-white' : 'text-primary'}`}>{activeSpecialMsg.recipient}</strong>
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={handleCopyLink}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors ${isDarkCard ? 'border-white/25 text-white/85 hover:bg-white/10 hover:text-white' : 'border-primary/20 hover:bg-primary/10 text-primary'}`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link copied!' : 'Copy link'}</span>
              </button>
            </div>

            {/* Reactions row — no second divider, actions live here */}
            <div className="relative z-10 mt-4">
              <InlineInteractions 
                messageId={activeSpecialMsg.id} 
                categorySlug={activeSpecialMsg?.category?.slug || 'general'}
                isVip={true}
                isDark={isDarkCard}
              />
            </div>
          </motion.article>
        ) : (
          /* EMPTY SPOTLIGHT */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full bg-[#FAF8F5] dark:bg-[#0E0E10] border border-violet-500/30 rounded-2xl p-10 sm:p-14 md:p-18 text-center text-primary relative overflow-hidden flex flex-col items-center shadow-sm"
          >
            <span aria-hidden="true" className="absolute top-0 left-8 right-8 h-[2px] bg-amber-400" />
            {/* Corner marks */}
            <span className="absolute top-4 left-4 text-amber-500/50 font-mono text-sm select-none">⌜</span>
            <span className="absolute top-4 right-4 text-amber-500/50 font-mono text-sm select-none">⌝</span>
            <span className="absolute bottom-4 left-4 text-amber-500/50 font-mono text-sm select-none">⌞</span>
            <span className="absolute bottom-4 right-4 text-amber-500/50 font-mono text-sm select-none">⌟</span>

            {/* Stage Icon */}
            <div className="w-14 h-14 rounded-full border border-violet-500/30 bg-violet-500/10 flex items-center justify-center text-violet-700 dark:text-violet-300 mb-6">
              <Compass className="w-6 h-6 stroke-[1.5]" />
            </div>

            <div suppressHydrationWarning className="text-[11px] font-mono uppercase tracking-[0.25em] text-violet-600 dark:text-violet-300 mb-3">
              {isMounted ? `Slot #${currentLiveSlotDef.slotNumber} · Open now` : 'Open now'}
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-primary mb-4 max-w-lg leading-tight">
              This spotlight is empty.
            </h2>

            <p className="text-secondary text-sm md:text-base font-serif italic max-w-lg mx-auto mb-8 leading-relaxed text-secondary/85">
              Own the next 3 hours. Your message stays big and center-stage — no bidding wars, no interruptions.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/create?tier=special">
                <button className="px-8 py-4 rounded-xl bg-violet-700 dark:bg-violet-600 text-white font-medium text-xs sm:text-sm tracking-[0.15em] uppercase hover:bg-violet-600 dark:hover:bg-violet-500 active:scale-[0.98] transition-all shadow-sm flex items-center gap-3">
                  <span>Claim this slot — $30</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </Link>

              <button 
                onClick={() => setSimulatorOpen(prev => !prev)}
                className="px-6 py-4 rounded-xl border border-violet-500/30 bg-background-elevated hover:bg-violet-500/10 text-primary text-xs sm:text-sm font-medium tracking-wider uppercase transition-all flex items-center gap-2"
              >
                <PenTool className="w-4 h-4 text-violet-500" />
                <span>{simulatorOpen ? 'Hide preview' : 'Preview your message'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </section>

      {/* ── 3. TRY-IT-OUT PREVIEW ─────────────────── */}
      <AnimatePresence>
        {simulatorOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full overflow-hidden"
          >
            <div className="w-full bg-background-elevated border border-violet-500/25 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-violet-500/15 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono text-xs text-violet-600 dark:text-violet-300 font-semibold uppercase tracking-wider">
                    <PenTool className="w-3.5 h-3.5 text-amber-500" />
                    <span>✦ Try it out</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-serif font-medium text-primary">
                    See how your message will look live
                  </h3>
                </div>

                <button 
                  onClick={() => setSimulatorOpen(false)}
                  className="text-xs font-mono text-secondary hover:text-primary underline"
                >
                  Close
                </button>
              </div>

              {/* Live preview */}
              <div className="w-full bg-[#FAF8F5] dark:bg-[#0E0E10] border border-violet-500/25 rounded-xl p-8 sm:p-12 text-center text-primary relative">
                <span className="absolute top-2 left-3 font-mono text-[10px] text-secondary/50 uppercase tracking-widest">
                  Live preview
                </span>

                <div className={`my-4 sm:my-6 ${testFont} text-2xl sm:text-3xl md:text-4xl text-primary leading-relaxed max-w-2xl mx-auto break-words`}>
                  {testQuote || 'Your message will appear here...'}
                </div>

                <div className="pt-4 border-t border-violet-500/15 font-mono text-xs text-secondary flex items-center justify-center gap-2">
                  <span>By:</span>
                  <span className="font-semibold text-primary">{testAuthor || 'Anonymous'}</span>
                  <span>&middot;</span>
                  <span className="text-secondary/60">3 hours live</span>
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-secondary block font-semibold uppercase">
                    Your message
                  </label>
                  <textarea
                    rows={2}
                    value={testQuote}
                    onChange={(e) => setTestQuote(e.target.value)}
                    placeholder="Write a birthday wish, proposal, launch…"
                    className="w-full p-2.5 text-xs sm:text-sm bg-background border border-violet-500/25 rounded-lg focus:outline-none focus:border-violet-500 text-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-secondary block font-semibold uppercase">
                    Your name (optional)
                  </label>
                  <input
                    type="text"
                    value={testAuthor}
                    onChange={(e) => setTestAuthor(e.target.value)}
                    placeholder="e.g. Sam"
                    className="w-full p-2.5 text-xs sm:text-sm bg-background border border-violet-500/25 rounded-lg focus:outline-none focus:border-violet-500 text-primary"
                  />
                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => setTestFont('font-serif')}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono border ${testFont === 'font-serif' ? 'border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-200 font-bold' : 'border-primary/10 text-secondary'}`}
                    >
                      Serif
                    </button>
                    <button
                      onClick={() => setTestFont('font-sans')}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono border ${testFont === 'font-sans' ? 'border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-200 font-bold' : 'border-primary/10 text-secondary'}`}
                    >
                      Sans
                    </button>
                    <button
                      onClick={() => setTestFont('font-mono')}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono border ${testFont === 'font-mono' ? 'border-violet-500 bg-violet-500/15 text-violet-700 dark:text-violet-200 font-bold' : 'border-primary/10 text-secondary'}`}
                    >
                      Monospace
                    </button>
                  </div>
                </div>

                <div className="flex flex-col justify-end space-y-2">
                  <Link 
                    href={`/create?tier=special&prefill=${encodeURIComponent(testQuote)}`}
                    className="w-full"
                  >
                    <button className="w-full py-3 rounded-lg bg-violet-700 dark:bg-violet-600 text-white font-medium text-xs tracking-wider uppercase hover:bg-violet-600 dark:hover:bg-violet-500 transition-colors flex items-center justify-center gap-2 shadow-sm">
                      <span>Post this message — $30</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </Link>
                  <span className="text-[10px] font-mono text-secondary text-center block">
                    $30 · 3 hours · no bidding
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. PICK YOUR TIME ───────── */}
      <section className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-violet-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-violet-600 dark:text-violet-300 mb-1">
              <Globe className="w-4 h-4 text-amber-500" />
              <span>✦ Pick your time</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-medium text-primary">
              Choose your 3-hour slot
            </h2>
            <p className="text-xs text-secondary font-mono mt-1">
              Tap any slot to see your local time and availability.
            </p>
          </div>

          {/* View toggle: Globe vs List */}
          <div className="inline-flex p-1 rounded-lg border border-violet-500/25 bg-background-elevated text-xs font-mono">
            <button
              onClick={() => setActiveTabMode('ASTROLABE')}
              className={`px-3 py-1 rounded font-medium transition-colors ${activeTabMode === 'ASTROLABE' ? 'bg-violet-700 dark:bg-violet-600 text-white' : 'text-secondary hover:text-violet-600 dark:hover:text-violet-300'}`}
            >
              Globe
            </button>
            <button
              onClick={() => setActiveTabMode('TIMELINE')}
              className={`px-3 py-1 rounded font-medium transition-colors ${activeTabMode === 'TIMELINE' ? 'bg-violet-700 dark:bg-violet-600 text-white' : 'text-secondary hover:text-violet-600 dark:hover:text-violet-300'}`}
            >
              List
            </button>
          </div>
        </div>

        {activeTabMode === 'ASTROLABE' ? (
          /* ── SLOT GLOBE ── */
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-background-elevated border border-violet-500/25 rounded-2xl p-6 sm:p-10 shadow-sm">
            
            {/* Left: The Astrolabe Interactive SVG */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
              <div className="w-full max-w-[380px] aspect-square relative select-none">
                <svg
                  viewBox="0 0 400 400"
                  className="w-full h-full drop-shadow-sm"
                  aria-label="24-Hour Planetary Astrolabe"
                >
                  {/* Outer Astronomical Ring */}
                  <circle
                    cx="200"
                    cy="200"
                    r="185"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-primary/20"
                  />

                  {/* Inner Degree Rim */}
                  <circle
                    cx="200"
                    cy="200"
                    r="150"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.75"
                    strokeDasharray="2 3"
                    className="text-primary/30"
                  />

                  {/* Meridian Center Axis Lines */}
                  <line x1="200" y1="15" x2="200" y2="385" stroke="currentColor" strokeWidth="0.75" className="text-primary/15" />
                  <line x1="15" y1="200" x2="385" y2="200" stroke="currentColor" strokeWidth="0.75" className="text-primary/15" />
                  <line x1="69" y1="69" x2="331" y2="331" stroke="currentColor" strokeWidth="0.5" className="text-primary/10" />
                  <line x1="69" y1="331" x2="331" y2="69" stroke="currentColor" strokeWidth="0.5" className="text-primary/10" />

                  {/* 24-Hour Tick Marks */}
                  {Array.from({ length: 24 }).map((_, i) => {
                    const angle = -90 + (i * 360) / 24
                    const rad = (angle * Math.PI) / 180
                    const x1 = 200 + 175 * Math.cos(rad)
                    const y1 = 200 + 175 * Math.sin(rad)
                    const x2 = 200 + (i % 3 === 0 ? 162 : 170) * Math.cos(rad)
                    const y2 = 200 + (i % 3 === 0 ? 162 : 170) * Math.sin(rad)
                    return (
                      <line
                        key={`tick-${i}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="currentColor"
                        strokeWidth={i % 3 === 0 ? 1.5 : 0.75}
                        className={i % 3 === 0 ? 'text-primary' : 'text-primary/30'}
                      />
                    )
                  })}

                  {/* 8 Sector Nodes / Interactive Hotspots */}
                  {FIXED_3H_SLOT_DEFINITIONS.map((def, idx) => {
                    const { x, y } = getCoordinatesForSector(idx, 150)
                    const isSelected = selectedSlotNumber === def.slotNumber
                    const isLive = currentLiveSlotDef.slotNumber === def.slotNumber
                    
                    const booked = isBookedOnDay(upcomingVipQueue, def, new Date())

                    return (
                      <g
                        key={def.slotNumber}
                        onClick={() => setSelectedSlotNumber(def.slotNumber)}
                        className="cursor-pointer group"
                      >
                        {/* Interactive Sector Pulse / Ring */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? 19 : 14}
                          fill="currentColor"
                          className={`transition-all duration-200 ${
                            isLive 
                              ? 'text-violet-600 dark:text-violet-400' 
                              : isSelected 
                              ? 'text-violet-500' 
                              : booked 
                              ? 'text-secondary/60' 
                              : 'text-primary/10 group-hover:text-violet-500/40'
                          }`}
                        />
                        
                        {/* Outer Selection Border — gold ring */}
                        {isSelected && (
                          <circle
                            cx={x}
                            cy={y}
                            r={24}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-amber-400 animate-pulse"
                          />
                        )}

                        {/* Node Label */}
                        <text
                          x={x}
                          y={y + 4}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="monospace"
                          fill={isLive || isSelected ? '#ffffff' : 'currentColor'}
                          className={isLive || isSelected ? '' : 'text-primary'}
                        >
                          {def.slotNumber}
                        </text>
                      </g>
                    )
                  })}

                  {/* Center hub */}
                  <circle cx="200" cy="200" r="32" fill="currentColor" className="text-background" />
                  <circle cx="200" cy="200" r="32" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-violet-500/40" />
                  <circle cx="200" cy="200" r="6" fill="currentColor" className="text-amber-400" />

                  {/* UTC needle */}
                  <g transform={`rotate(${currentHandAngle} 200 200)`}>
                    <line
                      x1="200"
                      y1="200"
                      x2="200"
                      y2="30"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-violet-600 dark:text-violet-400"
                    />
                    <polygon
                      points="200,20 196,32 204,32"
                      fill="currentColor"
                      className="text-violet-600 dark:text-violet-400"
                    />
                    {/* Tip dot */}
                    <circle cx="200" cy="60" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-500" />
                    <circle cx="200" cy="60" r="1.5" fill="currentColor" className="text-amber-500" />
                  </g>
                </svg>

                {/* Subtext beneath dial */}
                <div className="text-center font-mono text-[10px] text-secondary tracking-widest mt-2 uppercase">
                  Needle shows current UTC time
                </div>
              </div>
            </div>

            {/* Right: Slot details panel */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6 border-t lg:border-t-0 lg:border-l border-violet-500/15 pt-6 lg:pt-0 lg:pl-8">
              <div className="space-y-4">
                
                {/* Slot badge & status */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold tracking-widest px-2.5 py-1 rounded bg-violet-500/15 text-violet-700 dark:text-violet-200 border border-violet-500/30">
                    SLOT #{selectedSlotDef.slotNumber}
                  </span>

                  {currentLiveSlotDef.slotNumber === selectedSlotDef.slotNumber ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live now
                    </span>
                  ) : selectedSlotBookedItem ? (
                    <span className="text-xs font-mono font-semibold text-secondary uppercase">
                      Already booked
                    </span>
                  ) : (
                    <span className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-300 uppercase">
                      Available — $30
                    </span>
                  )}
                </div>

                {/* Slot title */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-medium text-primary">
                    {selectedQuadrantMeta.title}
                  </h3>
                  <div className="text-xs font-mono text-secondary mt-1">
                    {selectedSlotDef.label} UTC
                  </div>
                </div>

                {/* Your local time */}
                <div className="p-3 rounded-lg border border-violet-500/20 bg-violet-500/[0.06] text-xs font-mono space-y-1">
                  <div className="text-secondary text-[11px] uppercase tracking-wider">
                    Your time ({userTz}):
                  </div>
                  <div className="font-bold text-primary text-sm">
                    {(() => {
                      const now = new Date()
                      const s = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), selectedSlotDef.startHour, 0))
                      const e = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), selectedSlotDef.endHour, 0))
                      return `${formatLocalSlotTime(s.toISOString())} – ${formatLocalSlotTime(e.toISOString())}`
                    })()}
                  </div>
                </div>

                {/* Best for */}
                <div className="space-y-1 text-xs">
                  <span className="font-mono text-[11px] text-secondary uppercase tracking-wider block">
                    Popular in:
                  </span>
                  <div className="font-mono text-primary text-xs bg-background p-2.5 rounded border border-primary/10">
                    {selectedQuadrantMeta.cities}
                  </div>
                </div>

                {/* Vibe note */}
                <div className="flex items-center gap-2 text-xs font-mono text-secondary">
                  {selectedQuadrantMeta.night ? (
                    <Moon className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-primary" />
                  )}
                  <span>{selectedQuadrantMeta.hemisphere}</span>
                </div>
              </div>

              {/* Book button */}
              <div className="pt-4 border-t border-violet-500/15">
                {selectedSlotBookedItem ? (
                  <div className="p-3 rounded-lg bg-background border border-primary/10 text-xs font-mono">
                    <span className="text-secondary block mb-1">Coming up:</span>
                    <span className="text-secondary/60 select-none" aria-label="Message hidden until live">
                      {"•".repeat(24)}
                      <span className="block text-[10px] mt-1">Revealed when live</span>
                    </span>
                  </div>
                ) : (
                  <Link 
                    href={`/create?tier=special&slot=${selectedSlotDef.slotNumber}`}
                    className="w-full block"
                  >
                    <button className="w-full py-3.5 rounded-xl bg-violet-700 dark:bg-violet-600 text-white font-medium text-xs tracking-[0.15em] uppercase hover:bg-violet-600 dark:hover:bg-violet-500 active:scale-[0.98] transition-colors flex items-center justify-center gap-2 shadow-sm">
                      <span>Book slot #{selectedSlotDef.slotNumber} — $30</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </Link>
                )}
              </div>

            </div>
          </div>
        ) : (
          /* ── SLOT LIST (8 x 3-HOUR) ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {FIXED_3H_SLOT_DEFINITIONS.map((def) => {
              const isLive = currentLiveSlotDef.slotNumber === def.slotNumber
              const today = new Date()
              const windowStart = Date.UTC(
                today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(),
                def.startHour, 0, 0, 0
              )
              const windowEnd = Date.UTC(
                today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(),
                def.endHour, 0, 0, 0
              )
              const booked = upcomingVipQueue.find(item => {
                if (!item.scheduled_start) return false
                const t = new Date(item.scheduled_start).getTime()
                return t >= windowStart && t < windowEnd
              })

              const meta = QUADRANT_METADATA.find(q => q.slot === def.slotNumber)
              const now = new Date()
              const sDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), def.startHour, 0))
              const eDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), def.endHour, 0))
              const localRange = `${formatLocalSlotTime(sDate.toISOString())} – ${formatLocalSlotTime(eDate.toISOString())}`

              return (
                <div
                  key={def.slotNumber}
                  onClick={() => setSelectedSlotNumber(def.slotNumber)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between min-h-[160px] ${
                    isLive 
                      ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_24px_rgba(139,92,246,0.25)] ring-1 ring-violet-500' 
                      : booked 
                      ? 'border-primary/20 bg-background-elevated' 
                      : 'border-violet-500/20 bg-background hover:border-violet-500/50 hover:bg-violet-500/[0.04]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                      <span className="font-bold text-violet-700 dark:text-violet-200">
                        ✦ SLOT {def.slotNumber.toString().padStart(2, '0')}
                      </span>
                      {isLive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live
                        </span>
                      ) : booked ? (
                        <span className="text-[10px] text-secondary font-mono uppercase">
                          Booked
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 dark:text-amber-300 font-semibold font-mono uppercase">
                          Available
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-mono font-bold text-primary">
                      {def.label}
                    </div>
                    <div className="text-[11px] text-secondary font-mono mt-0.5">
                      {localRange}
                    </div>
                    <div className="text-[10px] text-secondary/80 font-mono mt-1 truncate">
                      {meta?.cities}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-violet-500/15 flex items-center justify-between text-xs font-mono">
                    {booked ? (
                      <span className="text-[10px] text-secondary/60 font-mono truncate max-w-[170px] select-none" aria-label="Message hidden until live">
                        {"•".repeat(12)}
                      </span>
                    ) : (
                      <>
                        <span className="text-amber-600 dark:text-amber-300 font-bold">${SPECIAL_SLOT_PRICE}</span>
                        <Link 
                          href={`/create?tier=special&slot=${def.slotNumber}`}
                          className="text-[10px] text-violet-600 dark:text-violet-300 hover:underline flex items-center gap-1 font-semibold uppercase tracking-wider"
                        >
                          <span>Book</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── 5. WHY SPECIAL? (3 BENEFITS) ─────────────── */}
      <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-violet-500/20">
        <div className="space-y-2 border-l-2 border-violet-500/40 pl-4">
          <div className="font-mono text-xs text-violet-600 dark:text-violet-300 font-semibold tracking-widest uppercase">
            1. No bidding. No bumping.
          </div>
          <h3 className="font-serif text-lg font-medium text-primary">
            Your slot is locked
          </h3>
          <p className="text-xs text-secondary font-serif leading-relaxed text-secondary/85">
            Once you book, it&apos;s yours for the full 3 hours. No one can outbid you or cut in line.
          </p>
        </div>

        <div className="space-y-2 border-l-2 border-fuchsia-500/40 pl-4">
          <div className="font-mono text-xs text-fuchsia-600 dark:text-fuchsia-300 font-semibold tracking-widest uppercase">
            2. You pick the exact time
          </div>
          <h3 className="font-serif text-lg font-medium text-primary">
            On your schedule
          </h3>
          <p className="text-xs text-secondary font-serif leading-relaxed text-secondary/85">
            Choose any 3-hour slot up to 15 days ahead. We auto-show your local time, so no math needed.
          </p>
        </div>

        <div className="space-y-2 border-l-2 border-amber-400/60 pl-4">
          <div className="font-mono text-xs text-amber-600 dark:text-amber-300 font-semibold tracking-widest uppercase">
            3. Made for big moments
          </div>
          <h3 className="font-serif text-lg font-medium text-primary">
            Birthdays, proposals, launches
          </h3>
          <p className="text-xs text-secondary font-serif leading-relaxed text-secondary/85">
            Get a premium design plus a shareable page that stays up forever — perfect to send to friends & family.
          </p>
        </div>
      </section>

    </div>
  )
}
