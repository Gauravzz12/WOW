'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Check, Eye, ArrowRight } from 'lucide-react'
import { updateSponsorShoutout } from '@/app/w/[id]/actions'

export function SponsorShoutoutForm({
  messageId,
  initialName = '',
  initialNote = '',
  token,
}: {
  messageId: string
  initialName?: string
  initialNote?: string
  token?: string
}) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [note, setNote] = useState(initialNote)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const words = note.trim() ? note.trim().split(/\s+/).filter(Boolean).length : 0

  // Celebration burst on landing — this IS the shoutout screen.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { default: confetti } = await import('canvas-confetti')
        if (cancelled) return
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.2 }, disableForReducedMotion: true })
        const t = setTimeout(() => {
          if (!cancelled) confetti({ particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.6 }, disableForReducedMotion: true })
        }, 350)
        const t2 = setTimeout(() => {
          if (!cancelled) confetti({ particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.6 }, disableForReducedMotion: true })
        }, 550)
        return () => {
          clearTimeout(t)
          clearTimeout(t2)
        }
      } catch {}
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    const res = await updateSponsorShoutout(messageId, {
      sponsorName: name,
      sponsorNote: note,
      token,
    })
    setSaving(false)
    if ((res as any).error) {
      setError((res as any).error)
    } else {
      setSaved(true)
      try {
        const { default: confetti } = await import('canvas-confetti')
        confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 }, disableForReducedMotion: true })
      } catch {}
      setTimeout(() => {
        router.push('/?tab=SPONSORED')
      }, 800)
    }
  }

  const handleSkip = () => {
    router.push('/?tab=SPONSORED')
  }

  return (
    <div className="bg-background-elevated border border-primary/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
          <Sparkles size={22} />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-primary">Add your sponsor shoutout</h2>
          <p className="text-xs text-secondary mt-0.5">
            Your name and dedication appear alongside the broadcast worldwide.
          </p>
        </div>
      </div>

      {/* Live preview of attribution */}
      <div className="p-3.5 rounded-2xl bg-background border border-primary/10 text-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1.5">
          Live preview
        </span>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs">
          <span className="text-amber-500 shrink-0">✨</span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-secondary shrink-0">Sponsored by</span>
          <span className="font-semibold text-primary shrink-0">{name.trim() || 'Your name'}</span>
          {(note.trim() || !note) && (
            <span className="text-secondary italic break-words">
              &mdash; &ldquo;{note.trim() || 'Your dedication…'}&rdquo;
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-primary block mb-1.5">
            Your Name or Organization
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 30))}
            placeholder="e.g. Sarah K. or Acme Labs"
            maxLength={30}
            className="w-full bg-background border border-primary/20 rounded-xl px-3.5 py-2.5 text-sm text-primary placeholder:text-secondary/50 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-primary">
              Dedication / Shoutout Message <span className="text-secondary font-normal">(optional)</span>
            </label>
            <span className={`text-[11px] font-mono ${words > 12 ? 'text-red-500 font-bold' : 'text-secondary'}`}>
              {words} / 12 words
            </span>
          </div>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => {
              const val = e.target.value
              const w = val.trim().split(/\s+/).filter(Boolean)
              if (w.length <= 12) setNote(val)
              else setNote(w.slice(0, 12).join(' '))
            }}
            placeholder="e.g. Keep inspiring the world! ✨"
            className="w-full bg-background border border-primary/20 rounded-xl px-3.5 py-2.5 text-sm text-primary placeholder:text-secondary/50 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl p-2.5">
          {error}
        </p>
      )}

      {saved && (
        <p className="text-xs text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 flex items-center gap-1.5 font-medium">
          <Check size={14} /> Shoutout saved! Taking you to the live broadcast…
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <button
          type="button"
          onClick={handleSkip}
          disabled={saving || saved}
          className="flex-1 py-3 rounded-full border border-primary/20 hover:bg-background-muted text-primary text-xs font-bold transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
        >
          <Eye size={14} />
          Skip for now
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || saved}
          className="flex-1 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {saving ? 'Saving…' : (
            <>
              Save & Broadcast <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>

      <a
        href={`/w/${messageId}`}
        className="block text-center text-[11px] text-secondary hover:text-primary transition-colors"
      >
        Or view the message memory page directly →
      </a>
    </div>
  )
}
