'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Trash2 } from 'lucide-react'
import posthog from 'posthog-js'
import { getDeviceId } from '@/lib/deviceId'
import { addComment, deleteComment } from './comments'

const MAX_LEN = 300

export function CommentSection({ messageId }: { messageId: string }) {
  const [comments, setComments] = useState<any[]>([])
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [myDeviceId, setMyDeviceId] = useState<string>('')
  const supabase = createClient()
  const endOfCommentsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMyDeviceId(getDeviceId())
  }, [])

  useEffect(() => {
    // Initial fetch
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          device_id
        `)
        .eq('message_id', messageId)
        .order('created_at', { ascending: true })
        .limit(200)

      if (!error && data) {
        setComments(data)
      }
    }

    fetchComments()

    // Realtime subscription
    const channel = supabase.channel(`comments_${messageId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `message_id=eq.${messageId}`
      }, () => {
        fetchComments()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [messageId, supabase])

  const scrollToBottom = () => {
    setTimeout(() => {
      endOfCommentsRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = content.trim()
    if (!trimmed || trimmed.length > MAX_LEN || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    // Server-validated, rate-limited insert (never direct anon writes).
    const res = await addComment(messageId, trimmed)

    setIsSubmitting(false)
    if ((res as any).error) {
      setError((res as any).error)
      return
    }
    try { posthog.capture('comment_posted', { message_id: messageId }) } catch {}
    setContent('')
    if ((res as any).comment) {
      setComments(prev => [...prev, (res as any).comment])
      scrollToBottom()
    }
  }

  const handleDelete = async (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId))
    const res = await deleteComment(messageId, commentId)
    if ((res as any).error) {
      // Revert: refetch to restore
      const { data } = await supabase
        .from('comments')
        .select('id, content, created_at, device_id')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true })
        .limit(200)
      if (data) setComments(data)
    }
  }

  return (
    <div className="flex flex-col h-[500px] bg-background-elevated border border-primary/10 rounded-2xl overflow-hidden">

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {comments.length === 0 ? (
          <div className="h-full flex items-center justify-center text-secondary text-sm">
            Be the first to comment.
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="group flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-secondary/70">
                  Anonymous
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-[10px] text-secondary/50">
                    {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {myDeviceId && comment.device_id === myDeviceId && (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment.id)}
                      aria-label="Delete your comment"
                      className="text-secondary/40 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </span>
              </div>
              <div className="bg-background border border-primary/5 rounded-xl rounded-tl-none px-4 py-3 text-sm inline-block max-w-[85%] self-start shadow-sm">
                {comment.content}
              </div>
            </div>
          ))
        )}
        <div ref={endOfCommentsRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-primary/10">
        {error && <p className="text-xs text-red-500 mb-2 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"Add an anonymous comment..."}
            maxLength={MAX_LEN}
            className="w-full bg-background-elevated border border-primary/20 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-background rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          >
            <Send className="w-3 h-3" />
          </button>
        </form>
      </div>

    </div>
  )
}
