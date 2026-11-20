'use client'

import { useState } from 'react'
import { PencilLine, Clock } from 'lucide-react'
import { EditMessageModal } from '@/components/EditMessageModal'

export function EditMessageButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 font-medium text-sm text-left">
          <Clock size={20} className="shrink-0" />
          <p>Changed your mind? Edit your message with your token any time before it goes live.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 whitespace-nowrap px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <PencilLine size={16} />
          <span>Edit Message</span>
        </button>
      </div>

      <EditMessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
