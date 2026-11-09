export interface FrameDef {
  id: string
  name: string
  description: string
  emoji: string
  cssClass: string
  occasionTag: string
  pickerHidden?: boolean
}

/**
 * Curated border frames:
 * - Solid & Architectural borders (clean solid, royal double, bold inset, editorial rule)
 * - Occasion vector artwork & animation (Openclipart, Plotcaster, Magic UI)
 */
export const FRAMES: FrameDef[] = [
  {
    id: 'none',
    name: 'Clean Edge',
    description: 'No decorative overlay',
    emoji: '◻',
    cssClass: '',
    occasionTag: 'Minimal',
  },
  {
    id: 'solid-clean',
    name: 'Solid Clean',
    description: 'Crisp modern single border hairline',
    emoji: '🔳',
    cssClass: '',
    occasionTag: 'Solid',
  },
  {
    id: 'royal-double',
    name: 'Royal Double',
    description: 'Classic double-line prestige border',
    emoji: '🏛',
    cssClass: '',
    occasionTag: 'Solid',
  },
  {
    id: 'bold-inset',
    name: 'Architectural Inset',
    description: 'Crisp framed inset with corner notches',
    emoji: '📐',
    cssClass: '',
    occasionTag: 'Solid',
  },
  {
    id: 'editorial-frame',
    name: 'Editorial Rule',
    description: 'Refined top and bottom accent header rules',
    emoji: '📰',
    cssClass: '',
    occasionTag: 'Solid',
  },
  {
    id: 'love-hearts',
    name: 'Love Confession',
    description: 'Victorian heart filigree & radiant rose beam',
    emoji: '💖',
    cssClass: '',
    occasionTag: 'Romance',
  },
  {
    id: 'celebration-champagne',
    name: 'Champagne Gala',
    description: 'Clinking champagne flutes, gold fizz & 24K beam',
    emoji: '🥂',
    cssClass: '',
    occasionTag: 'Celebration',
  },
  {
    id: 'celebration-confetti',
    name: 'Grand Fiesta',
    description: 'Party poppers, streamers & spectrum beam',
    emoji: '🎉',
    cssClass: '',
    occasionTag: 'Celebration',
  },
  {
    id: 'botanical-roses',
    name: 'Blooming Roses',
    description: 'William Morris tea roses, vines & dewdrop beam',
    emoji: '🌹',
    cssClass: '',
    occasionTag: 'Romance',
  },
  {
    id: 'imperial-laurel',
    name: 'Imperial Laurel',
    description: 'Roman victory wreaths & bullion gold sheen beam',
    emoji: '👑',
    cssClass: '',
    occasionTag: 'Triumph',
  },
  {
    id: 'celestial-night',
    name: 'Starlight Galaxy',
    description: 'Astrolabe crescent moon & cosmic meteor beam',
    emoji: '✨',
    cssClass: '',
    occasionTag: 'Night',
  },
  {
    id: 'cyber-matrix',
    name: 'Cyber Pulse',
    description: 'Sci-Fi HUD brackets & neon cyan laser beam',
    emoji: '⚡',
    cssClass: '',
    occasionTag: 'Tech',
  },
  {
    id: 'baroque-filigree',
    name: 'Baroque Filigree',
    description: 'Victorian Rococo scrollwork & candlelit beam',
    emoji: '📜',
    cssClass: '',
    occasionTag: 'Heritage',
  },
]

export function getFrameClass(frameId?: string): string {
  if (!frameId || frameId === 'none') return ''
  const frame = FRAMES.find(f => f.id === frameId)
  return frame?.cssClass ?? ''
}
