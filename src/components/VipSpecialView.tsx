'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { Check, Share2, Compass } from 'lucide-react'
import {
  FIXED_3H_SLOT_DEFINITIONS,
  SPECIAL_SLOT_PRICE,
  formatLocalSlotTime,
  getFixedSlotsForUtcDate
} from '@/lib/constants/pricing'
import { resolveCardStyles } from '@/lib/utils/colors'
import { InlineInteractions } from './InlineInteractions'
import { FullscreenMessage } from './MessageFullscreen'
import { FrameDecorator } from './FrameDecorator'
import { getFrameClass } from '@/lib/constants/frames'
import { sanitizeHtmlText } from '@/lib/sanitize'

export interface VipSpecialViewProps {
  activeSpecialMsg: any | null
  upcomingVipQueue: any[]
}

// A booking matches a slot only when it falls inside that slot's exact UTC
// day window — hour-only matching wrongly blocked the same slot number on
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

// The signature motif of this page: a 2px rule with a 1px rule 3px below it —
// the double rule that tops a newspaper front page. `inverted` renders it in
// pale cream so it can frame the dark Night Stage panel.
function DoubleRule({ inverted = false }: { inverted?: boolean }) {
  const rule = inverted ? 'bg-white/25' : 'bg-primary'
  return (
    <div aria-hidden="true" className="w-full">
      <div className={`h-[2px] w-full ${rule}`} />
      <div className={`mt-[3px] h-px w-full ${rule}`} />
    </div>
  )
}

type SlotStatus = 'LIVE NOW' | 'BOOKED' | 'OPEN' | 'PAST'

const DAY_MS = 24 * 60 * 60 * 1000

