'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

export interface Sticker {
  id: string
  emoji: string
  x: number   // 0–100 percent from left
  y: number   // 0–100 percent from top
  opacity: number   // 0.1–1.0
  size: number  // em — 2–8
}

// Curated sticker catalog grouped by occasion (16 per category = 80 total)
export const STICKER_CATALOG: { group: string; icon: string; stickers: { emoji: string; label: string }[] }[] = [
  {
    group: 'Birthday & Party',
    icon: '🎂',
    stickers: [
      { emoji: '🎂', label: 'Birthday Cake' },
      { emoji: '🎉', label: 'Party Popper' },
      { emoji: '🎈', label: 'Balloon' },
      { emoji: '🥂', label: 'Champagne' },
      { emoji: '🎁', label: 'Gift Box' },
      { emoji: '✨', label: 'Sparkles' },
      { emoji: '🎊', label: 'Confetti Ball' },
      { emoji: '🪄', label: 'Magic Wand' },
      { emoji: '🥳', label: 'Party Face' },
      { emoji: '🍰', label: 'Shortcake' },
      { emoji: '🍾', label: 'Popping Cork' },
      { emoji: '👑', label: 'Crown' },
      { emoji: '🎆', label: 'Fireworks' },
      { emoji: '🎇', label: 'Sparkler' },
      { emoji: '🧁', label: 'Cupcake' },
      { emoji: '🍻', label: 'Cheering Beers' },
    ],
  },
  {
    group: 'Love & Romance',
    icon: '💖',
    stickers: [
      { emoji: '💖', label: 'Sparkling Heart' },
      { emoji: '💋', label: 'Kiss Mark' },
      { emoji: '🌹', label: 'Red Rose' },
      { emoji: '💌', label: 'Love Letter' },
      { emoji: '💑', label: 'Couple with Heart' },
      { emoji: '🕊️', label: 'Dove of Peace' },
      { emoji: '🌷', label: 'Tulip' },
      { emoji: '💘', label: 'Heart with Arrow' },
      { emoji: '❤️', label: 'Red Heart' },
      { emoji: '🥰', label: 'Smiling with Hearts' },
      { emoji: '💍', label: 'Diamond Ring' },
      { emoji: '💐', label: 'Bouquet' },
      { emoji: '💓', label: 'Beating Heart' },
      { emoji: '💞', label: 'Revolving Hearts' },
      { emoji: '🧸', label: 'Teddy Bear' },
      { emoji: '🥀', label: 'Wilted Rose' },
    ],
  },
  {
    group: 'Launch & Success',
    icon: '🚀',
    stickers: [
      { emoji: '🚀', label: 'Rocket Launch' },
      { emoji: '🏆', label: 'Trophy' },
      { emoji: '⭐', label: 'Glowing Star' },
      { emoji: '💎', label: 'Diamond' },
      { emoji: '🔥', label: 'Fire' },
      { emoji: '⚡', label: 'High Voltage' },
      { emoji: '🎯', label: 'Bullseye' },
      { emoji: '💡', label: 'Bright Idea' },
      { emoji: '📈', label: 'Chart Increasing' },
      { emoji: '🌐', label: 'Globe' },
      { emoji: '🥇', label: '1st Place Medal' },
      { emoji: '📣', label: 'Megaphone' },
      { emoji: '🦾', label: 'Mechanical Arm' },
      { emoji: '🦄', label: 'Unicorn' },
      { emoji: '💰', label: 'Money Bag' },
      { emoji: '💯', label: 'Hundred Points' },
    ],
  },
  {
    group: 'Vibes & Aesthetic',
    icon: '🌙',
    stickers: [
      { emoji: '🌙', label: 'Crescent Moon' },
      { emoji: '🌟', label: 'Glowing Star' },
      { emoji: '🫶', label: 'Heart Hands' },
      { emoji: '🌸', label: 'Cherry Blossom' },
      { emoji: '🦋', label: 'Butterfly' },
      { emoji: '🌊', label: 'Ocean Wave' },
      { emoji: '☁️', label: 'Cloud' },
      { emoji: '🎶', label: 'Musical Notes' },
      { emoji: '☕', label: 'Hot Beverage' },
      { emoji: '🌈', label: 'Rainbow' },
      { emoji: '💫', label: 'Dizzy Star' },
      { emoji: '🔮', label: 'Crystal Ball' },
      { emoji: '🌻', label: 'Sunflower' },
      { emoji: '🍃', label: 'Fluttering Leaf' },
      { emoji: '☀️', label: 'Sun with Rays' },
      { emoji: '🎨', label: 'Artist Palette' },
    ],
  },
  {
    group: 'Fun & Expressions',
    icon: '✨',
    stickers: [
      { emoji: '🥺', label: 'Pleading Face' },
      { emoji: '🤩', label: 'Star-Struck' },
      { emoji: '🫡', label: 'Saluting Face' },
      { emoji: '🤝', label: 'Handshake' },
      { emoji: '🍀', label: 'Four Leaf Clover' },
      { emoji: '🧿', label: 'Nazar Amulet' },
      { emoji: '🤍', label: 'White Heart' },
      { emoji: '🪐', label: 'Ringed Planet' },
      { emoji: '🍸', label: 'Cocktail Glass' },
      { emoji: '🕯️', label: 'Candle' },
      { emoji: '🌺', label: 'Hibiscus' },
      { emoji: '🕶️', label: 'Sunglasses' },
      { emoji: '🎸', label: 'Guitar' },
      { emoji: '🍿', label: 'Popcorn' },
      { emoji: '👑', label: 'Royal Crown' },
      { emoji: '⚡', label: 'Lightning' },
    ],
  },
]

