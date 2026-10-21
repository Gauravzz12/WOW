'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldAlert, CheckCircle2, Send, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { submitContentReport } from '@/app/actions/reportActions'
import { toast } from '@/components/Toast'

const REPORT_REASONS = [
  { id: 'hate', label: 'Hate Speech, Slurs, or Discrimination' },
  { id: 'violence', label: 'Violent Threats, Harassment, or Doxxing' },
  { id: 'nsfw', label: 'Sexually Explicit or Prohibited NSFW Content' },
  { id: 'scam', label: 'Financial Scam, Crypto Drainer, or Phishing' },
  { id: 'drugs', label: 'Illegal Drugs, Weapons, or Contraband' },
  { id: 'language', label: 'Non-English Script or Text' },
  { id: 'other', label: 'Other Guidelines Violation' },
]

export function ReportModal({
  isOpen,
  onClose,
  messageId,
}: {
  isOpen: boolean
  onClose: () => void
  messageId: string
}) {
  const [selectedReason, setSelectedReason] = useState<string>('hate')
  const [details, setDetails] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleResetAndClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageId || isSubmitting) return

    setIsSubmitting(true)
    const reasonLabel = REPORT_REASONS.find(r => r.id === selectedReason)?.label || selectedReason

    const result = await submitContentReport({
      messageId,
      reason: reasonLabel,
      details: details.trim(),
    })

    setIsSubmitting(false)

    if (result.success) {
      setIsSubmitted(true)
      toast.success('Your report has been submitted to the moderation team.', {
        title: 'Report Received',
      })
    } else {
      toast.error(result.error || 'Failed to submit report. Please try again.', {
        title: 'Submission Error',
      })
    }
  }

  const handleResetAndClose = () => {
    setIsSubmitted(false)
    setDetails('')
    setSelectedReason('hate')
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/70 backdrop-blur-md"
        onClick={handleResetAndClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-background border border-primary/15 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[min(90vh,660px)] my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sticky Header */}
          <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-primary/10 bg-background/95 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-primary leading-tight">Report this Broadcast</h3>
                <p className="text-[11px] text-secondary font-mono">Message ID: #{messageId.slice(0, 8)}</p>
              </div>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-8 h-8 rounded-full bg-background-elevated/80 hover:bg-background-elevated flex items-center justify-center text-secondary hover:text-primary transition-colors shrink-0"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
              {/* Scrollable Content Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-4 custom-scrollbar">
                <p className="text-xs text-secondary leading-relaxed">
                  We enforce strict standards to maintain a safe, lawful billboard. Select the reason this message violates our{' '}
                  <Link href="/guidelines" target="_blank" className="text-primary underline font-medium">
                    User Guidelines
                  </Link>{' '}
                  or{' '}
                  <Link href="/content-policy" target="_blank" className="text-primary underline font-medium">
                    Content Policy
                  </Link>.
                </p>

                {/* Reasons list (integrated seamlessly into body scroll) */}
                <div className="space-y-2">
                  {REPORT_REASONS.map((r) => {
                    const isSelected = selectedReason === r.id
                    return (
                      <label
                        key={r.id}
                        className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-rose-500/10 border-rose-500/40 text-primary font-medium shadow-sm'
                            : 'bg-background-elevated/30 border-primary/10 text-secondary hover:bg-background-elevated/60 hover:text-primary'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reportReason"
                          value={r.id}
                          checked={isSelected}
                          onChange={() => setSelectedReason(r.id)}
                          className="accent-rose-500 w-4 h-4 cursor-pointer"
                        />
                        <span className="leading-snug">{r.label}</span>
                      </label>
                    )
                  })}
                </div>

                {/* Additional context textarea */}
                <div className="pt-1">
                  <label className="block text-xs font-medium text-secondary mb-1.5">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Explain why this content should be removed..."
                    maxLength={500}
                    rows={3}
                    className="w-full bg-background-elevated/40 border border-primary/15 rounded-xl sm:rounded-2xl p-3 text-xs text-primary focus:outline-none focus:border-rose-500 transition-colors resize-none placeholder:text-secondary/60"
                  />
                  <div className="text-[10px] text-secondary text-right pt-1">
                    {details.length}/500
                  </div>
                </div>
              </div>

              {/* Sticky Footer with Action Buttons */}
              <div className="flex items-center justify-end gap-3 px-5 py-3.5 sm:px-6 sm:py-4 border-t border-primary/10 bg-background/95 backdrop-blur-sm shrink-0">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 rounded-full border border-primary/10 text-xs font-semibold text-secondary hover:text-primary hover:bg-background-elevated/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Submit Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 space-y-4 my-auto">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-serif font-bold text-primary">Report Submitted</h3>
              <p className="text-xs text-secondary max-w-sm mx-auto leading-relaxed">
                Thank you for keeping Words of the World safe. An expedited alert has been dispatched to our 24/7 moderation team for immediate review and takedown if deemed in violation.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-8 py-2.5 rounded-full bg-primary text-background text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
