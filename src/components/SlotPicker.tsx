'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Clock, Lock, Sparkles, Check, Info, Globe } from 'lucide-react'
import { 
  SPECIAL_SLOT_PRICE, 
  SPECIAL_SLOT_HOURS, 
  MAX_SPECIAL_SLOTS, 
  FIXED_3H_SLOT_DEFINITIONS,
  getFixedSlotsForUtcDate,
  formatLocalSlotTime,
  getUserLocalTimeZone,
  calculateSpecialPrice 
} from '@/lib/constants/pricing'

export interface Slot {
  id: string
  slotNumber: number
  startHour: number
  endHour: number
  label: string
  shortLabel: string
  scheduled_start: string
  scheduled_end: string
  status: 'AVAILABLE' | 'BOOKED'
  bid_amount: number
}

interface SlotPickerProps {
  onSelect: (slots: Slot[]) => void
  selectedSlotIds?: string[]
  initialDate?: Date | string
  initialSlotNumber?: number
}

function formatUtcDate(date: Date) {
  return date.toLocaleDateString('en-US', { 
    timeZone: 'UTC', 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}

export function SlotPicker({ onSelect, selectedSlotIds = [], initialDate, initialSlotNumber }: SlotPickerProps) {
  // Anchor to provided initial date or today's UTC calendar day
  const [selectedUtcDate, setSelectedUtcDate] = useState<Date>(() => {
    if (initialDate) {
      const d = new Date(initialDate)
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    }
    const now = new Date()
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  })

  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([])
  const [hintMessage, setHintMessage] = useState<string | null>(null)
  const [userTz, setUserTz] = useState<string>('Local')
  const [isMounted, setIsMounted] = useState(false)
  // Ensures the initialSlotNumber auto-pick runs only once (not on every date visit)
  const initialAutoSelectDone = useRef(false)

  // Set user timezone on mount
  useEffect(() => {
    setIsMounted(true)
    setUserTz(getUserLocalTimeZone())
  }, [])

  const minUtcDate = (() => {
    const now = new Date()
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  })()

  const maxUtcDate = (() => {
    const max = new Date(minUtcDate)
    max.setUTCDate(max.getUTCDate() + 15)
    return max
  })()

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true)
      try {
        const y = selectedUtcDate.getUTCFullYear()
        const m = selectedUtcDate.getUTCMonth()
        const d = selectedUtcDate.getUTCDate()

        // Generate the 8 universal UTC 3-hour slots for this UTC date
        const daySlots = getFixedSlotsForUtcDate(y, m, d)

        const res = await fetch('/api/slots/available', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slots: daySlots.map(s => ({
              scheduled_start: s.scheduled_start,
              scheduled_end: s.scheduled_end,
              bid_amount: SPECIAL_SLOT_PRICE
            }))
          })
        })

        const data = await res.json()
        if (data.slots && Array.isArray(data.slots)) {
          const merged: Slot[] = data.slots.map((dbSlot: any, index: number) => {
            const def = FIXED_3H_SLOT_DEFINITIONS[index] || FIXED_3H_SLOT_DEFINITIONS[0]
            return {
              id: dbSlot.id || `slot_${index}`,
              slotNumber: def.slotNumber,
              startHour: def.startHour,
              endHour: def.endHour,
              label: def.label,
              shortLabel: def.shortLabel,
              scheduled_start: dbSlot.scheduled_start,
              scheduled_end: dbSlot.scheduled_end,
              status: dbSlot.status || 'AVAILABLE',
              bid_amount: dbSlot.bid_amount || SPECIAL_SLOT_PRICE
            }
          })
          setSlots(merged)

          // Merge current-day matches into the existing selection — never replace.
          // Picks may span several UTC days, so emitting only this day's slots
          // would wipe selections made on other days.
          if (selectedSlotIds.length > 0) {
            const preSelected = merged.filter(s => selectedSlotIds.includes(s.id))
            if (preSelected.length > 0) {
              setSelectedSlots(prev => {
                if (prev.length === 0) return preSelected
                const prevIds = new Set(prev.map(s => s.id))
                const refreshed = prev.map(s => preSelected.find(p => p.id === s.id) ?? s)
                const additions = preSelected.filter(s => !prevIds.has(s.id))
                return additions.length > 0 ? [...refreshed, ...additions] : refreshed
              })
            }
          } else if (initialSlotNumber && !initialAutoSelectDone.current) {
            initialAutoSelectDone.current = true
            const matchSlot = merged.find(s => s.slotNumber === initialSlotNumber && s.status === 'AVAILABLE')
            if (matchSlot) {
              setSelectedSlots([matchSlot])
              onSelect([matchSlot])
            }
          }
        } else {
          setSlots([])
        }
      } catch {
        setSlots([])
      } finally {
        setLoading(false)
      }
    }
    fetchSlots()
  }, [selectedUtcDate])

  const changeDate = (delta: number) => {
    const next = new Date(selectedUtcDate)
    next.setUTCDate(next.getUTCDate() + delta)
    if (next >= minUtcDate && next <= maxUtcDate) {
      // Keep the selection intact across date navigation so slots can be
      // combined from consecutive days (e.g. 1 slot today + 2 tomorrow).
      setSelectedUtcDate(next)
      setHintMessage(null)
    }
  }

  const handleSlotClick = (clickedSlot: Slot) => {
    setHintMessage(null)
    const isAlreadySelected = selectedSlots.some(s => s.id === clickedSlot.id)

    if (isAlreadySelected) {
      const remaining = selectedSlots.filter(s => s.id !== clickedSlot.id)
      setSelectedSlots(remaining)
      onSelect(remaining)
      return
    }

    if (selectedSlots.length === 0) {
      const next = [clickedSlot]
      setSelectedSlots(next)
      onSelect(next)
      return
    }

    // Check continuity across slots
    const sorted = [...selectedSlots].sort(
      (a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime()
    )
    const earliest = sorted[0]
    const latest = sorted[sorted.length - 1]

    const isDirectlyBefore = new Date(clickedSlot.scheduled_end).getTime() === new Date(earliest.scheduled_start).getTime()
    const isDirectlyAfter = new Date(clickedSlot.scheduled_start).getTime() === new Date(latest.scheduled_end).getTime()

    if (isDirectlyBefore || isDirectlyAfter) {
      if (sorted.length >= MAX_SPECIAL_SLOTS) {
        setHintMessage(`Maximum ${MAX_SPECIAL_SLOTS} continuous slots (9 hours) can be booked together.`)
        return
      }
      const next = isDirectlyBefore ? [clickedSlot, ...sorted] : [...sorted, clickedSlot]
      setSelectedSlots(next)
      onSelect(next)
    } else {
      const next = [clickedSlot]
      setSelectedSlots(next)
      onSelect(next)
      setHintMessage('Continuous slot selection reset to this slot. Click adjacent slots to extend up to 3.')
    }
  }

  const pricing = calculateSpecialPrice(selectedSlots.length)
  const sortedSelected = [...selectedSlots].sort(
    (a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime()
  )

  const isTodayUtc = selectedUtcDate.getTime() === minUtcDate.getTime()
  const isTomorrowUtc = selectedUtcDate.getTime() === minUtcDate.getTime() + 86400000

  return (
    <div className="space-y-4">
      {/* Timezone banner */}
      <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-violet-800 dark:text-violet-300 font-medium">
          <Globe size={14} className="shrink-0 text-violet-500" />
          <span>$30 = 3 hours, locked in</span>
        </div>
        <div suppressHydrationWarning className="text-[11px] font-mono text-secondary">
          Shown in your time: <strong suppressHydrationWarning className="text-primary font-bold">{isMounted ? userTz : 'Local'}</strong>
        </div>
      </div>

      {/* Date navigator (UTC Days) */}
      <div className="flex items-center justify-between bg-background-elevated border border-primary/10 rounded-2xl p-3 shadow-xs">
        <button
          type="button"
          onClick={() => changeDate(-1)}
          disabled={selectedUtcDate <= minUtcDate}
          className="p-1.5 rounded-lg hover:bg-primary/10 disabled:opacity-30 transition-all text-primary"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="font-semibold text-sm">{formatUtcDate(selectedUtcDate)} (UTC)</p>
          <p className="text-[10px] text-secondary uppercase tracking-widest mt-0.5 font-mono">
            {isTodayUtc ? 'Today • UTC' : isTomorrowUtc ? 'Tomorrow • UTC' : '15-Day Global Schedule'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => changeDate(1)}
          disabled={selectedUtcDate >= maxUtcDate}
          className="p-1.5 rounded-lg hover:bg-primary/10 disabled:opacity-30 transition-all text-primary"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Slots Header */}
      <div className="flex items-center justify-between text-xs px-1 text-secondary">
        <span className="font-semibold text-primary">8 slots a day — pick yours</span>
        <span className="text-[11px] font-mono font-bold text-violet-700 dark:text-violet-400">
          $30 / 3 hours
        </span>
      </div>

      {/* Slots Grid */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-secondary text-sm">
          <Clock size={16} className="animate-spin text-violet-500" />
          <span>Loading slots…</span>
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-8 text-secondary text-sm bg-background-elevated/40 rounded-2xl border border-primary/10">
          No slots available for this date.
          <br />
          <span className="text-xs opacity-60">Please select another date.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
          {slots.map(slot => {
            const isBooked = slot.status === 'BOOKED'
            const isSelected = selectedSlots.some(s => s.id === slot.id)
            // A slot is past only once fully elapsed — in-progress slots with
            // remaining airtime stay bookable.
            const isPast = new Date(slot.scheduled_end).getTime() <= Date.now()
            const disabled = isBooked || isPast
            const orderIndex = sortedSelected.findIndex(s => s.id === slot.id)

            const localStart = formatLocalSlotTime(slot.scheduled_start)
            const localEnd = formatLocalSlotTime(slot.scheduled_end)

            return (
              <button
                key={slot.id}
                type="button"
                disabled={disabled}
                onClick={() => handleSlotClick(slot)}
                className={`relative flex items-center justify-between p-3 rounded-xl border text-left transition-all text-xs
                  ${isSelected ? 'bg-violet-700 dark:bg-violet-600 text-white border-violet-700 dark:border-violet-500 shadow-sm ring-2 ring-amber-300/60' : ''}
                  ${disabled ? 'opacity-40 cursor-not-allowed border-primary/10 bg-background-muted text-secondary' : ''}
                  ${!disabled && !isSelected ? 'border-violet-500/20 bg-background hover:border-violet-500/50 hover:bg-violet-500/[0.05] text-primary' : ''}
                `}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  {/* Master Slot Label */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-violet-500/10 text-violet-700 dark:text-violet-300'
                    }`}>
                      ✦ {slot.shortLabel}
                    </span>
                    <span className="font-bold text-xs">
                      {slot.label}
                    </span>
                  </div>

                  {/* Local Time Conversion for the Visitor */}
                  <div className={`text-[11px] mt-1 font-medium ${isSelected ? 'text-violet-100' : 'text-primary/90'}`}>
                    Your time: <span className="font-semibold">{localStart} &ndash; {localEnd}</span> <span className="opacity-70 text-[10px]">({userTz})</span>
                  </div>

                  <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-violet-200' : 'text-secondary/60'}`}>
                    Slot #{slot.slotNumber} of 8
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {isBooked && (
                    <span className="flex items-center gap-1 text-[10px] text-secondary font-medium bg-background/50 px-2 py-0.5 rounded">
                      <Lock size={10} />
                      <span>Booked</span>
                    </span>
                  )}
                  {isPast && !isBooked && (
                    <span className="text-[10px] text-secondary font-medium bg-background/40 px-2 py-0.5 rounded">
                      Past
                    </span>
                  )}
                  {isSelected && (
                    <span className="font-bold font-mono text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={11} />
                      <span>Slot {orderIndex + 1}</span>
                    </span>
                  )}
                  {!disabled && !isSelected && (
                    <span className="font-mono font-bold text-xs text-violet-700 dark:text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded">
                      ${SPECIAL_SLOT_PRICE}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Hint / Alert */}
      {hintMessage && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
          <Info size={14} className="shrink-0" />
          <span>{hintMessage}</span>
        </div>
      )}

      {/* Multi-day selection indicator — slots picked on other dates stay selected */}
      {!loading && slots.length > 0 && selectedSlots.some(s => !slots.some(m => m.id === s.id)) && (
        <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-800 dark:text-violet-300 text-xs flex items-center gap-2">
          <Check size={14} className="shrink-0" />
          <span>
            +{selectedSlots.filter(s => !slots.some(m => m.id === s.id)).length} slot{selectedSlots.filter(s => !slots.some(m => m.id === s.id)).length > 1 ? 's' : ''} selected on other day{selectedSlots.filter(s => !slots.some(m => m.id === s.id)).length > 1 ? 's' : ''} — kept while you browse dates. Pick an adjacent slot here to extend.
          </span>
        </div>
      )}

      {/* Multi-slot continuous selection summary & 20% discount breakdown */}
      {selectedSlots.length > 0 && (
        <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/25 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-violet-900 dark:text-violet-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>
                {selectedSlots.length} Fixed Slot{selectedSlots.length > 1 ? 's' : ''} ({selectedSlots.length * SPECIAL_SLOT_HOURS} Hours Airtime)
              </span>
            </span>

            <div className="flex items-center gap-2">
              {selectedSlots.length > 1 && (
                <span className="line-through text-secondary font-mono text-xs">
                  ${pricing.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="font-mono font-bold text-sm text-emerald-800 dark:text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md">
                ${pricing.finalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {selectedSlots.length > 1 ? (
            <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-semibold pt-1 border-t border-violet-500/15">
              <span>🎉 20% off for booking together!</span>
              <span className="font-mono">Save ${pricing.savings.toFixed(2)}</span>
            </div>
          ) : (
            <p className="text-[11px] text-secondary leading-relaxed pt-1 border-t border-violet-500/15">
              💡 Tip: pick slots next to each other (up to 9 hours total) and get <strong className="text-emerald-600 dark:text-emerald-400">20% off</strong>!
            </p>
          )}

          {/* Dual Window Summary: UTC and Local Time (per-slot, supports multi-day picks) */}
          <div className="text-[11px] text-secondary space-y-0.5 pt-1 border-t border-violet-500/15">
            <div className="font-mono">
              <span className="font-bold text-violet-700 dark:text-violet-300">UTC Window:</span>{' '}
              {sortedSelected.map(s => `${s.shortLabel.replace(' UTC', '')} (${formatUtcDate(new Date(s.scheduled_start))})`).join(' + ')} UTC
            </div>
            <div className="font-mono">
              <span className="font-bold text-primary">Your Time:</span>{' '}
              {sortedSelected.map(s => `${formatLocalSlotTime(s.scheduled_start)}–${formatLocalSlotTime(s.scheduled_end)}`).join(' + ')} ({userTz})
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
