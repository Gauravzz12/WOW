'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, Send, X, ChevronDown, Maximize2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getCategoryStyles } from '@/lib/utils/colors'
import { ShareMenu } from './ShareMenu'
import { getDeviceId, getStoredReactions, setStoredReaction, removeStoredReaction, syncStoredReactions } from '@/lib/deviceId'
import { addReaction as serverAddReaction, removeReaction as serverRemoveReaction } from '@/app/w/[id]/reactions'
import { addComment as serverAddComment } from '@/app/w/[id]/comments'

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatRelativeTime(dateString?: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diffSecs < 60) return 'just now'
  const diffMins = Math.floor(diffSecs / 60)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return `${SHORT_MONTHS[date.getMonth()]} ${date.getDate()}`
}

const REACTIONS = [
  { id: 'LOVE', emoji: '❤️' },
  { id: 'CELEBRATE', emoji: '🎉' },
  { id: 'SUPPORT', emoji: '🫂' },
  { id: 'FEEL_THIS', emoji: '😢' },
  { id: 'RESPECT', emoji: '🙏' },
]

export function InlineInteractions({ 
  messageId, 
  categorySlug, 
  compact = false,
  isVip = false,
  isDark = false,
  buttonClassName
}: { 
  messageId: string, 
  categorySlug: string, 
  compact?: boolean,
  isVip?: boolean,
  isDark?: boolean,
  buttonClassName?: string
}) {
  const [supabase] = useState(() => createClient())
  
  const [showReact, setShowReact] = useState(false)
  // 'none' | 'input' | 'list'
  const [commentMode, setCommentMode] = useState<'none' | 'input' | 'list'>('none')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [comments, setComments] = useState<{ id: string, content: string, created_at?: string }[]>([])
  const [currentCycle, setCurrentCycle] = useState<{ id: string, content: string }[]>([])
  const [commentIndex, setCommentIndex] = useState(0)
  const [isPopUpActive, setIsPopUpActive] = useState(false)
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({})
  // Initialized empty so server HTML matches first client render.
  // Device reactions are client-only (localStorage) and load in the effect below.
  const [myReactions, setMyReactions] = useState<Record<string, string>>({})
  const listRef = useRef<HTMLDivElement>(null)
  const isReacting = useRef<boolean>(false)
  
  const { accentClass } = getCategoryStyles(categorySlug)
  const totalComments = comments.length
  const totalReactions = Object.values(reactionCounts).reduce((acc, count) => acc + count, 0)
  const myReactionType = Object.keys(myReactions)[0] || null
  const myReaction = REACTIONS.find(r => r.id === myReactionType)
  const hasReacted = !!myReaction
  const isLoved = myReactionType === 'LOVE'
  const reactPopoverRef = useRef<HTMLDivElement>(null)

  // Sync state if messageId changes (client-only: localStorage is unavailable on server)
  useEffect(() => {
    setMyReactions(getStoredReactions(messageId))
  }, [messageId])

  // Close reaction popover on outside click
  useEffect(() => {
    if (!showReact) return
    const handleClickOutside = (e: MouseEvent) => {
      if (reactPopoverRef.current && !reactPopoverRef.current.contains(e.target as Node)) {
        setShowReact(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showReact])

  const handleReactClick = () => {
    setShowReact(prev => !prev)
    setCommentMode('none')
  }

  // Fetch initial comments + reactions
  useEffect(() => {
    if (!messageId) return

    const fetchComments = async () => {
      const { data } = await supabase
        .from('comments')
        .select('id, content, created_at')
        .eq('message_id', messageId)
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (data) setComments(data)
    }
    fetchComments()

    const fetchReactions = async () => {
      const { data } = await supabase
        .from('reactions')
        .select('id, reaction_type, device_id')
        .eq('message_id', messageId)
      
      if (data) {
        const counts: Record<string, number> = {}
        const deviceId = getDeviceId()
        let deviceReactionType: string | null = null
        let deviceReactionId: string | null = null

        for (const r of (data as any[])) {
          counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1
          if (r.device_id && r.device_id === deviceId && !deviceReactionType) {
            deviceReactionType = r.reaction_type
            deviceReactionId = r.id
          }
        }
        setReactionCounts(counts)

        // Sync with confirmed DB state (enforcing at most 1 reaction per person)
        setMyReactions(prev => {
          const currentType = Object.keys(prev)[0]
          if (currentType && prev[currentType] === 'temp' && !deviceReactionType) {
            return { [currentType]: 'temp' }
          }
          const single: Record<string, string> = {}
          if (deviceReactionType && deviceReactionId) {
            single[deviceReactionType] = deviceReactionId
          }
          syncStoredReactions(messageId, single)
          return single
        })
      }
    }
    fetchReactions()

    // Realtime for new comments and reactions
    const channel = supabase.channel(`interactions_${messageId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `message_id=eq.${messageId}` }, (payload) => {
        const newComment = { id: payload.new.id, content: payload.new.content, created_at: payload.new.created_at }
        // Dedupe: our own server-action insert already prepends the row below,
        // and realtime may deliver the same row a moment later.
        setComments(prev => prev.some(c => c.id === newComment.id) ? prev : [newComment, ...prev].slice(0, 100))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions', filter: `message_id=eq.${messageId}` }, () => {
        fetchReactions()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [messageId, supabase])

  // Trigger 10-second cycling popup every 60 seconds (only when list is not open)
  useEffect(() => {
    if (comments.length === 0 || commentMode !== 'none') return

    const triggerCycle = () => {
      const shuffled = [...comments].sort(() => 0.5 - Math.random())
      setCurrentCycle(shuffled.slice(0, 5))
      setCommentIndex(0)
      setIsPopUpActive(true)
      setTimeout(() => setIsPopUpActive(false), 10000)
    }

    triggerCycle()
    const interval = setInterval(triggerCycle, 60000)
    return () => clearInterval(interval)
  }, [comments, commentMode])
  
  // Cycle comment ticker every 2s
  useEffect(() => {
    if (!isPopUpActive || currentCycle.length <= 1) return
    const interval = setInterval(() => {
      setCommentIndex(prev => (prev + 1) % currentCycle.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [isPopUpActive, currentCycle.length])

  const handleReact = async (type: string) => {
    setShowReact(false)
    if (!messageId) return
    if (isReacting.current) return
    isReacting.current = true

    const currentReactionType = Object.keys(myReactions)[0] || null
    const currentReactionId = currentReactionType ? myReactions[currentReactionType] : null

    try {
      // 1. If clicking the SAME reaction type already active -> TOGGLE OFF (unreact)
      if (currentReactionType === type) {
        setMyReactions({})
        syncStoredReactions(messageId, {})
        setReactionCounts(prev => ({
          ...prev,
          [type]: Math.max(0, (prev[type] || 0) - 1)
        }))

        // Device-gated server delete (direct anon DELETE is revoked by RLS hardening).
        if (currentReactionId && currentReactionId !== 'temp') {
          const res = await serverRemoveReaction(messageId, type)
          if ((res as any).error) {
            // Revert on error
            setMyReactions(currentReactionType ? { [currentReactionType]: currentReactionId } : {})
            syncStoredReactions(messageId, currentReactionType ? { [currentReactionType]: currentReactionId } : {})
            setReactionCounts(prev => ({
              ...prev,
              [type]: (prev[type] || 0) + 1
            }))
          }
        }
      }
      // 2. User selects a reaction -> Strictly 1 reaction per person, replaces previous reaction
      else {
        const oldType = currentReactionType
        const oldId = currentReactionId

        // Optimistically set the single new reaction
        setMyReactions({ [type]: 'temp' })
        syncStoredReactions(messageId, { [type]: 'temp' })

        setReactionCounts(prev => {
          const next = { ...prev }
          if (oldType) {
            next[oldType] = Math.max(0, (next[oldType] || 0) - 1)
          }
          next[type] = (next[type] || 0) + 1
          return next
        })

        // Delete old reaction from DB if there was one (device-gated server delete)
        if (oldId && oldId !== 'temp') {
          await serverRemoveReaction(messageId, oldType as string)
        }

        // Insert new single reaction (device-gated server insert, deduped per device+type)
        const res = await serverAddReaction(messageId, type)

        if (!(res as any).error && (res as any).id) {
          setMyReactions({ [type]: (res as any).id })
          syncStoredReactions(messageId, { [type]: (res as any).id })
        } else {
          // Revert on error
          setMyReactions(oldType && oldId ? { [oldType]: oldId } : {})
          syncStoredReactions(messageId, oldType && oldId ? { [oldType]: oldId } : {})
          setReactionCounts(prev => {
            const next = { ...prev }
            next[type] = Math.max(0, (next[type] || 0) - 1)
            if (oldType) next[oldType] = (next[oldType] || 0) + 1
            return next
          })
        }
      }
    } finally {
      isReacting.current = false
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !messageId || isSubmitting) return

    setIsSubmitting(true)
    const content = commentText.trim()
    // Device-gated server insert (direct anon INSERT is revoked by RLS hardening).
    const res = await serverAddComment(messageId, content)

    if ((res as any).error) {
      setIsSubmitting(false)
      return
    }
    const newComment = (res as any).comment
    if (newComment) {
      setComments(prev => prev.some(c => c.id === newComment.id)
        ? prev
        : [{ id: newComment.id, content: newComment.content, created_at: newComment.created_at }, ...prev].slice(0, 100))
    }
    setCommentText('')
    // After posting, if modal isn't open, show list
    if (!isModalOpen) {
      setCommentMode('list')
    }
    setIsSubmitting(false)
  }

  const toggleCommentPanel = () => {
    if (commentMode === 'none') {
      setCommentMode(comments.length > 0 ? 'list' : 'input')
    } else {
      setCommentMode('none')
    }
    setShowReact(false)
  }

  return (
    <div className="w-full relative">
      
      {/* Cycling Comments Ticker (hidden when panel or modal is open) */}
      {currentCycle.length > 0 && isPopUpActive && commentMode === 'none' && !isModalOpen && (
        <div className="absolute bottom-full mb-4 left-0 w-full flex justify-center">
          <AnimatePresence mode="wait">
            <motion.button
              key={currentCycle[commentIndex]?.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-black/60 backdrop-blur-md border border-white/10 text-white rounded-full text-sm font-medium shadow-xl truncate max-w-[90%] hover:bg-black/80 transition-colors text-left"
            >
              {currentCycle[commentIndex]?.content}
            </motion.button>
          </AnimatePresence>
        </div>
      )}

      {/* Reaction Popover */}
      <AnimatePresence>
        {showReact && (
          <motion.div
            ref={reactPopoverRef}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full mb-4 left-0 bg-neutral-900/95 dark:bg-neutral-900/95 border border-white/20 rounded-full shadow-2xl p-2 flex gap-2 z-50 backdrop-blur-xl"
          >
            {REACTIONS.map(r => (
              <button
                key={r.id}
                onClick={() => handleReact(r.id)}
                className={`w-11 h-11 flex flex-col items-center justify-center rounded-full transition-all relative group ${
                  myReactions[r.id] 
                    ? 'bg-amber-400/35 ring-2 ring-amber-400 scale-110 shadow-lg' 
                    : 'bg-white/10 hover:bg-white/20 hover:scale-110'
                }`}
              >
                <span className="text-xl select-none">{r.emoji}</span>
                {reactionCounts[r.id] > 0 && (
                  <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-amber-400 text-neutral-950 px-1.5 py-0.2 rounded-full shadow-md font-mono">
                    {reactionCounts[r.id] > 99 ? '99+' : reactionCounts[r.id]}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Panel — slides up from bottom of action bar */}
      <AnimatePresence>
        {commentMode !== 'none' && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-4 left-0 w-full bg-background-elevated border border-primary/20 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <MessageCircle size={15} className="text-secondary" />
                <span className="text-sm font-semibold">
                  {totalComments > 0 ? `${totalComments} comment${totalComments !== 1 ? 's' : ''}` : 'Comments'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setIsModalOpen(true); setCommentMode('none'); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-secondary hover:text-primary hover:bg-primary/10 transition"
                  title="Expand to Full Screen View"
                  aria-label="Expand to full screen"
                >
                  <Maximize2 size={13} />
                </button>
                <button
                  onClick={() => setCommentMode(commentMode === 'list' ? 'input' : 'list')}
                  className="text-xs px-3 py-1 rounded-full bg-primary text-background font-medium hover:opacity-90 transition"
                >
                  {commentMode === 'list' ? '+ Add' : 'View all'}
                </button>
                <button
                  onClick={() => setCommentMode('none')}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-secondary hover:bg-primary/10 transition"
                  aria-label="Close comment panel"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* List mode — scrollable comment list */}
            {commentMode === 'list' && (
              <div ref={listRef} className="max-h-64 overflow-y-auto custom-scrollbar">
                {comments.length === 0 ? (
                  <div className="px-4 py-8 text-center text-secondary text-sm">
                    No comments yet. Be the first!
                    <button
                      onClick={() => setCommentMode('input')}
                      className="block mx-auto mt-3 text-primary underline text-xs"
                    >
                      Write a comment
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y divide-primary/5">
                    {comments.map(c => (
                      <li key={c.id} className="px-4 py-3">
                        <p className="text-sm text-primary/90 leading-relaxed">{c.content}</p>
                        {c.created_at && (
                          <p suppressHydrationWarning className="text-[10px] text-secondary/50 mt-1">
                            {formatRelativeTime(c.created_at)}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Input mode — write a comment */}
            {commentMode === 'input' && (
              <form onSubmit={handleCommentSubmit} className="p-3 flex gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Say something nice..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={280}
                  className="flex-1 bg-background rounded-xl px-4 py-2.5 text-sm outline-none border border-primary/10 placeholder:text-secondary focus:border-primary/30"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmitting}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${commentText.trim() ? 'bg-primary text-background' : 'bg-primary/5 text-primary/30'}`}
                  aria-label="Send comment"
                >
                  <Send size={16} />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      {(() => {
        const isDarkCard = isVip || isDark
        const btnStyle = buttonClassName || (isDarkCard
          ? 'border-white/20 hover:border-white/35 bg-white/10 hover:bg-white/20 text-white/90'
          : 'border-black/10 dark:border-white/15 hover:border-black/20 dark:hover:border-white/30 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-neutral-800 dark:text-neutral-200'
        )

        return (
          <div className={`flex gap-4 items-center justify-between pt-4 border-t ${isDarkCard ? 'border-white/15' : 'border-black/10 dark:border-white/10'} w-full`}>
            <div className="flex gap-2 items-center flex-wrap">
              <button 
                onClick={handleReactClick}
                className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-3.5 md:py-1.5 rounded-full border transition-all backdrop-blur-md active:scale-95 ${
                  hasReacted 
                    ? (isDarkCard
                        ? (isLoved 
                            ? 'border-red-500/60 bg-red-500/25 hover:bg-red-500/35 text-white font-semibold shadow-lg shadow-red-500/20' 
                            : 'border-amber-400/60 bg-amber-500/25 hover:bg-amber-500/35 text-white font-semibold shadow-lg shadow-amber-500/20'
                          )
                        : (isLoved 
                            ? 'border-red-500/50 bg-red-100 hover:bg-red-200/80 text-red-700 font-semibold shadow-sm' 
                            : 'border-amber-400/60 bg-amber-100 hover:bg-amber-200/80 text-amber-900 font-semibold shadow-sm'
                          )
                      )
                    : btnStyle
                }`}
                title={hasReacted && myReaction ? `Reacted ${myReaction.emoji} • Click to change` : 'Add reaction'}
              >
                {hasReacted && myReaction ? (
                  <div className="flex items-center gap-1.5">
                    {/* Dedicated background badge behind reaction emoji */}
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0 select-none shadow-xs border ${
                      isDarkCard 
                        ? (isLoved ? 'bg-red-500/40 border-red-400/40 text-white' : 'bg-amber-400/35 border-amber-300/40 text-white') 
                        : (isLoved ? 'bg-red-200 border-red-300 text-red-700' : 'bg-amber-200 border-amber-300 text-amber-900')
                    }`}>
                      {myReaction.emoji}
                    </span>
                    {totalReactions > 0 && (
                      <span className={`text-xs font-bold font-mono px-0.5 ${isDarkCard ? 'text-white' : 'text-neutral-900'}`}>
                        {totalReactions}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {/* Background badge behind unreacted heart */}
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                      isDarkCard 
                        ? 'bg-red-500/20 border-red-500/30' 
                        : 'bg-red-50 border-red-200 dark:bg-white/10 dark:border-white/15'
                    }`}>
                      <Heart size={13} className="text-red-500 fill-red-500 transition-transform" />
                    </span>
                    {!compact && <span className="font-medium tracking-wide text-sm">React</span>}
                    {totalReactions > 0 && (
                      <span className={`text-xs font-bold font-mono ml-0.5 ${isDarkCard ? 'text-white/90' : 'text-neutral-800 dark:text-neutral-200'}`}>
                        {totalReactions}
                      </span>
                    )}
                  </div>
                )}
              </button>
            </div>

            <div className="flex gap-2 items-center">
              {/* Comment button shows count + opens panel / modal */}
              <button 
                onClick={toggleCommentPanel}
                className={`flex items-center gap-2 transition-all px-3 py-1.5 md:px-4 md:py-2 rounded-full border shadow-sm backdrop-blur-md active:scale-95 ${commentMode !== 'none' || isModalOpen ? 'bg-primary text-background border-primary' : btnStyle}`}
              >
                <MessageCircle size={16} />
                {!compact && (
                  <span className="font-medium tracking-wide text-sm">
                    {totalComments > 0 ? totalComments : 'Comment'}
                  </span>
                )}
              </button>

              {/* Full Screen Reader Trigger */}
              {totalComments > 0 && !compact && (
                <button
                  onClick={() => { setIsModalOpen(true); setCommentMode('none'); }}
                  className={`p-2 rounded-full border transition-all shadow-sm ${btnStyle}`}
                  title="Open full-view comment reader"
                  aria-label="Open full comments reader"
                >
                  <Maximize2 size={15} />
                </button>
              )}
              
              <ShareMenu 
                url={`${typeof window !== 'undefined' ? window.location.origin : 'https://words.world'}/w/${messageId}`} 
                text="Check out this message on Words of the World" 
                isVip={isVip}
                isDark={isDark}
                buttonClassName={buttonClassName}
              />
            </div>
          </div>
        )
      })()}

      {/* Full-View Comments Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-xl max-h-[85vh] bg-background-elevated border border-primary/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-left"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-primary/10 bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary text-base">Community Voices</h3>
                    <p className="text-xs text-secondary">
                      {totalComments} {totalComments === 1 ? 'thought' : 'thoughts'} shared on this broadcast
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:text-primary hover:bg-primary/10 transition"
                  aria-label="Close comments reader"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Comments List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3.5 custom-scrollbar">
                {comments.length === 0 ? (
                  <div className="py-14 text-center text-secondary">
                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 border border-primary/15">
                      <MessageCircle size={24} />
                    </div>
                    <p className="text-base font-serif font-medium text-primary">No comments yet</p>
                    <p className="text-xs text-secondary mt-1">Be the first to share your thoughts on this broadcast!</p>
                  </div>
                ) : (
                  comments.map((c, i) => (
                    <div 
                      key={c.id} 
                      className="p-4 rounded-2xl border border-primary/10 bg-background/60 hover:bg-background/80 transition-colors flex gap-3.5"
                    >
                      <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold font-mono bg-primary/10 text-primary border border-primary/20">
                        {String.fromCharCode(65 + (i % 26))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-semibold text-primary/80">Anonymous Voice</span>
                          {c.created_at && (
                            <span suppressHydrationWarning className="text-[10px] text-secondary">
                              {formatRelativeTime(c.created_at)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-primary leading-relaxed break-words whitespace-pre-wrap">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Sticky Comment Input */}
              <form onSubmit={handleCommentSubmit} className="p-4 border-t border-primary/10 bg-background/80 flex gap-2.5">
                <input
                  type="text"
                  placeholder="Share a thoughtful reply..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={280}
                  className="flex-1 bg-background-elevated rounded-2xl px-4 py-3 text-sm outline-none border border-primary/15 placeholder:text-secondary focus:border-primary/40 transition-colors text-primary"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmitting}
                  className={`px-5 py-3 rounded-2xl font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5 transition-all shrink-0 ${
                    commentText.trim() && !isSubmitting
                      ? 'bg-primary text-background shadow-md hover:opacity-90 active:scale-95'
                      : 'bg-primary/10 text-secondary cursor-not-allowed'
                  }`}
                  aria-label="Send reply"
                >
                  <Send size={14} />
                  <span>Send</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
