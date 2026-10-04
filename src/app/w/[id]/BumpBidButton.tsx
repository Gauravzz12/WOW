'use client'

import { useState } from 'react'
import { Zap, AlertTriangle, Loader2, X } from 'lucide-react'
import { toast } from '@/components/Toast'
import { bumpBid } from '@/app/checkout/[id]/actions'

export function BumpBidButton({ messageId, currentBid }: { messageId: string, currentBid: number }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [bumpAmount, setBumpAmount] = useState('1.00')

  const handleBump = async () => {
    const amount = parseFloat(bumpAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid bump amount.')
      return
    }

    setIsProcessing(true)
    const result = await bumpBid(messageId, amount)
    setIsProcessing(false)
    if (result.success && result.redirectUrl) {
      window.location.href = result.redirectUrl
    } else if (result.success) {
      toast.success(`Bid increased by $${amount.toFixed(2)}! Your rank has been updated.`)
      setIsModalOpen(false)
    } else {
      toast.error(result.error || 'Failed to bump bid.')
    }
  }

  return (
    <>
      <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400 font-medium text-sm text-left">
          <AlertTriangle size={20} className="shrink-0" />
          <p>Want to climb higher in the queue? Increase your bid to outrank others.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 whitespace-nowrap px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          <Zap size={16} />
          <span>Bump Bid (+)</span>
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isProcessing && setIsModalOpen(false)} />
          <div className="relative z-10 w-full max-w-sm bg-background-elevated border border-primary/20 rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Bump Your Bid</h3>
              <button disabled={isProcessing} onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-primary/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-secondary mb-4">
              Current Bid: <span className="font-bold text-primary">${currentBid?.toFixed(2) || '0.00'}</span>
            </p>
            <div className="mb-4 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary font-medium">$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={bumpAmount}
                onChange={(e) => setBumpAmount(e.target.value)}
                disabled={isProcessing}
                className="w-full pl-7 pr-4 py-3 rounded-xl bg-background border border-primary/20 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all font-mono"
                placeholder="Amount to add"
              />
            </div>
            <button
              onClick={handleBump}
              disabled={isProcessing || !bumpAmount || parseFloat(bumpAmount) <= 0}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
              Confirm Bump (+${parseFloat(bumpAmount || '0').toFixed(2)})
            </button>
          </div>
        </div>
      )}
    </>
  )
}
