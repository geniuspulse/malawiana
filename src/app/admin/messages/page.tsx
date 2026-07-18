'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Mail, MessageSquare, Trash2, CheckCircle2, User, Clock, AlertCircle } from 'lucide-react'

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('malawiana_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      const messagesData = data || []
      setMessages(messagesData)
      if (messagesData.length > 0 && !selectedMessage) {
        setSelectedMessage(messagesData[0])
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const handleSelectMessage = async (msg: any) => {
    setSelectedMessage(msg)
    if (msg.status === 'new') {
      // Mark as read immediately
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m))
      try {
        await supabase
          .from('malawiana_messages')
          .update({ status: 'read' })
          .eq('id', msg.id)
      } catch (err) {
        console.error('Error marking message as read:', err)
      }
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: 'new' | 'read' | 'replied') => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m))
    if (selectedMessage?.id === id) {
      setSelectedMessage((prev: any) => prev ? { ...prev, status: newStatus } : null)
    }

    try {
      const { error } = await supabase
        .from('malawiana_messages')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message permanently?')) return

    try {
      const { error } = await supabase
        .from('malawiana_messages')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMessages(prev => prev.filter(m => m.id !== id))
      if (selectedMessage?.id === id) {
        const remaining = messages.filter(m => m.id !== id)
        setSelectedMessage(remaining.length > 0 ? remaining[0] : null)
      }
    } catch (err) {
      console.error('Error deleting message:', err)
      alert('Failed to delete message. Please try again.')
    }
  }

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      (msg.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (msg.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (msg.subject || '').toLowerCase().includes(search.toLowerCase()) ||
      (msg.message || '').toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 h-[calc(100vh-10rem)] flex flex-col">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Inbox</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Enquiries</h1>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4 shrink-0">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search in messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-sm dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs font-medium focus:outline-none dark:text-gray-200 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="new">Unread / New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {/* Main Inbox Panel */}
      {loading ? (
        <div className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading messages...</p>
        </div>
      ) : filteredMessages.length === 0 ? (
        <div className="flex-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col items-center justify-center text-center p-8">
          <MessageSquare className="text-gray-300 dark:text-gray-700 mb-3" size={48} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inbox is empty</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1">
            There are no messages matching your current filters or search criteria.
          </p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Message List */}
          <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm h-full">
            <div className="overflow-y-auto flex-1 divide-y divide-gray-100 dark:divide-slate-800/60">
              {filteredMessages.map(msg => (
                <button
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex flex-col gap-1.5 relative ${
                    selectedMessage?.id === msg.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  {msg.status === 'new' && (
                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-600" />
                  )}
                  <div className="flex justify-between items-start gap-4">
                    <p className={`font-semibold text-sm ${msg.status === 'new' ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {msg.name}
                    </p>
                    <span className="text-xs text-gray-400 font-normal shrink-0">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={`text-xs font-medium truncate ${msg.status === 'new' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {msg.subject || '(No Subject)'}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 mt-0.5">
                    {msg.message}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Message Details */}
          <div className="lg:col-span-3 flex flex-col bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm h-full">
            {selectedMessage ? (
              <div className="flex flex-col h-full">
                {/* Message Header Actions */}
                <div className="border-b border-gray-100 dark:border-slate-800 p-4 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                      disabled={selectedMessage.status === 'replied'}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        selectedMessage.status === 'replied'
                          ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30'
                          : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50'
                      }`}
                    >
                      <CheckCircle2 size={14} />
                      {selectedMessage.status === 'replied' ? 'Replied' : 'Mark as Replied'}
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                    title="Delete message"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Message Details */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3 ${
                      selectedMessage.status === 'new'
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30'
                        : selectedMessage.status === 'read'
                        ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200'
                        : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200'
                    }`}>
                      {selectedMessage.status.toUpperCase()}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
                      {selectedMessage.subject || '(No Subject)'}
                    </h2>
                  </div>

                  {/* Sender Card */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-slate-800/60 bg-gray-50/50 dark:bg-slate-800/20">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{selectedMessage.name}</p>
                      <a href={`mailto:${selectedMessage.email}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        {selectedMessage.email}
                      </a>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                      <Clock size={12} />
                      {new Date(selectedMessage.created_at).toLocaleDateString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800/60 p-5 rounded-xl">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <Mail className="text-gray-300 dark:text-gray-700 mb-2 animate-bounce" size={40} />
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Select a message</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs">
                  Choose a message from the list on the left to read its full details.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
