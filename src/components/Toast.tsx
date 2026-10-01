'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  title?: string
  duration?: number
}

type ToastListener = (toasts: ToastItem[]) => void

class ToastEmitter {
  private toasts: ToastItem[] = []
  private listeners: Set<ToastListener> = new Set()

  subscribe(listener: ToastListener) {
    this.listeners.add(listener)
    listener(this.toasts)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]))
  }

  show(type: ToastType, message: string, options?: { title?: string; duration?: number }) {
    const id = Math.random().toString(36).substring(2, 9)
    const duration = options?.duration ?? 4500
    const newToast: ToastItem = {
      id,
      type,
      message,
      title: options?.title,
      duration,
    }
    // Keep at most 3 toasts on screen simultaneously to prevent obstruction
    this.toasts = [...this.toasts.slice(-2), newToast]
    this.notify()
    return id
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.notify()
  }

  success(message: string, options?: { title?: string; duration?: number }) {
    return this.show('success', message, options)
  }

  error(message: string, options?: { title?: string; duration?: number }) {
    return this.show('error', message, options)
  }

  info(message: string, options?: { title?: string; duration?: number }) {
    return this.show('info', message, options)
  }
}

export const toast = new ToastEmitter()

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    return toast.subscribe(setToasts)
  }, [])

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2.5 max-w-[92vw] sm:max-w-md w-full pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <ToastCard key={t.id} toastItem={t} onDismiss={() => toast.dismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastCard({ toastItem, onDismiss }: { toastItem: ToastItem; onDismiss: () => void }) {
  useEffect(() => {
    if (toastItem.duration && toastItem.duration > 0) {
      const timer = setTimeout(() => {
        onDismiss()
      }, toastItem.duration)
      return () => clearTimeout(timer)
    }
  }, [toastItem, onDismiss])

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
  }

  const borders = {
    success: 'border-emerald-500/25 dark:border-emerald-500/35',
    error: 'border-rose-500/25 dark:border-rose-500/35',
    info: 'border-amber-500/25 dark:border-amber-500/35',
  }

  const glows = {
    success: 'shadow-[0_12px_36px_-8px_rgba(16,185,129,0.25)]',
    error: 'shadow-[0_12px_36px_-8px_rgba(244,63,94,0.25)]',
    info: 'shadow-[0_12px_36px_-8px_rgba(245,158,11,0.25)]',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className={`pointer-events-auto flex items-start gap-3 w-full p-4 rounded-2xl bg-background-elevated/95 backdrop-blur-xl border ${borders[toastItem.type]} ${glows[toastItem.type]} shadow-2xl text-primary`}
    >
      {icons[toastItem.type]}
      <div className="flex-1 min-w-0 pr-1">
        {toastItem.title && (
          <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5 text-primary">
            {toastItem.title}
          </h4>
        )}
        <p className="text-sm leading-relaxed text-primary/90 font-medium break-words">
          {toastItem.message}
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-secondary hover:text-primary transition-colors p-1 -mr-1 -mt-1 rounded-lg hover:bg-background-muted shrink-0"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
