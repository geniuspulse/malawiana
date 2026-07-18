'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Download, Trash2, Mail, CheckCircle, XCircle } from 'lucide-react'

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchSubscribers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('malawiana_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false })

      if (error) throw error
      setSubscribers(data || [])
    } catch (err) {
      console.error('Error fetching subscribers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'unsubscribed' : 'active'
    
    // Optimistic UI update
    setSubscribers(prev => prev.map(sub => sub.id === id ? { ...sub, status: nextStatus } : sub))

    try {
      const { error } = await supabase
        .from('malawiana_subscribers')
        .update({ status: nextStatus })
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      console.error('Error updating subscriber status:', err)
      // Rollback
      setSubscribers(prev => prev.map(sub => sub.id === id ? { ...sub, status: currentStatus } : sub))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subscriber permanently?')) return

    try {
      const { error } = await supabase
        .from('malawiana_subscribers')
        .delete()
        .eq('id', id)

      if (error) throw error
      setSubscribers(prev => prev.filter(sub => sub.id !== id))
    } catch (err) {
      console.error('Error deleting subscriber:', err)
      alert('Failed to delete subscriber. Please try again.')
    }
  }

  const handleExportCSV = () => {
    if (filteredSubscribers.length === 0) {
      alert('No data to export.')
      return
    }

    // Define columns
    const headers = ['ID', 'Email', 'Name', 'Status', 'Subscribed At']
    
    // Map rows
    const rows = filteredSubscribers.map(sub => [
      sub.id,
      sub.email,
      sub.name || '',
      sub.status,
      new Date(sub.subscribed_at).toISOString()
    ])

    // Build CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    // Create a Blob and link to download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `malawiana_subscribers_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filter subscribers locally
  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = 
      (sub.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (sub.name || '').toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Subscribers</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Newsletter Directory</h1>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors shadow-md hover:shadow-lg shadow-blue-500/10"
        >
          <Download size={16} /> Export CSV ({filteredSubscribers.length})
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-sm dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent text-xs font-medium focus:outline-none dark:text-gray-200 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="unsubscribed">Unsubscribed Only</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <div className="min-h-[300px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading subscribers...</p>
        </div>
      ) : filteredSubscribers.length === 0 ? (
        <div className="min-h-[300px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col items-center justify-center text-center p-8">
          <Mail className="text-gray-300 dark:text-gray-700 mb-3" size={48} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No subscribers found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1">
            We couldn&apos;t find any subscribers matching your search or filters.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subscriber</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Subscribed</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {filteredSubscribers.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{sub.email}</p>
                        {sub.name && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub.name}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(sub.subscribed_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(sub.id, sub.status)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          sub.status === 'active'
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 hover:bg-emerald-100'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/30 hover:bg-red-100'
                        }`}
                        title={sub.status === 'active' ? 'Click to unsubscribe' : 'Click to make active'}
                      >
                        {sub.status === 'active' ? (
                          <>
                            <CheckCircle size={12} className="text-emerald-500" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle size={12} className="text-red-500" />
                            Unsubscribed
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-500 hover:text-red-600 rounded-md transition-colors"
                        title="Delete permanently"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
