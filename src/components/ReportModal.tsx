'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Send } from 'lucide-react'
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-background border border-primary/15 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-background-elevated flex items-center justify-center text-secondary hover:text-primary transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary">Report this Broadcast</h3>
                  <p className="text-xs text-secondary font-mono">Message ID: #{messageId.slice(0, 8)}</p>
                </div>
              </div>

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

              {/* Reasons list */}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedReason === r.id
                        ? 'bg-rose-500/10 border-rose-500/40 text-primary font-medium'
                        : 'bg-background-elevated/30 border-primary/10 text-secondary hover:bg-background-elevated/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={r.id}
                      checked={selectedReason === r.id}
                      onChange={() => setSelectedReason(r.id)}
                      className="accent-rose-500"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>

              {/* Optional context */}
              <div>
                <label className="block text-xs font-medium text-secondary mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Explain why this content should be removed..."
                  maxLength={500}
                  rows={3}
                  className="w-full bg-background-elevated/40 border border-primary/15 rounded-2xl p-3 text-xs text-primary focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 rounded-full border border-primary/10 text-xs font-semibold text-secondary hover:text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>Submitting...</span>
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
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-serif font-bold text-primary">Report Submitted</h3>
              <p className="text-xs text-secondary max-w-sm mx-auto leading-relaxed">
                Thank you for keeping Words of the World safe. An expedited alert has been dispatched to our 24/7 moderation team for immediate review and takedown if deemed in violation.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-8 py-3 rounded-full bg-primary text-background text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
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
