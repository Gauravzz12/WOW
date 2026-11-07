import type { Metadata } from 'next'

// The Create page is a client component and cannot export metadata itself,
// so its title/description live here.
export const metadata: Metadata = {
  title: 'Post a Message',
  description: 'Write your words, choose your style, and broadcast one message to the world.',
}

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children
}