// "All" flattened list for the All tab
const ALL_STICKERS = Array.from(
  new Map(STICKER_CATALOG.flatMap(c => c.stickers).map(s => [s.emoji, s])).values()
)

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

interface StickerPickerProps {
  stickers: Sticker[]
  onChange: (stickers: Sticker[]) => void
  selectedId?: string | null
  onSelectId?: (id: string | null) => void
}

export function StickerPicker({ 
  stickers, 
  onChange,
  selectedId: externalSelectedId,
  onSelectId: externalOnSelectId
}: StickerPickerProps) {
  // -1 = All, 0..N = index in STICKER_CATALOG
  const [activeGroup, setActiveGroup] = useState<number>(-1)
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  const selectedId = externalSelectedId !== undefined ? externalSelectedId : internalSelectedId
  const setSelectedId = (id: string | null) => {
    if (externalOnSelectId) externalOnSelectId(id)
    setInternalSelectedId(id)
  }

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -160 : 160,
        behavior: 'smooth'
      })
    }
  }

  const addSticker = (emoji: string) => {
    if (stickers.length >= 5) return
    // Stagger slightly near center
    const offset = (stickers.length * 8) % 24
    const newSticker: Sticker = {
      id: uid(),
      emoji,
      x: 50 + (stickers.length % 2 === 0 ? offset : -offset),
      y: 50 + (stickers.length % 3 === 0 ? offset : -offset),
      opacity: 0.95,
      size: 3.5,
    }
    onChange([...stickers, newSticker])
    setSelectedId(newSticker.id)
  }

  const removeSticker = (id: string) => {
    onChange(stickers.filter(s => s.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const currentStickers = activeGroup === -1 
    ? ALL_STICKERS 
    : STICKER_CATALOG[activeGroup]?.stickers || []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
              Sticker Decorations
            </h4>
          </div>
          <p className="text-[11px] text-secondary mt-0.5">
            Choose up to 5 stickers and drag them directly on your card preview
          </p>
        </div>
        <div className="flex items-center gap-2">
          {stickers.length > 0 && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300">
              {stickers.length}/5 placed
            </span>
          )}
        </div>
      </div>

      {/* Category Tabs with Chevron Scroll Arrows */}
      <div className="relative flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => scrollTabs('left')}
          className="w-7 h-7 rounded-full bg-background-elevated/80 border border-primary/15 text-secondary hover:text-primary hover:bg-background-elevated flex items-center justify-center shrink-0 shadow-xs active:scale-95 transition-all"
          title="Scroll categories left"
          aria-label="Scroll left"
        >
          <ChevronLeft size={15} />
        </button>

        <div 
          ref={tabsRef}
          onWheel={(e) => {
            if (tabsRef.current && e.deltaY !== 0) {
              tabsRef.current.scrollLeft += e.deltaY
            }
          }}
          className="flex gap-1.5 overflow-x-auto py-1 custom-scrollbar scroll-smooth flex-1 select-none"
        >
          {/* All Tab */}
          <button
            type="button"
            onClick={() => setActiveGroup(-1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
              activeGroup === -1
                ? 'bg-amber-500/25 border border-amber-400/60 text-amber-300 font-bold shadow-xs'
                : 'bg-background-elevated/60 border border-primary/10 text-secondary hover:text-primary hover:border-primary/25'
            }`}
          >
            <span>✨</span>
            <span>All ({ALL_STICKERS.length})</span>
          </button>

          {STICKER_CATALOG.map((group, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveGroup(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                activeGroup === i
                  ? 'bg-amber-500/25 border border-amber-400/60 text-amber-300 font-bold shadow-xs'
                  : 'bg-background-elevated/60 border border-primary/10 text-secondary hover:text-primary hover:border-primary/25'
              }`}
            >
              <span>{group.icon}</span>
              <span>{group.group}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scrollTabs('right')}
          className="w-7 h-7 rounded-full bg-background-elevated/80 border border-primary/15 text-secondary hover:text-primary hover:bg-background-elevated flex items-center justify-center shrink-0 shadow-xs active:scale-95 transition-all"
          title="Scroll categories right"
          aria-label="Scroll right"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Scrollable Sticker Grid */}
      <div className="relative border border-primary/10 rounded-2xl p-2.5 bg-background-muted/40">
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
          {currentStickers.map(({ emoji, label }) => {
            const alreadyPlaced = stickers.some(s => s.emoji === emoji)
            const isMax = stickers.length >= 5 && !alreadyPlaced
            return (
              <button
                key={emoji}
                type="button"
                title={`${label}${alreadyPlaced ? ' (Placed — Click to select on card)' : isMax ? ' (Max 5 placed)' : ' (Click to place on card)'}`}
                disabled={isMax}
                onClick={() => {
                  if (alreadyPlaced) {
                    const existing = stickers.find(s => s.emoji === emoji)
                    if (existing) setSelectedId(existing.id)
                  } else {
                    addSticker(emoji)
                  }
                }}
                className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all border select-none relative ${
                  alreadyPlaced
                    ? 'bg-amber-500/20 border-amber-400/70 ring-2 ring-amber-400/50 scale-100 shadow-xs'
                    : isMax
                    ? 'bg-background-elevated/20 border-primary/5 opacity-30 cursor-not-allowed'
                    : 'bg-background-elevated/70 border-primary/10 hover:bg-amber-500/15 hover:border-amber-400/40 hover:scale-110 active:scale-95 shadow-xs'
                }`}
              >
                {emoji}
                {alreadyPlaced && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-background shadow-xs" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
