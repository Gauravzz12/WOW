'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

export function MessageViewTracker({ messageId, categoryName }: { messageId: string, categoryName: string }) {
  useEffect(() => {
    try { posthog.capture('message_viewed', { message_id: messageId, category: categoryName }) } catch {}
    // Intentionally fire-and-forget analytics only; nothing persisted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageId])
  
  return null
}
