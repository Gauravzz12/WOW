'use client'

import { useState, useMemo, useTransition } from 'react'
import { removeMessage } from '@/app/admin/actions'
import { 
  Search, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Zap, 
  Sparkles, 
  Radio, 
  Filter, 
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

import { AdminMessage, MessageType, getMessageTypeInfo } from './adminUtils'
export type { AdminMessage, MessageType }
export { getMessageTypeInfo }

export function MessageModerationTable({ initialMessages }: { initialMessages: AdminMessage[] }) {
  const [messages, setMessages] = useState<AdminMessage[]>(initialMessages)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<'all' | MessageType>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null)
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Calculate counts for filters
  const typeCounts = useMemo(() => {
    const counts = { all: messages.length, normal: 0, special: 0, sponsored: 0 }
    messages.forEach(m => {
      const { type } = getMessageTypeInfo(m)
      counts[type]++
    })
    return counts
  }, [messages])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: messages.length }
    messages.forEach(m => {
      counts[m.status] = (counts[m.status] || 0) + 1
    })
    return counts
  }, [messages])

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      const typeInfo = getMessageTypeInfo(msg)
      
      // Type match
      if (selectedType !== 'all' && typeInfo.type !== selectedType) {
        return false
      }

      // Status match
      if (selectedStatus !== 'all' && msg.status !== selectedStatus) {
        return false
      }

      // Search query match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const contentMatch = msg.content?.toLowerCase().includes(query)
        const idMatch = msg.id.toLowerCase().includes(query)
        const categoryMatch = msg.category?.name?.toLowerCase().includes(query)
        const signatureMatch = msg.signature?.toLowerCase().includes(query)
        const recipientMatch = msg.recipient?.toLowerCase().includes(query)
        const sponsorMatch = typeInfo.sponsorName?.toLowerCase().includes(query)
        
        return contentMatch || idMatch || categoryMatch || signatureMatch || recipientMatch || sponsorMatch
      }

      return true
    })
  }, [messages, selectedType, selectedStatus, searchQuery])

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedMessages = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * pageSize
    return filteredMessages.slice(startIdx, startIdx + pageSize)
  }, [filteredMessages, safeCurrentPage, pageSize])

  // Handle page resets when filters change
  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handleTypeChange = (type: 'all' | MessageType) => {
    setSelectedType(type)
    setCurrentPage(1)
  }

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status)
    setCurrentPage(1)
  }

  const handleRemove = async (messageId: string) => {
    startTransition(async () => {
      const res = await removeMessage(messageId)
      if (res.success) {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, status: 'REMOVED' } : m))
        setPendingRemoveId(null)
      } else {
        alert(res.error || 'Failed to remove message.')
      }
    })
  }

  const isFiltered = searchQuery !== '' || selectedType !== 'all' || selectedStatus !== 'all'

  return (
    <div className="space-y-4">
      {/* Control Bar: Search & Filters */}
      <div className="bg-background-elevated border border-primary/10 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary w-4 h-4" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search messages by content, ID, category, or sponsor..."
              className="w-full bg-background text-primary border border-primary/20 rounded-xl pl-10 pr-9 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary p-0.5 rounded-full hover:bg-primary/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Rows per page selector */}
          <div className="flex items-center gap-2 self-end md:self-auto text-xs text-secondary">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="bg-background text-primary border border-primary/20 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-primary"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>per page</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-primary/5 text-xs">
          {/* Message Type Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-secondary font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Type:
            </span>
            <button
              onClick={() => handleTypeChange('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                selectedType === 'all' 
                  ? 'bg-primary text-background shadow-sm' 
                  : 'bg-background hover:bg-primary/5 text-secondary hover:text-primary border border-primary/10'
              }`}
            >
              All ({typeCounts.all})
            </button>
            <button
              onClick={() => handleTypeChange('normal')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                selectedType === 'normal' 
                  ? 'bg-sky-600 text-white shadow-sm' 
                  : 'bg-background hover:bg-sky-500/10 text-secondary hover:text-sky-600 border border-primary/10'
              }`}
            >
              <Radio className="w-3 h-3" />
              Normal ({typeCounts.normal})
            </button>
            <button
              onClick={() => handleTypeChange('special')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                selectedType === 'special' 
                  ? 'bg-purple-600 text-white shadow-sm' 
                  : 'bg-background hover:bg-purple-500/10 text-secondary hover:text-purple-600 border border-primary/10'
              }`}
            >
              <Zap className="w-3 h-3" />
              Special / VIP ({typeCounts.special})
            </button>
            <button
              onClick={() => handleTypeChange('sponsored')}
              className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                selectedType === 'sponsored' 
                  ? 'bg-amber-600 text-white shadow-sm' 
                  : 'bg-background hover:bg-amber-500/10 text-secondary hover:text-amber-600 border border-primary/10'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Sponsored ({typeCounts.sponsored})
            </button>
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-2">
            <span className="text-secondary font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-background text-primary border border-primary/20 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-primary font-medium"
            >
              <option value="all">All Statuses ({messages.length})</option>
              <option value="ACTIVE">ACTIVE ({statusCounts['ACTIVE'] || 0})</option>
              <option value="QUEUED">QUEUED ({statusCounts['QUEUED'] || 0})</option>
              <option value="COMPLETED">COMPLETED ({statusCounts['COMPLETED'] || 0})</option>
              <option value="PENDING_PAYMENT">PENDING_PAYMENT ({statusCounts['PENDING_PAYMENT'] || 0})</option>
              <option value="REMOVED">REMOVED ({statusCounts['REMOVED'] || 0})</option>
              <option value="EXPIRED">EXPIRED ({statusCounts['EXPIRED'] || 0})</option>
            </select>

            {isFiltered && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedType('all')
                  setSelectedStatus('all')
                  setCurrentPage(1)
                }}
                className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-background-elevated border border-primary/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-background-muted/60 border-b border-primary/10 text-secondary text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Message Content</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Bid / Duration</th>
                <th className="p-4 font-semibold">Created</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {paginatedMessages.map((msg) => {
                const typeInfo = getMessageTypeInfo(msg)
                const IconComponent = typeInfo.icon
                const isExpanded = expandedMessageId === msg.id

                return (
                  <tr key={msg.id} className="hover:bg-background-muted/30 transition-colors">
                    {/* Message Type Indicator */}
                    <td className="p-4 whitespace-nowrap align-top">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${typeInfo.badgeClass}`}>
                          <IconComponent className="w-3 h-3 shrink-0" />
                          <span>{typeInfo.label}</span>
                        </span>
                        
                        {typeInfo.type === 'sponsored' && typeInfo.sponsorName && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium truncate max-w-[130px]">
                            by {typeInfo.sponsorName}
                          </span>
                        )}

                        {typeInfo.type === 'special' && msg.scheduled_start && (
                          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                            {new Date(msg.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4 whitespace-nowrap align-top">
                      <span className="font-semibold text-xs px-2 py-0.5 rounded bg-primary/5 text-primary border border-primary/10">
                        {msg.category?.name || 'General'}
                      </span>
                    </td>

                    {/* Content */}
                    <td className="p-4 max-w-md align-top">
                      <div className="space-y-1.5">
                        <div className="text-sm font-serif leading-relaxed">
                          {isExpanded ? (
                            <span className="whitespace-pre-wrap">&ldquo;{msg.content}&rdquo;</span>
                          ) : (
                            <span className="line-clamp-2">&ldquo;{msg.content}&rdquo;</span>
                          )}
                        </div>

                        {msg.content && msg.content.length > 90 && (
                          <button
                            onClick={() => setExpandedMessageId(isExpanded ? null : msg.id)}
                            className="text-[11px] text-secondary hover:text-primary flex items-center gap-0.5 font-medium transition-colors"
                          >
                            <span>{isExpanded ? 'Show less' : 'Read full message'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}

                        {/* Attribution tags (signature, recipient) */}
                        {(msg.signature || msg.recipient) && (
                          <div className="flex flex-wrap gap-2 text-[11px] text-secondary pt-0.5">
                            {msg.signature && (
                              <span className="bg-background px-1.5 py-0.5 rounded border border-primary/10">
                                From: <strong className="text-primary font-medium">{msg.signature}</strong>
                              </span>
                            )}
                            {msg.recipient && (
                              <span className="bg-background px-1.5 py-0.5 rounded border border-primary/10">
                                To: <strong className="text-primary font-medium">{msg.recipient}</strong>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4 whitespace-nowrap align-top">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                        msg.status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25' : 
                        msg.status === 'QUEUED' 
                          ? 'bg-blue-500/10 text-blue-600 border-blue-500/25' :
                        msg.status === 'COMPLETED'
                          ? 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' :
                        msg.status === 'PENDING_PAYMENT'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/25' :
                        msg.status === 'REMOVED' || msg.status === 'EXPIRED'
                          ? 'bg-rose-500/10 text-rose-600 border-rose-500/25' :
                        'bg-background-muted text-secondary border-primary/10'
                      }`}>
                        {msg.status === 'ACTIVE' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                        <span>{msg.status}</span>
                      </span>
                    </td>

                    {/* Bid / Amount */}
                    <td className="p-4 whitespace-nowrap align-top font-mono text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm text-primary">
                          ${(msg.bid_amount || 0).toFixed(2)}
                        </span>
                        {msg.is_reserved_slot ? (
                          <span className="text-[10px] text-purple-600 dark:text-purple-400">Fixed Slot</span>
                        ) : msg.bid_amount < 2 ? (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400">Sponsored $1</span>
                        ) : (
                          <span className="text-[10px] text-secondary">Priority Bid</span>
                        )}
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="p-4 whitespace-nowrap align-top text-secondary text-xs font-mono" suppressHydrationWarning>
                      <div>{new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</div>
                      <div className="text-[10px] opacity-75">{new Date(msg.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC</div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 whitespace-nowrap align-top text-right">
                      {msg.status !== 'REMOVED' ? (
                        pendingRemoveId === msg.id ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleRemove(msg.id)}
                              disabled={isPending}
                              className="text-xs bg-red-600 text-white hover:bg-red-700 px-2.5 py-1 rounded font-semibold transition-all disabled:opacity-50"
                            >
                              {isPending ? '...' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setPendingRemoveId(null)}
                              disabled={isPending}
                              className="text-xs text-secondary hover:text-primary px-2 py-1 rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setPendingRemoveId(msg.id)}
                            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-500/10 px-2.5 py-1 rounded-md font-semibold transition-colors border border-transparent hover:border-red-500/20"
                            title="Remove from broadcast queue"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-secondary/50 font-mono italic">Removed</span>
                      )}
                    </td>
                  </tr>
                )
              })}

              {paginatedMessages.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-secondary text-sm">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-semibold text-primary">No messages match your criteria</p>
                      <p className="text-xs text-secondary">Try adjusting your search keywords, type filter, or status filter.</p>
                      {isFiltered && (
                        <button
                          onClick={() => {
                            setSearchQuery('')
                            setSelectedType('all')
                            setSelectedStatus('all')
                            setCurrentPage(1)
                          }}
                          className="mt-2 text-xs bg-primary text-background px-3 py-1.5 rounded-lg font-medium"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Navigation Footer */}
        {filteredMessages.length > 0 && (
          <div className="border-t border-primary/10 p-4 bg-background-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-secondary font-mono">
              Showing <strong className="text-primary font-bold">{Math.min(filteredMessages.length, (safeCurrentPage - 1) * pageSize + 1)}</strong> to{' '}
              <strong className="text-primary font-bold">{Math.min(filteredMessages.length, safeCurrentPage * pageSize)}</strong> of{' '}
              <strong className="text-primary font-bold">{filteredMessages.length}</strong> messages
              {filteredMessages.length !== messages.length && (
                <span className="text-secondary/70 ml-1.5 font-sans">(filtered from {messages.length})</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                className="p-1.5 rounded-lg border border-primary/10 hover:bg-background disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="p-1.5 rounded-lg border border-primary/10 hover:bg-background disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = safeCurrentPage
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (safeCurrentPage <= 3) {
                    pageNum = i + 1
                  } else if (safeCurrentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = safeCurrentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`min-w-[28px] h-7 rounded-lg font-mono font-medium transition-colors ${
                        safeCurrentPage === pageNum
                          ? 'bg-primary text-background font-bold shadow-sm'
                          : 'hover:bg-background text-secondary hover:text-primary border border-primary/10'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-primary/10 hover:bg-background disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-primary/10 hover:bg-background disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
