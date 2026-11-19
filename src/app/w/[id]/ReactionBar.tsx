'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import posthog from 'posthog-js'
import { Heart } from 'lucide-react'
import { getStoredReactions, syncStoredReactions } from '@/lib/deviceId'
import { setReaction as serverSetReaction, removeMyReaction as serverRemoveMyReaction, getMyReactions } from './reactions'
import { REACTION_EMOJIS, emojiForStoredType, formatReactionCount } from '@/lib/reactionEmojis'

/**
 * Single reaction button (WhatsApp/Instagram model): shows MY emoji and
 * the TOTAL reaction count — never a per-emoji breakdown. Tapping opens
 * the full emoji picker; picking my current emoji again removes it.
 */
export function ReactionBar({ messageId }: { messageId: string }) {
  const [total, setTotal] = useState(0)
  // My single reaction: stored type (emoji char, or a legacy type id for
  // rows written by the old 5-type system) -> row id.
  const [myReaction, setMyReaction] = useState<{ type: string; id: string } | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const reacting = useRef(false)
  const recentlyRemoved = useRef(0)
  const pickerRef = useRef<HTMLDivElement>(null)
  const [supabase] = useState(() => createClient())

  const myEmoji = emojiForStoredType(myReaction?.type)

  // Initial state from this device's local mirror (client-only).
  useEffect(() => {
    const stored = getStoredReactions(messageId)
    const type = Object.keys(stored)[0]
    if (type) setMyReaction({ type, id: stored[type] })
  }, [messageId])

  // Close the picker on outside click
  useEffect(() => {
    if (!showPicker) return
    const onDown = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [showPicker])

  useEffect(() => {
    const fetchReactions = async () => {
      const { data, error } = await supabase
        .from('reactions')
        .select('id')
        .eq('message_id', messageId)
      if (error || !data) return
      setTotal(data.length)

      const mine = await getMyReactions(messageId).catch(() => ({ reactions: [] as { id: string; type: string }[] }))
      const own = mine.reactions[0]
      setMyReaction(prev => {
        if (prev?.id === 'temp') return prev // keep the in-flight optimistic pick
        // Skip resurrecting a reaction we removed moments ago (refetch can
        // land before the DELETE is visible).
        if (own && Date.now() - recentlyRemoved.current < 4000 && own.type === prev?.type) return null
        const next = own ? { type: own.type, id: own.id } : null
        syncStoredReactions(messageId, next ? { [next.type]: next.id } : {})
        return next
      })
    }

    fetchReactions()
    const channel = supabase.channel(`reactions_bar_${messageId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reactions',
        filter: `message_id=eq.${messageId}`
      }, () => { fetchReactions() })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [messageId, supabase])

  const handleReact = async (emoji: string) => {
    setShowPicker(false)
    if (reacting.current) return
    reacting.current = true
    const prev = myReaction
    try {
      // Picking my current emoji again -> remove my reaction
      if (myEmoji === emoji) {
        setMyReaction(null)
        syncStoredReactions(messageId, {})
        setTotal(t => Math.max(0, t - 1))
        recentlyRemoved.current = Date.now()
        if (prev && prev.id !== 'temp') {
          const res = await serverRemoveMyReaction(messageId)
          if ((res as any).error) {
            recentlyRemoved.current = 0
            setMyReaction(prev)
            syncStoredReactions(messageId, { [prev.type]: prev.id })
            setTotal(t => t + 1)
          }
        }
      } else {
        const hadReaction = !!prev
        setMyReaction({ type: emoji, id: 'temp' })
        syncStoredReactions(messageId, { [emoji]: 'temp' })
        if (!hadReaction) setTotal(t => t + 1)
        try { posthog.capture('reaction_added', { message_id: messageId, reaction_type: emoji }) } catch {}
        const res = await serverSetReaction(messageId, emoji)
        if (!(res as any).error && (res as any).id) {
          setMyReaction({ type: emoji, id: (res as any).id })
          syncStoredReactions(messageId, { [emoji]: (res as any).id })
        } else {
          setMyReaction(prev)
          syncStoredReactions(messageId, prev ? { [prev.type]: prev.id } : {})
          if (!hadReaction) setTotal(t => Math.max(0, t - 1))
        }
      }
    } finally {
      reacting.current = false
    }
  }

  return (
    <div className="relative inline-block" ref={pickerRef}>
      <button
        onClick={() => setShowPicker(v => !v)}
        className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all active:scale-95 ${
          myEmoji
            ? 'bg-primary/10 border-primary text-primary shadow-sm font-semibold'
            : 'bg-background-elevated border-primary/10 hover:border-primary/30 text-secondary hover:text-primary'
        }`}
        title={myEmoji ? `Reacted ${myEmoji} • Click to change` : 'Add reaction'}
      >
        {myEmoji ? (
          <span className="text-xl select-none">{myEmoji}</span>
        ) : (
          <Heart size={18} className="text-red-500 fill-red-500" />
        )}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={total}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`font-medium ${myEmoji ? 'text-primary' : 'text-secondary'}`}
          >
            {total > 0 ? formatReactionCount(total) : 'React'}
          </motion.span>
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-3 left-0 w-[324px] max-w-[88vw] bg-background-elevated border border-primary/15 rounded-3xl shadow-xl p-3 z-50"
          >
            <div className="grid grid-cols-6 gap-1 max-h-64 overflow-y-auto custom-scrollbar">
              {REACTION_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  aria-label={`React ${emoji}`}
                  className={`h-11 flex items-center justify-center rounded-full text-[22px] transition-all select-none ${
                    myEmoji === emoji
                      ? 'bg-primary/15 ring-2 ring-primary scale-110'
                      : 'hover:bg-primary/10 hover:scale-110'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
