'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Radio, 
  Sparkles, 
  Zap, 
  ArrowLeft, 
  ExternalLink,
  ChevronRight,
  Heart
} from 'lucide-react'
import { getCategoryStyles } from '@/lib/utils/colors'

export type LeaderboardTier = 'all' | 'normal' | 'sponsored' | 'special'

export interface LeaderboardItem {
  id: string
  content: string
  created_at: string
  style_config: any
  reaction_count: number | string
  category_name?: string
  category_slug?: string
  is_reserved_slot?: boolean
  bid_amount?: number
}

export function classifyMessage(msg: LeaderboardItem): 'special' | 'sponsored' | 'normal' {
  const config = typeof msg.style_config === 'string'
    ? (() => { try { return JSON.parse(msg.style_config) } catch { return {} } })()
    : (msg.style_config || {})

  if (
    msg.is_reserved_slot === true ||
    config.isVip === true ||
    config.tier === 'special' ||
    (Array.isArray(config.selectedSlots) && config.selectedSlots.length > 0) ||
    (Array.isArray(config.slotIds) && config.slotIds.length > 0)
  ) {
    return 'special'
  }

  if (
    config.isSponsored === true ||
    config.tier === 'sponsored' ||
    (typeof msg.bid_amount === 'number' && msg.bid_amount < 2) ||
    Boolean(config.sponsorName) ||
    Boolean(config.sponsorNote)
  ) {
    return 'sponsored'
  }

  return 'normal'
}

