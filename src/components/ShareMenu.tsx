'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import posthog from 'posthog-js'

export function ShareMenu({ 
  url, 
  text, 
  isVip = false, 
  isDark = false, 
  buttonClassName 
}: { 
  url: string, 
  text: string, 
  isVip?: boolean, 
  isDark?: boolean, 
  buttonClassName?: string 
}) {
  const [copied, setCopied] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const isDarkCard = isVip || isDark
  const btnStyle = buttonClassName || (isDarkCard
    ? 'border-white/20 hover:border-white/35 bg-white/10 hover:bg-white/20 text-white/90'
    : 'border-black/10 dark:border-white/15 hover:border-black/20 dark:hover:border-white/30 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-neutral-800 dark:text-neutral-200'
  )

  const safeCapture = (event: string, props?: Record<string, unknown>) => {
    try { posthog.capture(event, props) } catch {}
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Words of the World',
          text: text,
          url: url,
        })
        safeCapture('message_shared', { method: 'native' })
      } catch (err) {
        // user cancelled or failed
      }
    } else {
      setIsOpen(!isOpen)
    }
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    safeCapture('message_shared', { method: 'clipboard' })
    setTimeout(() => setCopied(false), 2000)
    setIsOpen(false)
  }

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
    safeCapture('message_shared', { method: 'twitter' })
    setIsOpen(false)
  }

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    safeCapture('message_shared', { method: 'facebook' })
    setIsOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button 
        onClick={handleNativeShare}
        className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border shadow-sm backdrop-blur-md transition-all active:scale-95 ${btnStyle}`}
      >
        <Share2 size={16} />
        <span className="font-medium tracking-wide text-sm hidden md:inline">Share</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-48 bg-background-elevated border border-primary/20 rounded-xl shadow-xl overflow-hidden z-50 animate-in slide-in-from-bottom-2">
          <button 
            onClick={copyToClipboard}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-primary/10 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button 
            onClick={shareTwitter}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-primary/10 transition-colors border-t border-primary/5"
          >
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
            Share on X
          </button>
          <button 
            onClick={shareFacebook}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-primary/10 transition-colors border-t border-primary/5"
          >
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg>
            Share on Facebook
          </button>
        </div>
      )}
    </div>
  )
}
