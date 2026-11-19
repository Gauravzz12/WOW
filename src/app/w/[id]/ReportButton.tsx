'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { ReportModal } from '@/components/ReportModal'

/**
 * Report trigger for the /w post page. The home feed has always had one
 * (InlineInteractions), but a post opened directly — e.g. from a shared
 * link — offered no way to report it at all.
 */
export function ReportButton({ messageId, isDark = false }: { messageId: string; isDark?: boolean }) {
  const [open, setOpen] = useState(false)
  const style = isDark
    ? 'border-white/20 hover:border-white/35 bg-white/10 hover:bg-white/20 text-white/90'
    : 'border-black/10 dark:border-white/15 hover:border-black/20 dark:hover:border-white/30 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-neutral-800 dark:text-neutral-200'
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border shadow-sm transition-all active:scale-95 opacity-70 hover:opacity-100 ${style}`}
        title="Report prohibited content"
        aria-label="Report message"
      >
        <Flag size={14} />
        <span className="font-medium tracking-wide text-sm hidden md:inline">Report</span>
      </button>
      <ReportModal isOpen={open} onClose={() => setOpen(false)} messageId={messageId} />
    </>
  )
}
