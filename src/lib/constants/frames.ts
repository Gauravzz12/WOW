export interface FrameDef {
  id: string
  name: string
  description: string
  emoji: string
  cssClass: string
  occasionTag?: string
  /** Retired from the picker, but the def stays so existing messages keep rendering. */
  pickerHidden?: boolean
  /** Whether this frame was historically special-only (now unlocked for everyone). */
  specialOnly?: boolean
}

export const FRAMES: FrameDef[] = [
  {
    id: 'none',
    name: 'Clean Edge',
    description: 'No decorative overlay',
    emoji: '◻',
    cssClass: '',
    occasionTag: 'Classic',
  },
  // ── Occasion: Love Confession & Romance ──
  {
    id: 'love-hearts',
    name: 'Love Confession',
    description: 'Floating romantic hearts, rosebuds & stardust',
    emoji: '💖',
    cssClass: 'frame-love-hearts',
    occasionTag: 'Romance',
  },
  {
    id: 'botanical-roses',
    name: 'Blooming Roses',
    description: 'Floral vines, rose blossoms & organic leaves',
    emoji: '🌹',
    cssClass: '',
    occasionTag: 'Romance',
  },
  // ── Occasion: Celebration & Milestone ──
  {
    id: 'celebration-champagne',
    name: 'Champagne Gala',
    description: 'Clinking champagne flutes, bubbles & golden garland',
    emoji: '🥂',
    cssClass: '',
    occasionTag: 'Celebration',
  },
  {
    id: 'celebration-confetti',
    name: 'Grand Fiesta',
    description: 'Party poppers, streamers & festive confetti',
    emoji: '🎉',
    cssClass: 'frame-celebration-confetti',
    occasionTag: 'Celebration',
  },
  // ── Occasion: Triumph, Honor & Milestone ──
  {
    id: 'imperial-laurel',
    name: 'Imperial Laurel',
    description: 'Gilded victory wreaths, double gold & royal crest',
    emoji: '👑',
    cssClass: 'frame-imperial-laurel',
    occasionTag: 'Triumph',
  },
  // ── Occasion: Late Night, Secrets & Confessions ──
  {
    id: 'celestial-night',
    name: 'Starlight Galaxy',
    description: 'Crescent moon, constellation trails & stars',
    emoji: '✨',
    cssClass: '',
    occasionTag: 'Night',
  },
  // ── Occasion: Tech Launch & Modern Announcements ──
  {
    id: 'cyber-matrix',
    name: 'Cyber Pulse',
    description: 'Neon HUD brackets & circuit pulse lines',
    emoji: '⚡',
    cssClass: '',
    occasionTag: 'Tech',
  },
  // ── Occasion: Vintage, Heritage & Philosophy ──
  {
    id: 'baroque-filigree',
    name: 'Baroque Filigree',
    description: 'Antique Victorian scrollwork & lace flourishes',
    emoji: '📜',
    cssClass: '',
    occasionTag: 'Heritage',
  },
  // ── Occasion: Cinema & Nostalgia ──
  {
    id: 'film-strip',
    name: 'Cinema Reel',
    description: 'Classic cinema sprocket holes & frame ticks',
    emoji: '🎬',
    cssClass: 'frame-film-strip',
    occasionTag: 'Cinema',
  },
  // ── Occasion: Letters & Travel ──
  {
    id: 'postage-stamp',
    name: 'Vintage Postage',
    description: 'Classic perforated stamp edges',
    emoji: '📮',
    cssClass: '',
    occasionTag: 'Postcard',
  },

  // ── Retired simpler borders (preserved for backward compatibility with past messages) ──
  {
    id: 'royal-double',
    name: 'Royal Double',
    description: 'Double border',
    emoji: '👑',
    cssClass: 'frame-royal-double',
    pickerHidden: true,
  },
  {
    id: 'ornate-corners',
    name: 'Gilded Corners',
    description: 'Golden ornate corner accents',
    emoji: '✦',
    cssClass: 'frame-ornate-corners',
    pickerHidden: true,
  },
  {
    id: 'golden-filigree',
    name: 'Imperial Gold',
    description: 'Rich golden filigree frame',
    emoji: '🏛️',
    cssClass: 'frame-golden-filigree',
    pickerHidden: true,
  },
  {
    id: 'nature-vines',
    name: 'Ivy Vines',
    description: 'Organic leaf accents',
    emoji: '🌿',
    cssClass: 'frame-nature-vines',
    pickerHidden: true,
  },
  {
    id: 'stars-night',
    name: 'Starry Night',
    description: 'Stars along the border',
    emoji: '✨',
    cssClass: 'frame-stars-night',
    pickerHidden: true,
  },
  {
    id: 'stepped-inset',
    name: 'Stepped Inset',
    description: 'Architectural layered inset',
    emoji: '🏗️',
    cssClass: 'frame-stepped-inset',
    pickerHidden: true,
  },
  {
    id: 'dashed-sketch',
    name: 'Sketch',
    description: 'Hand-drawn dashed border look',
    emoji: '✏️',
    cssClass: '',
    pickerHidden: true,
  },
  {
    id: 'corner-ticks',
    name: 'Corner Ticks',
    description: 'Minimal corner marks only',
    emoji: '⌜',
    cssClass: '',
    pickerHidden: true,
  },
  {
    id: 'ticket-stub',
    name: 'Ticket Stub',
    description: 'Perforated edge with a tear line',
    emoji: '✂',
    cssClass: '',
    pickerHidden: true,
  },
  {
    id: 'ledger',
    name: 'Ledger',
    description: 'Dotted rule with double top line',
    emoji: '☰',
    cssClass: 'frame-ledger',
    pickerHidden: true,
  },
  {
    id: 'double-rule',
    name: 'Double Rule',
    description: 'Front-page double rule frame',
    emoji: '▦',
    cssClass: 'frame-double-rule',
    pickerHidden: true,
  },
  {
    id: 'top-band',
    name: 'Top Band',
    description: 'Solid band in category colour',
    emoji: '▬',
    cssClass: '',
    pickerHidden: true,
  },
  {
    id: 'laurel',
    name: 'Laurel',
    description: 'Brass laurel sprigs',
    emoji: '❦',
    cssClass: '',
    pickerHidden: true,
  },
]

export function getFrameClass(frameId?: string): string {
  if (!frameId || frameId === 'none') return ''
  const frame = FRAMES.find(f => f.id === frameId)
  return frame?.cssClass ?? ''
}
