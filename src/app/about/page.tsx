'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Clock, Globe, DollarSign, Radio, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AboutPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    messagesDelivered: 0,
    totalAirtimeMins: 0,
    totalInteractions: 0,
    isLoading: true
  })

  useEffect(() => {
    const supabase = createClient()

    const fetchStats = async () => {
      try {
        const { data: messages } = await supabase
          .from('messages')
          .select('id, status, bid_amount, style_config')
          .in('status', ['ACTIVE', 'COMPLETED', 'ARCHIVED', 'QUEUED'])

        let revenue = 0
        let delivered = 0
        let totalAirtimeSecs = 0

        if (messages) {
          messages.forEach(m => {
            revenue += Number(m.bid_amount || 0)
            if (m.status !== 'QUEUED') {
              delivered += 1
              let duration = 300
              if (m.style_config) {
                try {
                  const config = typeof m.style_config === 'string' ? JSON.parse(m.style_config) : m.style_config
                  duration = config.durationSecs || 300
                } catch {
                  duration = 300
                }
              }
              totalAirtimeSecs += duration
            }
          })
        }

        const [{ count: commentsCount }, { count: reactionsCount }] = await Promise.all([
          supabase.from('comments').select('*', { count: 'exact', head: true }),
          supabase.from('reactions').select('*', { count: 'exact', head: true })
        ])

        setStats({
          totalRevenue: revenue,
          messagesDelivered: delivered,
          totalAirtimeMins: Math.max(1, Math.round(totalAirtimeSecs / 60)),
          totalInteractions: (commentsCount || 0) + (reactionsCount || 0),
          isLoading: false
        })
      } catch (err) {
        console.error('Failed to load telemetry stats:', err)
        setStats(prev => ({ ...prev, isLoading: false }))
      }
    }

    fetchStats()

    const channel = supabase.channel('about_page_telemetry')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, () => fetchStats())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="min-h-[100dvh] bg-background dark:bg-grid-white/[0.03] bg-grid-black/[0.03] relative flex flex-col pt-20 px-6 pb-24 overflow-x-hidden">
      
      {/* Radial fade mask */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      
      <div className="max-w-3xl mx-auto w-full relative z-10">
        
        <Link href="/" className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-12 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-background-elevated border border-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <ArrowLeft size={16} />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase">Back</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-14"
        >
          {/* Hero Section */}
          <section className="space-y-5">
            <h1 className="text-4xl md:text-5xl font-serif text-primary tracking-tight leading-tight">
              Words of the World. <br />
              <span className="text-secondary italic font-light">Where your thoughts live.</span>
            </h1>
            <p className="text-base md:text-lg text-secondary leading-relaxed max-w-2xl">
              In a digital world overflowing with noise, some words deserve to be seen. 
              Words of the World is an ephemeral global canvas for confessions, celebrations, apologies, and poetry.
            </p>
          </section>

          {/* Live Network Telemetry / About Stats Top Section */}
          <section className="rounded-3xl border border-primary/15 bg-background-elevated/40 backdrop-blur-md p-6 md:p-8 relative overflow-hidden shadow-xl">
            {/* Subtle corner radial gradient */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-6 pb-4 border-b border-primary/10">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold tracking-widest uppercase text-primary/90">
                  Live Network Telemetry
                </span>
              </div>
              <span className="text-[11px] font-mono text-secondary/70">
                Verified database ledger • Synced in real-time
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Revenue */}
              <div className="p-4 rounded-2xl bg-background/60 border border-emerald-500/20 backdrop-blur-sm flex flex-col justify-between hover:border-emerald-500/40 transition-colors shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-secondary">
                    Total Revenue
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <DollarSign size={14} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-extrabold font-mono tracking-tight text-emerald-800 dark:text-emerald-300">
                    {stats.isLoading ? (
                      <span className="opacity-50 animate-pulse">...</span>
                    ) : (
                      `$${stats.totalRevenue.toLocaleString()}`
                    )}
                  </div>
                  <p className="text-[10px] text-secondary/80 mt-1">Paid till date</p>
                </div>
              </div>

              {/* Messages Delivered */}
              <div className="p-4 rounded-2xl bg-background/60 border border-violet-500/20 backdrop-blur-sm flex flex-col justify-between hover:border-violet-500/40 transition-colors shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-secondary">
                    Delivered
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-500/20">
                    <Radio size={14} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-extrabold font-mono tracking-tight text-violet-800 dark:text-violet-300">
                    {stats.isLoading ? (
                      <span className="opacity-50 animate-pulse">...</span>
                    ) : (
                      stats.messagesDelivered
                    )}
                  </div>
                  <p className="text-[10px] text-secondary/80 mt-1">Global broadcasts</p>
                </div>
              </div>

              {/* Broadcast Airtime */}
              <div className="p-4 rounded-2xl bg-background/60 border border-blue-500/20 backdrop-blur-sm flex flex-col justify-between hover:border-blue-500/40 transition-colors shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-secondary">
                    Total Airtime
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <Clock size={14} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-extrabold font-mono tracking-tight text-blue-800 dark:text-blue-300">
                    {stats.isLoading ? (
                      <span className="opacity-50 animate-pulse">...</span>
                    ) : stats.totalAirtimeMins < 60 ? (
                      `${stats.totalAirtimeMins}m`
                    ) : (
                      `${(stats.totalAirtimeMins / 60).toFixed(1)}h`
                    )}
                  </div>
                  <p className="text-[10px] text-secondary/80 mt-1">On the world stage</p>
                </div>
              </div>

              {/* Community Interactions */}
              <div className="p-4 rounded-2xl bg-background/60 border border-rose-500/20 backdrop-blur-sm flex flex-col justify-between hover:border-rose-500/40 transition-colors shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-secondary">
                    Interactions
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20">
                    <Heart size={14} />
                  </div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-extrabold font-mono tracking-tight text-rose-800 dark:text-rose-300">
                    {stats.isLoading ? (
                      <span className="opacity-50 animate-pulse">...</span>
                    ) : (
                      stats.totalInteractions
                    )}
                  </div>
                  <p className="text-[10px] text-secondary/80 mt-1">Reactions & replies</p>
                </div>
              </div>
            </div>
          </section>

          {/* Mechanics Section */}
          <section className="space-y-8">
            <h2 className="text-sm font-bold tracking-widest uppercase text-primary border-b border-primary/10 pb-4">
              How It Works
            </h2>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="p-6 rounded-2xl bg-background-elevated/40 border border-primary/5 backdrop-blur-sm">
                <Globe className="text-blue-500 mb-4" size={24} />
                <h3 className="font-bold text-primary mb-2">The Global Stage</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Messages are broadcast to anyone watching. The feed is a collective stream of human emotion, unfiltered and untethered.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-background-elevated/40 border border-primary/5 backdrop-blur-sm">
                <Clock className="text-emerald-500 mb-4" size={24} />
                <h3 className="font-bold text-primary mb-2">Fleeting Moments</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Every message has a lifespan. Standard words broadcast in chosen duration tiers, while VIP slots anchor them to a guaranteed scheduled hour. 
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-background-elevated/40 border border-primary/5 backdrop-blur-sm sm:col-span-2">
                <Sparkles className="text-violet-500 mb-4" size={24} />
                <h3 className="font-bold text-primary mb-2">Pay It Forward</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Have something to say but can&apos;t pay the toll? Drop it in the Waiting Room. Strangers can sponsor your message, allowing your voice to be heard through the kindness of others.
                </p>
              </div>
            </div>
          </section>

          {/* Closing */}
          <section className="pt-8 border-t border-primary/10">
            <p className="font-serif italic text-2xl text-primary text-center">
              &ldquo;Some words are too heavy to hold alone.&rdquo;
            </p>
            <div className="flex justify-center mt-10">
              <Link href="/create">
                <button className="px-8 py-4 bg-primary text-background rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-xl">
                  Leave a Message
                </button>
              </Link>
            </div>
          </section>

        </motion.div>
      </div>
    </div>
  )
}
