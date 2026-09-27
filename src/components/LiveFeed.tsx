'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { getCategoryStyles, resolveCardStyles } from '@/lib/utils/colors'
import { SpecialMomentOverlay } from './SpecialMomentOverlay'
import { InlineInteractions } from './InlineInteractions'

export function LiveFeed({ initialMessage, compact = false, activeTab = 'NORMAL' }: { initialMessage: any, compact?: boolean, activeTab?: 'NORMAL' | 'SPECIAL' | 'SPONSORED' }) {
  const message = initialMessage
  
  // Realtime state
  const [activeComments, setActiveComments] = useState<{ id: string, content: string }[]>([])
  
  const [supabase] = useState(() => createClient())

  // Effect 1: Reactions are now tracked and displayed inside InlineInteractions

  const categoryName = message?.category?.name || 'MESSAGE'
  const categorySlug = message?.category?.slug || 'general'
  
  const { bgClass, borderClass, accentClass, badgeClass, ringColor } = getCategoryStyles(categorySlug)
  const { 
    bg, 
    textColor, 
    cardBorder, 
    isVip, 
    isDarkCard, 
    inlineColor, 
    buttonStyle, 
    timerStyle, 
    sponsorStyle, 
    sponsorLabelStyle, 
    sponsorNameStyle, 
    sponsorNoteStyle 
  } = resolveCardStyles(message?.style_config, message?.template_id)

  // Calculate remaining time for digital timer
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  
  // Track message transitions for chime + confetti celebration
  const lastActiveIdRef = useRef<string | null>(null)
  const hasTriggeredAdvanceRef = useRef(false)

  const playLiveChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {})
      }
      const now = ctx.currentTime
      const tones = [523.25, 783.99] // C5 -> G5 harmonic chime
      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + idx * 0.12)
        gain.gain.setValueAtTime(0, now + idx * 0.12)
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.9)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + idx * 0.12)
        osc.stop(now + idx * 0.12 + 1.0)
      })
    } catch {
      // AudioContext unavailable or blocked by browser autoplay policy
    }
  }

  useEffect(() => {
    hasTriggeredAdvanceRef.current = false
    if (message?.id) {
      if (lastActiveIdRef.current && lastActiveIdRef.current !== message.id) {
        // Message transitioned live!
        playLiveChime()
        confetti({
          particleCount: 55,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#818cf8', '#c084fc', '#f472b6', '#fbbf24']
        })
      }
      lastActiveIdRef.current = message.id
    }
  }, [message?.id])

  useEffect(() => {
    if (message?.actual_start && message?.durationSecs) {
      const updateTimer = () => {
        const elapsed = (Date.now() - new Date(message.actual_start).getTime()) / 1000
        const remaining = Math.max(0, message.durationSecs - elapsed)
        setTimeLeft(remaining)
        if (remaining <= 0 && !hasTriggeredAdvanceRef.current) {
          hasTriggeredAdvanceRef.current = true
          fetch('/api/queue/advance', { method: 'POST' }).catch(() => {})
        }
      }
      updateTimer()
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    }
  }, [message?.actual_start, message?.durationSecs])

  const formatTimer = (seconds: number | null) => {
    if (seconds === null) return '--:--'
    const s = Math.ceil(seconds)
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isSpecialMoment = !!message?.isSpecialMoment

  return (
    <div className={`flex-1 flex flex-col items-center justify-start ${compact ? 'h-full' : 'w-full'} relative z-10 p-4 md:p-8 max-w-4xl mx-auto transition-colors duration-1000`}>
      {/* VIP Special Moment full-screen overlay */}
      <SpecialMomentOverlay
        message={isSpecialMoment ? {
          id: message.id,
          content: message.content,
          category: message.category,
          style_config: message.style_config,
          scheduled_start: message.actual_start,
          duration_secs: message.durationSecs || 300,
        } : null}
        timeLeft={isSpecialMoment ? timeLeft : null}
      />

      {/* Hero Text */}
      {!compact && (
        <motion.div 
          key={activeTab} // re-animate on tab change
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-14 mt-4 md:mt-8 shrink-0"
        >
          {activeTab === 'NORMAL' && (
            <>
              <h2 className="text-3xl md:text-5xl font-serif mb-4 leading-tight">
                Someone, somewhere,<br/>
                has something to say.
              </h2>
              <p className="text-secondary text-sm md:text-base max-w-md mx-auto">
                For a few minutes, the world's attention belongs to them.
              </p>
            </>
          )}
          {activeTab === 'SPECIAL' && (
            <>
              <h2 className="text-3xl md:text-5xl font-serif mb-4 leading-tight">
                A moment of<br/>
                significance.
              </h2>
              <p className="text-secondary text-sm md:text-base max-w-md mx-auto">
                This VIP message commands the world's stage for a fixed 3-hour window.
              </p>
            </>
          )}
          {activeTab === 'SPONSORED' && (
            <>
              <h2 className="text-3xl md:text-5xl font-serif mb-4 leading-tight">
                The Waiting<br/>
                Room.
              </h2>
              <p className="text-secondary text-sm md:text-base max-w-md mx-auto">
                Discover what the world is preparing to say.
              </p>
            </>
          )}
        </motion.div>
      )}

      {/* Floating Comments Overlay */}
      {!compact && (
        <div className="fixed bottom-12 left-0 right-0 z-40 pointer-events-none px-12 flex flex-col gap-4 items-center">
          <AnimatePresence>
            {activeComments.map(comment => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="bg-black/40 backdrop-blur-md border border-white/20 text-white/90 px-8 py-4 rounded-full text-xl font-medium shadow-2xl max-w-2xl truncate"
              >
                {comment.content}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Live Message Display */}
      <AnimatePresence mode="wait">
        {message ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <motion.div
              key={message.id}
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: categorySlug === 'love' ? 1.05 : 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: categorySlug === 'love' ? 1.1 : 1.05, filter: 'blur(10px)' }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className={`w-full ${compact ? 'max-w-xl aspect-[4/3] p-4 md:p-6' : 'max-w-4xl aspect-square md:aspect-video p-6 md:p-12'} mx-auto border ${cardBorder || message.style_config?.cardBorder || borderClass} rounded-2xl flex flex-col relative overflow-hidden shadow-2xl backdrop-blur-md ${bg || bgClass} hover:border-primary/50 transition-all duration-700 group`}
            >
              {/* Custom placed stickers if present */}
              {Array.isArray(message?.style_config?.stickers) && message.style_config.stickers.map((sticker: any) => (
                <span
                  key={sticker.id}
                  className="absolute pointer-events-none select-none z-20 leading-none"
                  style={{
                    left: `${sticker.x}%`,
                    top: `${sticker.y}%`,
                    fontSize: `${sticker.size}em`,
                    opacity: sticker.opacity,
                    transform: 'translate(-50%, -50%)',
                    filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))',
                  }}
                >
                  {sticker.emoji}
                </span>
              ))}

              <div className="flex justify-between items-center mb-2 relative z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs uppercase tracking-widest font-bold border shadow-sm backdrop-blur-md ${
                    isVip
                      ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
                      : badgeClass
                  }`}>
                    {categoryName}
                  </span>

                  {message.style_config?.vipBadge && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold tracking-widest uppercase bg-amber-400/20 border border-amber-400/40 text-amber-300 shadow-md backdrop-blur-md">
                      <span>{message.style_config.vipIcon || '✦'}</span>
                      <span>{message.style_config.vipBadge}</span>
                    </span>
                  )}
                </div>

                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm backdrop-blur-md ${timerStyle}`}>
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-red-400`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 bg-red-500`}></span>
                  </span>
                  <span className="text-sm font-mono font-bold tracking-widest tabular-nums">
                    {formatTimer(timeLeft)}
                  </span>
                </div>
              </div>

              {/* Scrollable message content container */}
              <div className="relative z-10 flex-1 min-h-0 w-full overflow-y-auto overscroll-contain custom-scrollbar px-2 md:px-6 py-4 my-2 flex flex-col">
                <div className="my-auto w-full flex flex-col items-center justify-center">
                  {message.style_config?.html ? (
                    <div 
                      className={`max-w-none text-center leading-relaxed ${
                        (message.content?.length || 0) > 350
                          ? 'text-lg md:text-xl'
                          : (message.content?.length || 0) > 180
                          ? 'text-xl md:text-2xl'
                          : 'text-2xl md:text-3xl'
                      } ${compact ? '!text-base md:!text-lg' : ''} ${message.style_config?.font || ''} ${textColor}`}
                      style={{ color: inlineColor }}
                      dangerouslySetInnerHTML={{ __html: message.style_config.html }}
                    />
                  ) : (
                    <p className={`font-serif text-center leading-relaxed ${
                      (message.content?.length || 0) > 350
                        ? 'text-lg md:text-2xl'
                        : (message.content?.length || 0) > 180
                        ? 'text-xl md:text-3xl'
                        : 'text-2xl md:text-4xl'
                    } ${compact ? '!text-lg md:!text-xl' : ''} ${textColor}`}>
                      &quot;{message.content}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Brand Promotion Action Link Button */}
              {message.style_config?.brandUrl && (
                <div className="mb-2 relative z-10 mx-auto">
                  <a 
                    href={message.style_config.brandUrl.startsWith('http') ? message.style_config.brandUrl : `https://${message.style_config.brandUrl}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-700 dark:text-cyan-300 text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95"
                  >
                    <span>{message.style_config.brandName || 'Visit Showcase'}</span>
                    <span className="text-[11px]">↗</span>
                  </a>
                </div>
              )}

              {/* Sponsor Attribution if present */}
              {(message?.style_config?.sponsorName || message?.style_config?.sponsorNote) && (
                <div className={`mb-2 relative z-10 mx-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-1.5 rounded-2xl border shadow-sm text-xs backdrop-blur-md max-w-xl text-center ${sponsorStyle}`}>
                  <span className="text-amber-500 shrink-0">✨</span>
                  <span className={`${sponsorLabelStyle} text-[10px] uppercase font-bold tracking-wider shrink-0`}>Sponsored by</span>
                  <span className={`font-semibold shrink-0 ${sponsorNameStyle}`}>{message.style_config.sponsorName || 'Community Supporter'}</span>
                  {message.style_config.sponsorNote && (
                    <span className={`${sponsorNoteStyle} italic break-words`}>&mdash; &ldquo;{message.style_config.sponsorNote}&rdquo;</span>
                  )}
                </div>
              )}

              <div className="mt-2 relative z-10 w-full flex items-center justify-between gap-4 shrink-0">
                <div className="flex-1">
                  <InlineInteractions 
                    messageId={message.id} 
                    categorySlug={categorySlug} 
                    compact={compact}
                    isVip={isVip}
                    isDark={isDarkCard}
                    buttonClassName={buttonStyle}
                  />
                </div>
              </div>
              
            </motion.div>
          </div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1 }}
            className="w-full max-w-2xl md:max-w-3xl aspect-[16/10] md:aspect-[16/9] border border-primary/10 rounded-3xl flex flex-col items-center justify-center p-6 md:p-10 text-center bg-background-elevated/30 backdrop-blur-md relative overflow-hidden shadow-xl"
          >
            {/* Subtle animated ring */}
            <div className="absolute inset-0 rounded-3xl border border-primary/5 animate-pulse" />
            
            <div className="relative z-10 flex flex-col items-center gap-4 md:gap-5">
              {/* Icon */}
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-primary/10 bg-background-elevated/60 flex items-center justify-center shadow-sm">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-secondary/70">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>

              <div>
                <p className="text-lg md:text-xl font-serif tracking-wider text-primary/80 mb-1.5">The stage is empty.</p>
                <p className="text-xs md:text-sm text-secondary/70 leading-relaxed max-w-sm">
                  No message is live right now.<br/>This moment is yours.
                </p>
              </div>

              <Link href="/create">
                <button className="px-6 py-2.5 md:py-3 bg-primary text-background rounded-full text-xs md:text-sm font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-95">
                  Be the first to speak
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="md:hidden w-full max-w-md mt-12"
      >
        <Link href="/create">
          <button className="w-full py-4 bg-primary text-background rounded-full font-medium shadow-[0_0_30px_rgba(0,0,0,0.15)] active:scale-95 transition-all">
            Speak to the World
          </button>
        </Link>
      </motion.div>
    </div>
  )
}
