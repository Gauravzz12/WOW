'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import posthog from 'posthog-js'
import { getDeviceId, getStoredReactions, setStoredReaction, removeStoredReaction, syncStoredReactions } from '@/lib/deviceId'
import { addReaction as serverAddReaction, removeReaction as serverRemoveReaction } from './reactions'

const REACTION_TYPES = [
  { id: 'LOVE', emoji: '❤️', label: 'Love' },
  { id: 'CELEBRATE', emoji: '🎉', label: 'Celebrate' },
  { id: 'SUPPORT', emoji: '🫂', label: 'Support' },
  { id: 'FEEL_THIS', emoji: '😢', label: 'Feel this' },
  { id: 'RESPECT', emoji: '🙏', label: 'Respect' },
]

export function ReactionBar({ messageId }: { messageId: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  // Initialized empty so server HTML matches first client render.
  // Device reactions are client-only (localStorage) and load in the effect below.
  const [myReactions, setMyReactions] = useState<Record<string, string>>({})
  // Per-type in-flight lock: rapid LOVE → CELEBRATE no longer drops the
  // second intent the way a single global boolean did.
  const reactingTypes = useRef<Set<string>>(new Set())
  // Suppresses the resurrection race: a realtime refetch that lands before our
  // DELETE commits would otherwise re-add the just-removed reaction.
  const recentlyRemoved = useRef<Record<string, number>>({})
  // Stable client: createBrowserClient returns a NEW instance per call, so
  // creating it inline re-ran the fetch effect (and resubscribed realtime)
  // on every render, since setCounts always produces a new object.
  const [supabase] = useState(() => createClient())

  // Sync state if messageId changes (client-only: localStorage is unavailable on server)
  useEffect(() => {
    setMyReactions(getStoredReactions(messageId))
  }, [messageId])

  useEffect(() => {
    // Initial fetch
    const fetchReactions = async () => {
      const { data, error } = await supabase
        .from('reactions')
        .select('id, reaction_type, device_id')
        .eq('message_id', messageId)

      if (!error && data) {
        const newCounts: Record<string, number> = {}
        const deviceId = getDeviceId()
        const deviceReactions: Record<string, string> = {}

        for (const r of (data as any[])) {
          newCounts[r.reaction_type] = (newCounts[r.reaction_type] || 0) + 1
          if (r.device_id && r.device_id === deviceId) {
            // Skip rows we just deleted but haven't seen committed yet.
            const removedAt = recentlyRemoved.current[r.reaction_type] || 0
            if (Date.now() - removedAt < 4000) continue
            deviceReactions[r.reaction_type] = r.id
          }
        }
        setCounts(newCounts)

        // Sync with confirmed DB state, preserving in-flight temp reactions
        setMyReactions(prev => {
          const merged: Record<string, string> = { ...deviceReactions }
          for (const [k, v] of Object.entries(prev)) {
            if (v === 'temp' && !merged[k]) {
              merged[k] = 'temp'
            }
          }
          syncStoredReactions(messageId, merged)
          return merged
        })
      }
    }

    fetchReactions()

    // Realtime subscription
    const channel = supabase.channel(`reactions_${messageId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reactions',
        filter: `message_id=eq.${messageId}`
      }, () => {
        fetchReactions()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [messageId, supabase])

  const addReaction = async (type: string) => {
    if (reactingTypes.current.has(type)) return
    reactingTypes.current.add(type)

    const existingId = myReactions[type]

    try {
      // 1. Toggle OFF if user already reacted with this type
      if (existingId) {
        if (existingId === 'temp') return

        setMyReactions(prev => {
          const next = { ...prev }
          delete next[type]
          removeStoredReaction(messageId, type)
          return next
        })
        setCounts(prev => ({
          ...prev,
          [type]: Math.max(0, (prev[type] || 0) - 1)
        }))
        recentlyRemoved.current[type] = Date.now()

        // Device-gated server delete: only our own device's row can be removed.
        const res = await serverRemoveReaction(messageId, type)
        if ((res as any).error) {
          // Revert on error
          delete recentlyRemoved.current[type]
          setMyReactions(prev => {
            const next = { ...prev, [type]: existingId }
            setStoredReaction(messageId, type, existingId)
            return next
          })
          setCounts(prev => ({
            ...prev,
            [type]: (prev[type] || 0) + 1
          }))
        }
      }
      // 2. Add reaction of this type (1 per device per type, up to 5 total)
      else {
        setMyReactions(prev => {
          const next = { ...prev, [type]: 'temp' }
          setStoredReaction(messageId, type, 'temp')
          return next
        })
        setCounts(prev => ({
          ...prev,
          [type]: (prev[type] || 0) + 1
        }))

        try { posthog.capture('reaction_added', {
          message_id: messageId,
          reaction_type: type
        }) } catch {}

        // Device-gated server insert (deduped by unique index per device+type).
        const res = await serverAddReaction(messageId, type)

        if (!(res as any).error && (res as any).id) {
          setMyReactions(prev => {
            const next = { ...prev, [type]: (res as any).id }
            setStoredReaction(messageId, type, (res as any).id)
            return next
          })
        } else {
          // Revert on error
          setMyReactions(prev => {
            const next = { ...prev }
            delete next[type]
            removeStoredReaction(messageId, type)
            return next
          })
          setCounts(prev => ({
            ...prev,
            [type]: Math.max(0, (prev[type] || 0) - 1)
          }))
        }
      }
    } finally {
      reactingTypes.current.delete(type)
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {REACTION_TYPES.map(reaction => {
        const count = counts[reaction.id] || 0
        const isSelected = !!myReactions[reaction.id]
        
        return (
          <button
            key={reaction.id}
            onClick={() => addReaction(reaction.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all active:scale-95 ${
              isSelected 
                ? 'bg-primary/10 border-primary text-primary shadow-sm font-semibold' 
                : 'bg-background-elevated border-primary/10 hover:border-primary/30 text-secondary hover:text-primary'
            }`}
          >
            <span className="text-xl">{reaction.emoji}</span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={count}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`font-medium ${isSelected ? 'text-primary' : 'text-secondary'}`}
              >
                {count > 0 ? count : ' '}
              </motion.span>
            </AnimatePresence>
          </button>
        )
      })}
    </div>
  )
}
