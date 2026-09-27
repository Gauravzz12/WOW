import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: messages } = await supabase
    .from('messages')
    .select(`
      id, content, status, created_at, scheduled_start, actual_start,
      category:categories(name)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background text-primary">
      <header className="border-b border-primary/10 p-4 bg-background-elevated sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="inline-flex items-center text-secondary hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            <h1 className="text-xl font-serif font-bold tracking-widest uppercase">My Messages</h1>
          </div>
          <div className="text-sm text-secondary font-medium">{user.email}</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-serif">Message History</h2>
          <Link href="/create">
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-background rounded-full font-medium text-sm hover:opacity-90 transition-opacity">
              <Plus size={16} /> New Message
            </button>
          </Link>
        </div>

        {messages && messages.length > 0 ? (
          <div className="grid gap-4">
            {messages.map(msg => (
              <div key={msg.id} className="bg-background-elevated border border-primary/10 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase tracking-widest ${
                      msg.status === 'ACTIVE' ? 'bg-primary text-background' :
                      msg.status === 'QUEUED' ? 'bg-blue-500/10 text-blue-600' :
                      msg.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600' :
                      'bg-background-muted text-secondary'
                    }`}>
                      {msg.status}
                    </span>
                    <span className="text-xs text-secondary font-medium uppercase tracking-widest">
                      {(msg.category as any)?.name}
                    </span>
                    <span suppressHydrationWarning className="text-xs text-secondary">
                      {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                    </span>
                  </div>
                  <p className="text-lg font-serif italic">"{msg.content}"</p>
                </div>
                
                <div className="flex items-center md:justify-end gap-4 border-t border-primary/10 md:border-0 pt-4 md:pt-0">
                  {msg.status === 'ACTIVE' && (
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Live Now
                    </div>
                  )}
                  {msg.status === 'QUEUED' && (
                    <div className="text-sm text-secondary font-medium">
                      Waiting...
                    </div>
                  )}
                  {msg.status === 'COMPLETED' && (
                    <div className="text-sm text-secondary">
                      Finished
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-background-elevated border border-primary/10 rounded-2xl">
            <p className="text-secondary mb-4">You haven't broadcasted any messages yet.</p>
            <Link href="/create">
              <button className="px-6 py-3 bg-primary text-background rounded-full font-medium hover:opacity-90 transition-opacity">
                Speak to the World
              </button>
            </Link>
          </div>
        )}
        
      </main>
    </div>
  )
}
