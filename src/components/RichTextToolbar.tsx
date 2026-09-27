'use client'

import { useState } from 'react'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Smile } from 'lucide-react'

export interface StyleConfig {
  fontFamily: string
  fontSize: string
  color: string
  align: string
  bold: boolean
  italic: boolean
  underline: boolean
}

export const DEFAULT_STYLE: StyleConfig = {
  fontFamily: 'serif',
  fontSize: 'text-2xl',
  color: '',
  align: 'text-center',
  bold: false,
  italic: false,
  underline: false,
}

const FONTS = [
  { label: 'Serif', value: 'serif', class: 'font-serif' },
  { label: 'Sans', value: 'sans', class: 'font-sans' },
  { label: 'Mono', value: 'mono', class: 'font-mono' },
  { label: 'Hand', value: 'hand', class: 'font-["Caveat",cursive]' },
  { label: 'Display', value: 'display', class: 'font-["Playfair_Display",serif]' },
]

const SIZES = [
  { label: 'S', value: 'text-lg' },
  { label: 'M', value: 'text-2xl' },
  { label: 'L', value: 'text-4xl' },
  { label: 'XL', value: 'text-6xl' },
]

const CATEGORY_COLORS: Record<string, string[]> = {
  love: ['#f43f5e', '#fb7185', '#fda4af', '#fff1f2', '#c026d3', '#f0abfc'],
  confession: ['#a78bfa', '#7c3aed', '#ddd6fe', '#f5d0fe', '#e879f9', '#ffffff'],
  celebration: ['#fbbf24', '#f59e0b', '#fde68a', '#fb923c', '#f97316', '#ffffff'],
  gratitude: ['#34d399', '#10b981', '#a7f3d0', '#6ee7b7', '#059669', '#ffffff'],
  apology: ['#94a3b8', '#64748b', '#cbd5e1', '#e2e8f0', '#475569', '#ffffff'],
  motivation: ['#38bdf8', '#0ea5e9', '#bae6fd', '#7dd3fc', '#0284c7', '#ffffff'],
  general: ['#e2e8f0', '#94a3b8', '#64748b', '#334155', '#ffffff', '#000000'],
}

const COMMON_EMOJIS = ['❤️', '🔥', '✨', '💫', '🌹', '🎉', '🙏', '💔', '😢', '🫂', '💌', '🌙', '⭐', '🦋', '🌊']

interface RichTextToolbarProps {
  style: StyleConfig
  categorySlug: string
  onChange: (style: StyleConfig) => void
  onInsertEmoji: (emoji: string) => void
}

export function RichTextToolbar({ style, categorySlug, onChange, onInsertEmoji }: RichTextToolbarProps) {
  const [showEmoji, setShowEmoji] = useState(false)

  const colors = CATEGORY_COLORS[categorySlug] || CATEGORY_COLORS.general

  const set = (updates: Partial<StyleConfig>) => onChange({ ...style, ...updates })

  const fontClass = FONTS.find(f => f.value === style.fontFamily)?.class || 'font-serif'

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-1 p-2 bg-background border border-primary/20 rounded-xl mb-3">
        
        {/* Font Family */}
        <div className="flex items-center gap-0.5 border-r border-primary/10 pr-2 mr-1">
          {FONTS.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => set({ fontFamily: f.value })}
              title={f.label}
              className={`px-2 py-1 text-xs rounded-md transition-all ${f.class} ${
                style.fontFamily === f.value
                  ? 'bg-primary text-background'
                  : 'text-secondary hover:bg-background-elevated'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Size */}
        <div className="flex items-center gap-0.5 border-r border-primary/10 pr-2 mr-1">
          {SIZES.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => set({ fontSize: s.value })}
              className={`w-7 h-7 text-xs font-bold rounded-md transition-all ${
                style.fontSize === s.value
                  ? 'bg-primary text-background'
                  : 'text-secondary hover:bg-background-elevated'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Bold / Italic / Underline */}
        <div className="flex items-center gap-0.5 border-r border-primary/10 pr-2 mr-1">
          <button
            type="button"
            onClick={() => set({ bold: !style.bold })}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${style.bold ? 'bg-primary text-background' : 'text-secondary hover:bg-background-elevated'}`}
          >
            <Bold size={13} />
          </button>
          <button
            type="button"
            onClick={() => set({ italic: !style.italic })}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${style.italic ? 'bg-primary text-background' : 'text-secondary hover:bg-background-elevated'}`}
          >
            <Italic size={13} />
          </button>
          <button
            type="button"
            onClick={() => set({ underline: !style.underline })}
            className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${style.underline ? 'bg-primary text-background' : 'text-secondary hover:bg-background-elevated'}`}
          >
            <Underline size={13} />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 border-r border-primary/10 pr-2 mr-1">
          {[
            { icon: AlignLeft, value: 'text-left' },
            { icon: AlignCenter, value: 'text-center' },
            { icon: AlignRight, value: 'text-right' },
          ].map(({ icon: Icon, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => set({ align: value })}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${style.align === value ? 'bg-primary text-background' : 'text-secondary hover:bg-background-elevated'}`}
            >
              <Icon size={13} />
            </button>
          ))}
        </div>

        {/* Color swatches */}
        <div className="flex items-center gap-1 border-r border-primary/10 pr-2 mr-1">
          {colors.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => set({ color: style.color === c ? '' : c })}
              title={c}
              style={{ backgroundColor: c, outline: style.color === c ? `2px solid white` : 'none', outlineOffset: '1px' }}
              className={`w-5 h-5 rounded-full border border-primary/20 transition-transform hover:scale-110 ${style.color === c ? 'ring-2 ring-offset-1 ring-white' : ''}`}
            />
          ))}
          {/* Reset color */}
          {style.color && (
            <button
              type="button"
              onClick={() => set({ color: '' })}
              className="w-5 h-5 rounded-full border border-dashed border-secondary flex items-center justify-center text-[8px] text-secondary hover:text-primary"
            >
              ✕
            </button>
          )}
        </div>

        {/* Emoji */}
        <button
          type="button"
          onClick={() => setShowEmoji(!showEmoji)}
          className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${showEmoji ? 'bg-primary text-background' : 'text-secondary hover:bg-background-elevated'}`}
        >
          <Smile size={14} />
        </button>
      </div>

      {/* Emoji Panel */}
      {showEmoji && (
        <div className="absolute z-20 top-full left-0 mt-1 p-3 bg-background-elevated border border-primary/20 rounded-xl shadow-xl flex flex-wrap gap-2 w-64">
          {COMMON_EMOJIS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => { onInsertEmoji(emoji); setShowEmoji(false) }}
              className="text-2xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Helper: convert StyleConfig to Tailwind class string
export function styleToClasses(style: StyleConfig): string {
  const fontMap: Record<string, string> = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono',
    hand: 'font-[Caveat]',
    display: 'font-[Playfair_Display]',
  }
  return [
    fontMap[style.fontFamily] || 'font-serif',
    style.fontSize,
    style.align,
    style.bold ? 'font-bold' : '',
    style.italic ? 'italic' : '',
    style.underline ? 'underline' : '',
  ].filter(Boolean).join(' ')
}
