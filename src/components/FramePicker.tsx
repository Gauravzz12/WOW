import React from 'react'
import { FRAMES } from '@/lib/constants/frames'
import { Frame } from 'lucide-react'

interface FramePickerProps {
  selectedId: string | null
  onChange: (id: string | null) => void
}

export function FramePicker({ selectedId, onChange }: FramePickerProps) {
  return (
    <div className="flex flex-col h-full bg-background-elevated/30 rounded-2xl overflow-hidden border border-background-elevated shadow-sm">
      <div className="flex items-center gap-2 p-3 sm:px-4 sm:py-3 border-b border-background-elevated bg-background-elevated/50">
        <Frame size={16} className="text-secondary" />
        <h3 className="text-sm font-semibold text-primary">Frame Decoration</h3>
      </div>
      
      <div className="p-3 sm:p-4 grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar">
        {FRAMES.map((frame) => {
          const isSelected = selectedId === frame.id || (frame.id === 'none' && !selectedId)
          
          return (
            <button
              key={frame.id}
              onClick={() => onChange(frame.id === 'none' ? null : frame.id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all ${
                isSelected 
                  ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/30' 
                  : 'border-primary/10 hover:border-primary/30 hover:bg-background-elevated/80'
              }`}
            >
              <span className="text-2xl drop-shadow-sm">{frame.emoji}</span>
              <div className="space-y-0.5">
                <span className="block text-xs font-bold leading-tight">{frame.name}</span>
                <span className="block text-[10px] text-secondary leading-tight opacity-80">{frame.description}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
