'use client'

import React from 'react'

/**
 * FrameDecorator renders high-end, occasion-tailored decorative borders inside a card.
 * Integrates:
 * - Magic UI: Animated CSS/SVG border beams, radiant glowing trails, and pulsing particles.
 * - Openclipart: Intricate decorative vector artwork (hearts, champagne, roses, laurel, baroque).
 * - Plotcaster: Modular corner-and-edge architecture with zero distortion across any aspect ratio.
 */
// Frame ids retired in the Nov 2026 unification. Stored messages still
// carry them; without a mapping they rendered frameless. Each maps to the
// closest surviving frame so old messages keep a border.
const LEGACY_FRAME_ALIASES: Record<string, string> = {
  'double-rule': 'editorial-frame',
  'ledger': 'editorial-frame',
  'top-band': 'bold-inset',
  'ticket-stub': 'bold-inset',
  'postage-stamp': 'bold-inset',
  'stepped-inset': 'bold-inset',
  'corner-ticks': 'solid-clean',
  'dashed-sketch': 'solid-clean',
  'ornate-corners': 'baroque-filigree',
  'film-strip': 'cyber-matrix',
}

export function FrameDecorator({ frameId: rawFrameId, accentHex }: { frameId?: string; accentHex?: string }) {
  if (!rawFrameId || rawFrameId === 'none') return null
  const frameId = LEGACY_FRAME_ALIASES[rawFrameId] ?? rawFrameId

  // ═══════════════════════════════════════════════════════════════════════════════
  // SOLID & ARCHITECTURAL FRAMES
  // ═══════════════════════════════════════════════════════════════════════════════

  // 1. Solid Clean — crisp modern single border hairline
  if (frameId === 'solid-clean') {
    const strokeColor = accentHex || 'currentColor'
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[2] overflow-hidden select-none p-1.5 sm:p-2">
        <div
          className="w-full h-full rounded-xl border-2 pointer-events-none transition-colors"
          style={{ borderColor: strokeColor, opacity: 0.7 }}
        />
      </div>
    )
  }

  // 2. Royal Double — classic double-line prestige border
  if (frameId === 'royal-double') {
    const strokeColor = accentHex || '#D4AF37'
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[2] overflow-hidden select-none p-1 sm:p-1.5">
        <div
          className="w-full h-full rounded-xl border-2 p-1 pointer-events-none transition-colors"
          style={{ borderColor: strokeColor, opacity: 0.85 }}
        >
          <div
            className="w-full h-full rounded-lg border pointer-events-none transition-colors"
            style={{ borderColor: strokeColor, opacity: 0.6 }}
          />
        </div>
      </div>
    )
  }

  // 3. Architectural Inset — crisp framed inset with corner notches
  if (frameId === 'bold-inset') {
    const strokeColor = accentHex || 'currentColor'
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[2] overflow-hidden select-none p-2 sm:p-3">
        <div
          className="relative w-full h-full rounded-lg border border-dashed pointer-events-none transition-colors"
          style={{ borderColor: strokeColor, opacity: 0.65 }}
        >
          <span className="absolute -top-[2px] -left-[2px] w-3 h-3 border-t-2 border-l-2 rounded-tl" style={{ borderColor: strokeColor, opacity: 0.95 }} />
          <span className="absolute -top-[2px] -right-[2px] w-3 h-3 border-t-2 border-r-2 rounded-tr" style={{ borderColor: strokeColor, opacity: 0.95 }} />
          <span className="absolute -bottom-[2px] -left-[2px] w-3 h-3 border-b-2 border-l-2 rounded-bl" style={{ borderColor: strokeColor, opacity: 0.95 }} />
          <span className="absolute -bottom-[2px] -right-[2px] w-3 h-3 border-b-2 border-r-2 rounded-br" style={{ borderColor: strokeColor, opacity: 0.95 }} />
        </div>
      </div>
    )
  }

  // 4. Editorial Rule — refined top and bottom accent header rules
  if (frameId === 'editorial-frame') {
    const strokeColor = accentHex || 'currentColor'
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[2] overflow-hidden select-none p-2 sm:p-2.5 flex flex-col justify-between">
        <div className="w-full space-y-1">
          <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: strokeColor, opacity: 0.85 }} />
          <div className="w-full h-[1px]" style={{ backgroundColor: strokeColor, opacity: 0.4 }} />
        </div>
        <div className="w-full space-y-1">
          <div className="w-full h-[1px]" style={{ backgroundColor: strokeColor, opacity: 0.4 }} />
          <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: strokeColor, opacity: 0.85 }} />
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 1. LOVE CONFESSION — Openclipart Victorian Heart Filigree + Magic UI Rose Beam
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'love-hearts') {
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[2] overflow-hidden select-none">
        {/* Magic UI Animated Rose Border Beam */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="rose-beam-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BE123C" stopOpacity="0" />
              <stop offset="40%" stopColor="#FB7185" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#FDA4AF" stopOpacity="1" />
              <stop offset="100%" stopColor="#BE123C" stopOpacity="0" />
            </linearGradient>
            <filter id="rose-beam-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Subtle inner hairline border */}
          <rect
            x="3"
            y="3"
            width="calc(100% - 6px)"
            height="calc(100% - 6px)"
            rx="10"
            fill="none"
            stroke="#F43F5E"
            strokeWidth="0.8"
            strokeOpacity="0.35"
            strokeDasharray="4 3"
          />
          {/* Magic UI sweeping light beam */}
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            rx="10"
            fill="none"
            stroke="url(#rose-beam-grad)"
            strokeWidth="2.5"
            pathLength="100"
            strokeDasharray="22 78"
            filter="url(#rose-beam-glow)"
            className="animate-magic-beam"
          />
        </svg>

        {/* ── Openclipart Detailed Victorian Heart Corner Ornaments (Fixed 90x90 Aspect) ── */}
        {/* Top-Left Corner */}
        <div className="absolute top-0 left-0 w-20 h-20 sm:w-28 sm:h-28 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Elegant Acanthus Flourish Tendrils */}
            <path d="M 6,94 C 8,55 22,22 65,10 C 82,5 92,12 90,20 C 88,28 78,26 72,18 C 66,12 55,14 42,22 C 26,32 16,56 14,94 Z" fill="#F43F5E" fillOpacity="0.25" />
            <path d="M 8,90 Q 12,30 68,14" stroke="#E11D48" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 14,84 Q 18,36 62,22" stroke="#FDA4AF" strokeWidth="0.6" strokeDasharray="2 2" />

            {/* Intertwined Heart Filigree Medallion */}
            <g transform="translate(32, 32)">
              {/* Secondary Heart */}
              <path
                d="M 14,-2 C 7,-10 0,-3 0,4 C 0,14 14,24 14,24 C 14,24 28,14 28,4 C 28,-3 21,-10 14,-2 Z"
                fill="#FDA4AF"
                fillOpacity="0.6"
                stroke="#E11D48"
                strokeWidth="0.8"
                transform="rotate(-15)"
              />
              {/* Primary Heart */}
              <path
                d="M 0,-4 C -8,-14 -18,-5 -18,4 C -18,16 0,28 0,28 C 0,28 18,16 18,4 C 18,-5 8,-14 0,-4 Z"
                fill="#E11D48"
                fillOpacity="0.85"
                stroke="#BE123C"
                strokeWidth="1.2"
              />
              {/* Rosebud Blossom at heart base */}
              <circle cx="0" cy="4" r="4.5" fill="#BE123C" />
              <path d="M -3,2 Q 0,-3 3,2 Q 4,6 0,7 Q -4,6 -3,2 Z" fill="#FDA4AF" opacity="0.9" />
              <path d="M -5,6 Q -8,8 -6,11 Q -2,10 -3,6 Z" fill="#15803D" opacity="0.8" />
              <path d="M 5,6 Q 8,8 6,11 Q 2,10 3,6 Z" fill="#15803D" opacity="0.8" />
            </g>

            {/* Corner Starburst Sparkles */}
            <polygon points="12,18 13.5,23 18,24.5 13.5,26 12,31 10.5,26 6,24.5 10.5,23" fill="#FDA4AF" className="animate-magic-twinkle" />
            <circle cx="80" cy="14" r="1.5" fill="#F43F5E" />
            <circle cx="14" cy="80" r="1.5" fill="#F43F5E" />
          </svg>
        </div>

        {/* Top-Right Corner (Mirrored horizontally) */}
        <div className="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28 pointer-events-none scale-x-[-1]">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <path d="M 6,94 C 8,55 22,22 65,10 C 82,5 92,12 90,20 C 88,28 78,26 72,18 C 66,12 55,14 42,22 C 26,32 16,56 14,94 Z" fill="#F43F5E" fillOpacity="0.25" />
            <path d="M 8,90 Q 12,30 68,14" stroke="#E11D48" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 14,84 Q 18,36 62,22" stroke="#FDA4AF" strokeWidth="0.6" strokeDasharray="2 2" />
            <g transform="translate(32, 32)">
              <path d="M 14,-2 C 7,-10 0,-3 0,4 C 0,14 14,24 14,24 C 14,24 28,14 28,4 C 28,-3 21,-10 14,-2 Z" fill="#FDA4AF" fillOpacity="0.6" stroke="#E11D48" strokeWidth="0.8" transform="rotate(-15)" />
              <path d="M 0,-4 C -8,-14 -18,-5 -18,4 C -18,16 0,28 0,28 C 0,28 18,16 18,4 C 18,-5 8,-14 0,-4 Z" fill="#E11D48" fillOpacity="0.85" stroke="#BE123C" strokeWidth="1.2" />
              <circle cx="0" cy="4" r="4.5" fill="#BE123C" />
              <path d="M -3,2 Q 0,-3 3,2 Q 4,6 0,7 Q -4,6 -3,2 Z" fill="#FDA4AF" opacity="0.9" />
              <path d="M -5,6 Q -8,8 -6,11 Q -2,10 -3,6 Z" fill="#15803D" opacity="0.8" />
              <path d="M 5,6 Q 8,8 6,11 Q 2,10 3,6 Z" fill="#15803D" opacity="0.8" />
            </g>
            <polygon points="12,18 13.5,23 18,24.5 13.5,26 12,31 10.5,26 6,24.5 10.5,23" fill="#FDA4AF" className="animate-magic-twinkle" />
            <circle cx="80" cy="14" r="1.5" fill="#F43F5E" />
            <circle cx="14" cy="80" r="1.5" fill="#F43F5E" />
          </svg>
        </div>

        {/* Bottom-Left Corner (Mirrored vertically) */}
        <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-28 sm:h-28 pointer-events-none scale-y-[-1]">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <path d="M 6,94 C 8,55 22,22 65,10 C 82,5 92,12 90,20 C 88,28 78,26 72,18 C 66,12 55,14 42,22 C 26,32 16,56 14,94 Z" fill="#F43F5E" fillOpacity="0.25" />
            <path d="M 8,90 Q 12,30 68,14" stroke="#E11D48" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 14,84 Q 18,36 62,22" stroke="#FDA4AF" strokeWidth="0.6" strokeDasharray="2 2" />
            <g transform="translate(32, 32)">
              <path d="M 14,-2 C 7,-10 0,-3 0,4 C 0,14 14,24 14,24 C 14,24 28,14 28,4 C 28,-3 21,-10 14,-2 Z" fill="#FDA4AF" fillOpacity="0.6" stroke="#E11D48" strokeWidth="0.8" transform="rotate(-15)" />
              <path d="M 0,-4 C -8,-14 -18,-5 -18,4 C -18,16 0,28 0,28 C 0,28 18,16 18,4 C 18,-5 8,-14 0,-4 Z" fill="#E11D48" fillOpacity="0.85" stroke="#BE123C" strokeWidth="1.2" />
              <circle cx="0" cy="4" r="4.5" fill="#BE123C" />
              <path d="M -3,2 Q 0,-3 3,2 Q 4,6 0,7 Q -4,6 -3,2 Z" fill="#FDA4AF" opacity="0.9" />
              <path d="M -5,6 Q -8,8 -6,11 Q -2,10 -3,6 Z" fill="#15803D" opacity="0.8" />
              <path d="M 5,6 Q 8,8 6,11 Q 2,10 3,6 Z" fill="#15803D" opacity="0.8" />
            </g>
            <polygon points="12,18 13.5,23 18,24.5 13.5,26 12,31 10.5,26 6,24.5 10.5,23" fill="#FDA4AF" className="animate-magic-twinkle" />
            <circle cx="80" cy="14" r="1.5" fill="#F43F5E" />
            <circle cx="14" cy="80" r="1.5" fill="#F43F5E" />
          </svg>
        </div>

        {/* Bottom-Right Corner (Mirrored horizontally & vertically) */}
        <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-28 sm:h-28 pointer-events-none scale-[-1]">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <path d="M 6,94 C 8,55 22,22 65,10 C 82,5 92,12 90,20 C 88,28 78,26 72,18 C 66,12 55,14 42,22 C 26,32 16,56 14,94 Z" fill="#F43F5E" fillOpacity="0.25" />
            <path d="M 8,90 Q 12,30 68,14" stroke="#E11D48" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 14,84 Q 18,36 62,22" stroke="#FDA4AF" strokeWidth="0.6" strokeDasharray="2 2" />
            <g transform="translate(32, 32)">
              <path d="M 14,-2 C 7,-10 0,-3 0,4 C 0,14 14,24 14,24 C 14,24 28,14 28,4 C 28,-3 21,-10 14,-2 Z" fill="#FDA4AF" fillOpacity="0.6" stroke="#E11D48" strokeWidth="0.8" transform="rotate(-15)" />
              <path d="M 0,-4 C -8,-14 -18,-5 -18,4 C -18,16 0,28 0,28 C 0,28 18,16 18,4 C 18,-5 8,-14 0,-4 Z" fill="#E11D48" fillOpacity="0.85" stroke="#BE123C" strokeWidth="1.2" />
              <circle cx="0" cy="4" r="4.5" fill="#BE123C" />
              <path d="M -3,2 Q 0,-3 3,2 Q 4,6 0,7 Q -4,6 -3,2 Z" fill="#FDA4AF" opacity="0.9" />
              <path d="M -5,6 Q -8,8 -6,11 Q -2,10 -3,6 Z" fill="#15803D" opacity="0.8" />
              <path d="M 5,6 Q 8,8 6,11 Q 2,10 3,6 Z" fill="#15803D" opacity="0.8" />
            </g>
            <polygon points="12,18 13.5,23 18,24.5 13.5,26 12,31 10.5,26 6,24.5 10.5,23" fill="#FDA4AF" className="animate-magic-twinkle" />
            <circle cx="80" cy="14" r="1.5" fill="#F43F5E" />
            <circle cx="14" cy="80" r="1.5" fill="#F43F5E" />
          </svg>
        </div>

        {/* ── Top Center Winged Heart Crest ── */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 120 32" className="w-24 sm:w-32 h-6 sm:h-8" fill="none">
            {/* Angel Wings */}
            <path d="M 60,18 C 50,8 35,4 20,12 C 30,16 42,16 54,20 Z" fill="#FDA4AF" fillOpacity="0.75" />
            <path d="M 60,18 C 70,8 85,4 100,12 C 90,16 78,16 66,20 Z" fill="#FDA4AF" fillOpacity="0.75" />
            {/* Center Heart */}
            <path
              d="M 60,8 C 55,2 48,7 48,13 C 48,20 60,28 60,28 C 60,28 72,20 72,13 C 72,7 65,2 60,8 Z"
              fill="#E11D48"
              stroke="#BE123C"
              strokeWidth="1"
              className="animate-magic-pulse"
            />
            <circle cx="60" cy="14" r="2.5" fill="#FDA4AF" />
          </svg>
        </div>

        {/* Floating Heart Droplets along Top & Bottom */}
        <div className="absolute top-2 left-20 right-20 sm:left-28 sm:right-28 flex justify-around pointer-events-none opacity-70">
          <span className="text-[10px] text-rose-400 animate-magic-twinkle">♥</span>
          <span className="text-[8px] text-rose-300 animate-magic-twinkle" style={{ animationDelay: '0.8s' }}>✦</span>
          <span className="text-[11px] text-rose-500 animate-magic-twinkle" style={{ animationDelay: '1.6s' }}>♥</span>
          <span className="text-[8px] text-rose-300 animate-magic-twinkle" style={{ animationDelay: '2.4s' }}>✦</span>
          <span className="text-[10px] text-rose-400 animate-magic-twinkle" style={{ animationDelay: '3.2s' }}>♥</span>
        </div>
        <div className="absolute bottom-2 left-20 right-20 sm:left-28 sm:right-28 flex justify-around pointer-events-none opacity-70">
          <span className="text-[10px] text-rose-400 animate-magic-twinkle" style={{ animationDelay: '0.5s' }}>♥</span>
          <span className="text-[8px] text-rose-300 animate-magic-twinkle" style={{ animationDelay: '1.2s' }}>✦</span>
          <span className="text-[12px] text-rose-500 animate-magic-twinkle" style={{ animationDelay: '2.0s' }}>♥</span>
          <span className="text-[8px] text-rose-300 animate-magic-twinkle" style={{ animationDelay: '2.8s' }}>✦</span>
          <span className="text-[10px] text-rose-400 animate-magic-twinkle" style={{ animationDelay: '3.6s' }}>♥</span>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 2. CHAMPAGNE GALA — Gatsby Art Deco Gold + Clinking Flutes + Magic UI Beam
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'celebration-champagne') {
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[2] overflow-hidden select-none">
        {/* Magic UI 24K Gold Animated Border Beam */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="gold-beam-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B45309" stopOpacity="0" />
              <stop offset="40%" stopColor="#FDE047" stopOpacity="1" />
              <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
            </linearGradient>
            <filter id="gold-beam-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Inner double gold hairline */}
          <rect
            x="3.5"
            y="3.5"
            width="calc(100% - 7px)"
            height="calc(100% - 7px)"
            rx="10"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="0.7"
            strokeOpacity="0.45"
          />
          <rect
            x="5.5"
            y="5.5"
            width="calc(100% - 11px)"
            height="calc(100% - 11px)"
            rx="8"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="0.4"
            strokeOpacity="0.3"
            strokeDasharray="2 3"
          />
          {/* Sweeping Gold Beam */}
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            rx="10"
            fill="none"
            stroke="url(#gold-beam-grad)"
            strokeWidth="2.5"
            pathLength="100"
            strokeDasharray="20 80"
            filter="url(#gold-beam-glow)"
            className="animate-magic-beam"
          />
        </svg>

        {/* ── Top-Left: Clinking Champagne Flutes + Starburst Toast ── */}
        <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            {/* Art Deco Corner Fan Rays */}
            <path d="M 8,80 L 8,8 L 80,8" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 14,70 L 14,14 L 70,14" stroke="#FDE047" strokeWidth="0.6" strokeOpacity="0.6" />
            <path d="M 20,60 L 20,20 L 60,20" stroke="#D4AF37" strokeWidth="0.4" strokeOpacity="0.4" strokeDasharray="2 2" />

            {/* Clinking Champagne Flutes Group */}
            <g transform="translate(38, 38)">
              {/* Left Flute (Tilted +20°) */}
              <g transform="rotate(20)">
                <path d="M -4,-22 L -4,-6 Q -4,2 0,2 Q 4,2 4,-6 L 4,-22 Z" fill="#FCD34D" fillOpacity="0.35" stroke="#F59E0B" strokeWidth="0.8" />
                <path d="M -3,-14 L -3,-6 Q -3,0 0,0 Q 3,0 3,-6 L 3,-14 Z" fill="#FBBF24" fillOpacity="0.85" />
                <line x1="0" y1="2" x2="0" y2="18" stroke="#F59E0B" strokeWidth="0.8" />
                <line x1="-5" y1="18" x2="5" y2="18" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
                {/* Rising foam bubbles */}
                <circle cx="-1" cy="-25" r="1" fill="#FEF08A" />
                <circle cx="2" cy="-28" r="0.8" fill="#FEF08A" />
              </g>

              {/* Right Flute (Tilted -20°) */}
              <g transform="translate(10, 0) rotate(-20)">
                <path d="M -4,-22 L -4,-6 Q -4,2 0,2 Q 4,2 4,-6 L 4,-22 Z" fill="#FCD34D" fillOpacity="0.35" stroke="#F59E0B" strokeWidth="0.8" />
                <path d="M -3,-14 L -3,-6 Q -3,0 0,0 Q 3,0 3,-6 L 3,-14 Z" fill="#FBBF24" fillOpacity="0.85" />
                <line x1="0" y1="2" x2="0" y2="18" stroke="#F59E0B" strokeWidth="0.8" />
                <line x1="-5" y1="18" x2="5" y2="18" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="1" cy="-25" r="1" fill="#FEF08A" />
                <circle cx="-2" cy="-28" r="0.8" fill="#FEF08A" />
              </g>

              {/* Clink Point Starburst Explosion */}
              <g transform="translate(5, -24)" className="animate-magic-twinkle">
                <polygon points="0,-10 2.5,-3 10,0 2.5,3 0,10 -2.5,3 -10,0 -2.5,-3" fill="#FEF08A" />
                <circle cx="0" cy="0" r="3" fill="#FFFBEB" />
              </g>
            </g>
          </svg>
        </div>

        {/* ── Top-Right: Clinking Champagne Flutes (Mirrored) ── */}
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 pointer-events-none scale-x-[-1]">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <path d="M 8,80 L 8,8 L 80,8" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 14,70 L 14,14 L 70,14" stroke="#FDE047" strokeWidth="0.6" strokeOpacity="0.6" />
            <path d="M 20,60 L 20,20 L 60,20" stroke="#D4AF37" strokeWidth="0.4" strokeOpacity="0.4" strokeDasharray="2 2" />
            <g transform="translate(38, 38)">
              <g transform="rotate(20)">
                <path d="M -4,-22 L -4,-6 Q -4,2 0,2 Q 4,2 4,-6 L 4,-22 Z" fill="#FCD34D" fillOpacity="0.35" stroke="#F59E0B" strokeWidth="0.8" />
                <path d="M -3,-14 L -3,-6 Q -3,0 0,0 Q 3,0 3,-6 L 3,-14 Z" fill="#FBBF24" fillOpacity="0.85" />
                <line x1="0" y1="2" x2="0" y2="18" stroke="#F59E0B" strokeWidth="0.8" />
                <line x1="-5" y1="18" x2="5" y2="18" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="-1" cy="-25" r="1" fill="#FEF08A" />
                <circle cx="2" cy="-28" r="0.8" fill="#FEF08A" />
              </g>
              <g transform="translate(10, 0) rotate(-20)">
                <path d="M -4,-22 L -4,-6 Q -4,2 0,2 Q 4,2 4,-6 L 4,-22 Z" fill="#FCD34D" fillOpacity="0.35" stroke="#F59E0B" strokeWidth="0.8" />
                <path d="M -3,-14 L -3,-6 Q -3,0 0,0 Q 3,0 3,-6 L 3,-14 Z" fill="#FBBF24" fillOpacity="0.85" />
                <line x1="0" y1="2" x2="0" y2="18" stroke="#F59E0B" strokeWidth="0.8" />
                <line x1="-5" y1="18" x2="5" y2="18" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="1" cy="-25" r="1" fill="#FEF08A" />
                <circle cx="-2" cy="-28" r="0.8" fill="#FEF08A" />
              </g>
              <g transform="translate(5, -24)" className="animate-magic-twinkle">
                <polygon points="0,-10 2.5,-3 10,0 2.5,3 0,10 -2.5,3 -10,0 -2.5,-3" fill="#FEF08A" />
                <circle cx="0" cy="0" r="3" fill="#FFFBEB" />
              </g>
            </g>
          </svg>
        </div>

        {/* ── Bottom-Left: Popping Cork with Champagne Bubbles ── */}
        <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-28 sm:h-28 pointer-events-none scale-y-[-1]">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <path d="M 8,80 L 8,8 L 80,8" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 14,70 L 14,14 L 70,14" stroke="#FDE047" strokeWidth="0.6" strokeOpacity="0.6" />
            {/* Popped Cork Streamer Arcs */}
            <path d="M 15,15 Q 35,40 50,18 Q 65,30 80,12" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="3 2" />
            <circle cx="50" cy="18" r="2.5" fill="#FEF08A" />
            <circle cx="80" cy="12" r="1.8" fill="#FDE047" />
          </svg>
        </div>

        {/* ── Bottom-Right: Popping Cork with Champagne Bubbles ── */}
        <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-28 sm:h-28 pointer-events-none scale-[-1]">
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
            <path d="M 8,80 L 8,8 L 80,8" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 14,70 L 14,14 L 70,14" stroke="#FDE047" strokeWidth="0.6" strokeOpacity="0.6" />
            <path d="M 15,15 Q 35,40 50,18 Q 65,30 80,12" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="3 2" />
            <circle cx="50" cy="18" r="2.5" fill="#FEF08A" />
            <circle cx="80" cy="12" r="1.8" fill="#FDE047" />
          </svg>
        </div>

        {/* ── Left & Right Effervescent Bubbles (Rising Animation) ── */}
        <div className="absolute top-20 bottom-20 left-2 w-4 flex flex-col justify-around pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-amber-300/80 animate-magic-bubble" style={{ animationDelay: '0s' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-200/90 animate-magic-bubble" style={{ animationDelay: '1.2s' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70 animate-magic-bubble" style={{ animationDelay: '2.1s' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-100 animate-magic-bubble" style={{ animationDelay: '0.6s' }} />
        </div>
        <div className="absolute top-20 bottom-20 right-2 w-4 flex flex-col justify-around pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-200/90 animate-magic-bubble" style={{ animationDelay: '0.8s' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-300/80 animate-magic-bubble" style={{ animationDelay: '2.4s' }} />
          <div className="w-2 h-2 rounded-full bg-amber-400/70 animate-magic-bubble" style={{ animationDelay: '1.5s' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-100 animate-magic-bubble" style={{ animationDelay: '0.3s' }} />
        </div>

        {/* ── Top Center Art Deco Gala Garland ── */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 120 28" className="w-28 sm:w-36 h-6 sm:h-7" fill="none">
            {/* Scalloped Deco Garland */}
            <path d="M 10,6 Q 35,18 60,6 Q 85,18 110,6" stroke="#D4AF37" strokeWidth="1" strokeDasharray="3 2" />
            {/* Center Faceted Diamond */}
            <polygon points="60,2 66,10 60,18 54,10" fill="#FEF08A" stroke="#B45309" strokeWidth="0.8" />
            <circle cx="35" cy="12" r="1.5" fill="#FDE047" />
            <circle cx="85" cy="12" r="1.5" fill="#FDE047" />
          </svg>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 3. GRAND FIESTA — Party Poppers + Multi-Color Confetti + Magic UI Spectrum Beam
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'celebration-confetti') {
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[2] overflow-hidden select-none">
        {/* Magic UI Spectrum Border Beam */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="spectrum-beam-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="25%" stopColor="#EC4899" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="75%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <filter id="spectrum-beam-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            rx="10"
            fill="none"
            stroke="url(#spectrum-beam-grad)"
            strokeWidth="2.5"
            pathLength="100"
            strokeDasharray="24 76"
            filter="url(#spectrum-beam-glow)"
            className="animate-magic-beam-fast"
          />
        </svg>

        {/* ── 4 Corner Bursting Party Poppers (Fixed 80x80) ── */}
        {/* Top-Left */}
        <div className="absolute top-0 left-0 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none">
          <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
            {/* Popper Cone */}
            <polygon points="6,6 12,24 24,12" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
            <polygon points="10,10 14,20 20,14" fill="#FDE047" />
            {/* Exploding Streamers */}
            <path d="M 18,18 Q 35,10 52,22 Q 62,14 74,18" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 18,18 Q 20,38 32,54 Q 38,68 50,72" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 22,22 Q 45,45 68,52" stroke="#10B981" strokeWidth="1.0" strokeLinecap="round" strokeDasharray="3 2" />
            {/* Star Sparkles */}
            <polygon points="40,24 42,28 46,29 42,32 43,36 39,33 35,36 37,32 33,29 37,28" fill="#FDE047" className="animate-magic-twinkle" />
            <polygon points="26,42 27.5,45 31,46 27.5,48 28.5,52 25,49.5 22,52 23.5,48 20,46 23.5,45" fill="#EC4899" className="animate-magic-twinkle" style={{ animationDelay: '1s' }} />
          </svg>
        </div>

        {/* Top-Right */}
        <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none scale-x-[-1]">
          <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
            <polygon points="6,6 12,24 24,12" fill="#A855F7" stroke="#6B21A8" strokeWidth="1" />
            <polygon points="10,10 14,20 20,14" fill="#E9D5FF" />
            <path d="M 18,18 Q 35,10 52,22 Q 62,14 74,18" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 18,18 Q 20,38 32,54 Q 38,68 50,72" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 22,22 Q 45,45 68,52" stroke="#3B82F6" strokeWidth="1.0" strokeLinecap="round" strokeDasharray="3 2" />
            <polygon points="40,24 42,28 46,29 42,32 43,36 39,33 35,36 37,32 33,29 37,28" fill="#FEF08A" className="animate-magic-twinkle" />
          </svg>
        </div>

        {/* Bottom-Left */}
        <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none scale-y-[-1]">
          <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
            <polygon points="6,6 12,24 24,12" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1" />
            <polygon points="10,10 14,20 20,14" fill="#93C5FD" />
            <path d="M 18,18 Q 35,10 52,22 Q 62,14 74,18" stroke="#EC4899" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 18,18 Q 20,38 32,54 Q 38,68 50,72" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Bottom-Right */}
        <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none scale-[-1]">
          <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
            <polygon points="6,6 12,24 24,12" fill="#10B981" stroke="#047857" strokeWidth="1" />
            <polygon points="10,10 14,20 20,14" fill="#A7F3D0" />
            <path d="M 18,18 Q 35,10 52,22 Q 62,14 74,18" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 18,18 Q 20,38 32,54 Q 38,68 50,72" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Scattered Dynamic Confetti Pieces along Perimeter */}
        <div className="absolute top-2 left-24 right-24 flex justify-between pointer-events-none">
          <span className="w-2 h-1 rounded-sm bg-yellow-400 rotate-12 animate-magic-twinkle" />
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-magic-twinkle" style={{ animationDelay: '0.6s' }} />
          <span className="w-2.5 h-1 rounded-sm bg-blue-400 -rotate-45 animate-magic-twinkle" style={{ animationDelay: '1.2s' }} />
          <span className="w-1.5 h-1.5 bg-emerald-400 rotate-45 animate-magic-twinkle" style={{ animationDelay: '1.8s' }} />
          <span className="w-2 h-1 rounded-sm bg-purple-500 rotate-25 animate-magic-twinkle" style={{ animationDelay: '2.4s' }} />
        </div>
        <div className="absolute bottom-2 left-24 right-24 flex justify-between pointer-events-none">
          <span className="w-1.5 h-1.5 bg-rose-500 rotate-45 animate-magic-twinkle" style={{ animationDelay: '0.4s' }} />
          <span className="w-2 h-1 rounded-sm bg-amber-400 -rotate-12 animate-magic-twinkle" style={{ animationDelay: '1.0s' }} />
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-magic-twinkle" style={{ animationDelay: '1.6s' }} />
          <span className="w-2 h-1 rounded-sm bg-emerald-400 rotate-60 animate-magic-twinkle" style={{ animationDelay: '2.2s' }} />
          <span className="w-1.5 h-1.5 bg-violet-400 -rotate-30 animate-magic-twinkle" style={{ animationDelay: '2.8s' }} />
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4. BLOOMING ROSES — William Morris Botanical + Magic UI Emerald-Rose Shimmer
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'botanical-roses' || frameId === 'nature-vines') {
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[2] overflow-hidden select-none">
        {/* Magic UI Emerald & Dewdrop Shimmer Beam */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="botanical-beam-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#15803D" stopOpacity="0" />
              <stop offset="50%" stopColor="#86EFAC" stopOpacity="0.9" />
              <stop offset="80%" stopColor="#FDA4AF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#15803D" stopOpacity="0" />
            </linearGradient>
            <filter id="botanical-beam-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect
            x="3"
            y="3"
            width="calc(100% - 6px)"
            height="calc(100% - 6px)"
            rx="10"
            fill="none"
            stroke="#15803D"
            strokeWidth="0.8"
            strokeOpacity="0.3"
          />
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            rx="10"
            fill="none"
            stroke="url(#botanical-beam-grad)"
            strokeWidth="2.2"
            pathLength="100"
            strokeDasharray="22 78"
            filter="url(#botanical-beam-glow)"
            className="animate-magic-beam"
          />
        </svg>

        {/* ── 4 Botanical Garden Rose Corners (Fixed 90x90) ── */}
        {/* Top-Left */}
        <div className="absolute top-0 left-0 w-22 h-22 sm:w-28 sm:h-28 pointer-events-none">
          <svg viewBox="0 0 90 90" className="w-full h-full" fill="none">
            {/* Curving Thorny Briar Vine */}
            <path d="M 6,86 C 8,42 24,18 78,8" stroke="#15803D" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 12,80 C 14,46 28,24 74,14" stroke="#22C55E" strokeWidth="0.6" strokeOpacity="0.5" />
            {/* Vine Leaves */}
            <path d="M 28,34 Q 38,28 36,44 Q 28,42 28,34 Z" fill="#22C55E" fillOpacity="0.85" stroke="#15803D" strokeWidth="0.5" />
            <path d="M 52,16 Q 64,18 56,28 Q 50,22 52,16 Z" fill="#22C55E" fillOpacity="0.85" stroke="#15803D" strokeWidth="0.5" />
            <path d="M 14,60 Q 24,56 20,70 Q 12,68 14,60 Z" fill="#15803D" fillOpacity="0.85" />

            {/* Blooming English Rose Blossom */}
            <g transform="translate(34, 34)">
              {/* Outer Petals */}
              <circle cx="0" cy="0" r="11" fill="#F43F5E" fillOpacity="0.9" />
              <path d="M -8,-6 C -12,2 -4,12 4,12 C 12,12 14,2 10,-6 C 4,-12 -4,-12 -8,-6 Z" fill="#E11D48" />
              <path d="M -5,-3 C -7,2 -2,8 2,8 C 7,8 8,2 6,-3 C 2,-7 -2,-7 -5,-3 Z" fill="#FDA4AF" />
              <circle cx="0" cy="0" r="3" fill="#BE123C" />
            </g>

            {/* Side Rosebud */}
            <g transform="translate(68, 12)">
              <ellipse cx="0" cy="0" rx="4.5" ry="3" fill="#F43F5E" transform="rotate(-30)" />
              <path d="M -3,2 Q 0,-3 3,0" fill="#FDA4AF" />
              <path d="M -2,4 Q -5,6 -2,8" stroke="#15803D" strokeWidth="0.8" />
            </g>
          </svg>
        </div>

        {/* Top-Right */}
        <div className="absolute top-0 right-0 w-22 h-22 sm:w-28 sm:h-28 pointer-events-none scale-x-[-1]">
          <svg viewBox="0 0 90 90" className="w-full h-full" fill="none">
            <path d="M 6,86 C 8,42 24,18 78,8" stroke="#15803D" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 12,80 C 14,46 28,24 74,14" stroke="#22C55E" strokeWidth="0.6" strokeOpacity="0.5" />
            <path d="M 28,34 Q 38,28 36,44 Q 28,42 28,34 Z" fill="#22C55E" fillOpacity="0.85" stroke="#15803D" strokeWidth="0.5" />
            <path d="M 52,16 Q 64,18 56,28 Q 50,22 52,16 Z" fill="#22C55E" fillOpacity="0.85" stroke="#15803D" strokeWidth="0.5" />
            <path d="M 14,60 Q 24,56 20,70 Q 12,68 14,60 Z" fill="#15803D" fillOpacity="0.85" />
            <g transform="translate(34, 34)">
              <circle cx="0" cy="0" r="11" fill="#F43F5E" fillOpacity="0.9" />
              <path d="M -8,-6 C -12,2 -4,12 4,12 C 12,12 14,2 10,-6 C 4,-12 -4,-12 -8,-6 Z" fill="#E11D48" />
              <path d="M -5,-3 C -7,2 -2,8 2,8 C 7,8 8,2 6,-3 C 2,-7 -2,-7 -5,-3 Z" fill="#FDA4AF" />
              <circle cx="0" cy="0" r="3" fill="#BE123C" />
            </g>
            <g transform="translate(68, 12)">
              <ellipse cx="0" cy="0" rx="4.5" ry="3" fill="#F43F5E" transform="rotate(-30)" />
              <path d="M -3,2 Q 0,-3 3,0" fill="#FDA4AF" />
              <path d="M -2,4 Q -5,6 -2,8" stroke="#15803D" strokeWidth="0.8" />
            </g>
          </svg>
        </div>

        {/* Bottom-Left */}
        <div className="absolute bottom-0 left-0 w-22 h-22 sm:w-28 sm:h-28 pointer-events-none scale-y-[-1]">
          <svg viewBox="0 0 90 90" className="w-full h-full" fill="none">
            <path d="M 6,86 C 8,42 24,18 78,8" stroke="#15803D" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 28,34 Q 38,28 36,44 Q 28,42 28,34 Z" fill="#22C55E" fillOpacity="0.85" stroke="#15803D" strokeWidth="0.5" />
            <path d="M 52,16 Q 64,18 56,28 Q 50,22 52,16 Z" fill="#22C55E" fillOpacity="0.85" stroke="#15803D" strokeWidth="0.5" />
            <g transform="translate(34, 34)">
              <circle cx="0" cy="0" r="11" fill="#F43F5E" fillOpacity="0.9" />
              <path d="M -8,-6 C -12,2 -4,12 4,12 C 12,12 14,2 10,-6 C 4,-12 -4,-12 -8,-6 Z" fill="#E11D48" />
              <circle cx="0" cy="0" r="3" fill="#BE123C" />
            </g>
          </svg>
        </div>

        {/* Bottom-Right */}
        <div className="absolute bottom-0 right-0 w-22 h-22 sm:w-28 sm:h-28 pointer-events-none scale-[-1]">
          <svg viewBox="0 0 90 90" className="w-full h-full" fill="none">
            <path d="M 6,86 C 8,42 24,18 78,8" stroke="#15803D" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M 28,34 Q 38,28 36,44 Q 28,42 28,34 Z" fill="#22C55E" fillOpacity="0.85" stroke="#15803D" strokeWidth="0.5" />
            <g transform="translate(34, 34)">
              <circle cx="0" cy="0" r="11" fill="#F43F5E" fillOpacity="0.9" />
              <path d="M -8,-6 C -12,2 -4,12 4,12 C 12,12 14,2 10,-6 C 4,-12 -4,-12 -8,-6 Z" fill="#E11D48" />
              <circle cx="0" cy="0" r="3" fill="#BE123C" />
            </g>
          </svg>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 5. IMPERIAL LAUREL — Roman Heraldic Victory Wreaths + Magic UI Gold Sheen
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'imperial-laurel' || frameId === 'royal-double' || frameId === 'laurel') {
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[2] overflow-hidden select-none">
        {/* Magic UI Bullion Gold Sheen Beam */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="imperial-beam-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#92400E" stopOpacity="0" />
              <stop offset="45%" stopColor="#FEF08A" stopOpacity="1" />
              <stop offset="75%" stopColor="#D4AF37" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#92400E" stopOpacity="0" />
            </linearGradient>
            <filter id="imperial-beam-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {/* Double gold regal border */}
          <rect
            x="3"
            y="3"
            width="calc(100% - 6px)"
            height="calc(100% - 6px)"
            rx="10"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1.2"
            strokeOpacity="0.75"
          />
          <rect
            x="6"
            y="6"
            width="calc(100% - 12px)"
            height="calc(100% - 12px)"
            rx="7"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="0.5"
            strokeOpacity="0.45"
          />
          {/* Sweeping Sheen Beam */}
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            rx="10"
            fill="none"
            stroke="url(#imperial-beam-grad)"
            strokeWidth="2.8"
            pathLength="100"
            strokeDasharray="20 80"
            filter="url(#imperial-beam-glow)"
            className="animate-magic-beam"
          />
        </svg>

        {/* ── Bottom-Left: Classical Roman Victory Laurel Wreath (Fixed 90x90) ── */}
        <div className="absolute bottom-0 left-0 w-22 h-22 sm:w-28 sm:h-28 pointer-events-none">
          <svg viewBox="0 0 90 90" className="w-full h-full" fill="none">
            {/* Laurel Stem */}
            <path d="M 8,82 C 10,50 24,24 62,12" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" />
            {/* Laurel Leaf Pairs */}
            <g fill="#D4AF37" stroke="#92400E" strokeWidth="0.5">
              <ellipse cx="12" cy="70" rx="6" ry="3" transform="rotate(-65, 12, 70)" />
              <ellipse cx="18" cy="66" rx="6" ry="3" transform="rotate(-40, 18, 66)" />
              <ellipse cx="16" cy="54" rx="6" ry="3" transform="rotate(-55, 16, 54)" />
              <ellipse cx="23" cy="50" rx="6" ry="3" transform="rotate(-30, 23, 50)" />
              <ellipse cx="23" cy="38" rx="6" ry="3" transform="rotate(-45, 23, 38)" />
              <ellipse cx="32" cy="36" rx="6" ry="3" transform="rotate(-20, 32, 36)" />
              <ellipse cx="34" cy="24" rx="6" ry="3" transform="rotate(-35, 34, 24)" />
              <ellipse cx="44" cy="22" rx="6" ry="3" transform="rotate(-10, 44, 22)" />
              <ellipse cx="56" cy="14" rx="6" ry="3" transform="rotate(5, 56, 14)" />
            </g>
            {/* Golden Berries */}
            <circle cx="16" cy="62" r="1.8" fill="#FEF08A" />
            <circle cx="24" cy="44" r="1.8" fill="#FEF08A" />
            <circle cx="36" cy="28" r="1.8" fill="#FEF08A" />
            {/* Knotted Ribbon Bow */}
            <path d="M 6,86 C 2,82 14,80 10,76 C 6,82 8,88 6,86 Z" fill="#D4AF37" stroke="#92400E" strokeWidth="0.6" />
          </svg>
        </div>

        {/* ── Bottom-Right: Classical Roman Victory Laurel Wreath (Mirrored) ── */}
        <div className="absolute bottom-0 right-0 w-22 h-22 sm:w-28 sm:h-28 pointer-events-none scale-x-[-1]">
          <svg viewBox="0 0 90 90" className="w-full h-full" fill="none">
            <path d="M 8,82 C 10,50 24,24 62,12" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" />
            <g fill="#D4AF37" stroke="#92400E" strokeWidth="0.5">
              <ellipse cx="12" cy="70" rx="6" ry="3" transform="rotate(-65, 12, 70)" />
              <ellipse cx="18" cy="66" rx="6" ry="3" transform="rotate(-40, 18, 66)" />
              <ellipse cx="16" cy="54" rx="6" ry="3" transform="rotate(-55, 16, 54)" />
              <ellipse cx="23" cy="50" rx="6" ry="3" transform="rotate(-30, 23, 50)" />
              <ellipse cx="23" cy="38" rx="6" ry="3" transform="rotate(-45, 23, 38)" />
              <ellipse cx="32" cy="36" rx="6" ry="3" transform="rotate(-20, 32, 36)" />
              <ellipse cx="34" cy="24" rx="6" ry="3" transform="rotate(-35, 34, 24)" />
              <ellipse cx="44" cy="22" rx="6" ry="3" transform="rotate(-10, 44, 22)" />
              <ellipse cx="56" cy="14" rx="6" ry="3" transform="rotate(5, 56, 14)" />
            </g>
            <circle cx="16" cy="62" r="1.8" fill="#FEF08A" />
            <circle cx="24" cy="44" r="1.8" fill="#FEF08A" />
            <circle cx="36" cy="28" r="1.8" fill="#FEF08A" />
            <path d="M 6,86 C 2,82 14,80 10,76 C 6,82 8,88 6,86 Z" fill="#D4AF37" stroke="#92400E" strokeWidth="0.6" />
          </svg>
        </div>

        {/* ── Top Corners: Heraldic Imperial Palmette Brackets ── */}
        <div className="absolute top-0 left-0 w-16 h-16 sm:w-20 sm:h-20 pointer-events-none">
          <svg viewBox="0 0 70 70" className="w-full h-full" fill="none">
            <polygon points="6,6 16,6 16,10 10,10 10,16 6,16" fill="#D4AF37" />
            <polygon points="12,12 24,12 12,24" fill="#FEF08A" opacity="0.6" />
            <circle cx="16" cy="16" r="3" fill="#D4AF37" />
            <circle cx="16" cy="16" r="1.2" fill="#FFFBEB" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 pointer-events-none scale-x-[-1]">
          <svg viewBox="0 0 70 70" className="w-full h-full" fill="none">
            <polygon points="6,6 16,6 16,10 10,10 10,16 6,16" fill="#D4AF37" />
            <polygon points="12,12 24,12 12,24" fill="#FEF08A" opacity="0.6" />
            <circle cx="16" cy="16" r="3" fill="#D4AF37" />
            <circle cx="16" cy="16" r="1.2" fill="#FFFBEB" />
          </svg>
        </div>

        {/* ── Top Center Imperial Crown Crest ── */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 60 24" className="w-16 sm:w-20 h-5 sm:h-6" fill="none">
            {/* Imperial Crown Silhouette */}
            <path d="M 12,18 L 16,8 L 24,14 L 30,6 L 36,14 L 44,8 L 48,18 Z" fill="#D4AF37" stroke="#92400E" strokeWidth="0.8" />
            <circle cx="30" cy="5" r="1.8" fill="#FEF08A" />
            <circle cx="16" cy="7" r="1.4" fill="#FEF08A" />
            <circle cx="44" cy="7" r="1.4" fill="#FEF08A" />
          </svg>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 6. STARLIGHT GALAXY — Astronomical Crescent Moon + Mariner Stars + Cosmic Beam
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'celestial-night' || frameId === 'stars-night') {
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[2] overflow-hidden select-none">
        {/* Magic UI Cosmic Beam */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="cosmic-beam-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0" />
              <stop offset="45%" stopColor="#FDE047" stopOpacity="1" />
              <stop offset="75%" stopColor="#C084FC" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
            <filter id="cosmic-beam-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect
            x="3"
            y="3"
            width="calc(100% - 6px)"
            height="calc(100% - 6px)"
            rx="10"
            fill="none"
            stroke="#A855F7"
            strokeWidth="0.8"
            strokeOpacity="0.35"
            strokeDasharray="3 3"
          />
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            rx="10"
            fill="none"
            stroke="url(#cosmic-beam-grad)"
            strokeWidth="2.5"
            pathLength="100"
            strokeDasharray="22 78"
            filter="url(#cosmic-beam-glow)"
            className="animate-magic-beam"
          />
        </svg>

        {/* ── Top-Right: Astronomical Crescent Moon with Radiant Halo ── */}
        <div className="absolute top-1 right-2 w-16 h-16 sm:w-20 sm:h-20 pointer-events-none">
          <svg viewBox="0 0 60 60" className="w-full h-full" fill="none">
            {/* Halo Ring */}
            <circle cx="30" cy="30" r="22" stroke="#FDE047" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.6" className="animate-magic-pulse" />
            {/* Crescent Moon */}
            <path
              d="M 28,12 C 18,12 10,20 10,30 C 10,40 18,48 28,48 C 22,42 22,18 28,12 Z"
              fill="#FDE047"
              stroke="#CA8A04"
              strokeWidth="0.8"
            />
            {/* Moon craters */}
            <circle cx="18" cy="26" r="2" fill="#CA8A04" fillOpacity="0.5" />
            <circle cx="21" cy="36" r="2.5" fill="#CA8A04" fillOpacity="0.4" />
            <circle cx="15" cy="33" r="1.5" fill="#CA8A04" fillOpacity="0.4" />
          </svg>
        </div>

        {/* ── 8-Point Mariner Compass Star in Top-Left Corner ── */}
        <div className="absolute top-1 left-1 w-14 h-14 sm:w-18 sm:h-18 pointer-events-none">
          <svg viewBox="0 0 50 50" className="w-full h-full" fill="none">
            <g transform="translate(25, 25)" className="animate-magic-twinkle">
              <polygon points="0,-18 3,-4 18,0 3,4 0,18 -3,4 -18,0 -3,-4" fill="#FEF08A" />
              <polygon points="0,-10 2,-2 10,0 2,2 0,10 -2,2 -10,0 -2,-2" fill="#E9D5FF" />
              <circle cx="0" cy="0" r="2" fill="#FFFBEB" />
            </g>
          </svg>
        </div>

        {/* ── Bottom-Left Mariner Star ── */}
        <div className="absolute bottom-1 left-1 w-12 h-12 sm:w-16 sm:h-16 pointer-events-none">
          <svg viewBox="0 0 50 50" className="w-full h-full" fill="none">
            <g transform="translate(25, 25)" className="animate-magic-twinkle" style={{ animationDelay: '1.5s' }}>
              <polygon points="0,-16 2.5,-3.5 16,0 2.5,3.5 0,16 -2.5,3.5 -16,0 -2.5,-3.5" fill="#FEF08A" />
              <circle cx="0" cy="0" r="2" fill="#FFFBEB" />
            </g>
          </svg>
        </div>

        {/* ── Bottom-Right Mariner Star ── */}
        <div className="absolute bottom-1 right-1 w-12 h-12 sm:w-16 sm:h-16 pointer-events-none">
          <svg viewBox="0 0 50 50" className="w-full h-full" fill="none">
            <g transform="translate(25, 25)" className="animate-magic-twinkle" style={{ animationDelay: '0.8s' }}>
              <polygon points="0,-16 2.5,-3.5 16,0 2.5,3.5 0,16 -2.5,3.5 -16,0 -2.5,-3.5" fill="#FEF08A" />
              <circle cx="0" cy="0" r="2" fill="#FFFBEB" />
            </g>
          </svg>
        </div>

        {/* Constellation Dots along Top & Bottom */}
        <div className="absolute top-2 left-16 right-20 flex justify-between pointer-events-none opacity-80">
          <span className="text-[9px] text-yellow-300 animate-magic-twinkle">✦</span>
          <span className="text-[7px] text-purple-300 animate-magic-twinkle" style={{ animationDelay: '1.1s' }}>★</span>
          <span className="text-[10px] text-yellow-200 animate-magic-twinkle" style={{ animationDelay: '2.2s' }}>✦</span>
          <span className="text-[7px] text-purple-200 animate-magic-twinkle" style={{ animationDelay: '0.5s' }}>★</span>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 7. CYBER PULSE — High-Tech Sci-Fi HUD + Magic UI Neon Laser Beam
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'cyber-matrix') {
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[2] overflow-hidden select-none">
        {/* Magic UI Electric Cyan Laser Beam */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="cyber-beam-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0891B2" stopOpacity="0" />
              <stop offset="40%" stopColor="#06B6D4" stopOpacity="1" />
              <stop offset="70%" stopColor="#EC4899" stopOpacity="1" />
              <stop offset="100%" stopColor="#0891B2" stopOpacity="0" />
            </linearGradient>
            <filter id="cyber-beam-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect
            x="3"
            y="3"
            width="calc(100% - 6px)"
            height="calc(100% - 6px)"
            rx="6"
            fill="none"
            stroke="#06B6D4"
            strokeWidth="0.8"
            strokeOpacity="0.4"
          />
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            rx="6"
            fill="none"
            stroke="url(#cyber-beam-grad)"
            strokeWidth="2.5"
            pathLength="100"
            strokeDasharray="18 82"
            filter="url(#cyber-beam-glow)"
            className="animate-magic-beam-fast"
          />
        </svg>

        {/* ── 4 High-Tech HUD Angular Brackets with Coordinates (Fixed 70x70) ── */}
        {/* Top-Left */}
        <div className="absolute top-0 left-0 w-16 h-16 sm:w-20 sm:h-20 pointer-events-none">
          <svg viewBox="0 0 70 70" className="w-full h-full" fill="none">
            {/* Outer bracket */}
            <path d="M 4,32 L 4,4 L 32,4" stroke="#06B6D4" strokeWidth="2" strokeLinecap="square" />
            {/* Inner bracket */}
            <path d="M 10,24 L 10,10 L 24,10" stroke="#06B6D4" strokeWidth="1" strokeOpacity="0.6" />
            {/* Corner node square */}
            <rect x="2" y="2" width="4" height="4" fill="#06B6D4" />
            {/* Micro telemetry ticks */}
            <line x1="36" y1="4" x2="48" y2="4" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="4" y1="36" x2="4" y2="48" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="2 2" />
            {/* Telemetry label */}
            <text x="12" y="22" fill="#06B6D4" fontSize="5" fontFamily="monospace" fontWeight="bold" opacity="0.8">SYS.OK</text>
          </svg>
        </div>

        {/* Top-Right */}
        <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 pointer-events-none scale-x-[-1]">
          <svg viewBox="0 0 70 70" className="w-full h-full" fill="none">
            <path d="M 4,32 L 4,4 L 32,4" stroke="#06B6D4" strokeWidth="2" strokeLinecap="square" />
            <path d="M 10,24 L 10,10 L 24,10" stroke="#06B6D4" strokeWidth="1" strokeOpacity="0.6" />
            <rect x="2" y="2" width="4" height="4" fill="#EC4899" />
            <line x1="36" y1="4" x2="48" y2="4" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="2 2" />
            <line x1="4" y1="36" x2="4" y2="48" stroke="#06B6D4" strokeWidth="0.8" strokeDasharray="2 2" />
          </svg>
        </div>

        {/* Bottom-Left */}
        <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-20 sm:h-20 pointer-events-none scale-y-[-1]">
          <svg viewBox="0 0 70 70" className="w-full h-full" fill="none">
            <path d="M 4,32 L 4,4 L 32,4" stroke="#06B6D4" strokeWidth="2" strokeLinecap="square" />
            <path d="M 10,24 L 10,10 L 24,10" stroke="#06B6D4" strokeWidth="1" strokeOpacity="0.6" />
            <rect x="2" y="2" width="4" height="4" fill="#06B6D4" />
          </svg>
        </div>

        {/* Bottom-Right */}
        <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-20 sm:h-20 pointer-events-none scale-[-1]">
          <svg viewBox="0 0 70 70" className="w-full h-full" fill="none">
            <path d="M 4,32 L 4,4 L 32,4" stroke="#06B6D4" strokeWidth="2" strokeLinecap="square" />
            <path d="M 10,24 L 10,10 L 24,10" stroke="#06B6D4" strokeWidth="1" strokeOpacity="0.6" />
            <rect x="2" y="2" width="4" height="4" fill="#EC4899" />
          </svg>
        </div>

        {/* Mid-Edge Crosshair Targets */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-70">
          <span className="w-3 h-px bg-cyan-400" />
          <span className="w-1.5 h-1.5 rounded-full border border-cyan-400" />
          <span className="w-3 h-px bg-cyan-400" />
        </div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 opacity-70">
          <span className="w-3 h-px bg-cyan-400" />
          <span className="w-1.5 h-1.5 rounded-full border border-cyan-400" />
          <span className="w-3 h-px bg-cyan-400" />
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 8. BAROQUE FILIGREE — Victorian Rococo Scrollwork + Candlelit Shimmer Beam
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'baroque-filigree' || frameId === 'golden-filigree') {
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none z-[2] overflow-hidden select-none">
        {/* Magic UI Candlelit Shimmer Beam */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="baroque-beam-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#78350F" stopOpacity="0" />
              <stop offset="50%" stopColor="#FEF08A" stopOpacity="1" />
              <stop offset="80%" stopColor="#D4AF37" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#78350F" stopOpacity="0" />
            </linearGradient>
            <filter id="baroque-beam-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect
            x="3"
            y="3"
            width="calc(100% - 6px)"
            height="calc(100% - 6px)"
            rx="8"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="1"
            strokeOpacity="0.6"
          />
          <rect
            x="2"
            y="2"
            width="calc(100% - 4px)"
            height="calc(100% - 4px)"
            rx="8"
            fill="none"
            stroke="url(#baroque-beam-grad)"
            strokeWidth="2.5"
            pathLength="100"
            strokeDasharray="22 78"
            filter="url(#baroque-beam-glow)"
            className="animate-magic-beam"
          />
        </svg>

        {/* ── 4 Antique Rococo Corner Scroll Cartouches (Fixed 80x80) ── */}
        {/* Top-Left */}
        <div className="absolute top-0 left-0 w-20 h-20 sm:w-26 sm:h-26 pointer-events-none">
          <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
            {/* Acanthus leaf volute scrolls */}
            <path d="M 6,74 C 8,42 20,20 62,8 C 76,4 78,14 70,18 C 60,22 52,18 48,12 C 40,16 28,26 22,44 C 18,58 18,74 6,74 Z" fill="#D4AF37" fillOpacity="0.4" stroke="#B45309" strokeWidth="0.8" />
            <path d="M 8,72 Q 12,24 64,12" stroke="#FEF08A" strokeWidth="0.8" strokeLinecap="round" />
            <polygon points="12,12 18,6 24,12 18,18" fill="#FEF08A" stroke="#B45309" strokeWidth="0.8" />
            <circle cx="18" cy="18" r="2.5" fill="#D4AF37" />
          </svg>
        </div>

        {/* Top-Right */}
        <div className="absolute top-0 right-0 w-20 h-20 sm:w-26 sm:h-26 pointer-events-none scale-x-[-1]">
          <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
            <path d="M 6,74 C 8,42 20,20 62,8 C 76,4 78,14 70,18 C 60,22 52,18 48,12 C 40,16 28,26 22,44 C 18,58 18,74 6,74 Z" fill="#D4AF37" fillOpacity="0.4" stroke="#B45309" strokeWidth="0.8" />
            <path d="M 8,72 Q 12,24 64,12" stroke="#FEF08A" strokeWidth="0.8" strokeLinecap="round" />
            <polygon points="12,12 18,6 24,12 18,18" fill="#FEF08A" stroke="#B45309" strokeWidth="0.8" />
            <circle cx="18" cy="18" r="2.5" fill="#D4AF37" />
          </svg>
        </div>

        {/* Bottom-Left */}
        <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-26 sm:h-26 pointer-events-none scale-y-[-1]">
          <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
            <path d="M 6,74 C 8,42 20,20 62,8 C 76,4 78,14 70,18 C 60,22 52,18 48,12 C 40,16 28,26 22,44 C 18,58 18,74 6,74 Z" fill="#D4AF37" fillOpacity="0.4" stroke="#B45309" strokeWidth="0.8" />
            <polygon points="12,12 18,6 24,12 18,18" fill="#FEF08A" stroke="#B45309" strokeWidth="0.8" />
          </svg>
        </div>

        {/* Bottom-Right */}
        <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-26 sm:h-26 pointer-events-none scale-[-1]">
          <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
            <path d="M 6,74 C 8,42 20,20 62,8 C 76,4 78,14 70,18 C 60,22 52,18 48,12 C 40,16 28,26 22,44 C 18,58 18,74 6,74 Z" fill="#D4AF37" fillOpacity="0.4" stroke="#B45309" strokeWidth="0.8" />
            <polygon points="12,12 18,6 24,12 18,18" fill="#FEF08A" stroke="#B45309" strokeWidth="0.8" />
          </svg>
        </div>
      </div>
    )
  }

  return null
}
