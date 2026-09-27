/**
 * Detects whether a background string is inherently dark in ALL themes
 * (i.e. dark VIP gradients that never switch to a light variant).
 */
function isBgAlwaysDark(bg: string): boolean {
  if (!bg || bg.includes('dark:bg-')) return false
  if (bg.includes('from-[#') || bg.includes('bg-gradient')) {
    const hexes = bg.match(/#[0-9A-Fa-f]{6}/g) || []
    if (hexes.length === 0) return false
    return hexes.every(hex => {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.25
    })
  }
  return false
}

export function getCategoryStyles(slug: string) {
  let bgClass = 'bg-primary/5'
  let borderClass = 'border-primary/20'
  let accentClass = 'text-primary'
  let badgeClass = 'bg-primary/10 text-primary border-primary/20'
  let glowColor = 'bg-white/10'
  let ringColor = 'bg-white'

  switch(slug) {
    case 'love':
      bgClass = 'bg-rose-500/10 dark:bg-rose-500/15'
      borderClass = 'border-rose-500/25 dark:border-rose-500/35'
      accentClass = 'text-rose-600 dark:text-rose-400'
      badgeClass = 'bg-rose-500/15 dark:bg-rose-400/20 text-rose-700 dark:text-rose-300 border-rose-500/30 dark:border-rose-400/40'
      glowColor = 'bg-rose-500'
      ringColor = 'bg-rose-400'
      break;
    case 'celebration':
      bgClass = 'bg-amber-500/10 dark:bg-amber-500/15'
      borderClass = 'border-amber-500/25 dark:border-amber-500/35'
      accentClass = 'text-amber-600 dark:text-amber-400'
      badgeClass = 'bg-amber-500/15 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 border-amber-500/30 dark:border-amber-400/40'
      glowColor = 'bg-amber-500'
      ringColor = 'bg-amber-400'
      break;
    case 'confession':
      bgClass = 'bg-purple-500/10 dark:bg-purple-500/15'
      borderClass = 'border-purple-500/25 dark:border-purple-500/35'
      accentClass = 'text-purple-600 dark:text-purple-400'
      badgeClass = 'bg-purple-500/15 dark:bg-purple-400/20 text-purple-700 dark:text-purple-300 border-purple-500/30 dark:border-purple-400/40'
      glowColor = 'bg-purple-500'
      ringColor = 'bg-purple-400'
      break;
    case 'gratitude':
      bgClass = 'bg-teal-500/10 dark:bg-teal-500/15'
      borderClass = 'border-teal-500/25 dark:border-teal-500/35'
      accentClass = 'text-teal-600 dark:text-teal-400'
      badgeClass = 'bg-teal-500/15 dark:bg-teal-400/20 text-teal-700 dark:text-teal-300 border-teal-500/30 dark:border-teal-400/40'
      glowColor = 'bg-teal-500'
      ringColor = 'bg-teal-400'
      break;
    case 'announcement':
      bgClass = 'bg-blue-500/10 dark:bg-blue-500/15'
      borderClass = 'border-blue-500/25 dark:border-blue-500/35'
      accentClass = 'text-blue-600 dark:text-blue-400'
      badgeClass = 'bg-blue-500/15 dark:bg-blue-400/20 text-blue-700 dark:text-blue-300 border-blue-500/30 dark:border-blue-400/40'
      glowColor = 'bg-blue-500'
      ringColor = 'bg-blue-400'
      break;
    case 'promotion':
      bgClass = 'bg-cyan-500/10 dark:bg-cyan-500/15'
      borderClass = 'border-cyan-500/25 dark:border-cyan-500/35'
      accentClass = 'text-cyan-600 dark:text-cyan-400'
      badgeClass = 'bg-cyan-500/15 dark:bg-cyan-400/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 dark:border-cyan-400/40'
      glowColor = 'bg-cyan-500'
      ringColor = 'bg-cyan-400'
      break;
    case 'rant':
      bgClass = 'bg-red-500/10 dark:bg-red-500/15'
      borderClass = 'border-red-500/25 dark:border-red-500/35'
      accentClass = 'text-red-600 dark:text-red-400'
      badgeClass = 'bg-red-500/15 dark:bg-red-400/20 text-red-700 dark:text-red-300 border-red-500/30 dark:border-red-400/40'
      glowColor = 'bg-red-500'
      ringColor = 'bg-red-400'
      break;
    case 'general':
    default:
      bgClass = 'bg-violet-500/10 dark:bg-violet-500/15'
      borderClass = 'border-violet-500/25 dark:border-violet-500/35'
      accentClass = 'text-violet-600 dark:text-violet-400'
      badgeClass = 'bg-violet-500/15 dark:bg-violet-400/20 text-violet-700 dark:text-violet-300 border-violet-500/30 dark:border-violet-400/40'
      glowColor = 'bg-violet-500'
      ringColor = 'bg-violet-400'
      break;
  }

  return { bgClass, borderClass, accentClass, badgeClass, glowColor, ringColor }
}

export function getCategoryHex(slug: string): string {
  switch(slug) {
    case 'promotion': return '#06b6d4'
    case 'love': return '#f43f5e'
    case 'celebration': return '#f59e0b'
    case 'confession': return '#a855f7'
    case 'gratitude': return '#14b8a6'
    case 'announcement': return '#3b82f6'
    case 'rant': return '#ef4444'
    default: return '#e2e8f0'
  }
}

/**
 * Master canonical template definitions guaranteeing high contrast in BOTH light and dark themes.
 * lightHex / darkHex are explicit CSS colour values for inline-style overrides on prose containers,
 * bypassing Tailwind's prose/prose-invert specificity conflicts.
 */
export const CANONICAL_TEMPLATES: Record<string, {
  bg: string
  textColor: string
  lightHex: string   // hex for light-mode background (inline style)
  darkHex: string    // hex for dark-mode background (inline style)
  cardBorder: string
  isVip?: boolean
}> = {
  // ── Classic Editorial ────────────────────────────────────────────────────
  'a': {
    bg: 'bg-background',
    textColor: 'text-primary',
    lightHex: '#111111',
    darkHex: '#f0f0f0',
    cardBorder: 'border-primary/15'
  },
  'b': {
    bg: 'bg-[#FDFBF7] dark:bg-[#1C1613]',
    textColor: 'text-[#3D2C24] dark:text-[#F5EBE6]',
    lightHex: '#3D2C24',
    darkHex: '#F5EBE6',
    cardBorder: 'border-amber-900/15 dark:border-amber-500/25'
  },
  'c': {
    bg: 'bg-[#F4F4F5] dark:bg-[#0E0E11]',
    textColor: 'text-[#18181B] dark:text-[#F4F4F5]',
    lightHex: '#18181B',
    darkHex: '#F4F4F5',
    cardBorder: 'border-neutral-300 dark:border-neutral-800'
  },
  'd': {
    bg: 'bg-[#EFF6FF] dark:bg-[#070D18]',
    textColor: 'text-[#1e3a5f] dark:text-[#bfdbfe]',
    lightHex: '#1e3a5f',
    darkHex: '#bfdbfe',
    cardBorder: 'border-blue-200 dark:border-blue-900/40'
  },
  'f': {
    bg: 'bg-[#EBF7EE] dark:bg-[#051109]',
    textColor: 'text-[#064E22] dark:text-[#6ee7b7]',
    lightHex: '#064E22',
    darkHex: '#6ee7b7',
    cardBorder: 'border-emerald-300 dark:border-emerald-500/30'
  },
  'g': {
    bg: 'bg-[#F4ECD8] dark:bg-[#1E1914]',
    textColor: 'text-[#3E2723] dark:text-[#EDE3D2]',
    lightHex: '#3E2723',
    darkHex: '#EDE3D2',
    cardBorder: 'border-amber-900/20 dark:border-amber-500/25'
  },
  'h': {
    bg: 'bg-neutral-100 dark:bg-black',
    textColor: 'text-[#171717] dark:text-[#f5f5f5]',
    lightHex: '#171717',
    darkHex: '#f5f5f5',
    cardBorder: 'border-neutral-300 dark:border-neutral-800'
  },
  'i': {
    bg: 'bg-[#FFF1F2] dark:bg-[#200D13]',
    textColor: 'text-[#4c0519] dark:text-[#fecdd3]',
    lightHex: '#4c0519',
    darkHex: '#fecdd3',
    cardBorder: 'border-rose-200 dark:border-rose-900/40'
  },
  'j': {
    bg: 'bg-[#ECE6D8] dark:bg-[#151517]',
    textColor: 'text-[#1a1a1a] dark:text-[#e5e5e5]',
    lightHex: '#1a1a1a',
    darkHex: '#e5e5e5',
    cardBorder: 'border-neutral-400 dark:border-neutral-700'
  },

  // ── VIP Luxury (always-dark gradients → always-bright text) ─────────────
  'vip-birthday': {
    bg: 'bg-gradient-to-br from-[#1C1304] via-[#0E0A02] to-[#2B1D06]',
    textColor: 'text-[#FEF3C7]',
    lightHex: '#FEF3C7',
    darkHex: '#FEF3C7',
    cardBorder: 'border-amber-400/50 shadow-[0_0_40px_rgba(251,191,36,0.25)]',
    isVip: true
  },
  'vip-romance': {
    bg: 'bg-gradient-to-br from-[#290714] via-[#140209] to-[#3B0A1D]',
    textColor: 'text-[#FFE4E6]',
    lightHex: '#FFE4E6',
    darkHex: '#FFE4E6',
    cardBorder: 'border-rose-400/50 shadow-[0_0_40px_rgba(244,63,94,0.25)]',
    isVip: true
  },
  'vip-brand': {
    bg: 'bg-gradient-to-br from-[#031326] via-[#010914] to-[#06203D]',
    textColor: 'text-[#E0F2FE]',
    lightHex: '#E0F2FE',
    darkHex: '#E0F2FE',
    cardBorder: 'border-cyan-400/50 shadow-[0_0_40px_rgba(6,182,212,0.25)]',
    isVip: true
  },
  'vip-wisdom': {
    bg: 'bg-gradient-to-br from-[#081C13] via-[#040D09] to-[#0E2C1E]',
    textColor: 'text-[#ECFDF5]',
    lightHex: '#ECFDF5',
    darkHex: '#ECFDF5',
    cardBorder: 'border-emerald-400/50 shadow-[0_0_40px_rgba(16,185,129,0.25)]',
    isVip: true
  },
  'vip-noir': {
    bg: 'bg-gradient-to-b from-[#0C0B12] via-[#020204] to-[#0A0910]',
    textColor: 'text-[#F3E8FF]',
    lightHex: '#F3E8FF',
    darkHex: '#F3E8FF',
    cardBorder: 'border-purple-400/50 shadow-[0_0_40px_rgba(168,85,247,0.25)]',
    isVip: true
  }
}

/**
 * Ensures any message background class has its dark mode counterpart.
 */
export function resolveThemeSafeBg(rawBg?: string, templateId?: string): string {
  const canonical = templateId ? CANONICAL_TEMPLATES[templateId] : null

  if (!rawBg || !rawBg.trim()) {
    return canonical ? canonical.bg : 'bg-background'
  }

  const bg = rawBg.trim()
  if (bg.includes('dark:bg-')) return bg
  if (isBgAlwaysDark(bg)) return bg
  if (canonical) return canonical.bg

  // Legacy single-theme background mapping
  if (bg.includes('#FDFBF7')) return 'bg-[#FDFBF7] dark:bg-[#1C1613]'
  if (bg.includes('#F4F4F5')) return 'bg-[#F4F4F5] dark:bg-[#0E0E11]'
  if (bg.includes('#EFF6FF')) return 'bg-[#EFF6FF] dark:bg-[#070D18]'
  if (bg.includes('#EBF7EE') || bg.includes('emerald-50')) return 'bg-[#EBF7EE] dark:bg-[#051109]'
  if (bg.includes('#F4ECD8')) return 'bg-[#F4ECD8] dark:bg-[#1E1914]'
  if (bg.includes('neutral-100')) return 'bg-neutral-100 dark:bg-black'
  if (bg.includes('#FFF1F2')) return 'bg-[#FFF1F2] dark:bg-[#200D13]'
  if (bg.includes('#ECE6D8')) return 'bg-[#ECE6D8] dark:bg-[#151517]'
  if (bg === 'bg-background') return 'bg-background'

  return bg
}

/**
 * Ensures text color is high-contrast and legible in BOTH light and dark themes.
 */
export function resolveThemeSafeTextColor(rawTextColor?: string, safeBg?: string, templateId?: string): string {
  const canonical = templateId ? CANONICAL_TEMPLATES[templateId] : null
  if (canonical) return canonical.textColor

  const textColor = (rawTextColor || '').trim()
  const isAlwaysDark = safeBg ? isBgAlwaysDark(safeBg) : false

  if (isAlwaysDark) {
    // VIP / always-dark bg: always want bright text
    const bright = ['#FEF3C7', '#FFE4E6', '#E0F2FE', '#ECFDF5', '#F3E8FF']
    if (bright.some(h => textColor.includes(h)) || textColor.includes('text-white')) return textColor
    return 'text-[#f0f0f0]'
  }

  // Known exact-hex upgrades (with dual dark: variant)
  if (textColor.includes('#3D2C24')) return 'text-[#3D2C24] dark:text-[#F5EBE6]'
  if (textColor.includes('#18181B') || textColor.includes('#1C1C20')) return 'text-[#18181B] dark:text-[#F4F4F5]'
  if (textColor.includes('blue-950') || textColor.includes('blue-100')) return 'text-[#1e3a5f] dark:text-[#bfdbfe]'
  if (textColor.includes('#064E22') || textColor.includes('emerald-400') || textColor.includes('emerald-800')) return 'text-[#064E22] dark:text-[#6ee7b7]'
  if (textColor.includes('#3E2723')) return 'text-[#3E2723] dark:text-[#EDE3D2]'
  if (textColor.includes('neutral-900') || textColor.includes('text-black')) return 'text-[#1a1a1a] dark:text-[#e5e5e5]'
  if (textColor.includes('rose-950') || textColor.includes('rose-700') || textColor.includes('rose-600')) return 'text-[#4c0519] dark:text-[#fecdd3]'
  if (textColor.includes('rose-200')) return 'text-[#4c0519] dark:text-[#fecdd3]'
  if (textColor.includes('#171717')) return 'text-[#171717] dark:text-[#f5f5f5]'
  if (textColor.includes('#4c0519')) return 'text-[#4c0519] dark:text-[#fecdd3]'
  if (textColor.includes('#1a1a1a')) return 'text-[#1a1a1a] dark:text-[#e5e5e5]'
  if (!textColor || textColor === 'text-primary') return 'text-primary'

  // Has dual dark: already? Trust it.
  if (textColor.includes('dark:text-')) return textColor

  // Unknown textColor on a dual-theme bg → safe fallback
  if (safeBg?.includes('dark:bg-')) return 'text-[#1a1a1a] dark:text-[#e5e5e5]'

  return textColor
}

/**
 * Unified helper returning fully resolved, mutually contrast-guaranteed card styles.
 * Also returns `inlineColor` — a CSS value string for use as inline style on prose/rich-text
 * containers. This bypasses Tailwind prose-invert specificity conflicts and guarantees
 * the correct colour is applied regardless of theme utilities.
 *
 * Usage in components:
 *   <div
 *     className={`... ${textColor}`}
 *     style={{ color: inlineColor }}
 *   >
 */
export function resolveCardStyles(styleConfig?: any, templateId?: string): {
  bg: string
  textColor: string
  cardBorder?: string
  isVip: boolean
  isDarkCard: boolean
  inlineColor: string
  buttonStyle: string
  timerStyle: string
  sponsorStyle: string
  sponsorLabelStyle: string
  sponsorNameStyle: string
  sponsorNoteStyle: string
  dividerStyle: string
} {
  const cfg = typeof styleConfig === 'string'
    ? (() => { try { return JSON.parse(styleConfig) } catch { return {} } })()
    : (styleConfig || {})
  
  let tid = templateId || cfg.templateId || cfg.template_id

  // Auto-detect canonical template by background or text pattern if tid is not explicit
  if (!tid && cfg.bg) {
    const rawBg = String(cfg.bg)
    if (rawBg.includes('#FDFBF7') || rawBg.includes('#1C1613')) tid = 'b'
    else if (rawBg.includes('#F4F4F5') || rawBg.includes('#0E0E11')) tid = 'c'
    else if (rawBg.includes('#EFF6FF') || rawBg.includes('#070D18')) tid = 'd'
    else if (rawBg.includes('#EBF7EE') || rawBg.includes('#051109')) tid = 'f'
    else if (rawBg.includes('#F4ECD8') || rawBg.includes('#1E1914')) tid = 'g'
    else if (rawBg.includes('neutral-100') || (rawBg.includes('black') && !rawBg.includes('black/'))) tid = 'h'
    else if (rawBg.includes('#FFF1F2') || rawBg.includes('#200D13')) tid = 'i'
    else if (rawBg.includes('#ECE6D8') || rawBg.includes('#151517')) tid = 'j'
    else if (rawBg.includes('#1C1304')) tid = 'vip-birthday'
    else if (rawBg.includes('#290714')) tid = 'vip-romance'
    else if (rawBg.includes('#031326')) tid = 'vip-brand'
    else if (rawBg.includes('#081C13')) tid = 'vip-wisdom'
    else if (rawBg.includes('#0C0B12')) tid = 'vip-noir'
    else if (rawBg === 'bg-background') tid = 'a'
  }

  const isVip = !!(cfg.isVip || (tid && tid.startsWith('vip-')))
  const safeBg = resolveThemeSafeBg(cfg.bg, tid)
  const safeTextColor = resolveThemeSafeTextColor(cfg.textColor, safeBg, tid)
  const isDarkCard = isVip || isBgAlwaysDark(safeBg)

  let cardBorder = cfg.cardBorder
  if (!cardBorder && tid && CANONICAL_TEMPLATES[tid]) {
    cardBorder = CANONICAL_TEMPLATES[tid].cardBorder
  }

  // inlineColor: used in style={{ color: inlineColor }} on prose containers.
  let inlineColor = 'inherit'
  if (isVip && tid && CANONICAL_TEMPLATES[tid]) {
    inlineColor = CANONICAL_TEMPLATES[tid].lightHex
  } else if (isDarkCard) {
    inlineColor = '#f0f0f0'
  }

  // Cohesive element styles matching card luminance across light & dark themes
  const buttonStyle = isDarkCard
    ? 'border-white/20 hover:border-white/35 bg-white/10 hover:bg-white/20 text-white/90 active:scale-95 shadow-sm'
    : 'border-black/10 dark:border-white/15 hover:border-black/20 dark:hover:border-white/30 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-neutral-800 dark:text-neutral-200 active:scale-95 shadow-sm'

  const timerStyle = isDarkCard
    ? 'bg-black/50 border-white/20 text-white/90'
    : 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/15 text-neutral-800 dark:text-neutral-200'

  const sponsorStyle = isDarkCard
    ? 'bg-black/50 border-white/15 text-white/90'
    : 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/15'

  const sponsorLabelStyle = isDarkCard
    ? 'text-white/60'
    : 'text-neutral-500 dark:text-neutral-400'

  const sponsorNameStyle = isDarkCard
    ? 'text-white'
    : 'text-neutral-900 dark:text-neutral-100'

  const sponsorNoteStyle = isDarkCard
    ? 'text-white/70'
    : 'text-neutral-600 dark:text-neutral-300'

  const dividerStyle = isDarkCard
    ? 'border-white/15'
    : 'border-black/10 dark:border-white/10'

  return {
    bg: safeBg,
    textColor: safeTextColor,
    cardBorder,
    isVip,
    isDarkCard,
    inlineColor,
    buttonStyle,
    timerStyle,
    sponsorStyle,
    sponsorLabelStyle,
    sponsorNameStyle,
    sponsorNoteStyle,
    dividerStyle
  }
}

