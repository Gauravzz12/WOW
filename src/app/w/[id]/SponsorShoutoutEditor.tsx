'use client'

import { useState } from 'react'
import { Sparkles, X, HeartHandshake, Check } from 'lucide-react'
import { updateSponsorShoutout } from './actions'
import { motion, AnimatePresence } from 'framer-motion'

export function SponsorShoutoutEditor({
  messageId,
  initialName = '',
  initialNote = '',
  justSponsored = false,
  messageContent = '',
  token,
}: {
  messageId: string
  initialName?: string
  initialNote?: string
  justSponsored?: boolean
  messageContent?: string
  token?: string
}) {
  const [isOpen, setIsOpen] = useState(justSponsored)
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
    const res = await updateSponsorShoutout(messageId, { 
      sponsorName: name, 
      sponsorNote: note,
      token
    })
    setSaving(false)
    if ((res as any).error) {
      setError((res as any).error)
    } else {
      setSaved(true)
      setTimeout(() => {
        if (justSponsored) {
          window.location.href = '/?tab=SPONSORED'
        } else {
          setIsOpen(false)
          window.location.reload()
        }
      }, 600)
    }
  }

  const handleClose = () => {
    if (justSponsored) {
      window.location.href = '/'
    } else {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Inline banner when modal is closed (only for returning sponsors, never on the shoutout page) */}
      {!isOpen && !justSponsored && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="text-xs font-bold text-primary block">
                {name ? `Sponsored by ${name}` : 'You sponsored this message!'}
              </span>
              {note ? (
                <span className="text-[11px] text-secondary italic block">&ldquo;{note}&rdquo;</span>
              ) : (
                <span className="text-[11px] text-secondary block">Add your dedication or organization name</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="px-4 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-sm shrink-0"
          >
            Edit Shoutout
          </button>
        </div>
      )}

      {/* Prominent Sponsor Shoutout Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-background-elevated border border-primary/20 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col space-y-5 text-left"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-5 right-5 p-2 rounded-full text-secondary hover:text-primary hover:bg-background-muted transition-colors"
                aria-label="Close shoutout menu"
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 pr-8">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold text-primary">Sponsor Shoutout Menu</h2>
                  <p className="text-xs text-secondary mt-0.5">
                    {justSponsored
                      ? 'Payment successful! Add your dedication to be broadcast worldwide.'
                      : 'Edit the attribution that appears alongside this broadcast.'}
                  </p>
                </div>
              </div>

              {/* Message preview snippet */}
              {messageContent && (
                <div className="p-3.5 rounded-2xl bg-background border border-primary/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary block mb-1">
                    Message you sponsored
                  </span>
                  <p className="font-serif italic text-xs text-primary/90 line-clamp-3 leading-relaxed">
                    &ldquo;{messageContent}&rdquo;
                  </p>
                </div>
              )}

              {/* Form Inputs */}
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
                    rows={2}
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
                  <Check size={14} /> Shoutout saved successfully! Redirecting...
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={saving}
                  className="flex-1 py-3 rounded-full border border-primary/20 hover:bg-background-muted text-primary text-xs font-bold transition-colors disabled:opacity-50"
                >
                  Skip / Close
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || saved}
                  className="flex-1 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {saving ? 'Saving...' : 'Save & Broadcast'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
