export interface FrameDef {
  id: string
  name: string
  description: string
  emoji: string
  cssClass: string
  /** Retired from the picker, but the def stays so existing messages keep rendering. */
  pickerHidden?: boolean
  /** Only offered in the picker for the Special tier (rendering is never gated). */
  specialOnly?: boolean
}

export const FRAMES: FrameDef[] = [
  {
    id: 'none',
    name: 'Clean Edge',
    description: 'No decorative border',
    emoji: '◻',
    cssClass: '',
  },
  {
    id: 'royal-double',
    name: 'Royal Double',
    description: 'Elegant double border',
    emoji: '👑',
    cssClass: 'frame-royal-double',
  },
  {
    id: 'ornate-corners',
    name: 'Gilded Corners',
    description: 'Golden ornate corner accents',
    emoji: '✦',
    cssClass: 'frame-ornate-corners',
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
    id: 'postage-stamp',
    name: 'Vintage Postage',
    description: 'Classic stamp-style perforated border',
    emoji: '📮',
    // SVG-only (FrameDecorator) — no CSS class.
    cssClass: '',
  },
  {
    id: 'stepped-inset',
    name: 'Stepped Inset',
    description: 'Architectural layered inset',
    emoji: '🏗️',
    cssClass: 'frame-stepped-inset',
  },
  // ── Theme-focused decorative frames ──
  {
    id: 'love-hearts',
    name: 'Love Letters',
    description: 'Scattered hearts around the edges',
    emoji: '💕',
    cssClass: 'frame-love-hearts',
    pickerHidden: true,
  },
  {
    id: 'celebration-confetti',
    name: 'Party Confetti',
    description: 'Festive confetti dots & shapes',
    emoji: '🎉',
    cssClass: 'frame-celebration-confetti',
    pickerHidden: true,
  },
  {
    id: 'nature-vines',
    name: 'Ivy Vines',
    description: 'Organic leaf and vine accents',
    emoji: '🌿',
    cssClass: 'frame-nature-vines',
  },
  {
    id: 'stars-night',
    name: 'Starry Night',
    description: 'Twinkling stars along the border',
    emoji: '✨',
    cssClass: 'frame-stars-night',
  },
  {
    id: 'film-strip',
    name: 'Film Strip',
    description: 'Classic cinema sprocket holes',
    emoji: '🎬',
    cssClass: 'frame-film-strip',
  },
  {
    id: 'dashed-sketch',
    name: 'Sketch',
    description: 'Hand-drawn dashed border look',
    emoji: '✏️',
    // SVG-only (FrameDecorator) — no CSS class.
    cssClass: '',
  },
  // ── Editorial frames ──
  {
    id: 'double-rule',
    name: 'Double Rule',
    description: 'Front-page double rule frame',
    emoji: '▦',
    cssClass: 'frame-double-rule',
  },
  {
    id: 'corner-ticks',
    name: 'Corner Ticks',
    description: 'Minimal corner marks only',
    emoji: '⌜',
    cssClass: '',
  },
  {
    id: 'ticket-stub',
    name: 'Ticket Stub',
    description: 'Perforated edge with a tear line',
    emoji: '✂',
    cssClass: '',
  },
  {
    id: 'ledger',
    name: 'Ledger',
    description: 'Dotted rule with a double top line',
    emoji: '☰',
    cssClass: 'frame-ledger',
  },
  {
    id: 'top-band',
    name: 'Top Band',
    description: 'Solid band in your category colour',
    emoji: '▬',
    cssClass: '',
  },
  {
    id: 'laurel',
    name: 'Laurel',
    description: 'Brass laurel sprigs — Special only',
    emoji: '❦',
    cssClass: '',
    specialOnly: true,
  },
]

export function getFrameClass(frameId?: string): string {
  if (!frameId || frameId === 'none') return ''
  const frame = FRAMES.find(f => f.id === frameId)
  return frame?.cssClass ?? ''
}
