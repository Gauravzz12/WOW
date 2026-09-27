import { createClient } from '@supabase/supabase-js'
import { updateCategoryDuration } from '@/app/admin/actions'
import { MessageModerationTable } from './MessageModerationTable'
import { getMessageTypeInfo, AdminMessage } from './adminUtils'
import { Zap, Sparkles, Radio } from 'lucide-react'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminDashboard() {
  // Fetch data with superuser privileges
  const { data: categories } = await supabaseAdmin.from('categories').select('*').order('name')
  const { data: rawMessages } = await supabaseAdmin
    .from('messages')
    .select(`
      id,
      content,
      status,
      created_at,
      actual_start,
      scheduled_start,
      scheduled_end,
      bid_amount,
      is_reserved_slot,
      signature,
      recipient,
      style_config,
      category:categories (name, slug, base_price)
    `)
    .order('created_at', { ascending: false })

  const messages = (rawMessages as unknown as AdminMessage[]) || []

  // Calculate analytics
  const queuedCount = messages.filter(m => m.status === 'QUEUED').length
  const servedCount = messages.filter(m => m.status === 'COMPLETED').length
  // Revenue from actual bid amounts on paid messages
  const mockRevenue = messages
    .filter(m => m.status === 'ACTIVE' || m.status === 'QUEUED' || m.status === 'COMPLETED')
    .reduce((sum, msg) => sum + (msg.bid_amount || 0), 0)

  const activeMessage = messages.find(m => m.status === 'ACTIVE')
  const queuedMessages = messages.filter(m => m.status === 'QUEUED')

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Top Title Banner */}
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">Admin Overview</h1>
        <p className="text-secondary text-sm mt-1">Real-time platform metrics, moderation, and category configuration.</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background-elevated border border-primary/10 rounded-2xl p-6 shadow-sm">
          <div className="text-xs text-secondary font-semibold uppercase tracking-wider mb-2">Total Queued</div>
          <div className="text-4xl font-serif font-bold">{queuedCount}</div>
        </div>
        <div className="bg-background-elevated border border-primary/10 rounded-2xl p-6 shadow-sm">
          <div className="text-xs text-secondary font-semibold uppercase tracking-wider mb-2">Total Served</div>
          <div className="text-4xl font-serif font-bold">{servedCount}</div>
        </div>
        <div className="bg-background-elevated border border-primary/10 rounded-2xl p-6 shadow-sm">
          <div className="text-xs text-secondary font-semibold uppercase tracking-wider mb-2">Gross Revenue</div>
          <div className="text-4xl font-serif font-bold text-green-600">${mockRevenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Live Spotlight Status */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-semibold flex items-center gap-2.5">
          Live Display Status
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
        </h2>
        
        {activeMessage ? (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-primary font-bold uppercase tracking-widest flex items-center gap-2">
                <span>Now Showing Live</span>
                <span className="text-secondary font-normal">&bull;</span>
                <span className="text-secondary font-normal">{activeMessage.category?.name || 'General'}</span>
              </div>
              
              {/* Message Type Badge */}
              {(() => {
                const typeInfo = getMessageTypeInfo(activeMessage)
                const IconComp = typeInfo.icon
                return (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${typeInfo.badgeClass}`}>
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{typeInfo.label}</span>
                  </span>
                )
              })()}
            </div>

            <div className="text-2xl font-serif italic leading-relaxed">"{activeMessage.content}"</div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-secondary font-mono pt-1">
              <span>Started: {activeMessage.actual_start ? new Date(activeMessage.actual_start).toLocaleTimeString() : 'Just now'}</span>
              <span>Bid: <strong className="text-primary font-bold">${(activeMessage.bid_amount || 0).toFixed(2)}</strong></span>
              {activeMessage.signature && (
                <span>From: <strong className="text-primary">{activeMessage.signature}</strong></span>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-background-elevated border border-primary/10 rounded-2xl p-8 text-center text-secondary text-sm">
            No message currently active in the spotlight.
          </div>
        )}

        {queuedMessages.length > 0 && (
          <div className="mt-6">
            <div className="text-xs text-secondary mb-3 font-semibold uppercase tracking-wider">
              Up Next in Queue ({queuedMessages.length})
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {queuedMessages.map((msg, i) => {
                const typeInfo = getMessageTypeInfo(msg)
                const IconComp = typeInfo.icon
                return (
                  <div key={msg.id} className="min-w-[280px] max-w-[340px] bg-background-elevated border border-primary/10 rounded-xl p-4 shadow-sm space-y-2">
                    <div className="text-[11px] text-secondary font-mono flex items-center justify-between gap-2">
                      <span className="font-bold">#{i + 1}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${typeInfo.badgeClass}`}>
                          <IconComp className="w-2.5 h-2.5" />
                          <span>{typeInfo.label}</span>
                        </span>
                        <span className="uppercase text-[10px] tracking-wide font-semibold text-primary/70">{msg.category?.name}</span>
                      </div>
                    </div>
                    <div className="text-sm line-clamp-2 italic font-serif">"{msg.content}"</div>
                    <div className="text-[11px] font-mono text-secondary flex justify-between items-center pt-1 border-t border-primary/5">
                      <span>Bid: <strong className="text-primary">${(msg.bid_amount || 0).toFixed(2)}</strong></span>
                      {typeInfo.sponsorName && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 truncate max-w-[120px]">
                          by {typeInfo.sponsorName}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Category Management */}
      <div>
        <h2 className="text-xl font-serif font-semibold mb-4">Category Configuration</h2>
        <div className="bg-background-elevated border border-primary/10 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-background-muted/50 border-b border-primary/10 text-secondary text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Base Price</th>
                <th className="p-4 font-semibold">Durations (Base / Max sec)</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {categories?.map((cat) => (
                <tr key={cat.id} className="hover:bg-background-muted/40 transition-colors">
                  <td className="p-4 font-medium">{cat.name}</td>
                  <td className="p-4 font-mono">${cat.base_price}</td>
                  <td className="p-4">
                    <form action={async (formData) => {
                      'use server';
                      await updateCategoryDuration(cat.id, formData);
                    }} className="flex items-center gap-2">
                      <input 
                        type="number" 
                        name="base_duration" 
                        defaultValue={cat.base_duration} 
                        className="w-20 bg-background text-primary border border-primary/20 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-primary" 
                      />
                      <span className="text-secondary text-xs">/</span>
                      <input 
                        type="number" 
                        name="max_duration" 
                        defaultValue={cat.max_duration} 
                        className="w-20 bg-background text-primary border border-primary/20 rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-primary" 
                      />
                      <button 
                        type="submit" 
                        className="text-xs bg-primary/10 text-primary hover:bg-primary/20 font-medium px-3 py-1 rounded-lg ml-2 transition-colors"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-green-500/10 text-green-600 border border-green-500/20">
                      {cat.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!categories?.length && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-secondary text-sm">No categories found in database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation / All Messages */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-xl font-serif font-semibold">Message Moderation & Search</h2>
            <p className="text-xs text-secondary">Browse, search, filter by message type (Normal, Special, Sponsored), and moderate broadcast messages.</p>
          </div>
          <div className="text-xs font-mono text-secondary bg-background-elevated px-3 py-1.5 rounded-full border border-primary/10 self-start sm:self-auto">
            Total Messages: <strong className="text-primary font-bold">{messages.length}</strong>
          </div>
        </div>

        <MessageModerationTable initialMessages={messages} />
      </div>
    </div>
  )
}

