'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

export function MessageViewTracker({ messageId, categoryName }: { messageId: string, categoryName: string }) {
  useEffect(() => {
    posthog.capture('message_viewed', { message_id: messageId, category: categoryName })
  }, [messageId, categoryName])
  
  return null
}
