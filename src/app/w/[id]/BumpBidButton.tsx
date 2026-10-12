'use client'

import { useState } from 'react'
import { Zap, AlertTriangle } from 'lucide-react'
import { BumpBidModal } from '@/components/BumpBidModal'

export function BumpBidButton({ 
  messageId, 
  currentBid 
}: { 
  messageId: string
  currentBid: number 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400 font-medium text-sm text-left">
          <AlertTriangle size={20} className="shrink-0" />
          <p>Want to climb higher in the queue? Enter your secret bump token to boost your bid.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 whitespace-nowrap px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Zap size={16} />
          <span>Bump Bid (+)</span>
        </button>
      </div>

      <BumpBidModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
