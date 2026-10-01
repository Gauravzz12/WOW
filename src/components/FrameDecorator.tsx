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
      <>
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
      </>
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

  // For CSS-only frames (royal-double, neon-glow, holographic) return null —
  // the visual is driven purely by globals.css on the parent container.
  return null
}
