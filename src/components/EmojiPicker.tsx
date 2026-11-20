'use client'

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import {
  EMOJI_CATEGORIES,
  POPULAR_EMOJIS,
  searchEmojis,
  type EmojiEntry,
} from '@/lib/reactionEmojis'

/**
 * Shared emoji picker panel (WhatsApp/Instagram style): a search box,
 * category tabs, and a scrollable grid with a visible scrollbar. Picking
 * the current reaction again removes it (handled by the parent's onPick).
 *
 * On phones it renders as a bottom sheet (fixed to the viewport) so it can
 * never overflow the screen or get clipped by a card; on sm+ screens it
 * pops over the element that anchors it (the parent must be positioned).
 */
export const EmojiPicker = forwardRef<
  HTMLDivElement,
  {
    myEmoji: string | null
    onPick: (emoji: string) => void
    variant?: 'dark' | 'light'
  }
>(function EmojiPicker({ myEmoji, onPick, variant = 'dark' }, ref) {
  const dark = variant === 'dark'
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('popular')
  const gridRef = useRef<HTMLDivElement>(null)

  const searching = query.trim().length > 0

  const results: EmojiEntry[] = useMemo(() => {
    if (searching) return searchEmojis(query)
    if (activeTab === 'popular') return POPULAR_EMOJIS
    return (
      EMOJI_CATEGORIES.find(category => category.id === activeTab)?.emojis ??
      POPULAR_EMOJIS
    )
  }, [query, searching, activeTab])

  const heading = searching
    ? results.length > 0
      ? `${results.length} result${results.length !== 1 ? 's' : ''}`
      : 'No matches'
    : activeTab === 'popular'
      ? 'Popular'
      : (EMOJI_CATEGORIES.find(category => category.id === activeTab)?.label ??
        'Popular')

  // Start each tab/search at the top of the grid.
  useEffect(() => {
    if (gridRef.current) gridRef.current.scrollTop = 0
  }, [activeTab, searching])

  const tabs = [
    { id: 'popular', label: 'Popular', icon: '🔥' },
    ...EMOJI_CATEGORIES,
  ]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className={`fixed inset-x-3 bottom-3 z-50 rounded-3xl border p-3 shadow-xl sm:absolute sm:inset-x-auto sm:bottom-full sm:left-0 sm:mb-3 sm:w-[352px] ${
        dark
          ? 'border-white/20 bg-neutral-900/95 text-white backdrop-blur-md'
          : 'border-primary/15 bg-background-elevated text-primary'
      }`}
    >
      {/* Search */}
      <div
        className={`flex items-center gap-2 rounded-full px-3 py-2 ${
          dark ? 'bg-white/10' : 'bg-primary/5'
        }`}
      >
        <Search
          size={15}
          className={`shrink-0 ${dark ? 'text-white/50' : 'text-secondary'}`}
        />
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search emojis"
          aria-label="Search emojis"
          className={`w-full bg-transparent text-sm outline-none ${
            dark
              ? 'text-white placeholder-white/40'
              : 'text-primary placeholder-secondary/60'
          }`}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className={`shrink-0 ${
              dark
                ? 'text-white/60 hover:text-white'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div
        className="no-scrollbar mt-2 flex gap-1 overflow-x-auto"
        role="tablist"
        aria-label="Emoji categories"
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={!searching && activeTab === tab.id}
            title={tab.label}
            onClick={() => {
              setActiveTab(tab.id)
              setQuery('')
            }}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[18px] transition-all ${
              !searching && activeTab === tab.id
                ? dark
                  ? 'bg-white/20 ring-1 ring-white/40'
                  : 'bg-primary/10 ring-1 ring-primary/40'
                : dark
                  ? 'hover:bg-white/10'
                  : 'hover:bg-primary/5'
            }`}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {/* Section heading */}
      <div
        className={`mt-2 px-1 text-[11px] font-semibold uppercase tracking-wider ${
          dark ? 'text-white/45' : 'text-secondary'
        }`}
      >
        {heading}
      </div>

      {/* Scrollable grid */}
      <div
        ref={gridRef}
        className="emoji-scroll mt-1 grid max-h-[34vh] grid-cols-8 gap-0.5 overflow-y-auto overscroll-contain pr-1 sm:max-h-60"
      >
        {results.map(entry => (
          <button
            key={entry.char}
            onClick={() => onPick(entry.char)}
            aria-label={`React ${entry.char} (${entry.name})`}
            title={entry.name}
            className={`flex h-10 items-center justify-center rounded-xl text-[22px] transition-all select-none ${
              myEmoji === entry.char
                ? dark
                  ? 'scale-110 bg-amber-400/35 ring-2 ring-amber-400'
                  : 'scale-110 bg-primary/15 ring-2 ring-primary'
                : dark
                  ? 'hover:scale-110 hover:bg-white/15'
                  : 'hover:scale-110 hover:bg-primary/10'
            }`}
          >
            {entry.char}
          </button>
        ))}
        {results.length === 0 && (
          <div
            className={`col-span-8 py-6 text-center text-sm ${
              dark ? 'text-white/50' : 'text-secondary'
            }`}
          >
            No emojis found for &ldquo;{query.trim()}&rdquo;
          </div>
        )}
      </div>
    </motion.div>
  )
})
