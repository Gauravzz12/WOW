'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, X, Check, Copy, AlertTriangle, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'
import { verifyTokenAction, createBumpCheckoutAction } from '@/app/actions/bumpActions'
import type { VerifiedBumpMessage } from '@/lib/bumpToken'

export function BumpBidModal({
  isOpen,
  onClose,
  initialToken = ''
}: {
  isOpen: boolean
  onClose: () => void
  initialToken?: string
}) {
  const [tokenInput, setTokenInput] = useState(initialToken)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  
  const [verifiedMsg, setVerifiedMsg] = useState<VerifiedBumpMessage | null>(null)
  const [activeToken, setActiveToken] = useState<string>('')
  
  const [newBidInput, setNewBidInput] = useState<number | ''>('')
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  // Auto-verify if initialToken provided
  useEffect(() => {
    if (initialToken && isOpen) {
      setTokenInput(initialToken)
      handleVerify(initialToken)
    }
  }, [initialToken, isOpen])

  const handleVerify = async (tokenToVerify?: string) => {
    const t = (tokenToVerify || tokenInput).trim()
    if (!t) {
      setVerifyError('Please enter your bump token.')
      return
    }

    setIsVerifying(true)
    setVerifyError(null)
    setCheckoutError(null)

    const res = await verifyTokenAction(t)
    setIsVerifying(false)

    if (res.error || !res.message) {
      setVerifyError(res.error || 'Token is invalid or message is no longer in the queue.')
      setVerifiedMsg(null)
      setActiveToken('')
    } else {
      setVerifiedMsg(res.message)
      setActiveToken(t)
      // Default suggested bid: current highest + $1, or current + $5
      const targetTakeOne = (res.message.highestQueuedBid || res.message.bid_amount) + 1
      const defaultSuggested = Math.max(res.message.bid_amount + 5, targetTakeOne)
      setNewBidInput(defaultSuggested)
    }
  }

  const handleReset = () => {
    setVerifiedMsg(null)
    setActiveToken('')
    setTokenInput('')
    setVerifyError(null)
    setCheckoutError(null)
  }

  const currentBid = verifiedMsg?.bid_amount || 0
  const candidateBid = typeof newBidInput === 'number' ? newBidInput : 0
  const difference = Math.max(0, Math.round((candidateBid - currentBid) * 100) / 100)
  const isBidValid = candidateBid > currentBid && difference >= 1

  const handleCheckout = async () => {
    if (!verifiedMsg || !activeToken || !isBidValid) return

    setIsCheckingOut(true)
    setCheckoutError(null)

    const res = await createBumpCheckoutAction(activeToken, candidateBid)
    setIsCheckingOut(false)

    if (res.error || !res.redirectUrl) {
      setCheckoutError(res.error || 'Failed to start payment session.')
    } else {
      // Redirect to Dodo Payments checkout for the difference
      window.location.href = res.redirectUrl
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-background-elevated border border-primary/20 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col space-y-6 text-left"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-secondary hover:text-primary hover:bg-background-muted transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 pr-8">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
                <Zap size={22} className="fill-amber-500/50" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-primary">Bump Your Priority Bid</h2>
                <p className="text-xs text-secondary mt-0.5">
                  Boost your message up the queue anytime before it broadcasts.
                </p>
              </div>
            </div>

            {/* STEP 1: TOKEN VERIFICATION (If not yet verified) */}
            {!verifiedMsg ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-primary block mb-1.5">
                    Your Secret Bump Token
                  </label>
                  <p className="text-[11px] text-secondary mb-2 leading-relaxed">
                    Enter the secret token from your receipt email (format: <code className="text-amber-500">bmp_...</code>).
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value.trim())}
                      placeholder="e.g. bmp_a8f9c1d2e3f4..."
                      className="flex-1 bg-background border border-primary/20 rounded-xl px-3.5 py-2.5 text-sm text-primary font-mono placeholder:text-secondary/50 focus:outline-none focus:border-amber-500 transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleVerify()
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleVerify()}
                      disabled={isVerifying || !tokenInput.trim()}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
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
                    <span>How Token Security Works</span>
                  </div>
                  <p className="leading-relaxed">
                    Tokens are cryptographically signed. Upon each successful bump, your old token is permanently revoked and a new secret token is issued to your email.
                  </p>
                </div>
              </div>
            ) : (
              /* STEP 2: VERIFIED MESSAGE & BID SELECTION */
              <div className="space-y-5">
                {/* Message & Current Stats Card */}
                <div className="p-4 rounded-2xl bg-background border border-primary/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                      {verifiedMsg.categoryName} • Rank #{verifiedMsg.currentRank}
                    </span>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-[11px] text-amber-500 hover:underline font-medium"
                    >
                      Change Token
                    </button>
                  </div>

                  <p className="font-serif italic text-xs text-primary/90 line-clamp-2 leading-relaxed">
                    &ldquo;{verifiedMsg.content}&rdquo;
                  </p>

                  <div className="pt-2 border-t border-primary/10 grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 bg-primary/5 rounded-xl">
                      <span className="text-[10px] text-secondary block">Current Bid</span>
                      <span className="font-mono font-bold text-primary text-sm">
                        ${verifiedMsg.bid_amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-2 bg-primary/5 rounded-xl">
                      <span className="text-[10px] text-secondary block">Top Queue Bid</span>
                      <span className="font-mono font-bold text-amber-500 text-sm">
                        ${verifiedMsg.highestQueuedBid.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Bump Buttons */}
                <div>
                  <label className="text-xs font-semibold text-primary block mb-2">
                    Quick Boost Options
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewBidInput(verifiedMsg.highestQueuedBid + 1)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                        newBidInput === verifiedMsg.highestQueuedBid + 1
                          ? 'border-amber-500 bg-amber-500/15 text-amber-500 font-bold'
                          : 'border-primary/10 bg-primary/5 hover:border-primary/20 text-primary'
                      }`}
                    >
                      <span className="text-[10px] uppercase text-secondary">Take #1</span>
                      <span className="font-mono">${(verifiedMsg.highestQueuedBid + 1).toFixed(2)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewBidInput(currentBid + 5)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                        newBidInput === currentBid + 5
                          ? 'border-amber-500 bg-amber-500/15 text-amber-500 font-bold'
                          : 'border-primary/10 bg-primary/5 hover:border-primary/20 text-primary'
                      }`}
                    >
                      <span className="text-[10px] uppercase text-secondary">Boost +$5</span>
                      <span className="font-mono">${(currentBid + 5).toFixed(2)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewBidInput(currentBid + 10)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                        newBidInput === currentBid + 10
                          ? 'border-amber-500 bg-amber-500/15 text-amber-500 font-bold'
                          : 'border-primary/10 bg-primary/5 hover:border-primary/20 text-primary'
                      }`}
                    >
                      <span className="text-[10px] uppercase text-secondary">Boost +$10</span>
                      <span className="font-mono">${(currentBid + 10).toFixed(2)}</span>
                    </button>
                  </div>
                </div>

                {/* Custom Bid Input */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-primary">
                      New Total Bid
                    </label>
                    <span className="text-[11px] text-secondary font-mono">
                      Must be &gt; ${currentBid.toFixed(2)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-secondary font-mono text-sm">$</span>
                    <input
                      type="number"
                      step="1"
                      min={currentBid + 1}
                      value={newBidInput}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        setNewBidInput(isNaN(val) ? '' : val)
                      }}
                      className="w-full bg-background border border-primary/20 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-mono text-primary focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Calculation Summary */}
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-secondary block text-[11px]">Total You Pay Today (Difference):</span>
                    <span className="text-[10px] text-secondary/70">
                      ${candidateBid.toFixed(2)} new bid &minus; ${currentBid.toFixed(2)} already paid
                    </span>
                  </div>
                  <span className="text-base font-bold font-mono text-amber-500">
                    +${difference.toFixed(2)}
                  </span>
                </div>

                {checkoutError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500">
                    {checkoutError}
                  </div>
                )}

                {/* Action Button */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isCheckingOut}
                    className="flex-1 py-3 rounded-full border border-primary/20 hover:bg-background-muted text-primary text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isCheckingOut || !isBidValid}
                    className="flex-1 py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isCheckingOut ? (
                      'Redirecting to checkout...'
                    ) : (
                      <>
                        <Zap size={14} className="fill-black" />
                        <span>Pay +${difference.toFixed(2)} & Bump</span>
                      </>
                    )}
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
