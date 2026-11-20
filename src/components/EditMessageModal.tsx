'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PencilLine, X, Check, AlertTriangle, ShieldCheck } from 'lucide-react'
import { verifyTokenAction } from '@/app/actions/bumpActions'
import { editMessageAction } from '@/app/actions/editActions'
import type { VerifiedBumpMessage } from '@/lib/bumpToken'
import { toast } from '@/components/Toast'

const MAX_WORDS = 150
const MAX_CHARS = 1500

export function EditMessageModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [tokenInput, setTokenInput] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)

  const [verifiedMsg, setVerifiedMsg] = useState<VerifiedBumpMessage | null>(null)
  const [activeToken, setActiveToken] = useState('')
  const [draft, setDraft] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const wordCount = draft.trim() ? draft.trim().split(/\s+/).filter(Boolean).length : 0
  const overLimit = wordCount > MAX_WORDS || draft.length > MAX_CHARS
  const unchanged = !!verifiedMsg && draft.trim() === (verifiedMsg.content || '').trim()

  const handleVerify = async () => {
    const t = tokenInput.trim()
    if (!t) {
      setVerifyError('Please enter your token.')
      return
    }
    setIsVerifying(true)
    setVerifyError(null)
    setSaveError(null)
    const res = await verifyTokenAction(t)
    setIsVerifying(false)
    if (res.error || !res.message) {
      setVerifyError(res.error || 'Token is invalid, or this message has already gone live and can no longer be edited.')
      setVerifiedMsg(null)
      setActiveToken('')
    } else {
      setVerifiedMsg(res.message)
      setActiveToken(t)
      setDraft(res.message.content || '')
      setSaved(false)
    }
  }

  const handleReset = () => {
    setVerifiedMsg(null)
    setActiveToken('')
    setTokenInput('')
    setVerifyError(null)
    setSaveError(null)
    setSaved(false)
  }

  const handleSave = async () => {
    if (!verifiedMsg || !activeToken || overLimit || unchanged) return
    setIsSaving(true)
    setSaveError(null)
    const res = await editMessageAction(activeToken, draft)
    setIsSaving(false)
    if (res.error) {
      setSaveError(res.error)
    } else {
      setSaved(true)
      setVerifiedMsg({ ...verifiedMsg, content: res.content || draft.trim() })
      toast.success('Your message has been updated.', { title: 'Edit Saved' })
    }
  }

  const handleClose = () => {
    if (saved) router.refresh()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-background-elevated border border-primary/20 rounded-lg p-6 md:p-8 shadow-none flex flex-col space-y-6 text-left"
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 rounded-full text-secondary hover:text-primary hover:bg-background-muted transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 pr-8">
              <div className="w-11 h-11 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                <PencilLine size={22} />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-primary">Edit Your Message</h2>
                <p className="text-xs text-secondary mt-0.5">
                  You can change your message any time before it goes live. Edits go through the same content filter as new posts.
                </p>
              </div>
            </div>

            {!verifiedMsg ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-primary block mb-1.5">
                    Your Secret Token
                  </label>
                  <p className="text-[11px] text-secondary mb-2 leading-relaxed">
                    Enter the token from your receipt email (format: <code className="text-emerald-500">bmp_...</code>) — the same one used for bid bumps.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value.trim())}
                      placeholder="e.g. bmp_a8f9c1d2e3f4..."
                      className="flex-1 bg-background border border-primary/20 rounded-xl px-3.5 py-2.5 text-sm text-primary font-mono placeholder:text-secondary/50 focus:outline-none focus:border-emerald-500 transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleVerify()
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={isVerifying || !tokenInput.trim()}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify'}
                    </button>
                  </div>
                </div>

                {verifyError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 flex items-start gap-2">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                    <span>{verifyError}</span>
                  </div>
                )}

                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-[11px] text-secondary space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-primary">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    <span>When editing closes</span>
                  </div>
                  <p className="leading-relaxed">
                    Editing is open while your message is waiting in the pool or locked into a lineup. The moment it goes live on stage, the text is final.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                    {verifiedMsg.categoryName} • Current Bid ${verifiedMsg.bid_amount.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] text-emerald-500 hover:underline font-medium"
                  >
                    Change Token
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold text-primary block mb-1.5">
                    Message Text
                  </label>
                  <textarea
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value)
                      setSaved(false)
                    }}
                    rows={5}
                    className="w-full bg-background border border-primary/20 rounded-xl px-3.5 py-3 text-sm text-primary placeholder:text-secondary/50 focus:outline-none focus:border-emerald-500 transition-colors resize-y"
                    placeholder="Write your message…"
                  />
                  <div className="flex items-center justify-between mt-1.5 text-[11px]">
                    <span className={overLimit ? 'text-red-500 font-semibold' : 'text-secondary'}>
                      {wordCount} / {MAX_WORDS} words · {draft.length} / {MAX_CHARS} characters
                    </span>
                    <span className="text-secondary">Saved as plain text</span>
                  </div>
                </div>

                {saveError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 flex items-start gap-2">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                    <span>{saveError}</span>
                  </div>
                )}

                {saved && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                    <Check size={15} className="shrink-0 mt-0.5" />
                    <span>Saved — this is the text that will broadcast.</span>
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSaving}
                    className="flex-1 py-3 rounded-full border border-primary/20 hover:bg-background-muted text-primary text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {saved ? 'Done' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || overLimit || unchanged}
                    className="flex-1 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <PencilLine size={14} />
                    <span>{isSaving ? 'Checking & Saving…' : 'Save Edit'}</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
