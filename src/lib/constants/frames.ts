export interface FrameDef {
  id: string
  name: string
  description: string
  emoji: string
  cssClass: string
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
  },
  {
    id: 'postage-stamp',
    name: 'Vintage Postage',
    description: 'Classic stamp-style perforated border',
    emoji: '📮',
    cssClass: 'frame-postage-stamp',
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
  },
  {
    id: 'celebration-confetti',
    name: 'Party Confetti',
    description: 'Festive confetti dots & shapes',
    emoji: '🎉',
    cssClass: 'frame-celebration-confetti',
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
    cssClass: 'frame-dashed-sketch',
  },
]

export function getFrameClass(frameId?: string): string {
  if (!frameId || frameId === 'none') return ''
  const frame = FRAMES.find(f => f.id === frameId)
  return frame?.cssClass ?? ''
}
