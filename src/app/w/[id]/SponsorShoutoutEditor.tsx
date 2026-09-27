'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { updateSponsorShoutout } from './actions'

export function SponsorShoutoutEditor({
  messageId,
  initialName = '',
  initialNote = '',
  justSponsored = false,
}: {
  messageId: string
  initialName?: string
  initialNote?: string
  justSponsored?: boolean
}) {
  const [name, setName] = useState(initialName)
  const [note, setNote] = useState(initialNote)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const words = note.trim() ? note.trim().split(/\s+/).filter(Boolean).length : 0

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    const res = await updateSponsorShoutout(messageId, { sponsorName: name, sponsorNote: note })
    setSaving(false)
    if ((res as any).error) {
      setError((res as any).error)
    } else {
      setSaved(true)
      window.location.reload()
    }
  }

  return (
    <div className="p-4 bg-background rounded-2xl border border-primary/10 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Sparkles size={13} className="text-amber-500" />
          <span>{justSponsored ? 'Now that you’ve seen the full message — add your shoutout' : 'Sponsor shoutout'}</span>
        </label>
        <span className="text-[10px] text-secondary font-mono">12 words max</span>
      </div>
      {justSponsored && (
        <p className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2">
          Payment successful — full message revealed. Add or edit your dedication below, then join the comments.
        </p>
      )}
      <div>
        <label className="text-[11px] text-secondary block mb-1">Your Name / Organization</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 30))}
          placeholder="e.g. Sarah K. or Acme Labs"
          maxLength={30}
          className="w-full bg-background-elevated border border-primary/20 rounded-xl px-3 py-2 text-xs text-primary placeholder:text-secondary/50 focus:outline-none focus:border-green-500 transition-colors"
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-[11px] text-secondary">Dedication (optional)</label>
          <span className="text-[10px] font-mono text-secondary">{words} / 12 words</span>
        </div>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => {
            const val = e.target.value
            const w = val.trim().split(/\s+/).filter(Boolean)
            if (w.length <= 12) setNote(val)
            else setNote(w.slice(0, 12).join(' '))
          }}
          placeholder="e.g. Keep inspiring the world! ✨"
          className="w-full bg-background-elevated border border-primary/20 rounded-xl px-3 py-2 text-xs text-primary placeholder:text-secondary/50 focus:outline-none focus:border-green-500 transition-colors resize-none leading-relaxed"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {saved && <p className="text-xs text-emerald-600">Saved!</p>}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save shoutout'}
      </button>
      <p className="text-[10px] text-secondary/70 text-center">You write this after seeing the full text — no need to guess from the teaser.</p>
    </div>
  )
}
