import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  // 1. Get Category Details
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!category) {
    notFound()
  }

  // 2. Get Live Message
  const { data: liveMessage } = await supabase
    .from('messages')
    .select('id, content, actual_start, user_id')
    .eq('category_id', category.id)
    .eq('status', 'ACTIVE')
    .order('actual_start', { ascending: false })
    .limit(1)
    .single()

  // 3. Get Queue (Upcoming messages)
  const { data: queue } = await supabase
    .from('messages')
    .select('id, content, created_at')
    .eq('category_id', category.id)
    .eq('status', 'QUEUED')
    .order('created_at', { ascending: true })
    .limit(10)

  return (
    <div className="min-h-screen bg-background text-primary flex flex-col">
      <header className="p-6">
        <Link href="/" className="inline-flex items-center text-secondary hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to World
        </Link>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif">{category.name}</h1>
          <p className="text-secondary text-lg">{category.description}</p>
        </div>

        {/* Live Message Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-serif border-b border-primary/10 pb-4">Live Now</h2>
          {liveMessage ? (
            <Link href={`/w/${liveMessage.id}`} className="block relative bg-background-elevated border border-primary/20 rounded-xl p-8 hover:border-primary/50 transition-colors group">
              <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 text-xs font-bold uppercase tracking-widest rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Active
              </div>
              <h3 className="text-3xl font-serif italic mb-4">"{liveMessage.content}"</h3>
              <p className="text-sm text-secondary">Started {new Date(liveMessage.actual_start).toLocaleTimeString()}</p>
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            </Link>
          ) : (
            <div className="bg-background-elevated border border-primary/10 rounded-xl p-8 text-center text-secondary">
              <p>No active message in {category.name} right now.</p>
              <Link href="/compose" className="inline-block mt-4 text-primary underline hover:text-primary/80">Be the first to speak.</Link>
            </div>
          )}
        </section>

        {/* Queue Visibility */}
        <section className="space-y-6">
          <h2 className="text-2xl font-serif border-b border-primary/10 pb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Up Next in Queue
          </h2>
          
          {queue && queue.length > 0 ? (
            <div className="space-y-4">
              {queue.map((msg, idx) => (
                <div key={msg.id} className="flex items-center gap-4 bg-background-elevated/50 border border-primary/5 rounded-lg p-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-full font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-primary truncate">
                      {/* The user specifically wanted to not show upcoming message content, so we redact it. */}
                      {msg.content.replace(/./g, '•')}
                    </p>
                    <p suppressHydrationWarning className="text-xs text-secondary">Waiting since {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-secondary py-8">
              <p>The queue is completely empty.</p>
              <Link href="/compose" className="inline-block mt-2 text-primary underline hover:text-primary/80">Claim the next spot instantly.</Link>
            </div>
          )}
        </section>

      </main>
    </div>
  )
}
