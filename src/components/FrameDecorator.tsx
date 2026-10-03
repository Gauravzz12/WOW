'use client'

/**
 * FrameDecorator renders decorative SVG/CSS overlays inside a card.
 * It must be the first child of a `relative overflow-hidden` container.
 */
export function FrameDecorator({ frameId }: { frameId?: string }) {
  if (!frameId || frameId === 'none') return null

  if (frameId === 'ornate-corners') {
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Top-left */}
        <path d="M2,12 L2,2 L12,2" fill="none" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" />
        <path d="M2,16 L2,2 L16,2" fill="none" stroke="#D4AF37" strokeWidth="0.4" strokeOpacity="0.5" strokeLinecap="round" />
        <circle cx="2" cy="2" r="1.5" fill="#D4AF37" fillOpacity="0.9" />
        {/* Top-right */}
        <path d="M88,2 L98,2 L98,12" fill="none" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" />
        <path d="M84,2 L98,2 L98,16" fill="none" stroke="#D4AF37" strokeWidth="0.4" strokeOpacity="0.5" strokeLinecap="round" />
        <circle cx="98" cy="2" r="1.5" fill="#D4AF37" fillOpacity="0.9" />
        {/* Bottom-left */}
        <path d="M2,88 L2,98 L12,98" fill="none" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" />
        <path d="M2,84 L2,98 L16,98" fill="none" stroke="#D4AF37" strokeWidth="0.4" strokeOpacity="0.5" strokeLinecap="round" />
        <circle cx="2" cy="98" r="1.5" fill="#D4AF37" fillOpacity="0.9" />
        {/* Bottom-right */}
        <path d="M88,98 L98,98 L98,88" fill="none" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" />
        <path d="M84,98 L98,98 L98,84" fill="none" stroke="#D4AF37" strokeWidth="0.4" strokeOpacity="0.5" strokeLinecap="round" />
        <circle cx="98" cy="98" r="1.5" fill="#D4AF37" fillOpacity="0.9" />
      </svg>
    )
  }

  if (frameId === 'golden-filigree') {
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <rect x="1.5" y="1.5" width="97" height="97" rx="1" fill="none" stroke="#D4AF37" strokeWidth="0.6" strokeOpacity="0.8" />
        <rect x="3" y="3" width="94" height="94" rx="0.5" fill="none" stroke="#D4AF37" strokeWidth="0.3" strokeOpacity="0.4" />
        {/* Corner diamonds */}
        <polygon points="3,1 5,3 3,5 1,3" fill="#D4AF37" fillOpacity="0.9" />
        <polygon points="97,1 99,3 97,5 95,3" fill="#D4AF37" fillOpacity="0.9" />
        <polygon points="3,95 5,97 3,99 1,97" fill="#D4AF37" fillOpacity="0.9" />
        <polygon points="97,95 99,97 97,99 95,97" fill="#D4AF37" fillOpacity="0.9" />
        {/* Mid edge ticks */}
        <line x1="50" y1="1" x2="50" y2="4" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.6" />
        <line x1="50" y1="96" x2="50" y2="99" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.6" />
        <line x1="1" y1="50" x2="4" y2="50" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.6" />
        <line x1="96" y1="50" x2="99" y2="50" stroke="#D4AF37" strokeWidth="0.5" strokeOpacity="0.6" />
      </svg>
    )
  }

  if (frameId === 'postage-stamp') {
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Perforated edges — circles along each side */}
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
        <rect x="4" y="4" width="92" height="92" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="0" />
      </svg>
    )
  }

  if (frameId === 'stepped-inset') {
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <rect x="1" y="1" width="98" height="98" rx="1" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.4" />
        <rect x="3" y="3" width="94" height="94" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.25" />
        <rect x="5.5" y="5.5" width="89" height="89" rx="0.5" fill="none" stroke="currentColor" strokeWidth="0.2" strokeOpacity="0.15" />
      </svg>
    )
  }

  // ── Theme-focused decorative frames ──

  if (frameId === 'love-hearts') {
    // Scattered heart shapes around the edges
    const hearts = [
      { x: 8, y: 5, s: 1.2 }, { x: 25, y: 3, s: 0.8 }, { x: 50, y: 2, s: 1.0 }, { x: 75, y: 4, s: 0.9 }, { x: 92, y: 5, s: 1.1 },
      { x: 3, y: 25, s: 0.7 }, { x: 4, y: 50, s: 1.0 }, { x: 3, y: 75, s: 0.8 },
      { x: 97, y: 25, s: 0.9 }, { x: 96, y: 50, s: 0.7 }, { x: 97, y: 75, s: 1.0 },
      { x: 10, y: 96, s: 0.9 }, { x: 30, y: 97, s: 1.1 }, { x: 50, y: 98, s: 0.8 }, { x: 70, y: 97, s: 1.0 }, { x: 90, y: 96, s: 0.7 },
    ]
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {hearts.map((h, i) => (
          <text
            key={i}
            x={h.x}
            y={h.y}
            fontSize={h.s * 3}
            textAnchor="middle"
            dominantBaseline="central"
            opacity={0.4 + h.s * 0.2}
            fill="#e11d48"
          >
            ♥
          </text>
        ))}
      </svg>
    )
  }

  if (frameId === 'celebration-confetti') {
    // Confetti dots and small shapes around the edges
    const confetti = [
      { x: 5, y: 4, color: '#f59e0b', shape: 'circle' },
      { x: 15, y: 2, color: '#ef4444', shape: 'rect' },
      { x: 30, y: 5, color: '#3b82f6', shape: 'circle' },
      { x: 45, y: 2, color: '#22c55e', shape: 'rect' },
      { x: 60, y: 4, color: '#a855f7', shape: 'circle' },
      { x: 75, y: 2, color: '#f43f5e', shape: 'rect' },
      { x: 90, y: 5, color: '#eab308', shape: 'circle' },
      { x: 95, y: 3, color: '#06b6d4', shape: 'rect' },
      { x: 3, y: 20, color: '#ef4444', shape: 'circle' },
      { x: 2, y: 40, color: '#3b82f6', shape: 'rect' },
      { x: 4, y: 60, color: '#a855f7', shape: 'circle' },
      { x: 3, y: 80, color: '#22c55e', shape: 'rect' },
      { x: 97, y: 20, color: '#f59e0b', shape: 'rect' },
      { x: 98, y: 40, color: '#ef4444', shape: 'circle' },
      { x: 96, y: 60, color: '#06b6d4', shape: 'rect' },
      { x: 97, y: 80, color: '#eab308', shape: 'circle' },
      { x: 10, y: 97, color: '#3b82f6', shape: 'rect' },
      { x: 25, y: 96, color: '#22c55e', shape: 'circle' },
      { x: 40, y: 98, color: '#f43f5e', shape: 'rect' },
      { x: 55, y: 96, color: '#a855f7', shape: 'circle' },
      { x: 70, y: 98, color: '#f59e0b', shape: 'rect' },
      { x: 85, y: 96, color: '#06b6d4', shape: 'circle' },
    ]
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {confetti.map((c, i) =>
          c.shape === 'circle' ? (
            <circle key={i} cx={c.x} cy={c.y} r={1} fill={c.color} opacity={0.6} />
          ) : (
            <rect key={i} x={c.x - 0.7} y={c.y - 0.7} width={1.4} height={1.4} fill={c.color} opacity={0.5} rx={0.2} transform={`rotate(${i * 25}, ${c.x}, ${c.y})`} />
          )
        )}
      </svg>
    )
  }

  if (frameId === 'nature-vines') {
    // Organic leaf/vine accents in corners
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Top-left vine */}
        <path d="M2,15 Q2,2 15,2" fill="none" stroke="#16a34a" strokeWidth="0.5" strokeOpacity="0.5" />
        <ellipse cx="4" cy="5" rx="2" ry="1.2" fill="#22c55e" fillOpacity="0.3" transform="rotate(-40,4,5)" />
        <ellipse cx="7" cy="3" rx="1.8" ry="1" fill="#22c55e" fillOpacity="0.25" transform="rotate(-20,7,3)" />
        <ellipse cx="2.5" cy="9" rx="1.5" ry="0.9" fill="#16a34a" fillOpacity="0.3" transform="rotate(-60,2.5,9)" />
        {/* Top-right vine */}
        <path d="M85,2 Q98,2 98,15" fill="none" stroke="#16a34a" strokeWidth="0.5" strokeOpacity="0.5" />
        <ellipse cx="93" cy="3" rx="2" ry="1.2" fill="#22c55e" fillOpacity="0.3" transform="rotate(20,93,3)" />
        <ellipse cx="96" cy="5" rx="1.8" ry="1" fill="#22c55e" fillOpacity="0.25" transform="rotate(40,96,5)" />
        <ellipse cx="97.5" cy="9" rx="1.5" ry="0.9" fill="#16a34a" fillOpacity="0.3" transform="rotate(60,97.5,9)" />
        {/* Bottom-left vine */}
        <path d="M2,85 Q2,98 15,98" fill="none" stroke="#16a34a" strokeWidth="0.5" strokeOpacity="0.5" />
        <ellipse cx="4" cy="95" rx="2" ry="1.2" fill="#22c55e" fillOpacity="0.3" transform="rotate(40,4,95)" />
        <ellipse cx="7" cy="97" rx="1.8" ry="1" fill="#22c55e" fillOpacity="0.25" transform="rotate(20,7,97)" />
        {/* Bottom-right vine */}
        <path d="M85,98 Q98,98 98,85" fill="none" stroke="#16a34a" strokeWidth="0.5" strokeOpacity="0.5" />
        <ellipse cx="93" cy="97" rx="2" ry="1.2" fill="#22c55e" fillOpacity="0.3" transform="rotate(-20,93,97)" />
        <ellipse cx="96" cy="95" rx="1.8" ry="1" fill="#22c55e" fillOpacity="0.25" transform="rotate(-40,96,95)" />
      </svg>
    )
  }

  if (frameId === 'stars-night') {
    // Stars twinkling around the border
    const stars = [
      { x: 5, y: 4, s: 1.2 }, { x: 18, y: 2, s: 0.6 }, { x: 35, y: 4, s: 1.0 }, { x: 50, y: 2, s: 0.7 },
      { x: 65, y: 3, s: 1.1 }, { x: 80, y: 2, s: 0.5 }, { x: 95, y: 4, s: 0.9 },
      { x: 3, y: 15, s: 0.6 }, { x: 2, y: 35, s: 1.0 }, { x: 4, y: 55, s: 0.5 }, { x: 2, y: 75, s: 0.8 }, { x: 3, y: 90, s: 0.6 },
      { x: 97, y: 15, s: 0.8 }, { x: 98, y: 35, s: 0.5 }, { x: 96, y: 55, s: 1.0 }, { x: 98, y: 75, s: 0.6 }, { x: 97, y: 90, s: 0.9 },
      { x: 8, y: 97, s: 0.7 }, { x: 25, y: 98, s: 1.0 }, { x: 42, y: 96, s: 0.5 }, { x: 60, y: 98, s: 0.8 },
      { x: 78, y: 97, s: 1.1 }, { x: 92, y: 98, s: 0.6 },
    ]
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {stars.map((st, i) => {
          const r = st.s * 0.6
          return (
            <g key={i} opacity={0.3 + st.s * 0.3}>
              {/* 4-pointed star shape */}
              <polygon
                points={`${st.x},${st.y - r * 2} ${st.x + r * 0.5},${st.y - r * 0.5} ${st.x + r * 2},${st.y} ${st.x + r * 0.5},${st.y + r * 0.5} ${st.x},${st.y + r * 2} ${st.x - r * 0.5},${st.y + r * 0.5} ${st.x - r * 2},${st.y} ${st.x - r * 0.5},${st.y - r * 0.5}`}
                fill="currentColor"
                fillOpacity="0.6"
              />
            </g>
          )
        })}
      </svg>
    )
  }

  if (frameId === 'film-strip') {
    // Cinema film strip sprocket holes along left and right edges
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Left strip */}
        <rect x="0" y="0" width="6" height="100" fill="currentColor" fillOpacity="0.06" />
        {Array.from({ length: 12 }, (_, i) => {
          const y = 4 + i * 8
          return <rect key={`l-${i}`} x="1.5" y={y} width="3" height="4" rx="0.5" fill="currentColor" fillOpacity="0.15" />
        })}
        {/* Right strip */}
        <rect x="94" y="0" width="6" height="100" fill="currentColor" fillOpacity="0.06" />
        {Array.from({ length: 12 }, (_, i) => {
          const y = 4 + i * 8
          return <rect key={`r-${i}`} x="95.5" y={y} width="3" height="4" rx="0.5" fill="currentColor" fillOpacity="0.15" />
        })}
      </svg>
    )
  }

  if (frameId === 'dashed-sketch') {
    return (
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none z-[2]"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <rect
          x="2" y="2" width="96" height="96" rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
          strokeOpacity="0.35"
          strokeDasharray="3 2 1 2"
          strokeLinecap="round"
        />
        <rect
          x="4.5" y="4.5" width="91" height="91" rx="1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.4"
          strokeOpacity="0.2"
          strokeDasharray="2 3"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // For CSS-only frames (royal-double, golden-filigree, etc.) return null —
  // the visual is driven purely by globals.css on the parent container.
  return null
}
