import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Trophy } from 'lucide-react'
import { getCategoryStyles } from '@/lib/utils/colors'

export const revalidate = 0

export default async function LeaderboardPage() {
  const supabase = createClient()
  
  // Fetch leaderboard data
  const { data: leaderboardQueue } = await supabase.rpc('get_leaderboard')

  // Filter messages that have reactions, or if none yet, show recent top messages
  const ratedMessages = (leaderboardQueue || []).filter((m: any) => Number(m.reaction_count || 0) > 0)
  const displayMessages = ratedMessages.length > 0 ? ratedMessages : (leaderboardQueue || [])

  return (
    <div className="min-h-[100dvh] bg-background dark:bg-grid-white/[0.03] bg-grid-black/[0.03] relative flex flex-col pt-20 px-6 pb-24 overflow-x-hidden selection:bg-amber-500/20">
      
      {/* Radial fade mask */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      
      <div className="max-w-3xl mx-auto w-full relative z-10">
        
        <Link href="/" className="inline-flex items-center gap-2 text-secondary hover:text-primary mb-8 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-background-elevated border border-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowLeft size={16} />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase">Back to Feed</span>
        </Link>

        <div className="space-y-12">
          <section className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Trophy className="text-amber-500 w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-serif text-primary tracking-tight">
                  Top Messages
                </h1>
                <p className="text-sm md:text-base text-secondary mt-1">
                  The most loved, celebrated, and deeply felt messages across the world.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            {displayMessages && displayMessages.length > 0 ? (
              displayMessages.map((msg: any, i: number) => {
                const catName = msg.category_name || 'Message'
                const catSlug = msg.category_slug || 'general'
                const { badgeClass } = getCategoryStyles(catSlug)
                const reactionCount = Number(msg.reaction_count || 0)

                return (
                  <div 
                    key={msg.id} 
                    className="p-6 rounded-2xl bg-background-elevated/50 border border-primary/10 hover:border-amber-500/40 backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center gap-6 group transition-all shadow-sm"
                  >
                    {/* Rank */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full font-bold flex items-center justify-center text-lg shadow-inner border ${
                      i === 0 ? 'bg-amber-500/20 text-amber-500 border-amber-500/40' :
                      i === 1 ? 'bg-slate-300/20 text-slate-300 border-slate-300/40' :
                      i === 2 ? 'bg-amber-700/20 text-amber-600 border-amber-700/40' :
                      'bg-background-elevated text-secondary border-primary/10'
                    }`}>
                      #{i + 1}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                          {catName}
                        </span>
                        <span suppressHydrationWarning className="text-xs text-secondary font-mono">
                          {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                        </span>
                      </div>
                      <p className="text-lg font-serif text-primary opacity-90 line-clamp-3 leading-snug">
                        "{msg.content}"
                      </p>
                    </div>

                    {/* Reactions */}
                    <div className="flex-shrink-0 flex items-center gap-2 bg-background px-4 py-2 rounded-full border border-primary/10 group-hover:border-amber-500/30 transition-colors shadow-inner">
                      <span className="text-lg">❤️</span>
                      <span className="text-lg font-bold text-primary font-mono">{reactionCount}</span>
                    </div>

                  </div>
                )
              })
            ) : (
              <div className="text-center py-24 border border-dashed border-background-elevated rounded-2xl">
                <p className="text-secondary text-lg font-serif">No messages have been rated yet.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
