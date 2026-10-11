'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { processPayment } from './actions'
import { SlotPicker, Slot } from '@/components/SlotPicker'
import { Zap, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { calculateSpecialPrice, SPONSORED_PRICE } from '@/lib/constants/pricing'
import { toast } from '@/components/Toast'

export function CheckoutForm({ 
  messageId, 
  baseAmount,
  isReservedSlot = false,
  isSponsorMode = false,
  isSponsoredTier = false,
  initialSlotIds = [],
  initialSlots = []
}: { 
  messageId: string, 
  baseAmount: number,
  isReservedSlot?: boolean,
  isSponsorMode?: boolean,
  isSponsoredTier?: boolean,
  initialSlotIds?: string[],
  initialSlots?: Slot[]
}) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>(initialSlots)
  const [isEditingSlots, setIsEditingSlots] = useState(initialSlots.length === 0)
  const [currentBid, setCurrentBid] = useState(baseAmount)
  const [queueBids, setQueueBids] = useState<number[]>([])
  
  // Realtime queue monitoring on checkout to detect if someone outbid while checking out
  useEffect(() => {
    if (isReservedSlot || isSponsorMode || isSponsoredTier) return

    const supabase = createClient()
    const fetchBids = async () => {
      // Exclude our own message: the moment payment succeeds it joins QUEUED
      // itself, and counting it would raise a false "outbid" alert against
      // our own bid (e.g. $35 <= $35).
      const { data } = await supabase
        .from('messages')
        .select('bid_amount')
        .eq('status', 'QUEUED')
        .eq('is_reserved_slot', false)
        .gte('bid_amount', 10)
        .neq('id', messageId)
        .order('bid_amount', { ascending: false })

      if (data) {
        setQueueBids(data.map(d => d.bid_amount || 0))
      }
    }

    fetchBids()

    const channel = supabase.channel(`checkout_queue_${messageId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchBids()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [messageId, isReservedSlot, isSponsorMode, isSponsoredTier])

  const highestQueuedBid = queueBids.length > 0 ? queueBids[0] : 0
  const isOutbid = !isReservedSlot && !isSponsorMode && queueBids.length > 0 && currentBid <= highestQueuedBid
  const liveRank = queueBids.filter(b => b > currentBid).length + 1

  const specialPricing = calculateSpecialPrice(selectedSlots.length)
  const total = isSponsorMode
    ? SPONSORED_PRICE 
    : isReservedSlot 
    ? specialPricing.finalPrice 
    : currentBid

  const handlePay = async () => {
    setIsProcessing(true)
    const result = await processPayment(
      messageId, 
      isReservedSlot ? selectedSlots.map(s => s.id) : null, 
      total, 
      isSponsorMode,
      undefined
    )
    
    if (result.success && result.redirectUrl) {
      window.location.href = result.redirectUrl
    } else if (result.success) {
      if (isSponsorMode) {
        toast.success('Payment successful! Revealing the full message — you can add your shoutout next.', {
          title: 'Sponsorship Confirmed'
        })
        router.push(`/w/${messageId}?justSponsored=1`)
        return
      }
      const tabParam = isReservedSlot ? 'SPECIAL' : 'NORMAL'
      toast.success(
        isReservedSlot && selectedSlots.length > 0 
          ? `Payment successful! Your special message is reserved for ${selectedSlots.length * 3} hours starting ${new Date(selectedSlots[0].scheduled_start).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}.`
          : 'Payment successful! The message is now in the queue.',
        { title: 'Payment Confirmed' }
      )
      router.push(`/?tab=${tabParam}`)
    } else {
      toast.error(result.error || 'Payment failed.', { title: 'Payment Failed' })
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {isSponsoredTier ? (
        <div className="space-y-4">
          <div className="p-4 bg-blue-500/10 border border-blue-500/25 rounded-2xl text-blue-700 dark:text-blue-300 text-xs font-medium text-center leading-relaxed">
            Sponsored messages have no pay-and-broadcast. This message is waiting in the Waiting Room and will go live for 30 minutes once someone sponsors it for $3.
          </div>
          <button
            type="button"
            onClick={() => { window.location.href = '/waiting-room' }}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-colors"
          >
            View the Waiting Room
          </button>
        </div>
      ) : (
      <>
      {isSponsorMode && (
        <div className="space-y-4">
          <div className="p-3.5 bg-green-500/10 border border-green-500/25 rounded-2xl text-green-700 dark:text-green-400 text-xs font-medium text-center">
            You are paying for someone else&apos;s message. Thank you for broadcasting their voice!
          </div>
          <p className="text-[11px] text-secondary text-center leading-relaxed">
            You&apos;ll add your sponsor shoutout after the message goes live.
          </p>
        </div>
      )}

      {/* Outbid Alert / #1 Position Confirmation for Normal Queue */}
      {!isReservedSlot && !isSponsorMode && (
        <>
          {isOutbid ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>Outbid Alert: Current Position #{liveRank}</span>
                </div>
                <span className="text-[11px] text-amber-900 dark:text-amber-200 font-mono font-bold bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded">
                  Top bid: ${highestQueuedBid}
                </span>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Another user placed a higher bid while you were checking out. Want to secure the #1 broadcast position right now?
              </p>
              <button
                type="button"
                onClick={() => setCurrentBid(highestQueuedBid + 1)}
                className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs shadow-sm"
              >
                <Zap size={14} />
                <span>Bump bid to ${highestQueuedBid + 1} (+${highestQueuedBid + 1 - currentBid}) to take #1</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>Position #1 in Line (Highest bid)</span>
              </div>
              <span className="text-secondary font-mono text-[11px]">
                {queueBids.length > 0 ? `Beats all ${queueBids.length} queue bids` : 'Be the first!'}
              </span>
            </div>
          )}
        </>
      )}

      {/* Dynamic Summary */}
      <div className="space-y-4 bg-background p-6 rounded-2xl border border-primary/5">
        {!isReservedSlot && (
          <div className="flex justify-between text-sm">
            <span className="text-secondary">
              {currentBid > baseAmount ? 'Priority Bid (Boosted):' : 'Base Bid:'}
            </span>
            <span className="font-semibold text-primary font-mono">${currentBid.toFixed(2)}</span>
          </div>
        )}
        
        {/* Reserved Slot Option */}
        {isReservedSlot && (
          <div className="pt-2 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-violet-700 dark:text-violet-400 flex items-center gap-1.5">
                <Zap size={15} />
                <span>Special — 3 hours, locked in</span>
              </span>
              <span className="text-xs font-bold text-violet-800 dark:text-violet-300 bg-violet-500/15 border border-violet-500/25 px-2 py-0.5 rounded-md font-mono">$30 / slot</span>
            </div>

            {selectedSlots.length > 0 && !isEditingSlots ? (
              <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} ({selectedSlots.length * 3} hours, no bidding)
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingSlots(true)}
                    className="text-xs text-violet-600 dark:text-violet-400 hover:underline font-semibold"
                  >
                    Change Slots
                  </button>
                </div>

                <div className="space-y-1 font-mono text-xs text-secondary">
                  {selectedSlots.map((s, idx) => (
                    <div key={s.id || idx} className="flex justify-between items-center py-1 border-b border-primary/5 last:border-none">
                      <span>Slot #{s.slotNumber || idx + 1}: {s.label || '3-Hour Window'}</span>
                      <span suppressHydrationWarning className="text-primary font-medium">
                        {new Date(s.scheduled_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} · {new Date(s.scheduled_start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC
                      </span>
                    </div>
                  ))}
                </div>

                {selectedSlots.length > 1 && (
                  <div className="pt-1 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    <span>You save 20% for booking together:</span>
                    <span className="font-mono font-bold">-${specialPricing.originalPrice - specialPricing.finalPrice}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-secondary">
                  <p>Pick 1–3 slots in a row, across consecutive days too. Save 20% on 2+.</p>
                  {selectedSlots.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsEditingSlots(false)}
                      className="text-primary hover:underline text-xs font-medium shrink-0 ml-2"
                    >
                      Done Editing
                    </button>
                  )}
                </div>
                <SlotPicker
                  onSelect={(slots) => setSelectedSlots(slots)}
                  selectedSlotIds={selectedSlots.length > 0 ? selectedSlots.map(s => s.id) : initialSlotIds}
                  initialDate={selectedSlots[0]?.scheduled_start || undefined}
                />
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-primary/10 flex justify-between items-center font-bold text-lg">
          <span>Total:</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xl">${total.toFixed(2)}</span>
        </div>
      </div>

      
      <button 
        onClick={handlePay}
        disabled={isProcessing || (isReservedSlot && selectedSlots.length === 0)}
        className={`w-full py-4 mt-4 rounded-full font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2 ${
          isReservedSlot
            ? 'bg-violet-700 dark:bg-violet-600 hover:bg-violet-600 dark:hover:bg-violet-500 text-white shadow-sm'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
        }`}
      >
        {isReservedSlot && selectedSlots.length > 0 && <Zap size={18} />}
        {isProcessing 
          ? 'Processing...' 
          : (isReservedSlot && selectedSlots.length === 0 
            ? 'Pick at least 1 slot to continue' 
            : isReservedSlot
            ? `Pay $${total.toFixed(2)} — live for ${selectedSlots.length * 3}h`
            : isSponsorMode 
            ? `Sponsor for $${SPONSORED_PRICE.toFixed(2)} & Broadcast` 
            : `Pay $${total.toFixed(2)} & Broadcast`)}
      </button>

      {/* Transparent auction notice */}
      {!isReservedSlot && !isSponsorMode && (
        <p className="text-[11px] text-secondary/70 text-center leading-normal">
          Priority queue plays messages ordered by bid amount. If you need an immutable time that cannot be outbid, select <span className="text-violet-400 font-medium">Reserve a Time Slot</span>.
        </p>
      )}
      </>
      )}
    </div>
  )
}
