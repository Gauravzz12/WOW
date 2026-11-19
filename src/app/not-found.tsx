import Link from 'next/link'

/**
 * Custom 404. Bad /w, /checkout and /sponsor links used to render the bare
 * default Next.js 404 with no site chrome and no way back — a dead end for
 * anyone following a stale or mistyped link.
 */
export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-5">
        <p className="text-6xl select-none">🌍</p>
        <h1 className="text-4xl font-serif font-bold text-primary">404 — Lost in the world</h1>
        <p className="text-sm text-secondary leading-relaxed">
          This page could not be found. The message may have finished its broadcast,
          the link may be mistyped, or the page may never have existed.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full bg-primary text-background text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all"
          >
            Back to the World
          </Link>
          <Link
            href="/create"
            className="px-5 py-2.5 rounded-full border border-primary/25 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/5 active:scale-95 transition-all"
          >
            Say Something
          </Link>
        </div>
      </div>
    </main>
  )
}
