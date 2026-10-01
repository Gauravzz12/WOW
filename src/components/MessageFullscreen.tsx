'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, X } from 'lucide-react'

export interface FullscreenMessageData {
  content: string
  html?: string
  font?: string
  categoryName?: string
  brandName?: string
  brandUrl?: string
  sponsorName?: string
  sponsorNote?: string
  stickers?: any[]
}

export interface FullscreenMessageAppearance {
  bg: string
  textColor: string
  cardBorder?: string
  inlineColor?: string
  isDarkCard?: boolean
  /**
   * Source-card fidelity: the modal reuses the originating card's own
   * geometry + type scale so %-positioned stickers keep the exact layout
   * the author arranged. Each call site passes its card's classes.
   */
  widthClass?: string
  aspectClass?: string
  paddingClass?: string
  bodyClassName?: string
  bodyInnerClassName?: string
  htmlTextClass?: string
  plainTextClass?: string
}

function enlargedTextSize(contentLength: number): string {
  if (contentLength > 350) return 'text-xl md:text-2xl'
  if (contentLength > 180) return 'text-2xl md:text-4xl'
  return 'text-3xl md:text-5xl'
}

/**
 * "Watch in fullscreen" — an enlarged modal overlay for any message body.
 * Owns its open state so it can be dropped into server or client components.
 */
export function FullscreenMessage({
  message,
  appearance,
  triggerClassName = '',
  triggerTitle = 'Watch in fullscreen',
}: {
  message: FullscreenMessageData
  appearance: FullscreenMessageAppearance
  triggerClassName?: string
  triggerTitle?: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen])

  const { bg, textColor, cardBorder, inlineColor, isDarkCard } = appearance
  // Same layout as the source card — only the backdrop isolation is new.
  const widthClass = appearance.widthClass ?? 'max-w-4xl'
  const aspectClass = appearance.aspectClass ?? ''
  const paddingClass = appearance.paddingClass ?? 'p-6 md:p-12'
  const bodyClassName =
    appearance.bodyClassName ??
    'relative z-10 flex-1 min-h-0 w-full overflow-y-auto overscroll-contain custom-scrollbar px-2 md:px-6 py-4 flex flex-col'
  const bodyInnerClassName =
    appearance.bodyInnerClassName ?? 'my-auto w-full flex flex-col items-center justify-center'
  const htmlTextClass =
    appearance.htmlTextClass ??
    `max-w-none text-center leading-relaxed ${enlargedTextSize(message.content?.length || 0)} ${message.font || ''} ${textColor}`
  const plainTextClass =
    appearance.plainTextClass ??
    `font-serif text-center leading-relaxed ${enlargedTextSize(message.content?.length || 0)} ${textColor}`

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(true)
        }}
        title={triggerTitle}
        aria-label={triggerTitle}
        className={`inline-flex items-center justify-center w-7 h-7 rounded-full border border-primary/15 bg-background-elevated/60 text-secondary hover:text-primary hover:border-primary/40 transition-all active:scale-95 ${triggerClassName}`}
      >
        <Maximize2 size={13} />
      </button>

      {/* Portalled to document.body: message cards live under transformed /
          blurred ancestors (framer-motion + backdrop-blur), which would
          otherwise trap `fixed` positioning and distort/crop the overlay. */}
      {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="fullscreen-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={message.categoryName || 'Message fullscreen view'}
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`relative w-[94vw] ${widthClass} ${aspectClass} ${paddingClass} ${bg} border ${cardBorder || 'border-primary/20'} rounded-3xl flex flex-col overflow-hidden shadow-2xl max-h-[90dvh]`}
            >
              {Array.isArray(message.stickers) && message.stickers.map((sticker: any) => (
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

              <div className="flex items-center justify-between gap-3 mb-4 relative z-10 shrink-0">
                {message.categoryName ? (
                  <span className="px-3 py-1 rounded-full text-[10px] md:text-xs uppercase tracking-widest font-bold border border-primary/20 bg-primary/10 text-primary">
                    {message.categoryName}
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close fullscreen"
                  aria-label="Close fullscreen"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-primary/20 bg-background-elevated/70 text-secondary hover:text-primary hover:border-primary/40 transition-all active:scale-95"
                >
                  <X size={15} />
                </button>
              </div>

              <div className={bodyClassName}>
                <div className={bodyInnerClassName}>
                  {message.html ? (
                    <div
                      className={htmlTextClass}
                      style={{ color: inlineColor }}
                      dangerouslySetInnerHTML={{ __html: message.html }}
                    />
                  ) : (
                    <p className={plainTextClass} style={{ color: inlineColor }}>
                      &quot;{message.content}&quot;
                    </p>
                  )}
                </div>
              </div>

              {message.brandUrl && (
                <div className="mt-4 relative z-10 mx-auto shrink-0">
                  <a
                    href={message.brandUrl.startsWith('http') ? message.brandUrl : `https://${message.brandUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-700 dark:text-cyan-300 text-xs font-semibold transition-all hover:scale-105"
                  >
                    <span>{message.brandName || 'Open Link'}</span>
                    <span className="text-[11px]">↗</span>
                  </a>
                </div>
              )}

              {(message.sponsorName || message.sponsorNote) && (
                <div className={`mt-4 relative z-10 mx-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-1.5 rounded-2xl border text-xs max-w-xl text-center shrink-0 ${isDarkCard ? 'bg-black/50 border-white/15 text-white/90' : 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/15'}`}>
                  <span className="text-amber-500 shrink-0">✨</span>
                  <span className="font-semibold shrink-0">{message.sponsorName || 'Community'}</span>
                  {message.sponsorNote && (
                    <span className="italic break-words">&mdash; &ldquo;{message.sponsorNote}&rdquo;</span>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  )
}
