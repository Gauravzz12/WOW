'use client'

import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { X } from 'lucide-react'

export function LeftSidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 md:w-64
        bg-background border-r border-background-elevated p-8
        flex flex-col h-[100dvh]
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex
      `}>
        
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-xl font-bold tracking-widest uppercase">Words of the World</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
              className="md:hidden text-secondary hover:text-primary transition-colors" 
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2 mt-4">
          <Link href="/about" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-background-elevated transition-colors text-secondary hover:text-primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            <span className="font-bold tracking-wider uppercase text-sm">About</span>
          </Link>
          <Link href="/leaderboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-amber-500/10 transition-colors text-secondary hover:text-amber-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
            <span className="font-bold tracking-wider uppercase text-sm">Leaderboard</span>
          </Link>
        </nav>
        
        <div className="mt-8">
          <Link href="/create">
            <button className="w-full py-3 bg-primary text-background rounded-full font-medium hover:opacity-90 transition-all shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] mb-4">
              Speak to the World
            </button>
          </Link>
          <Link href="/waiting-room">
            <button className="w-full py-3 bg-transparent border border-primary/20 text-primary rounded-full font-medium hover:bg-primary/5 transition-all mb-4">
              The Waiting Room
            </button>
          </Link>
        </div>
      </aside>
    </>
  )
}
