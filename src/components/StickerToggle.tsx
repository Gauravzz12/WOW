'use client'

import { useSyncExternalStore } from 'react'
import { Sparkles, EyeOff } from 'lucide-react'

/**
 * Reader-side sticker visibility.
 *
 * Stickers are part of a message's design, but they can sit on top of the
 * words. This tiny shared store lets any reading surface (stage, Special
 * stage, fullscreen, /w page) offer the same small on/off button. The
 * choice is per-device and persists in localStorage; default is ON
 * (stickers shown, exactly as the author placed them).
 */

const STORAGE_KEY = 'wow-stickers-visible'

let current: boolean | null = null
const listeners = new Set<() => void>()

function readVisible(): boolean {
  if (current === null) {
    try {
      current = window.localStorage.getItem(STORAGE_KEY) !== '0'
    } catch {
      current = true
    }
  }
  return current
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function useStickersVisible(): boolean {
  return useSyncExternalStore(subscribe, readVisible, () => true)
}

export function setStickersVisible(next: boolean) {
  current = next
  try {
    window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  } catch {
    // storage unavailable — the in-memory value still applies this session
  }
  listeners.forEach((cb) => cb())
}

/** Small pill button: "✦ Stickers on/off". Render only when a message has stickers. */
export function StickerToggleButton({ className = '' }: { className?: string }) {
  const visible = useStickersVisible()
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        setStickersVisible(!visible)
      }}
      title={visible ? 'Hide stickers for a clean read' : 'Show stickers'}
      aria-pressed={!visible}
      className={`inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-background/80 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary hover:text-primary hover:border-primary/50 transition-all active:scale-95 ${className}`}
    >
      {visible ? <Sparkles size={11} /> : <EyeOff size={11} />}
      Stickers {visible ? 'on' : 'off'}
    </button>
  )
}

/**
 * Sticker overlay layer for surfaces that don't render stickers inline
 * (e.g. the server-rendered /w page). Matches the stage/fullscreen sticker
 * markup: %-positioned, pointer-events-none, drop shadow.
 */
export function StickerLayer({ stickers }: { stickers?: any[] }) {
  const visible = useStickersVisible()
  if (!visible || !Array.isArray(stickers)) return null
  return (
    <>
      {stickers.map((sticker: any) => (
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
    </>
  )
}
