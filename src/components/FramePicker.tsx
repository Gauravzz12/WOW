import React from 'react'
import { FRAMES } from '@/lib/constants/frames'
import { Frame } from 'lucide-react'

interface FramePickerProps {
  selectedId: string | null
  onChange: (id: string | null) => void
  /** Delivery tier — all occasion frames are now unified and available for all tiers */
  tier?: 'normal' | 'special' | 'sponsored'
}

export function FramePicker({ selectedId, onChange }: FramePickerProps) {
  // Show all occasion-focused frames (simpler retired frames remain hidden from the picker)
  const visibleFrames = FRAMES.filter(f => !f.pickerHidden)

  return (
    <div className="flex flex-col h-full bg-background-elevated/30 rounded-lg overflow-hidden border border-background-elevated shadow-sm">
      <div className="flex items-center justify-between p-3 sm:px-4 sm:py-3 border-b border-background-elevated bg-background-elevated/50">
        <div className="flex items-center gap-2">
          <Frame size={16} className="text-secondary" />
          <h3 className="text-sm font-semibold text-primary">Occasion Borders & Frames</h3>
        </div>
        <span className="text-[11px] text-secondary font-mono">{visibleFrames.length} styles</span>
      </div>
      
      <div className="p-3 sm:p-4 grid grid-cols-2 gap-3 max-h-[340px] overflow-y-auto custom-scrollbar">
        {visibleFrames.map((frame) => {
          const isSelected = selectedId === frame.id || (frame.id === 'none' && !selectedId)
          
          return (
            <button
              key={frame.id}
              type="button"
              onClick={() => onChange(frame.id === 'none' ? null : frame.id)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                isSelected 
                  ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30 shadow-sm scale-[1.02]' 
                  : 'border-primary/10 hover:border-primary/30 hover:bg-background-elevated/80'
              }`}
            >
              <span className="text-2xl drop-shadow-sm">{frame.emoji}</span>
              <div className="space-y-0.5 w-full">
                {frame.occasionTag && (
                  <span className="inline-block text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-background-elevated text-secondary mb-0.5">
                    {frame.occasionTag}
                  </span>
                )}
                <span className="block text-xs font-bold leading-tight">{frame.name}</span>
                <span className="block text-[10px] text-secondary leading-tight opacity-80 line-clamp-2">{frame.description}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
