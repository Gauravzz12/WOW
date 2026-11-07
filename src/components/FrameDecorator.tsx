'use client'

import React from 'react'

/**
 * FrameDecorator renders rich, occasion-tailored decorative SVG overlays inside a card.
 * It must be placed inside a `relative overflow-hidden` container.
 */
export function FrameDecorator({ frameId, accentHex }: { frameId?: string; accentHex?: string }) {
  if (!frameId || frameId === 'none') return null

  // ═══════════════════════════════════════════════════════════════════════════════
  // 1. LOVE CONFESSION — Romantic hearts, rosebuds, and stardust border
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'love-hearts') {
    const topHearts = [
      { x: 18, y: 3.2, s: 0.9, r: -8, c: '#E11D48' },
      { x: 28, y: 2.6, s: 0.65, r: 12, c: '#FDA4AF' },
      { x: 38, y: 3.4, s: 0.85, r: -5, c: '#F43F5E' },
      { x: 50, y: 2.2, s: 1.25, r: 0, c: '#E11D48' }, // Center crest heart
      { x: 62, y: 3.4, s: 0.85, r: 5, c: '#F43F5E' },
      { x: 72, y: 2.6, s: 0.65, r: -12, c: '#FDA4AF' },
      { x: 82, y: 3.2, s: 0.9, r: 8, c: '#E11D48' },
    ]
    const bottomHearts = [
      { x: 18, y: 96.8, s: 0.85, r: 6, c: '#E11D48' },
      { x: 28, y: 97.4, s: 0.65, r: -10, c: '#FDA4AF' },
      { x: 38, y: 96.6, s: 0.9, r: 5, c: '#F43F5E' },
      { x: 50, y: 97.5, s: 1.15, r: 0, c: '#E11D48' },
      { x: 62, y: 96.6, s: 0.9, r: -5, c: '#F43F5E' },
      { x: 72, y: 97.4, s: 0.65, r: 10, c: '#FDA4AF' },
      { x: 82, y: 96.8, s: 0.85, r: -6, c: '#E11D48' },
    ]
    const leftHearts = [
      { x: 2.6, y: 20, s: 0.8, r: 14, c: '#F43F5E' },
      { x: 3.2, y: 34, s: 0.65, r: -8, c: '#FDA4AF' },
      { x: 2.4, y: 50, s: 0.95, r: 6, c: '#E11D48' },
      { x: 3.2, y: 66, s: 0.65, r: -12, c: '#FDA4AF' },
      { x: 2.6, y: 80, s: 0.8, r: 10, c: '#F43F5E' },
    ]
    const rightHearts = [
      { x: 97.4, y: 20, s: 0.8, r: -14, c: '#F43F5E' },
      { x: 96.8, y: 34, s: 0.65, r: 8, c: '#FDA4AF' },
      { x: 97.6, y: 50, s: 0.95, r: -6, c: '#E11D48' },
      { x: 96.8, y: 66, s: 0.65, r: 12, c: '#FDA4AF' },
      { x: 97.4, y: 80, s: 0.8, r: -10, c: '#F43F5E' },
    ]
    const sparkles = [
      { x: 12, y: 3 }, { x: 23, y: 4 }, { x: 33, y: 2.5 }, { x: 44, y: 3.5 }, { x: 56, y: 3.5 }, { x: 67, y: 2.5 }, { x: 77, y: 4 }, { x: 88, y: 3 },
      { x: 12, y: 97 }, { x: 23, y: 96 }, { x: 33, y: 97.5 }, { x: 44, y: 96.5 }, { x: 56, y: 96.5 }, { x: 67, y: 97.5 }, { x: 77, y: 96 }, { x: 88, y: 97 },
      { x: 3, y: 27 }, { x: 2.5, y: 42 }, { x: 3.5, y: 58 }, { x: 2.5, y: 73 },
      { x: 97, y: 27 }, { x: 97.5, y: 42 }, { x: 96.5, y: 58 }, { x: 97.5, y: 73 },
    ]

    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <path
            id="lh-heart"
            d="M0 4.2L-0.6 3.6C-2.8 1.8 -4 0.5 -4 -1c0-1.2 1-2.2 2.2-2.2 0.8 0 1.5 0.4 1.8 1 0.3-0.6 1-1 1.8-1 1.2 0 2.2 1 2.2 2.2 0 1.5-1.2 2.8-3.4 4.6L0 4.2z"
          />
        </defs>

        {/* Soft inner hairline */}
        <rect x="4.5" y="4.5" width="91" height="91" rx="2" fill="none" stroke="#F43F5E" strokeWidth="0.4" strokeOpacity="0.35" strokeDasharray="3 2" />

        {/* Corner Flourish Clusters */}
        {/* Top-Left */}
        <g transform="translate(6, 6)">
          <path d="M-2,6 Q-2,-2 6,-2" fill="none" stroke="#F43F5E" strokeWidth="0.6" strokeOpacity="0.6" />
          <use href="#lh-heart" x="-0.5" y="-0.5" transform="scale(0.85) rotate(-20)" fill="#E11D48" opacity="0.9" />
          <use href="#lh-heart" x="3" y="1" transform="scale(0.6) rotate(15)" fill="#FDA4AF" opacity="0.85" />
          <circle cx="5" cy="-2" r="0.6" fill="#F43F5E" />
          <circle cx="-2" cy="5" r="0.6" fill="#F43F5E" />
        </g>
        {/* Top-Right */}
        <g transform="translate(94, 6) scale(-1, 1)">
          <path d="M-2,6 Q-2,-2 6,-2" fill="none" stroke="#F43F5E" strokeWidth="0.6" strokeOpacity="0.6" />
          <use href="#lh-heart" x="-0.5" y="-0.5" transform="scale(0.85) rotate(-20)" fill="#E11D48" opacity="0.9" />
          <use href="#lh-heart" x="3" y="1" transform="scale(0.6) rotate(15)" fill="#FDA4AF" opacity="0.85" />
          <circle cx="5" cy="-2" r="0.6" fill="#F43F5E" />
          <circle cx="-2" cy="5" r="0.6" fill="#F43F5E" />
        </g>
        {/* Bottom-Left */}
        <g transform="translate(6, 94) scale(1, -1)">
          <path d="M-2,6 Q-2,-2 6,-2" fill="none" stroke="#F43F5E" strokeWidth="0.6" strokeOpacity="0.6" />
          <use href="#lh-heart" x="-0.5" y="-0.5" transform="scale(0.85) rotate(-20)" fill="#E11D48" opacity="0.9" />
          <use href="#lh-heart" x="3" y="1" transform="scale(0.6) rotate(15)" fill="#FDA4AF" opacity="0.85" />
          <circle cx="5" cy="-2" r="0.6" fill="#F43F5E" />
          <circle cx="-2" cy="5" r="0.6" fill="#F43F5E" />
        </g>
        {/* Bottom-Right */}
        <g transform="translate(94, 94) scale(-1, -1)">
          <path d="M-2,6 Q-2,-2 6,-2" fill="none" stroke="#F43F5E" strokeWidth="0.6" strokeOpacity="0.6" />
          <use href="#lh-heart" x="-0.5" y="-0.5" transform="scale(0.85) rotate(-20)" fill="#E11D48" opacity="0.9" />
          <use href="#lh-heart" x="3" y="1" transform="scale(0.6) rotate(15)" fill="#FDA4AF" opacity="0.85" />
          <circle cx="5" cy="-2" r="0.6" fill="#F43F5E" />
          <circle cx="-2" cy="5" r="0.6" fill="#F43F5E" />
        </g>

        {/* Floating Perimeter Hearts */}
        {[...topHearts, ...bottomHearts, ...leftHearts, ...rightHearts].map((h, i) => (
          <use
            key={i}
            href="#lh-heart"
            x={h.x}
            y={h.y}
            transform={`rotate(${h.r}, ${h.x}, ${h.y}) scale(${h.s * 0.75})`}
            fill={h.c}
            opacity={0.8}
          />
        ))}

        {/* Tiny Stardust Sparkles */}
        {sparkles.map((sp, i) => (
          <circle key={`sp-${i}`} cx={sp.x} cy={sp.y} r={0.5} fill="#FDA4AF" opacity={0.65} />
        ))}
      </svg>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 2. CHAMPAGNE GALA — Clinking flutes, bubbles, and festive golden garland
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'celebration-champagne') {
    // Rising effervescent bubbles on the left and right
    const leftBubbles = [
      { x: 2.2, y: 92, r: 0.8, o: 0.7 }, { x: 3.4, y: 84, r: 0.5, o: 0.5 }, { x: 2.0, y: 76, r: 1.1, o: 0.75 },
      { x: 3.2, y: 68, r: 0.6, o: 0.6 }, { x: 2.4, y: 60, r: 0.9, o: 0.7 }, { x: 3.5, y: 52, r: 0.5, o: 0.5 },
      { x: 1.9, y: 44, r: 1.0, o: 0.8 }, { x: 3.1, y: 36, r: 0.7, o: 0.6 }, { x: 2.5, y: 28, r: 0.9, o: 0.7 },
      { x: 3.3, y: 20, r: 0.5, o: 0.5 },
    ]
    const rightBubbles = [
      { x: 97.8, y: 92, r: 0.8, o: 0.7 }, { x: 96.6, y: 84, r: 0.5, o: 0.5 }, { x: 98.0, y: 76, r: 1.1, o: 0.75 },
      { x: 96.8, y: 68, r: 0.6, o: 0.6 }, { x: 97.6, y: 60, r: 0.9, o: 0.7 }, { x: 96.5, y: 52, r: 0.5, o: 0.5 },
      { x: 98.1, y: 44, r: 1.0, o: 0.8 }, { x: 96.9, y: 36, r: 0.7, o: 0.6 }, { x: 97.5, y: 28, r: 0.9, o: 0.7 },
      { x: 96.7, y: 20, r: 0.5, o: 0.5 },
    ]
    const goldStars = [
      { x: 20, y: 3.5, s: 0.9 }, { x: 35, y: 2.2, s: 1.1 }, { x: 50, y: 3.8, s: 1.4 }, { x: 65, y: 2.2, s: 1.1 }, { x: 80, y: 3.5, s: 0.9 },
      { x: 20, y: 96.8, s: 0.9 }, { x: 35, y: 97.8, s: 1.0 }, { x: 50, y: 96.5, s: 1.3 }, { x: 65, y: 97.8, s: 1.0 }, { x: 80, y: 96.8, s: 0.9 },
    ]

    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Champagne Flute Icon */}
          <g id="cg-flute">
            <path d="M-1.2,-7 L-1.2,-2 Q-1.2,1 0,1 Q1.2,1 1.2,-2 L1.2,-7 Z" fill="#FCD34D" fillOpacity="0.4" stroke="#F59E0B" strokeWidth="0.5" />
            <path d="M-1,-4.5 L-1,-2 Q-1,0.8 0,0.8 Q1,0.8 1,-2 L1,-4.5 Z" fill="#F59E0B" fillOpacity="0.8" />
            <line x1="0" y1="1" x2="0" y2="6.5" stroke="#F59E0B" strokeWidth="0.5" strokeLinecap="round" />
            <line x1="-2" y1="6.5" x2="2" y2="6.5" stroke="#F59E0B" strokeWidth="0.6" strokeLinecap="round" />
            <circle cx="-0.4" cy="-8.2" r="0.35" fill="#FEF08A" />
            <circle cx="0.5" cy="-9.4" r="0.25" fill="#FEF08A" />
          </g>
          {/* 4-point radiant star */}
          <g id="cg-star">
            <polygon points="0,-2.5 0.5,-0.5 2.5,0 0.5,0.5 0,2.5 -0.5,0.5 -2.5,0 -0.5,-0.5" fill="#F59E0B" />
          </g>
        </defs>

        {/* Subtle gold inlaid double border */}
        <rect x="3.5" y="3.5" width="93" height="93" rx="1.5" fill="none" stroke="#F59E0B" strokeWidth="0.45" strokeOpacity="0.45" />

        {/* Top-Left Clinking Flutes */}
        <g transform="translate(7, 7)">
          <use href="#cg-flute" transform="rotate(18) scale(0.65)" />
          <use href="#cg-flute" transform="translate(3.5, 0) rotate(-18) scale(0.65)" />
          {/* Clink starburst */}
          <polygon points="1.8,-5.5 2.2,-4.5 3.2,-4.2 2.2,-3.8 1.8,-2.8 1.4,-3.8 0.4,-4.2 1.4,-4.5" fill="#FEF08A" />
        </g>

        {/* Top-Right Clinking Flutes */}
        <g transform="translate(90, 7) scale(-1, 1)">
          <use href="#cg-flute" transform="rotate(18) scale(0.65)" />
          <use href="#cg-flute" transform="translate(3.5, 0) rotate(-18) scale(0.65)" />
          <polygon points="1.8,-5.5 2.2,-4.5 3.2,-4.2 2.2,-3.8 1.8,-2.8 1.4,-3.8 0.4,-4.2 1.4,-4.5" fill="#FEF08A" />
        </g>

        {/* Festive Golden Garland along Top Border */}
        <path d="M 14,4.5 Q 32,7.5 50,4.5 Q 68,7.5 86,4.5" fill="none" stroke="#F59E0B" strokeWidth="0.5" strokeOpacity="0.6" strokeDasharray="1.5 1.5" />
        <path d="M 14,95.5 Q 32,92.5 50,95.5 Q 68,92.5 86,95.5" fill="none" stroke="#F59E0B" strokeWidth="0.5" strokeOpacity="0.6" strokeDasharray="1.5 1.5" />

        {/* Rising Effervescent Bubbles */}
        {[...leftBubbles, ...rightBubbles].map((b, i) => (
          <circle key={`bb-${i}`} cx={b.x} cy={b.y} r={b.r} fill="#FCD34D" opacity={b.o} />
        ))}

        {/* Golden Celebration Stars */}
        {goldStars.map((st, i) => (
          <use
            key={`st-${i}`}
            href="#cg-star"
            x={st.x}
            y={st.y}
            transform={`scale(${st.s})`}
            opacity={0.8}
          />
        ))}

        {/* Bottom corners celebratory sparkle arcs */}
        <path d="M 3,92 Q 8,92 8,97" fill="none" stroke="#F59E0B" strokeWidth="0.6" strokeOpacity="0.7" />
        <circle cx="8" cy="92" r="0.7" fill="#FEF08A" />
        <path d="M 97,92 Q 92,92 92,97" fill="none" stroke="#F59E0B" strokeWidth="0.6" strokeOpacity="0.7" />
        <circle cx="92" cy="92" r="0.7" fill="#FEF08A" />
      </svg>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 3. GRAND FIESTA — Colorful confetti, ribbons, and party poppers
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'celebration-confetti') {
    const confettiPieces = [
      { x: 12, y: 3, c: '#F59E0B', r: 15, s: 1.2 }, { x: 22, y: 2.2, c: '#EF4444', r: -30, s: 1.0 },
      { x: 32, y: 3.5, c: '#3B82F6', r: 45, s: 0.9 }, { x: 42, y: 2, c: '#10B981', r: -15, s: 1.1 },
      { x: 50, y: 3.8, c: '#A855F7', r: 25, s: 1.3 }, { x: 58, y: 2.2, c: '#F43F5E', r: -40, s: 1.0 },
      { x: 68, y: 3.5, c: '#06B6D4', r: 35, s: 1.1 }, { x: 78, y: 2.5, c: '#F59E0B', r: -20, s: 0.9 },
      { x: 88, y: 3.2, c: '#EF4444', r: 50, s: 1.2 },
      // Left border
      { x: 2.5, y: 16, c: '#3B82F6', r: 20, s: 1.1 }, { x: 3.2, y: 28, c: '#F59E0B', r: -45, s: 0.9 },
      { x: 2.2, y: 42, c: '#10B981', r: 60, s: 1.0 }, { x: 3.0, y: 56, c: '#A855F7', r: -25, s: 1.2 },
      { x: 2.4, y: 70, c: '#F43F5E', r: 40, s: 0.9 }, { x: 3.1, y: 84, c: '#06B6D4', r: -35, s: 1.1 },
      // Right border
      { x: 97.5, y: 16, c: '#EF4444', r: -20, s: 1.1 }, { x: 96.8, y: 28, c: '#A855F7', r: 45, s: 0.9 },
      { x: 97.8, y: 42, c: '#F59E0B', r: -60, s: 1.0 }, { x: 97.0, y: 56, c: '#3B82F6', r: 25, s: 1.2 },
      { x: 97.6, y: 70, c: '#10B981', r: -40, s: 0.9 }, { x: 96.9, y: 84, c: '#F43F5E', r: 35, s: 1.1 },
      // Bottom border
      { x: 12, y: 97, c: '#06B6D4', r: 30, s: 1.1 }, { x: 24, y: 97.8, c: '#F59E0B', r: -20, s: 0.9 },
      { x: 36, y: 96.5, c: '#EF4444', r: 45, s: 1.2 }, { x: 48, y: 97.6, c: '#A855F7', r: -35, s: 1.0 },
      { x: 60, y: 96.8, c: '#10B981', r: 50, s: 1.3 }, { x: 72, y: 97.5, c: '#3B82F6', r: -15, s: 1.1 },
      { x: 84, y: 96.8, c: '#F43F5E', r: 25, s: 0.9 },
    ]

    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Corner popper shoots */}
        <g transform="translate(4, 4)">
          <polygon points="0,0 2,6 6,2" fill="#F59E0B" opacity="0.8" />
          <path d="M 4,4 Q 8,5 10,2" fill="none" stroke="#EF4444" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 4,4 Q 6,8 3,11" fill="none" stroke="#3B82F6" strokeWidth="0.6" strokeLinecap="round" />
        </g>
        <g transform="translate(96, 4) scale(-1, 1)">
          <polygon points="0,0 2,6 6,2" fill="#A855F7" opacity="0.8" />
          <path d="M 4,4 Q 8,5 10,2" fill="none" stroke="#10B981" strokeWidth="0.6" strokeLinecap="round" />
          <path d="M 4,4 Q 6,8 3,11" fill="none" stroke="#F59E0B" strokeWidth="0.6" strokeLinecap="round" />
        </g>

        {confettiPieces.map((p, i) => (
          <rect
            key={`cp-${i}`}
            x={p.x - 0.7}
            y={p.y - 0.7}
            width={1.6 * p.s}
            height={1.0 * p.s}
            rx={0.2}
            fill={p.c}
            opacity={0.7}
            transform={`rotate(${p.r}, ${p.x}, ${p.y})`}
          />
        ))}
      </svg>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 4. BLOOMING ROSES — Botanical leafy vines and blooming buds
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'botanical-roses') {
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Continuous vine perimeter */}
        <path d="M 7,3 Q 50,5 93,3" fill="none" stroke="#15803D" strokeWidth="0.55" strokeOpacity="0.55" />
        <path d="M 97,7 Q 95,50 97,93" fill="none" stroke="#15803D" strokeWidth="0.55" strokeOpacity="0.55" />
        <path d="M 93,97 Q 50,95 7,97" fill="none" stroke="#15803D" strokeWidth="0.55" strokeOpacity="0.55" />
        <path d="M 3,93 Q 5,50 3,7" fill="none" stroke="#15803D" strokeWidth="0.55" strokeOpacity="0.55" />

        {/* Four Corner Rosebud Bouquets */}
        {/* Top-Left */}
        <g transform="translate(6, 6)">
          <path d="M-3,8 Q-3,-3 8,-3" fill="none" stroke="#15803D" strokeWidth="0.7" strokeOpacity="0.7" />
          <ellipse cx="2" cy="-2.5" rx="1.8" ry="1.0" fill="#22C55E" opacity="0.6" transform="rotate(-20, 2, -2.5)" />
          <ellipse cx="-2.5" cy="2" rx="1.8" ry="1.0" fill="#22C55E" opacity="0.6" transform="rotate(70, -2.5, 2)" />
          {/* Rose flower */}
          <circle cx="0.5" cy="0.5" r="1.4" fill="#F43F5E" opacity="0.9" />
          <circle cx="0.2" cy="0.2" r="0.8" fill="#BE123C" opacity="0.9" />
        </g>
        {/* Top-Right */}
        <g transform="translate(94, 6) scale(-1, 1)">
          <path d="M-3,8 Q-3,-3 8,-3" fill="none" stroke="#15803D" strokeWidth="0.7" strokeOpacity="0.7" />
          <ellipse cx="2" cy="-2.5" rx="1.8" ry="1.0" fill="#22C55E" opacity="0.6" transform="rotate(-20, 2, -2.5)" />
          <ellipse cx="-2.5" cy="2" rx="1.8" ry="1.0" fill="#22C55E" opacity="0.6" transform="rotate(70, -2.5, 2)" />
          <circle cx="0.5" cy="0.5" r="1.4" fill="#F43F5E" opacity="0.9" />
          <circle cx="0.2" cy="0.2" r="0.8" fill="#BE123C" opacity="0.9" />
        </g>
        {/* Bottom-Left */}
        <g transform="translate(6, 94) scale(1, -1)">
          <path d="M-3,8 Q-3,-3 8,-3" fill="none" stroke="#15803D" strokeWidth="0.7" strokeOpacity="0.7" />
          <ellipse cx="2" cy="-2.5" rx="1.8" ry="1.0" fill="#22C55E" opacity="0.6" transform="rotate(-20, 2, -2.5)" />
          <ellipse cx="-2.5" cy="2" rx="1.8" ry="1.0" fill="#22C55E" opacity="0.6" transform="rotate(70, -2.5, 2)" />
          <circle cx="0.5" cy="0.5" r="1.4" fill="#F43F5E" opacity="0.9" />
          <circle cx="0.2" cy="0.2" r="0.8" fill="#BE123C" opacity="0.9" />
        </g>
        {/* Bottom-Right */}
        <g transform="translate(94, 94) scale(-1, -1)">
          <path d="M-3,8 Q-3,-3 8,-3" fill="none" stroke="#15803D" strokeWidth="0.7" strokeOpacity="0.7" />
          <ellipse cx="2" cy="-2.5" rx="1.8" ry="1.0" fill="#22C55E" opacity="0.6" transform="rotate(-20, 2, -2.5)" />
          <ellipse cx="-2.5" cy="2" rx="1.8" ry="1.0" fill="#22C55E" opacity="0.6" transform="rotate(70, -2.5, 2)" />
          <circle cx="0.5" cy="0.5" r="1.4" fill="#F43F5E" opacity="0.9" />
          <circle cx="0.2" cy="0.2" r="0.8" fill="#BE123C" opacity="0.9" />
        </g>

        {/* Small rosebuds along top & bottom */}
        {[25, 50, 75].map((x, i) => (
          <g key={`rb-top-${i}`} transform={`translate(${x}, 3.5)`}>
            <circle cx="0" cy="0" r="0.9" fill="#F43F5E" opacity="0.85" />
            <ellipse cx="-1.2" cy="0" rx="0.8" ry="0.4" fill="#22C55E" opacity="0.7" transform="rotate(-15)" />
            <ellipse cx="1.2" cy="0" rx="0.8" ry="0.4" fill="#22C55E" opacity="0.7" transform="rotate(15)" />
          </g>
        ))}
        {[25, 50, 75].map((x, i) => (
          <g key={`rb-bot-${i}`} transform={`translate(${x}, 96.5)`}>
            <circle cx="0" cy="0" r="0.9" fill="#F43F5E" opacity="0.85" />
            <ellipse cx="-1.2" cy="0" rx="0.8" ry="0.4" fill="#22C55E" opacity="0.7" transform="rotate(15)" />
            <ellipse cx="1.2" cy="0" rx="0.8" ry="0.4" fill="#22C55E" opacity="0.7" transform="rotate(-15)" />
          </g>
        ))}
      </svg>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 5. IMPERIAL LAUREL — Golden victory wreaths and regal double gold
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'imperial-laurel') {
    const laurelLeaves = [
      { x: 3.5, y: 92, r: -50 }, { x: 4.5, y: 88, r: -35 }, { x: 6.2, y: 84.5, r: -20 }, { x: 8.5, y: 82, r: -5 },
    ]
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Double gold inlaid frame */}
        <rect x="2" y="2" width="96" height="96" rx="1.5" fill="none" stroke="#D4AF37" strokeWidth="0.7" strokeOpacity="0.85" />
        <rect x="3.8" y="3.8" width="92.4" height="92.4" rx="0.8" fill="none" stroke="#D4AF37" strokeWidth="0.35" strokeOpacity="0.45" />

        {/* Corner Diamond Filigree */}
        {/* Top-Left */}
        <polygon points="3.8,1.5 6,3.8 3.8,6 1.5,3.8" fill="#D4AF37" />
        {/* Top-Right */}
        <polygon points="96.2,1.5 98.5,3.8 96.2,6 94,3.8" fill="#D4AF37" />
        {/* Bottom-Left */}
        <polygon points="3.8,94 6,96.2 3.8,98.5 1.5,96.2" fill="#D4AF37" />
        {/* Bottom-Right */}
        <polygon points="96.2,94 98.5,96.2 96.2,98.5 94,96.2" fill="#D4AF37" />

        {/* Top & Bottom Center Crests */}
        <polygon points="50,1.5 52,3.8 50,6 48,3.8" fill="#D4AF37" />
        <polygon points="50,94 52,96.2 50,98.5 48,96.2" fill="#D4AF37" />

        {/* Bottom-Left Laurel Sprig */}
        <path d="M 3,96 Q 2.5,86 10,81" fill="none" stroke="#D4AF37" strokeWidth="0.55" strokeLinecap="round" />
        {laurelLeaves.map((l, i) => (
          <ellipse
            key={`ll-${i}`}
            cx={l.x}
            cy={l.y}
            rx="1.8"
            ry="0.8"
            fill="#D4AF37"
            fillOpacity="0.85"
            transform={`rotate(${l.r}, ${l.x}, ${l.y})`}
          />
        ))}

        {/* Bottom-Right Laurel Sprig */}
        <g transform="translate(100, 0) scale(-1, 1)">
          <path d="M 3,96 Q 2.5,86 10,81" fill="none" stroke="#D4AF37" strokeWidth="0.55" strokeLinecap="round" />
          {laurelLeaves.map((l, i) => (
            <ellipse
              key={`lr-${i}`}
              cx={l.x}
              cy={l.y}
              rx="1.8"
              ry="0.8"
              fill="#D4AF37"
              fillOpacity="0.85"
              transform={`rotate(${l.r}, ${l.x}, ${l.y})`}
            />
          ))}
        </g>
      </svg>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 6. STARLIGHT GALAXY — Crescent moon, constellations, and starry night
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'celestial-night' || frameId === 'stars-night') {
    const celestialStars = [
      { x: 10, y: 3.5, s: 1.1 }, { x: 25, y: 2.2, s: 0.7 }, { x: 40, y: 3.8, s: 1.2 }, { x: 55, y: 2.5, s: 0.8 }, { x: 70, y: 3.6, s: 1.0 }, { x: 82, y: 2.4, s: 0.7 },
      { x: 3.5, y: 15, s: 0.8 }, { x: 2.2, y: 32, s: 1.2 }, { x: 3.8, y: 50, s: 0.7 }, { x: 2.4, y: 68, s: 1.0 }, { x: 3.5, y: 85, s: 0.8 },
      { x: 96.5, y: 22, s: 0.9 }, { x: 97.8, y: 40, s: 0.7 }, { x: 96.2, y: 58, s: 1.2 }, { x: 97.6, y: 76, s: 0.8 }, { x: 96.5, y: 90, s: 1.0 },
      { x: 10, y: 96.8, s: 0.8 }, { x: 28, y: 97.6, s: 1.1 }, { x: 45, y: 96.5, s: 0.7 }, { x: 62, y: 97.8, s: 1.2 }, { x: 80, y: 96.6, s: 0.8 },
    ]
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Crescent moon in top-right */}
        <path
          d="M 0,-4 A 4.5,4.5 0 0,0 4.5,1 A 3.8,3.8 0 1,1 0,-4 Z"
          fill="#FDE047"
          opacity="0.85"
          transform="translate(93, 7) scale(0.95)"
        />

        {/* Faint constellation connector paths */}
        <path d="M 10,3.5 L 25,2.2 L 40,3.8 L 55,2.5 L 70,3.6" fill="none" stroke="#FDE047" strokeWidth="0.25" strokeOpacity="0.3" strokeDasharray="1 1" />
        <path d="M 10,96.8 L 28,97.6 L 45,96.5 L 62,97.8 L 80,96.6" fill="none" stroke="#FDE047" strokeWidth="0.25" strokeOpacity="0.3" strokeDasharray="1 1" />

        {/* 4-point radiant stars */}
        {celestialStars.map((st, i) => (
          <polygon
            key={`cs-${i}`}
            points={`${st.x},${st.y - st.s * 1.5} ${st.x + st.s * 0.4},${st.y - st.s * 0.4} ${st.x + st.s * 1.5},${st.y} ${st.x + st.s * 0.4},${st.y + st.s * 0.4} ${st.x},${st.y + st.s * 1.5} ${st.x - st.s * 0.4},${st.y + st.s * 0.4} ${st.x - st.s * 1.5},${st.y} ${st.x - st.s * 0.4},${st.y - st.s * 0.4}`}
            fill="#FEF08A"
            opacity={0.8}
          />
        ))}
      </svg>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 7. CYBER MATRIX — Neon tech HUD brackets and circuit pulse lines
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'cyber-matrix') {
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* HUD Corner Brackets */}
        {/* Top-Left */}
        <path d="M 2,12 L 2,2 L 12,2" fill="none" stroke="#06B6D4" strokeWidth="0.8" />
        <rect x="1.5" y="1.5" width="2" height="2" fill="#06B6D4" />
        <line x1="14" y1="2" x2="18" y2="2" stroke="#06B6D4" strokeWidth="0.4" strokeDasharray="1 1" />
        <line x1="2" y1="14" x2="2" y2="18" stroke="#06B6D4" strokeWidth="0.4" strokeDasharray="1 1" />

        {/* Top-Right */}
        <path d="M 88,2 L 98,2 L 98,12" fill="none" stroke="#06B6D4" strokeWidth="0.8" />
        <rect x="96.5" y="1.5" width="2" height="2" fill="#06B6D4" />
        <line x1="82" y1="2" x2="86" y2="2" stroke="#06B6D4" strokeWidth="0.4" strokeDasharray="1 1" />
        <line x1="98" y1="14" x2="98" y2="18" stroke="#06B6D4" strokeWidth="0.4" strokeDasharray="1 1" />

        {/* Bottom-Left */}
        <path d="M 2,88 L 2,98 L 12,98" fill="none" stroke="#06B6D4" strokeWidth="0.8" />
        <rect x="1.5" y="96.5" width="2" height="2" fill="#06B6D4" />
        <line x1="14" y1="98" x2="18" y2="98" stroke="#06B6D4" strokeWidth="0.4" strokeDasharray="1 1" />
        <line x1="2" y1="82" x2="2" y2="86" stroke="#06B6D4" strokeWidth="0.4" strokeDasharray="1 1" />

        {/* Bottom-Right */}
        <path d="M 88,98 L 98,98 L 98,88" fill="none" stroke="#06B6D4" strokeWidth="0.8" />
        <rect x="96.5" y="96.5" width="2" height="2" fill="#06B6D4" />
        <line x1="82" y1="98" x2="86" y2="98" stroke="#06B6D4" strokeWidth="0.4" strokeDasharray="1 1" />
        <line x1="98" y1="82" x2="98" y2="86" stroke="#06B6D4" strokeWidth="0.4" strokeDasharray="1 1" />

        {/* Mid-edge reticle targets */}
        <line x1="47" y1="2" x2="53" y2="2" stroke="#06B6D4" strokeWidth="0.6" />
        <circle cx="50" cy="2" r="0.8" fill="#06B6D4" />
        <line x1="47" y1="98" x2="53" y2="98" stroke="#06B6D4" strokeWidth="0.6" />
        <circle cx="50" cy="98" r="0.8" fill="#06B6D4" />

        {/* Sub-grid perimeter dots */}
        <circle cx="50" cy="50" r="0.4" fill="#06B6D4" opacity="0.3" />
      </svg>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 8. BAROQUE FILIGREE — Victorian antique scrollwork and lace flourish
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'baroque-filigree' || frameId === 'golden-filigree') {
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <rect x="2" y="2" width="96" height="96" rx="1.5" fill="none" stroke="#D4AF37" strokeWidth="0.7" strokeOpacity="0.85" />
        <rect x="3.8" y="3.8" width="92.4" height="92.4" rx="0.8" fill="none" stroke="#D4AF37" strokeWidth="0.35" strokeOpacity="0.45" />

        {/* Corner diamonds */}
        <polygon points="3.8,1.5 6,3.8 3.8,6 1.5,3.8" fill="#D4AF37" fillOpacity="0.95" />
        <polygon points="96.2,1.5 98.5,3.8 96.2,6 94,3.8" fill="#D4AF37" fillOpacity="0.95" />
        <polygon points="3.8,94 6,96.2 3.8,98.5 1.5,96.2" fill="#D4AF37" fillOpacity="0.95" />
        <polygon points="96.2,94 98.5,96.2 96.2,98.5 94,96.2" fill="#D4AF37" fillOpacity="0.95" />

        {/* Ornamental corner scroll accents */}
        <path d="M 6,3.8 Q 12,3.8 12,9" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.7" />
        <path d="M 3.8,6 Q 3.8,12 9,12" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.7" />
        <path d="M 94,3.8 Q 88,3.8 88,9" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.7" />
        <path d="M 96.2,6 Q 96.2,12 91,12" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.7" />
        <path d="M 6,96.2 Q 12,96.2 12,91" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.7" />
        <path d="M 3.8,94 Q 3.8,88 9,88" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.7" />
        <path d="M 94,96.2 Q 88,96.2 88,91" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.7" />
        <path d="M 96.2,94 Q 96.2,88 91,88" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.7" />
      </svg>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 9. FILM STRIP — Cinema reel sprocket holes
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'film-strip') {
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <rect x="0" y="0" width="6" height="100" fill="currentColor" fillOpacity="0.06" />
        {Array.from({ length: 12 }, (_, i) => {
          const y = 4 + i * 8
          return <rect key={`l-${i}`} x="1.5" y={y} width="3" height="4" rx="0.5" fill="currentColor" fillOpacity="0.18" />
        })}
        <rect x="94" y="0" width="6" height="100" fill="currentColor" fillOpacity="0.06" />
        {Array.from({ length: 12 }, (_, i) => {
          const y = 4 + i * 8
          return <rect key={`r-${i}`} x="95.5" y={y} width="3" height="4" rx="0.5" fill="currentColor" fillOpacity="0.18" />
        })}
      </svg>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  // 10. VINTAGE POSTAGE — Perforated stamp edge
  // ═══════════════════════════════════════════════════════════════════════════════
  if (frameId === 'postage-stamp') {
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {Array.from({ length: 18 }, (_, i) => {
          const t = 3 + i * 5.4
          return (
            <g key={i}>
              <circle cx={t} cy={1.5} r={1.2} fill="currentColor" fillOpacity="0.15" />
              <circle cx={t} cy={98.5} r={1.2} fill="currentColor" fillOpacity="0.15" />
            </g>
          )
        })}
        {Array.from({ length: 18 }, (_, i) => {
          const t = 3 + i * 5.4
          return (
            <g key={`s-${i}`}>
              <circle cx={1.5} cy={t} r={1.2} fill="currentColor" fillOpacity="0.15" />
              <circle cx={98.5} cy={t} r={1.2} fill="currentColor" fillOpacity="0.15" />
            </g>
          )
        })}
        <rect x="4" y="4" width="92" height="92" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
      </svg>
    )
  }

  // ── Backward compatibility for retired frames ──
  if (frameId === 'ornate-corners') {
    return (
      <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none z-[2]" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M2,12 L2,2 L12,2" fill="none" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" />
        <circle cx="2" cy="2" r="1.5" fill="#D4AF37" fillOpacity="0.9" />
        <path d="M88,2 L98,2 L98,12" fill="none" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" />
        <circle cx="98" cy="2" r="1.5" fill="#D4AF37" fillOpacity="0.9" />
        <path d="M2,88 L2,98 L12,98" fill="none" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" />
        <circle cx="2" cy="98" r="1.5" fill="#D4AF37" fillOpacity="0.9" />
        <path d="M88,98 L98,98 L98,88" fill="none" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" />
        <circle cx="98" cy="98" r="1.5" fill="#D4AF37" fillOpacity="0.9" />
      </svg>
    )
  }

  if (frameId === 'nature-vines') {
    return (
      <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none z-[2]" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M2,15 Q2,2 15,2" fill="none" stroke="#16a34a" strokeWidth="0.5" strokeOpacity="0.5" />
        <ellipse cx="4" cy="5" rx="2" ry="1.2" fill="#22c55e" fillOpacity="0.3" transform="rotate(-40,4,5)" />
        <path d="M85,2 Q98,2 98,15" fill="none" stroke="#16a34a" strokeWidth="0.5" strokeOpacity="0.5" />
        <ellipse cx="93" cy="3" rx="2" ry="1.2" fill="#22c55e" fillOpacity="0.3" transform="rotate(20,93,3)" />
      </svg>
    )
  }

  if (frameId === 'dashed-sketch') {
    return (
      <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none z-[2]" viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect x="2" y="2" width="96" height="96" rx="2" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.35" strokeDasharray="3 2 1 2" strokeLinecap="round" />
      </svg>
    )
  }

  if (frameId === 'corner-ticks') {
    return (
      <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none z-[2]" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M2,14 L2,2 L14,2" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <path d="M86,2 L98,2 L98,14" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <path d="M2,86 L2,98 L14,98" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <path d="M86,98 L98,98 L98,86" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    )
  }

  if (frameId === 'ticket-stub') {
    return (
      <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none z-[2]" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line x1="7" y1="2" x2="7" y2="98" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.35" strokeDasharray="2.5 2" />
      </svg>
    )
  }

  if (frameId === 'top-band') {
    return (
      <div aria-hidden="true" className="absolute top-0 left-0 right-0 h-[6px] pointer-events-none z-[2]" style={{ backgroundColor: accentHex || 'currentColor' }} />
    )
  }

  if (frameId === 'laurel') {
    return (
      <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none z-[2]" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M4,96.5 Q2.8,88 10,83.5" fill="none" stroke="#B08D2F" strokeWidth="0.55" strokeLinecap="round" />
      </svg>
    )
  }

  return null
}
