'use client'

import { forwardRef } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { EmojiStyle, SuggestionMode, Theme } from 'emoji-picker-react'

/**
 * Emoji picker panel built on the emoji-picker-react library — search,
 * category tabs, recently-used, and skin tones come from the library
 * instead of a hand-rolled grid with a hardcoded emoji list.
 *
 * The dataset is code-split (its own chunk, loaded the first time the
 * picker opens) so it never weighs down the page bundle. The loader is
 * hoisted: a new function identity would make the library reload it.
 */
const loadEmojiData = () => import('emoji-picker-react/data/emojis-en')

const LibraryEmojiPicker = dynamic(() => import('emoji-picker-react'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm opacity-60">
      Loading emojis…
    </div>
  ),
})

/**
 * On phones the panel is a bottom sheet (fixed to the viewport) so it can
 * never overflow the screen or get clipped by a card; on sm+ screens it
 * pops over the element that anchors it (the parent must be positioned).
 * Picking the current reaction again removes it (the parent's onPick).
 */
export const EmojiPicker = forwardRef<
  HTMLDivElement,
  {
    myEmoji: string | null
    onPick: (emoji: string) => void
    variant?: 'dark' | 'light'
  }
>(function EmojiPicker({ onPick, variant = 'dark' }, ref) {
  const dark = variant === 'dark'
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={`fixed inset-x-3 bottom-3 z-50 h-[54vh] max-h-[480px] overflow-hidden rounded-3xl shadow-xl sm:absolute sm:inset-x-auto sm:bottom-full sm:left-0 sm:mb-3 sm:h-[440px] sm:w-[352px] ${
        dark ? 'bg-[#222222] text-white' : 'bg-white text-neutral-900'
      }`}
    >
      <LibraryEmojiPicker
        onEmojiClick={emojiData => onPick(emojiData.emoji)}
        theme={dark ? Theme.DARK : Theme.LIGHT}
        emojiStyle={EmojiStyle.NATIVE}
        emojiData={loadEmojiData}
        lazyLoadEmojis
        width="100%"
        height="100%"
        searchPlaceholder="Search emojis"
        autoFocusSearch={false}
        suggestedEmojisMode={SuggestionMode.RECENT}
        previewConfig={{ showPreview: false }}
      />
    </motion.div>
  )
})
