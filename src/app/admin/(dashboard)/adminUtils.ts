import { Zap, Sparkles, Radio, LucideIcon } from 'lucide-react'

export interface AdminMessage {
  id: string
  content: string
  status: string
  created_at: string
  actual_start?: string | null
  scheduled_start?: string | null
  scheduled_end?: string | null
  bid_amount: number
  is_reserved_slot: boolean
  signature?: string | null
  recipient?: string | null
  style_config?: any
  category?: {
    name: string
    slug?: string
    base_price?: number
  } | null
}

export type MessageType = 'special' | 'sponsored' | 'normal'

export interface MessageTypeInfo {
  type: MessageType
  label: string
  badgeClass: string
  icon: LucideIcon
  sponsorName?: string
  sponsorNote?: string
}

export function getMessageTypeInfo(msg: AdminMessage): MessageTypeInfo {
  const config = typeof msg.style_config === 'string'
    ? (() => { try { return JSON.parse(msg.style_config) } catch { return {} } })()
    : (msg.style_config || {})

  if (msg.is_reserved_slot) {
    return {
      type: 'special',
      label: 'Special (VIP)',
      badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25',
      icon: Zap,
    }
  }

  if (msg.bid_amount < 2 || config.sponsorName || config.sponsorNote) {
    return {
      type: 'sponsored',
      label: 'Sponsored',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
      icon: Sparkles,
      sponsorName: config.sponsorName,
      sponsorNote: config.sponsorNote,
    }
  }

  return {
    type: 'normal',
    label: 'Normal',
    badgeClass: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25',
    icon: Radio,
  }
}