export function VipSpecialView({ activeSpecialMsg, upcomingVipQueue = [] }: VipSpecialViewProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [nowUtcMs, setNowUtcMs] = useState<number>(() => Date.now())
  const [userTz, setUserTz] = useState<string>('Local Time')
  const [copiedLink, setCopiedLink] = useState(false)
  const [selectedDayOffset, setSelectedDayOffset] = useState(0)
  const [selectedSlotNumber, setSelectedSlotNumber] = useState<number | null>(null)
  // Fires the expiry advance exactly once per active message (not every 1s tick).
  const advanceFiredForRef = useRef<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      setUserTz(tz.replace(/_/g, ' '))
    } catch {}

    const updateClock = () => {
      const now = Date.now()
      setNowUtcMs(now)

      if (activeSpecialMsg) {
        let endMs: number
        if (activeSpecialMsg.scheduled_end) {
          endMs = new Date(activeSpecialMsg.scheduled_end).getTime()
        } else if (activeSpecialMsg.actual_start) {
          const durationSecs = activeSpecialMsg.durationSecs || 10800
          endMs = new Date(activeSpecialMsg.actual_start).getTime() + durationSecs * 1000
        } else {
          endMs = now
        }
        const rem = Math.max(0, Math.floor((endMs - now) / 1000))
        setTimeLeft(rem)
        if (rem === 0) {
          const msgId = activeSpecialMsg.id || 'unknown'
          if (advanceFiredForRef.current !== msgId) {
            advanceFiredForRef.current = msgId
            fetch('/api/queue/advance', { method: 'POST' }).catch(() => {})
          }
        }
      } else {
        // Remaining seconds in the current 3-hour sector
        const d = new Date(now)
        const sectorEndHour = Math.floor(d.getUTCHours() / 3) * 3 + 3
        const sectorEnd = Date.UTC(
          d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), sectorEndHour, 0, 0
        )
        setTimeLeft(Math.max(0, Math.floor((sectorEnd - now) / 1000)))
      }
    }

    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [activeSpecialMsg])

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

  // Today (UTC) + the next 14 days
  const days = useMemo(() => {
    const now = new Date(nowUtcMs)
    const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    return Array.from({ length: 15 }, (_, i) => new Date(todayUtc + i * DAY_MS))
  }, [nowUtcMs])

  const selectedDay = days[selectedDayOffset] || days[0]

  const slotsForDay = useMemo(() => {
    if (!selectedDay) return []
    return getFixedSlotsForUtcDate(
      selectedDay.getUTCFullYear(), selectedDay.getUTCMonth(), selectedDay.getUTCDate()
    )
  }, [selectedDay])

  const slotStatus = (slot: (typeof slotsForDay)[number]): SlotStatus => {
    const startMs = new Date(slot.scheduled_start).getTime()
    const endMs = new Date(slot.scheduled_end).getTime()
    if (endMs <= nowUtcMs) return 'PAST'
    if (startMs <= nowUtcMs && nowUtcMs < endMs) return 'LIVE NOW'
    const def = FIXED_3H_SLOT_DEFINITIONS.find(d => d.slotNumber === slot.slotNumber)
    if (def && selectedDay && isBookedOnDay(upcomingVipQueue, def, selectedDay)) return 'BOOKED'
    return 'OPEN'
  }

  // Current live slot (for the dateline + default selection)
  const currentSlot = useMemo(() => {
    const today = days[0]
    if (!today) return null
    const todays = getFixedSlotsForUtcDate(
      today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()
    )
    return (
      todays.find(s => {
        const st = new Date(s.scheduled_start).getTime()
        const en = new Date(s.scheduled_end).getTime()
        return st <= nowUtcMs && nowUtcMs < en
      }) || todays[0]
    )
  }, [days, nowUtcMs])

  // Default the selection to the current live slot on first render
  useEffect(() => {
    if (selectedSlotNumber === null && currentSlot) {
      setSelectedSlotNumber(currentSlot.slotNumber)
    }
  }, [currentSlot, selectedSlotNumber])

  const selectedSlot = slotsForDay.find(s => s.slotNumber === selectedSlotNumber) || slotsForDay[0]
  const selectedStatus: SlotStatus = selectedSlot ? slotStatus(selectedSlot) : 'OPEN'

  const fmtDayLong = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })
  const fmtDayChip = (d: Date) => {
    const wd = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }).toUpperCase()
    return `${wd} ${d.getUTCDate()}`
  }

  const msgCategoryName = activeSpecialMsg?.category?.name || 'Special message'
  const { bg: msgBg, textColor, cardBorder: msgBorder, isDarkCard, inlineColor } = resolveCardStyles(
    activeSpecialMsg?.style_config,
    activeSpecialMsg?.template_id
  )

  // ── Night Stage ──────────────────────────────────────────────
  // A Special slot is the site's one significant moment, so a message on the
  // default card style is presented on a dark stage (solid ink panel, cream
  // type, amber accent) in BOTH site themes — the spotlight contrast. A
  // message whose author chose a real template/background keeps that design;
  // never paint over a paid design. Template 'a' IS the default style (its
  // canonical bg is plain bg-background), so it does not count as chosen.
  const rawStyleCfg = activeSpecialMsg?.style_config
  const styleCfg: Record<string, any> = typeof rawStyleCfg === 'string'
    ? (() => { try { return JSON.parse(rawStyleCfg) } catch { return {} } })()
    : (rawStyleCfg || {})
  const chosenTemplateId = activeSpecialMsg?.template_id || styleCfg.templateId || styleCfg.template_id
  const hasChosenCardStyle = !!(
    (chosenTemplateId && chosenTemplateId !== 'a') ||
    styleCfg.isVip ||
    (styleCfg.bg && styleCfg.bg !== 'bg-background')
  )
  const forceNightStage = !!activeSpecialMsg && !hasChosenCardStyle
  const stageBg = forceNightStage ? 'bg-[#141118]' : msgBg
  const stageTextColor = forceNightStage ? 'text-[#F5EFE6]' : textColor
  const stageInlineColor = forceNightStage ? '#F5EFE6' : inlineColor
  const stageIsDark = forceNightStage || isDarkCard
  // The empty stage is always the dark panel, so its rules are always inverted.
  const stageRulesInverted = activeSpecialMsg ? stageIsDark : true

  const bookDisabled = selectedStatus !== 'OPEN'
  const bookLabel = !selectedSlot
    ? 'Pick a slot'
    : selectedStatus === 'BOOKED'
      ? `Slot #${selectedSlot.slotNumber} is booked`
      : selectedStatus === 'PAST'
        ? `Slot #${selectedSlot.slotNumber} has passed`
        : selectedStatus === 'LIVE NOW'
          ? `Slot #${selectedSlot.slotNumber} is live now`
          : `Claim Slot #${selectedSlot.slotNumber} — ${fmtDayLong(selectedDay)} · ${selectedSlot.label} — $${SPECIAL_SLOT_PRICE}`

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* ── 1. Masthead ─────────────────────────────────────────── */}
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <span className="font-mono text-[11px] sm:text-xs tracking-[0.25em] uppercase text-primary">
          ✦ Special
        </span>
        <span className="font-mono text-[11px] sm:text-xs tracking-[0.25em] uppercase text-secondary">
          ${SPECIAL_SLOT_PRICE} · 3 Hours · One Voice on Earth
        </span>
      </div>
      <div className="mt-3">
        <DoubleRule />
      </div>

      {/* ── 2. Dateline ─────────────────────────────────────────── */}
      <p className="mt-3 font-mono text-[11px] sm:text-xs text-secondary flex flex-wrap items-center gap-x-2 gap-y-1">
        {activeSpecialMsg ? (
          <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE NOW
          </span>
        ) : (
          <span className="text-primary font-semibold">
            {currentSlot ? `SLOT #${currentSlot.slotNumber} OPEN` : 'OPEN'}
          </span>
        )}
        {currentSlot && (
          <>
            <span aria-hidden="true" className="text-secondary/40">·</span>
            <span>{currentSlot.label}</span>
            <span aria-hidden="true" className="text-secondary/40">·</span>
            <span suppressHydrationWarning>
              YOUR TIME {isMounted ? userTz.toUpperCase() : 'LOCAL'} {formatLocalSlotTime(currentSlot.scheduled_start)} – {formatLocalSlotTime(currentSlot.scheduled_end)}
            </span>
          </>
        )}
      </p>

      {/* ── 3. The Stage ────────────────────────────────────────── */}
      <section className="mt-6">
        <DoubleRule inverted={stageRulesInverted} />
        {activeSpecialMsg ? (
          <article
            className={`relative overflow-hidden rounded-none ${stageBg} px-5 py-9 sm:px-10 sm:py-12 ${getFrameClass(activeSpecialMsg.style_config?.frameId)}`}
          >
            <FrameDecorator frameId={activeSpecialMsg.style_config?.frameId} />

            {/* Stickers as backdrop décor — always behind text */}
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
                }}
              >
                {sticker.emoji}
              </span>
            ))}

            {/* Stage strip — the significance marker */}
            <p className={`relative z-10 mb-7 sm:mb-9 text-center font-mono text-[11px] uppercase tracking-[0.3em] ${stageIsDark ? 'text-amber-400' : 'text-amber-700'}`}>
              ✦ Now on the World Stage ✦
            </p>

            {/* Top row */}
            <div className={`relative z-10 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.2em] ${stageIsDark ? 'text-[#F5EFE6]/60' : 'text-secondary'}`}>
              <span>✦ {msgCategoryName}</span>
              <span className={stageIsDark ? 'text-[#F5EFE6]' : 'text-primary'}>Live Now · #{activeSpecialMsg.id.slice(0, 8)}</span>
            </div>

            {/* Message — the hero */}
            <div className="relative z-10 my-10 sm:my-14 text-center max-w-3xl mx-auto px-1">
              {activeSpecialMsg.style_config?.html ? (
                <div
                  className={`text-balance leading-[1.2] tracking-tight text-4xl sm:text-6xl md:text-7xl [overflow-wrap:anywhere] ${activeSpecialMsg.style_config?.font || 'font-serif'} ${stageTextColor}`}
                  style={{ color: stageInlineColor }}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtmlText(activeSpecialMsg.style_config.html) }}
                />
              ) : (
                <blockquote
                  className={`text-balance font-serif leading-[1.2] tracking-tight text-4xl sm:text-6xl md:text-7xl [overflow-wrap:anywhere] ${stageTextColor}`}
                >
                  &ldquo;{activeSpecialMsg.content}&rdquo;
                </blockquote>
              )}
            </div>

            {/* Optional brand link */}
            {activeSpecialMsg.style_config?.brandUrl && (
              <div className="relative z-10 mx-auto mb-6 text-center">
                <a
                  href={activeSpecialMsg.style_config.brandUrl.startsWith('http') ? activeSpecialMsg.style_config.brandUrl : `https://${activeSpecialMsg.style_config.brandUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-700 dark:text-cyan-300 text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <span>{activeSpecialMsg.style_config.brandName || 'Open Link'}</span>
                  <span className="text-[11px]">↗</span>
                </a>
              </div>
            )}

            {/* Attribution + actions */}
            <div className={`relative z-10 flex flex-wrap items-center justify-between gap-3 font-mono text-xs ${stageIsDark ? 'text-[#F5EFE6]/70' : 'text-secondary'}`}>
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span>
                  By <strong className={`font-semibold ${stageIsDark ? 'text-[#F5EFE6]' : 'text-primary'}`}>{activeSpecialMsg.signature || 'Anonymous'}</strong>
                </span>
                {activeSpecialMsg.recipient && (
                  <>
                    <span className={stageIsDark ? 'text-[#F5EFE6]/40' : 'text-secondary/40'}>·</span>
                    <span>
                      For <strong className={`font-semibold ${stageIsDark ? 'text-[#F5EFE6]' : 'text-primary'}`}>{activeSpecialMsg.recipient}</strong>
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors ${stageIsDark ? 'border-white/25 text-[#F5EFE6]/85 hover:bg-white/10 hover:text-[#F5EFE6]' : 'border-primary/20 hover:bg-primary/10 text-primary'}`}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link copied!' : 'Copy link'}</span>
                </button>

                <FullscreenMessage
                  message={{
                    content: activeSpecialMsg.content || '',
                    html: activeSpecialMsg.style_config?.html,
                    font: activeSpecialMsg.style_config?.font,
                    categoryName: msgCategoryName,
                    brandName: activeSpecialMsg.style_config?.brandName,
                    brandUrl: activeSpecialMsg.style_config?.brandUrl,
                    sponsorName: activeSpecialMsg.style_config?.sponsorName,
                    sponsorNote: activeSpecialMsg.style_config?.sponsorNote,
                    stickers: activeSpecialMsg.style_config?.stickers,
                    frameId: activeSpecialMsg.style_config?.frameId,
                  }}
                  appearance={{
                    bg: stageBg,
                    textColor: stageTextColor,
                    cardBorder: msgBorder || 'border-violet-500/30',
                    inlineColor: stageInlineColor,
                    isDarkCard: stageIsDark,
                    widthClass: 'max-w-4xl',
                    aspectClass: '',
                    paddingClass: 'px-6 py-9 sm:px-10 sm:py-12 md:px-14 md:py-14',
                    bodyClassName: 'relative z-10 my-6 sm:my-8 text-center max-w-3xl mx-auto px-2 w-full flex-1 min-h-0 overflow-y-auto flex flex-col',
                    bodyInnerClassName: 'm-auto w-full',
                    htmlTextClass: `text-balance leading-[1.2] tracking-tight text-4xl sm:text-6xl md:text-7xl ${activeSpecialMsg.style_config?.font || 'font-serif'} ${stageTextColor}`,
                    plainTextClass: `text-balance font-serif leading-[1.2] tracking-tight text-4xl sm:text-6xl md:text-7xl ${stageTextColor}`,
                  }}
                />
              </div>
            </div>

            {/* Countdown — the centrepiece under the message */}
            <div className="relative z-10 mt-9 text-center">
              <p className={`font-mono text-[10px] uppercase tracking-[0.3em] ${stageIsDark ? 'text-amber-400' : 'text-amber-700'}`}>
                Remaining on stage
              </p>
              <p
                suppressHydrationWarning
                className={`mt-2 font-mono tabular-nums leading-none text-4xl sm:text-5xl ${stageIsDark ? 'text-[#F5EFE6]' : 'text-primary'}`}
              >
                {isMounted ? formatCountdown(timeLeft) : '--:--:--'}
              </p>
            </div>

            {/* Reactions under a single hairline */}
            <div className={`relative z-10 mt-6 pt-4 border-t ${stageIsDark ? 'border-white/15' : 'border-primary/10'}`}>
              <InlineInteractions
                messageId={activeSpecialMsg.id}
                categorySlug={activeSpecialMsg?.category?.slug || 'general'}
                isVip={true}
                isDark={stageIsDark}
              />
            </div>
          </article>
        ) : (
          <div className="relative overflow-hidden rounded-none bg-[#141118] px-5 py-12 sm:p-14 text-center flex flex-col items-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-amber-400">
              ✦ The World Stage ✦
            </p>
            <div className="mt-9 w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-[#F5EFE6]/50 mb-5">
              <Compass className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#F5EFE6] mb-3 leading-tight">
              The stage is dark.
            </h2>
            <p className="text-[#F5EFE6]/60 text-sm font-serif italic max-w-md mx-auto mb-7 leading-relaxed">
              In a few hours this is the only voice on Earth. Make it yours.
            </p>
            <Link
              href="/create?tier=special"
              className="px-7 py-3.5 bg-amber-400 text-black font-medium text-xs tracking-[0.15em] uppercase hover:bg-amber-300 active:scale-[0.98] transition-all"
            >
              Claim this slot — ${SPECIAL_SLOT_PRICE}
            </Link>
          </div>
        )}
        <DoubleRule inverted={stageRulesInverted} />
      </section>

      {/* ── 4. Pick your time ───────────────────────────────────── */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-primary">Eight slots a day.</h2>
          <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-secondary">
            One voice at a time
          </span>
        </div>

        {/* Day chips — today + next 14 days */}
        <div className="mt-4 flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible pb-1 -mx-1 px-1">
          {days.map((day, i) => {
            const isSel = i === selectedDayOffset
            return (
              <button
                key={day.getTime()}
                onClick={() => setSelectedDayOffset(i)}
                className={`shrink-0 px-3 py-1.5 border font-mono text-[11px] tracking-wider transition-colors ${
                  isSel
                    ? 'bg-violet-700 dark:bg-violet-600 border-violet-700 dark:border-violet-600 text-white'
                    : 'border-primary/20 text-secondary hover:text-primary hover:border-primary/40'
                }`}
              >
                {i === 0 ? `TODAY · ${fmtDayChip(day)}` : fmtDayChip(day)}
              </button>
            )
          })}
        </div>

        {/* The day's 8 slots — one ruled list, no cards */}
        <div className="mt-2 divide-y divide-primary/10 border-b border-primary/10">
          {slotsForDay.map(slot => {
            const status = slotStatus(slot)
            const isSel = selectedSlot?.slotNumber === slot.slotNumber
            return (
              <button
                key={slot.slotNumber}
                onClick={() => setSelectedSlotNumber(slot.slotNumber)}
                className={`relative w-full flex items-center gap-3 px-3 py-3 text-left transition-colors ${
                  isSel ? 'bg-violet-50 dark:bg-violet-500/10' : 'hover:bg-primary/[0.03]'
                }`}
              >
                {isSel && <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-[3px] bg-violet-700 dark:bg-violet-500" />}
                <span className="font-mono text-[11px] tracking-wider text-secondary w-14 shrink-0">
                  SLOT {slot.slotNumber}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-primary whitespace-nowrap">{slot.label}</span>
                  <span className="block text-xs text-secondary whitespace-nowrap" suppressHydrationWarning>
                    {formatLocalSlotTime(slot.scheduled_start)} – {formatLocalSlotTime(slot.scheduled_end)} local
                  </span>
                </span>
                <span
                  className={`font-mono text-[10px] tracking-[0.15em] shrink-0 ${
                    status === 'LIVE NOW'
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : status === 'BOOKED'
                        ? 'text-amber-600 dark:text-amber-400'
                        : status === 'PAST'
                          ? 'text-secondary/50'
                          : 'text-secondary'
                  }`}
                >
                  {status}
                </span>
                <span className="text-sm text-primary w-8 text-right shrink-0">${SPECIAL_SLOT_PRICE}</span>
              </button>
            )
          })}
        </div>

        {/* One booking action for the selected slot */}
        <div className="mt-5">
          {bookDisabled || !selectedSlot ? (
            <button
              disabled
              className="w-full py-3.5 bg-primary/10 text-secondary font-medium text-xs tracking-[0.12em] uppercase cursor-not-allowed"
            >
              {bookLabel}
            </button>
          ) : (
            <Link
              href={`/create?tier=special&slot=${selectedSlot.slotNumber}`}
              className="block w-full py-3.5 text-center bg-amber-400 text-black font-medium text-xs tracking-[0.12em] uppercase hover:bg-amber-300 active:scale-[0.99] transition-all"
            >
              {bookLabel}
            </Link>
          )}
        </div>
      </section>

      {/* ── 5. Facts strip — true scarcity facts, nothing else ──── */}
      <p className="mt-10 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-secondary leading-relaxed">
        The only message on the homepage
        <span aria-hidden="true" className="text-amber-500"> ✦ </span>
        Full 3 hours — never bumped
        <span aria-hidden="true" className="text-amber-500"> ✦ </span>
        A page that stays forever
      </p>
    </div>
  )
}