export function LeaderboardView({ items }: { items: LeaderboardItem[] }) {
  const [activeTab, setActiveTab] = useState<LeaderboardTier>('all')

  // Pre-classify all items once
  const categorizedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      tier: classifyMessage(item),
      numericReactions: Number(item.reaction_count || 0),
    }))
  }, [items])

  const counts = useMemo(() => {
    return {
      all: categorizedItems.length,
      normal: categorizedItems.filter(m => m.tier === 'normal').length,
      sponsored: categorizedItems.filter(m => m.tier === 'sponsored').length,
      special: categorizedItems.filter(m => m.tier === 'special').length,
    }
  }, [categorizedItems])

  const displayList = useMemo(() => {
    if (activeTab === 'all') {
      return categorizedItems
    }
    return categorizedItems.filter(m => m.tier === activeTab)
  }, [categorizedItems, activeTab])

  const tabOptions: Array<{
    id: LeaderboardTier
    label: string
    shortLabel: string
    icon: React.ComponentType<{ className?: string }>
    badgeColor: string
    activeGlow: string
  }> = [
    {
      id: 'all',
      label: 'All Broadcasts',
      shortLabel: 'All',
      icon: Trophy,
      badgeColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      activeGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
    {
      id: 'normal',
      label: 'Live Queue',
      shortLabel: 'Normal',
      icon: Radio,
      badgeColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      activeGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    {
      id: 'sponsored',
      label: 'Sponsored ($1)',
      shortLabel: 'Sponsored',
      icon: Sparkles,
      badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      activeGlow: 'shadow-[0_0_20px_rgba(251,191,36,0.15)]',
    },
    {
      id: 'special',
      label: 'Special (VIP)',
      shortLabel: 'Special',
      icon: Zap,
      badgeColor: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
      activeGlow: 'shadow-[0_0_20px_rgba(167,139,250,0.15)]',
    },
  ]

  const tabDescriptions: Record<LeaderboardTier, { title: string; subtitle: string; ctaText: string; ctaHref: string }> = {
    all: {
      title: 'Top Broadcasts Worldwide',
      subtitle: 'The most loved, celebrated, and deeply resonated messages across every delivery tier.',
      ctaText: 'Post a Message',
      ctaHref: '/create',
    },
    normal: {
      title: 'Live Auction Queue Leaderboard',
      subtitle: 'Top-ranked messages broadcast through the competitive live bidding stream.',
      ctaText: 'Bid on Live Queue',
      ctaHref: '/create?tier=normal',
    },
    sponsored: {
      title: 'Sponsored Grid Leaderboard',
      subtitle: 'Beloved messages backed and brought to life by the global community for $1.',
      ctaText: 'Visit Waiting Room',
      ctaHref: '/waiting-room',
    },
    special: {
      title: 'VIP Special Slots Leaderboard',
      subtitle: 'Historic messages broadcast during scheduled worldwide prime-time hours.',
      ctaText: 'Book a Special Slot',
      ctaHref: '/create?tier=special',
    },
  }

  const currentTabInfo = tabDescriptions[activeTab]

  return (
    <div className="min-h-[100dvh] bg-background dark:bg-grid-white/[0.03] bg-grid-black/[0.03] relative flex flex-col pt-16 md:pt-20 px-4 sm:px-6 pb-28 overflow-x-hidden selection:bg-amber-500/20">
      
      {/* Radial fade mask */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      <div className="max-w-4xl mx-auto w-full relative z-10 space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-background-elevated border border-primary/10 flex items-center justify-center group-hover:scale-105 group-hover:border-primary/20 transition-all shadow-sm">
              <ArrowLeft size={16} />
            </div>
            <span className="text-xs font-bold tracking-widest uppercase">Back to Feed</span>
          </Link>

          <Link
            href={currentTabInfo.ctaHref}
            className="text-xs font-semibold px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/15 transition-all flex items-center gap-1.5"
          >
            <span>{currentTabInfo.ctaText}</span>
            <ChevronRight size={13} />
          </Link>
        </div>

        {/* Hero Section */}
        <section className="space-y-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/5">
              <Trophy className="text-amber-500 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-serif text-primary tracking-tight">
                {currentTabInfo.title}
              </h1>
              <p className="text-sm md:text-base text-secondary mt-1 max-w-2xl leading-relaxed">
                {currentTabInfo.subtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Tier Tabs Navigation */}
        <div className="bg-background-elevated/70 backdrop-blur-xl border border-primary/10 rounded-2xl p-1.5 shadow-sm flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabOptions.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const count = counts[tab.id]

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 min-w-[110px] sm:min-w-[130px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-colors z-10 ${
                  isActive ? 'text-primary' : 'text-secondary hover:text-primary'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="leaderboardActiveTab"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className={`absolute inset-0 bg-background rounded-xl border border-primary/15 ${tab.activeGlow} z-[-1] shadow-md`}
                  />
                )}
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? tab.badgeColor.split(' ')[0] : 'text-secondary'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-primary/10 text-primary font-bold' : 'bg-primary/5 text-secondary'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Leaderboard Cards List */}
        <section className="space-y-3.5">
          <AnimatePresence mode="popLayout">
            {displayList.length > 0 ? (
              displayList.map((msg, i) => {
                const catName = msg.category_name || 'Message'
                const catSlug = msg.category_slug || 'general'
                const { badgeClass } = getCategoryStyles(catSlug)
                const reactionCount = msg.numericReactions

                const cfg = typeof msg.style_config === 'string'
                  ? (() => { try { return JSON.parse(msg.style_config) } catch { return {} } })()
                  : (msg.style_config || {})

                // Tier badge definitions
                const tierMeta = {
                  normal: {
                    label: 'Live Queue',
                    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
                    icon: Radio,
                  },
                  sponsored: {
                    label: 'Sponsored $1',
                    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
                    icon: Sparkles,
                  },
                  special: {
                    label: 'VIP Special',
                    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/25',
                    icon: Zap,
                  },
                }[msg.tier]

                const TierIcon = tierMeta.icon

                // Rank medal colors
                const rankStyles = i === 0 
                  ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : i === 1
                  ? 'bg-slate-300/20 text-slate-300 border-slate-300/40'
                  : i === 2
                  ? 'bg-amber-700/20 text-amber-600 border-amber-700/40'
                  : 'bg-background-elevated text-secondary border-primary/10'

                return (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Link
                      href={`/w/${msg.id}`}
                      className="group block p-5 sm:p-6 rounded-2xl bg-background-elevated/60 hover:bg-background-elevated/90 border border-primary/10 hover:border-amber-500/40 backdrop-blur-md transition-all shadow-sm hover:shadow-xl"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        
                        {/* Rank Badge */}
                        <div className={`shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full font-bold flex items-center justify-center text-base sm:text-lg border ${rankStyles}`}>
                          #{i + 1}
                        </div>

                        {/* Message Info & Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                          
                          {/* Metadata row */}
                          <div className="flex items-center gap-2 flex-wrap text-xs">
                            {/* Category Badge */}
                            <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                              {catName}
                            </span>

                            {/* Delivery Tier Badge */}
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${tierMeta.badge}`}>
                              <TierIcon className="w-3 h-3" />
                              <span>{tierMeta.label}</span>
                            </span>

                            {/* Date */}
                            <span suppressHydrationWarning className="text-[11px] text-secondary font-mono">
                              {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                            </span>
                          </div>

                          {/* Message Content */}
                          <p className="text-base sm:text-lg font-serif text-primary/95 group-hover:text-primary transition-colors line-clamp-3 leading-snug">
                            "{msg.content}"
                          </p>

                          {/* Sponsor dedication badge if applicable */}
                          {msg.tier === 'sponsored' && (cfg.sponsorName || cfg.sponsorNote) && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                              <Sparkles className="w-3 h-3 shrink-0" />
                              <span>
                                {cfg.sponsorName ? `Sponsored by ${cfg.sponsorName}` : 'Community Sponsored'}
                                {cfg.sponsorNote ? `: "${cfg.sponsorNote}"` : ''}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Reaction Counter & Arrow */}
                        <div className="shrink-0 flex items-center gap-3 self-end sm:self-center">
                          <div className="flex items-center gap-1.5 bg-background px-3.5 py-1.5 rounded-full border border-primary/10 group-hover:border-amber-500/30 transition-colors shadow-inner">
                            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                            <span className="text-sm sm:text-base font-bold text-primary font-mono">
                              {reactionCount}
                            </span>
                          </div>

                          <div className="w-8 h-8 rounded-full border border-primary/10 flex items-center justify-center text-secondary group-hover:text-primary group-hover:border-primary/20 group-hover:translate-x-0.5 transition-all">
                            <ExternalLink size={14} />
                          </div>
                        </div>

                      </div>
                    </Link>
                  </motion.div>
                )
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 px-6 border border-dashed border-primary/15 rounded-3xl bg-background-elevated/20 space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/5 mx-auto flex items-center justify-center text-secondary">
                  <Trophy className="w-6 h-6 opacity-40" />
                </div>
                <div>
                  <h3 className="text-lg font-serif text-primary font-medium">
                    No {activeTab !== 'all' ? activeTab : ''} messages ranked yet
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary mt-1 max-w-sm mx-auto">
                    Be the first to post or react to a message in this tier and claim the #1 spot on the worldwide leaderboard!
                  </p>
                </div>
                <Link
                  href={currentTabInfo.ctaHref}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-background font-semibold text-xs hover:opacity-90 transition-opacity"
                >
                  <span>{currentTabInfo.ctaText}</span>
                  <ChevronRight size={14} />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </div>
    </div>
  )
}
