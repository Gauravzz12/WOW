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
    id: 'neon-glow',
    name: 'Cyber Aura',
    description: 'Vibrant neon glow ring',
    emoji: '⚡',
    cssClass: 'frame-neon-glow',
  },
  {
    id: 'golden-filigree',
    name: 'Imperial Gold',
    description: 'Rich golden filigree frame',
    emoji: '🏛️',
    cssClass: 'frame-golden-filigree',
  },
  {
    id: 'holographic',
    name: 'Prismatic Aurora',
    description: 'Rainbow prismatic shimmer',
    emoji: '🌈',
    cssClass: 'frame-holographic',
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
]

export function getFrameClass(frameId?: string): string {
  if (!frameId || frameId === 'none') return ''
  const frame = FRAMES.find(f => f.id === frameId)
  return frame?.cssClass ?? ''
}
