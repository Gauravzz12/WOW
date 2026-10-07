'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, Sparkles, X, ChevronRight, Info, HeartHandshake, Clock, Globe } from 'lucide-react'
import { getSlotLabel, getUserLocalTimeZone, formatLocalSlotTime, SPONSORED_PRICE } from '@/lib/constants/pricing'

export interface QueueItem {
  id: string
  content?: string
  teaser?: string
  contentLength?: number
  maskedContent?: string
  isLocked?: boolean
  created_at: string
  bid_amount?: number
  scheduled_start?: string
  scheduled_end?: string
  style_config?: any
  category?: { name: string; slug: string; base_duration?: number } | Array<{ name: string; slug: string; base_duration?: number }>
  is_reserved_slot?: boolean
}

function getLockedTeaser(msg: QueueItem): { teaser: string; totalLength: number } {
  if (msg.teaser) return { teaser: msg.teaser, totalLength: msg.contentLength ?? msg.teaser.length }
  // Fallback for legacy rows: never show full content for locked items — truncate hard.
  const plain = (msg.content || '').replace(/<[^>]*>/g, '').trim()
  const teaser = plain.slice(0, 80)
  return { teaser, totalLength: plain.length }
}

export function QueueTabs({ 
  globalQueue = [], 
  specialQueue = [], 
  sponsoredQueue = [],
  activeTab, 
  activeMsg,
  isOpen = false,
  onClose
}: { 
  globalQueue?: QueueItem[], 
  specialQueue?: QueueItem[], 
  sponsoredQueue?: QueueItem[],
  activeTab: 'NORMAL' | 'SPECIAL' | 'SPONSORED',
  activeMsg?: any,
  isOpen?: boolean,
  onClose?: () => void
}) {
  const [userTz, setUserTz] = useState('Local')
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setUserTz(getUserLocalTimeZone())
  }, [])

  const getCategoryName = (msg: QueueItem): string => {
    if (!msg.category) return 'Message'
    if (Array.isArray(msg.category)) {
      return msg.category[0]?.name || 'Message'
    }
    return msg.category.name || 'Message'
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside 
        aria-label="Queue navigation panel"
        className={`
          fixed inset-y-0 right-0 z-50 w-80 lg:w-80
          bg-background/95 lg:bg-background/80 backdrop-blur-xl
          border-l border-primary/10 p-5 pt-16 lg:pt-24
          flex flex-col h-[100dvh]
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'}
          lg:translate-x-0 lg:static lg:flex lg:shadow-none
        `}
      >
        {/* Mobile Close Button */}
        {isOpen && (
          <button 
            type="button"
            className="lg:hidden absolute top-5 right-5 p-2 rounded-full text-secondary hover:text-primary hover:bg-background-elevated transition-colors" 
            onClick={onClose}
            aria-label="Close queue panel"
          >
            <X size={20} />
          </button>
        )}
        
        {/* Panel Header */}
        <div className="shrink-0 mb-4 pb-4 border-b border-primary/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  activeTab === 'NORMAL' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 
                  activeTab === 'SPECIAL' ? 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]' : 
                  'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]'
                }`} />
                <h2 className="text-xs font-bold tracking-widest uppercase text-secondary">
                  {activeTab === 'NORMAL' ? 'Priority Queue' : activeTab === 'SPECIAL' ? '✦ Special Slots' : 'Waiting Room'}
                </h2>
              </div>
              <p className="text-[11px] text-secondary/70 mt-1">
                {activeTab === 'NORMAL' ? `${globalQueue.length} message${globalQueue.length !== 1 ? 's' : ''} in live bid queue` :
                 activeTab === 'SPECIAL' ? `${specialQueue.length} booked slot${specialQueue.length !== 1 ? 's' : ''} coming up` :
                 `${sponsoredQueue.length}/100 awaiting sponsorship`}
              </p>
            </div>
            
            <Link 
              href="/create" 
              className="text-[11px] font-medium text-primary/80 hover:text-primary transition-colors flex items-center gap-0.5 bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded-md border border-primary/10"
            >
              <span>+ Post</span>
            </Link>
          </div>

          {/* Dynamic Auction Tip for Normal Queue */}
          {activeTab === 'NORMAL' && (
            <div className="mt-3 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 text-[10px] text-emerald-800 dark:text-emerald-300 font-medium">
              <Zap size={11} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Highest bid plays next • Outbid anytime to jump ahead</span>
            </div>
          )}

          {activeTab === 'SPECIAL' && (
            <div className="mt-3 px-2.5 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-between gap-1.5 text-[10px] text-violet-800 dark:text-violet-300 font-medium">
              <div className="flex items-center gap-1.5">
                <Globe size={11} className="text-violet-600 dark:text-violet-400 shrink-0" />
                <span>$30 = 3 hours, no bidding</span>
              </div>
              <span suppressHydrationWarning className="font-mono text-[9px] text-secondary">
                {isMounted ? `Shown in ${userTz}` : 'Shown in your time'}
              </span>
            </div>
          )}

          {activeTab === 'SPONSORED' && (
            <div className="mt-3 px-2.5 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-1.5 text-[10px] text-blue-800 dark:text-blue-300 font-medium">
              <HeartHandshake size={11} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Sponsor for $3 to broadcast a community voice live</span>
            </div>
          )}
        </div>

        {/* Tab Content List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar mask-image-bottom pb-12">
          
          {/* 1. NORMAL QUEUE */}
          {activeTab === 'NORMAL' && (
            <div className="space-y-2.5">
              {globalQueue.length > 0 ? (
                globalQueue.map((msg, i) => {
                  const catName = getCategoryName(msg)
                  const isFirst = i === 0

                  return (
                    <div 
                      key={msg.id} 
                      className={`p-3 rounded-2xl border transition-all ${
                        isFirst 
                          ? 'border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.06)]' 
                          : 'border-background-elevated bg-background/50 hover:border-primary/20'
                      } backdrop-blur-sm`}
                    >
                      {/* Top Header */}
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-secondary/80 bg-background-elevated/70 px-2 py-0.5 rounded-md">
                          {catName}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          {isFirst ? (
                            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              #1 Next in Line
                            </span>
                          ) : (
                            <span className="text-[10px] text-secondary font-mono bg-background-elevated/80 px-2 py-0.5 rounded-full">
                              #{i + 1} in line
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Masked preview — upcoming text stays hidden until live */}
                      <p className="text-xs text-secondary/60 my-2 font-mono pl-1 border-l-2 border-primary/20 select-none" aria-label="Message hidden until live">
                        {"•".repeat(18)}
                        <span className="block text-[10px] mt-0.5">Revealed when live</span>
                      </p>

                      {/* Priority Bid */}
                      <div className="flex items-center justify-between mt-2 bg-background-elevated/70 dark:bg-black/30 px-3 py-2 rounded-xl border border-primary/10">
                        <span className="text-[10px] text-secondary uppercase tracking-widest font-semibold">
                          Priority Bid
                        </span>
                        <span className="text-xs font-bold font-mono bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black px-2.5 py-0.5 rounded-md shadow-sm">
                          ${msg.bid_amount || 3}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-10 px-4 border border-dashed border-primary/10 rounded-2xl bg-background-elevated/20">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                    <Zap size={20} />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Normal Queue is Empty</h3>
                  <p className="text-[11px] text-secondary mt-1">Be the first to place a bid and your message will broadcast instantly!</p>
                  <Link 
                    href="/create"
                    className="inline-flex items-center gap-1 mt-4 px-3 py-1.5 rounded-full bg-primary text-background font-semibold text-xs hover:opacity-90 transition-opacity"
                  >
                    <span>Place Bid</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 2. SPECIAL (VIP) QUEUE */}
          {activeTab === 'SPECIAL' && (
            <div className="space-y-2.5">
              {specialQueue.length > 0 ? (
                specialQueue.map((msg) => {
                  const catName = getCategoryName(msg)

                  return (
                      <div 
                      key={msg.id} 
                      className="p-3.5 rounded-2xl border border-violet-500/30 bg-violet-500/[0.06] backdrop-blur-sm shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-violet-800 dark:text-violet-300 bg-violet-500/15 px-2 py-0.5 rounded-md">
                          {catName}
                        </span>
                        <span className="text-[10px] text-white font-bold bg-violet-700 dark:bg-violet-600 px-2 py-0.5 rounded-full shadow-sm">
                          ✦ SPECIAL
                        </span>
                      </div>

                      {/* Masked preview — upcoming text stays hidden until live */}
                      <p className="text-xs text-secondary/60 my-2 font-mono pl-1 border-l-2 border-violet-500/30 select-none" aria-label="Message hidden until live">
                        {"•".repeat(18)}
                        <span className="block text-[10px] mt-0.5">Revealed when live</span>
                      </p>

                      <div className="mt-2 text-center bg-background-elevated/70 dark:bg-black/30 py-2.5 px-3 rounded-xl border border-violet-500/20 space-y-1">
                        <span className="text-[9px] text-violet-800 dark:text-violet-300/90 uppercase tracking-widest font-semibold block">
                          3 hours · locked time
                        </span>
                        {(() => {
                          if (!msg.scheduled_start) return <span className="text-xs font-semibold text-violet-900 dark:text-violet-100">Reserved</span>
                          const start = new Date(msg.scheduled_start)
                          const end = msg.scheduled_end ? new Date(msg.scheduled_end) : new Date(start.getTime() + 3 * 3600 * 1000)
                          const slotDef = getSlotLabel(msg.scheduled_start)
                          const utcDateStr = start.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })
                          const localDateStr = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                          const startTimeStr = formatLocalSlotTime(start.toISOString())
                          const endTimeStr = formatLocalSlotTime(end.toISOString())
                          return (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px] text-violet-800 dark:text-violet-200 font-mono font-bold bg-violet-500/15 px-2.5 py-0.5 rounded-full border border-violet-500/30">
                                {`Slot #${slotDef.slotNumber} • ${slotDef.label} (${slotDef.shortLabel})`}
                              </span>
                              <span suppressHydrationWarning className="text-xs font-bold text-violet-900 dark:text-violet-100 font-sans">
                                {isMounted ? `Your time: ${startTimeStr} – ${endTimeStr}` : `Slot: ${slotDef.label}`}
                              </span>
                              <span suppressHydrationWarning className="text-[9px] text-secondary font-mono">
                                {isMounted ? `${localDateStr} (${userTz}) • Global: ${utcDateStr} UTC` : `Global: ${utcDateStr} UTC`}
                              </span>
                            </div>
                          )
                        })()}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-10 px-4 border border-dashed border-violet-500/20 rounded-2xl bg-violet-500/5">
                  <div className="w-10 h-10 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-3">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-800 dark:text-violet-300">No Special slots booked</h3>
                  <p className="text-[11px] text-secondary mt-1">Pick your exact time — no bidding, no waiting behind others.</p>
                  <Link 
                    href="/create"
                    className="inline-flex items-center gap-1 mt-4 px-3 py-1.5 rounded-full bg-violet-600 text-white font-semibold text-xs hover:bg-violet-500 transition-colors"
                  >
                    <span>Book a slot — $30</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* 3. SPONSORED (WAITING ROOM) — paywalled teasers only, never full content */}
          {activeTab === 'SPONSORED' && (
            <div className="space-y-2.5">
              {sponsoredQueue.length > 0 ? (
                sponsoredQueue.map((msg, i) => {
                  const catName = getCategoryName(msg)
                  const isLocked = msg.isLocked !== false && (!msg.content || msg.teaser || msg.isLocked)
                  // Paid QUEUED sponsored rows carry full `content` (safe). Locked PENDING rows
                  // carry only `teaser` — never render full text for locked items.
                  const paidSnippet = !isLocked && msg.content ? msg.content.replace(/<[^>]*>/g, '').trim().slice(0, 140) : ''
                  const locked = isLocked ? getLockedTeaser(msg) : null

                  return (
                    <div 
                      key={msg.id} 
                      className="p-3.5 rounded-2xl border border-blue-500/25 bg-blue-500/5 backdrop-blur-sm shadow-sm hover:border-blue-500/40 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-800 dark:text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded-md">
                          {catName}
                        </span>
                        <span className="text-[10px] text-blue-800 dark:text-blue-300 font-bold bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 rounded-full">
                          {isLocked ? 'LOCKED' : 'WAITING ROOM'}
                        </span>
                      </div>

                      {locked ? (
                        <div className="my-2 pl-1 border-l-2 border-blue-500/30">
                          <p className="text-xs text-primary/80 font-serif italic">
                            &ldquo;{locked.teaser}&hellip;&rdquo;
                          </p>
                          <p className="text-[10px] text-secondary mt-1">
                            Locked preview ({locked.totalLength} chars) — sponsor to reveal
                          </p>
                        </div>
                      ) : (
                        paidSnippet && (
                          <p className="text-xs text-primary/80 line-clamp-2 my-2 font-serif italic pl-1 border-l-2 border-blue-500/30">
                            &ldquo;{paidSnippet}&rdquo;
                          </p>
                        )
                      )}

                      {/* Sponsor Price */}
                      <div className="flex items-center justify-between mt-2 bg-background-elevated/70 dark:bg-black/30 px-3 py-2 rounded-xl border border-blue-500/15">
                        <span className="text-[10px] text-secondary uppercase tracking-widest font-semibold">
                          Sponsor Price
                        </span>
                        <span className="text-xs font-bold font-mono bg-blue-600 text-white dark:bg-blue-500 dark:text-black px-2.5 py-0.5 rounded-md shadow-sm">
                          ${SPONSORED_PRICE.toFixed(2)}
                        </span>
                      </div>

                      {/* Instant Sponsor Action Button — normal messages only, never VIP/Special */}
                      {!msg.is_reserved_slot && (
                      <Link 
                        href={`/checkout/${msg.id}?mode=sponsor`}
                        className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm"
                      >
                        <HeartHandshake size={13} />
                        <span>Sponsor this for $3</span>
                      </Link>
                      )}
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-10 px-4 border border-dashed border-blue-500/20 rounded-2xl bg-blue-500/5">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                    <HeartHandshake size={20} />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">Waiting Room is Empty</h3>
                  <p className="text-[11px] text-secondary mt-1">Users can submit messages without paying and have them sponsored by the community.</p>
                  <Link 
                    href="/waiting-room"
                    className="inline-flex items-center gap-1 mt-4 px-3 py-1.5 rounded-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-600/30 font-semibold text-xs transition-colors"
                  >
                    <span>View Waiting Room</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          )}

        </div>
      </aside>
    </>
  )
}
