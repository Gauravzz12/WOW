'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Clock, HeartHandshake, Sparkles, ChevronRight } from 'lucide-react'
import { getCategoryStyles, resolveCardStyles } from '@/lib/utils/colors'
import { InlineInteractions } from './InlineInteractions'

function SponsoredCard({ message }: { message: any }) {
  const categoryName = message?.category?.name || 'MESSAGE'
  const categorySlug = message?.category?.slug || 'general'
  const { bgClass, borderClass, badgeClass } = getCategoryStyles(categorySlug)
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
    sponsorNoteStyle, 
    dividerStyle 
  } = resolveCardStyles(message?.style_config, message?.template_id)

  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    if (message?.actual_start && message?.durationSecs) {
      const updateTimer = () => {
        const elapsed = (Date.now() - new Date(message.actual_start).getTime()) / 1000
        const remaining = Math.max(0, message.durationSecs - elapsed)
        setTimeLeft(remaining)
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`w-full rounded-2xl border ${cardBorder || message?.style_config?.cardBorder || borderClass} ${bg || bgClass} p-5 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:border-primary/40 transition-all duration-300 relative overflow-hidden backdrop-blur-md min-h-[300px] group`}
    >
      {/* Custom placed stickers if present */}
      {Array.isArray(message?.style_config?.stickers) && message.style_config.stickers.map((sticker: any) => (
        <span
          key={sticker.id}
          className="absolute pointer-events-none select-none z-20 leading-none"
          style={{
            left: `${sticker.x}%`,
            top: `${sticker.y}%`,
            fontSize: `${Math.min(sticker.size, 3)}em`,
            opacity: sticker.opacity,
            transform: 'translate(-50%, -50%)',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
          }}
        >
          {sticker.emoji}
        </span>
      ))}

      {/* Top Header */}
      <div className="flex justify-between items-center mb-2 relative z-10 shrink-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-bold border shadow-sm backdrop-blur-md ${
            isVip
              ? 'bg-amber-400/20 border-amber-400/40 text-amber-300'
              : badgeClass
          }`}>
            {categoryName}
          </span>

          {message?.style_config?.vipBadge && (
            <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              {message?.style_config?.vipIcon || '✦'} VIP
            </span>
          )}
        </div>

        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-md ${timerStyle}`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-blue-400" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span className="text-[11px] font-mono font-bold tracking-wider tabular-nums">
            {formatTimer(timeLeft)}
          </span>
        </div>
      </div>

      {/* Scrollable Message Content */}
      <div className="relative z-10 flex-1 my-2 overflow-y-auto overscroll-contain custom-scrollbar pr-1 flex flex-col justify-center min-h-[90px]">
        {message?.style_config?.html ? (
          <div 
            className={`max-w-none text-center leading-relaxed text-base md:text-lg ${message.style_config?.font || ''} ${textColor}`}
            style={{ color: inlineColor }}
            dangerouslySetInnerHTML={{ __html: message.style_config.html }}
          />
        ) : (
          <p className={`text-center leading-relaxed text-base md:text-lg ${message?.style_config?.font || 'font-serif italic'} ${textColor}`}>
            &ldquo;{message?.content}&rdquo;
          </p>
        )}
      </div>

      {/* Brand Showcase Link if present */}
      {message?.style_config?.brandUrl && (
        <div className="relative z-10 my-1 text-center">
          <a
            href={message.style_config.brandUrl.startsWith('http') ? message.style_config.brandUrl : `https://${message.style_config.brandUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-700 dark:text-cyan-300 text-[11px] font-semibold transition-all hover:scale-105 active:scale-95 shadow-xs"
          >
            <span>{message.style_config.brandName || 'Visit Showcase'}</span>
            <span className="text-[10px]">↗</span>
          </a>
        </div>
      )}

      {/* Sponsor Indication / Note */}
      <div className={`relative z-10 my-2 px-3 py-2 rounded-xl border shadow-sm backdrop-blur-sm flex items-start gap-2.5 ${sponsorStyle}`}>
        <span className="text-amber-500 shrink-0 text-xs mt-0.5">✨</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] leading-tight">
            <span className={`text-[9px] uppercase font-bold tracking-wider shrink-0 ${sponsorLabelStyle}`}>
              Sponsored by
            </span>
            <span className={`font-semibold truncate ${sponsorNameStyle}`}>
              {message?.style_config?.sponsorName || 'Community Supporter'}
            </span>
          </div>
          {message?.style_config?.sponsorNote && (
            <p className={`text-[11px] italic mt-1 leading-snug break-words ${sponsorNoteStyle}`} title={message.style_config.sponsorNote}>
              &ldquo;{message.style_config.sponsorNote}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className={`mt-1 pt-2.5 border-t relative z-10 w-full shrink-0 ${dividerStyle}`}>
        <InlineInteractions 
          messageId={message.id} 
          categorySlug={categorySlug} 
          compact={true}
          isVip={isVip}
          isDark={isDarkCard}
          buttonClassName={buttonStyle}
        />
      </div>
    </motion.div>
  )
}

export function SponsoredGrid({ 
  messages = [], 
  waitingCount = 0 
}: { 
  messages: any[], 
  waitingCount?: number 
}) {
  const activeGridMessages = messages.slice(0, 10)

  return (
    <div className="w-full max-w-7xl mx-auto px-4 flex flex-col items-center">
      {/* Grid Sub-header & Status */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 pb-4 border-b border-primary/10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
            <HeartHandshake size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-primary">
              The Sponsored Gallery
            </h3>
            <p className="text-xs text-secondary">
              Community broadcasts live on stage simultaneously (up to 10 at once)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-background-elevated border border-primary/10 text-[11px] font-mono text-secondary">
            <span className="font-bold text-primary">{activeGridMessages.length}</span> Active
            {waitingCount > 0 && (
              <>
                {' '}• <span className="font-bold text-blue-600 dark:text-blue-400">{waitingCount}</span> in queue
              </>
            )}
          </div>
          <Link 
            href="/waiting-room"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors text-xs font-semibold shadow-sm"
          >
            <span>Sponsor +</span>
          </Link>
        </div>
      </div>

      {/* Grid Cards Container */}
      {activeGridMessages.length > 0 ? (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {activeGridMessages.map((msg) => (
            <SponsoredCard key={msg.id} message={msg} />
          ))}
        </div>
      ) : (
        <div className="w-full max-w-xl aspect-[16/10] border border-primary/10 rounded-3xl flex flex-col items-center justify-center p-8 text-center bg-background-elevated/30 backdrop-blur-md relative overflow-hidden shadow-xl my-6">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
            <HeartHandshake size={24} />
          </div>
          <h3 className="text-lg font-serif tracking-wider text-primary mb-1.5">The Sponsored Stage is Quiet</h3>
          <p className="text-xs text-secondary max-w-sm leading-relaxed mb-6">
            No sponsored messages are currently broadcasting. You can sponsor an authentic message from the community to light up the grid.
          </p>
          <Link href="/waiting-room">
            <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5">
              <span>View The Waiting Room</span>
              <ChevronRight size={14} />
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}
