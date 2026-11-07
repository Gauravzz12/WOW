import type { Metadata } from 'next'

// The About page is a client component and cannot export metadata itself,
// so its title/description live here.
export const metadata: Metadata = {
  title: 'About',
  description: 'Words of the World is an ephemeral global canvas for confessions, celebrations, apologies, and poetry. Where your thoughts live.',
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
