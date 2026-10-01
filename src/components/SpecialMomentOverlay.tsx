'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { getCategoryStyles, resolveCardStyles } from '@/lib/utils/colors'

interface SpecialMomentMessage {
  id: string
  content: string
  template_id?: string
  category?: { name: string; slug: string }
  style_config?: any
  scheduled_start: string
  duration_secs: number
}

interface SpecialMomentOverlayProps {
  message: SpecialMomentMessage | null
  timeLeft: number | null
}

export function SpecialMomentOverlay({ message, timeLeft }: SpecialMomentOverlayProps) {
  const isVisible = !!message && (timeLeft === null || timeLeft > 0)
  const categorySlug = message?.category?.slug || 'general'
  const categoryName = message?.category?.name || 'Special Moment'
  const { borderClass, accentClass, badgeClass, glowColor } = getCategoryStyles(categorySlug)
  const { bg, textColor, cardBorder, isVip, isDarkCard, inlineColor } = resolveCardStyles(message?.style_config, message?.template_id)

  const formatTimer = (seconds: number | null) => {
    if (seconds === null) return '--:--'
    const s = Math.ceil(seconds)
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={message!.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop blur */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" />



          {/* Card */}
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className={`relative w-[90vw] max-w-2xl min-h-[50vh] flex flex-col border-2 ${cardBorder || message?.style_config?.cardBorder || borderClass} rounded-3xl p-10 md:p-16 text-center shadow-2xl ${bg || 'bg-background-elevated/60'} backdrop-blur-2xl overflow-hidden`}
          >
            {/* Stickers */}
            {Array.isArray(message?.style_config?.stickers) && message!.style_config.stickers.map((sticker: any) => (
              <span
                key={sticker.id}
                className="absolute pointer-events-none select-none z-30 leading-none"
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  fontSize: `${sticker.size}em`,
                  opacity: sticker.opacity,
                  transform: 'translate(-50%, -50%)',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                }}
              >
                {sticker.emoji}
              </span>
            ))}
            {/* Animated border shimmer */}
            <div className={`absolute inset-0 rounded-3xl pointer-events-none`}>
              <div className={`absolute inset-0 rounded-3xl opacity-30 blur-sm ${glowColor} animate-pulse`} 
                style={{ boxShadow: 'inset 0 0 60px 20px currentColor' }} />
            </div>

            {/* Top badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center gap-2 mb-8"
            >
              <div className={`px-4 py-1 rounded-full text-xs uppercase tracking-[0.3em] font-bold border shadow-sm backdrop-blur-md ${isVip ? 'bg-amber-400/20 border-amber-400/40 text-amber-300' : badgeClass}`}>
                {message?.style_config?.vipBadge || '✦ Special Moment ✦'}
              </div>
              <div className={`text-[10px] uppercase tracking-widest font-semibold ${isDarkCard ? 'text-white/70' : 'text-secondary/80'}`}>
                {categoryName}
              </div>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain custom-scrollbar px-4 py-2 flex flex-col"
            >
              <div className="my-auto w-full">
                {message?.style_config?.html ? (
                  <div 
                    className={`max-w-none text-center leading-relaxed ${textColor} ${message?.style_config?.font || 'font-serif italic'} ${
                      (message!.content?.length || 0) > 300 ? 'text-xl md:text-3xl' : 'text-3xl md:text-5xl'
                    }`}
                    style={{ color: inlineColor }}
                    dangerouslySetInnerHTML={{ __html: message.style_config.html }}
                  />
                ) : (
                  <p className={`leading-relaxed text-balance ${textColor} ${message?.style_config?.font || 'font-serif italic'} ${
                    (message!.content?.length || 0) > 300 ? 'text-xl md:text-3xl' : 'text-3xl md:text-5xl'
                  }`}>
                    &quot;{message!.content}&quot;
                  </p>
                )}

                {/* Brand Showcase Link */}
                {message?.style_config?.brandUrl && (
                  <div className="mt-6">
                    <a 
                      href={message.style_config.brandUrl.startsWith('http') ? message.style_config.brandUrl : `https://${message.style_config.brandUrl}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-700 dark:text-cyan-300 text-xs font-bold shadow-md transition-all hover:scale-105"
                    >
                      <span>{message.style_config.brandName || 'Open Link'}</span>
                      <span className="text-xs">↗</span>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Timer */}
            {timeLeft !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-10 flex justify-center"
              >
                <div className="font-mono text-sm text-secondary/50 tabular-nums">
                  {formatTimer(timeLeft)}
                </div>
              </motion.div>
            )}

            {/* Progress bar */}
            {timeLeft !== null && message?.duration_secs && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 rounded-b-3xl overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: message.duration_secs, ease: 'linear' }}
                  className={`h-full ${accentClass} bg-current`}
                />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
