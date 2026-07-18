'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Plus, Search, Filter, Trash2, Edit2, Star, Zap, X } from 'lucide-react'
import { Article } from '@/types'

const CATEGORIES = [
  { value: 'politics', label: 'Politics & Governance' },
  { value: 'business', label: 'Business & Finance' },
  { value: 'sports', label: 'Sports' },
  { value: 'entertainment', label: 'Entertainment & Arts' },
  { value: 'lifestyle', label: 'Lifestyle & Culture' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health & Medicine' },
  { value: 'technology', label: 'Science & Tech' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'environment', label: 'Environment' },
  { value: 'opinion', label: 'Opinion & Editorial' },
  { value: 'international', label: 'International' },
  { value: 'law-justice', label: 'Law & Justice' },
  { value: 'general', label: 'General News' }
]

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const query = supabase.from('malawiana_articles').select('*').order('created_at', { ascending: false })

      const { data, error } = await query
      if (error) throw error
      setArticles(data || [])
    } catch (err) {
      console.error('Error fetching articles:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  const handleToggleBoolean = async (id: string, field: 'is_featured' | 'is_breaking' | 'is_editors_pick', currentValue: boolean) => {
    const nextVal = !currentValue
    // Optimistic Update
    setArticles(prev => prev.map(art => art.id === id ? { ...art, [field]: nextVal } : art))

    try {
      const { error } = await supabase
        .from('malawiana_articles')
        .update({ [field]: nextVal, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      console.error(`Error toggling ${field}:`, err)
      // Rollback
      setArticles(prev => prev.map(art => art.id === id ? { ...art, [field]: currentValue } : art))
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'published' ? 'draft' : 'published'
    const updatePayload: Partial<Article> = {
      status: nextStatus,
      updated_at: new Date().toISOString()
    }
    if (nextStatus === 'published') {
      updatePayload.published_at = new Date().toISOString()
    }

    // Optimistic Update
    setArticles(prev => prev.map(art => art.id === id ? { ...art, status: nextStatus } : art))

    try {
      const { error } = await supabase
        .from('malawiana_articles')
        .update(updatePayload)
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      console.error('Error toggling status:', err)
      // Rollback
      setArticles(prev => prev.map(art => art.id === id ? { ...art, status: currentStatus } : art))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this article? This action cannot be undone.')) return

    try {
      const { error } = await supabase.from('malawiana_articles').delete().eq('id', id)
      if (error) throw error
      setArticles(prev => prev.filter(art => art.id !== id))
    } catch (err) {
      console.error('Error deleting article:', err)
      alert('Failed to delete article. Please try again.')
    }
  }

  // Filter & search locally for lightning fast dashboard feel
  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(search.toLowerCase()) || 
      (art.author_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (art.summary || '').toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'all' || art.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || art.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Workspace</span>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Articles Directory</h1>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors shadow-md hover:shadow-lg shadow-blue-500/10"
        >
          <Plus size={16} /> Create Article
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by title, author, or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent text-sm dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5">
            <Filter size={14} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-medium focus:outline-none dark:text-gray-200 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Drafts</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1.5">
            <Filter size={14} className="text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs font-medium focus:outline-none dark:text-gray-200 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <div className="min-h-[300px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading articles...</p>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="min-h-[300px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col items-center justify-center text-center p-8">
          <X className="text-gray-300 dark:text-gray-700 mb-3" size={48} />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No articles found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1 mb-6">
            We couldn&apos;t find any articles matching your search query or filters. Create a new article to get started!
          </p>
          <Link
            href="/admin/articles/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Create New Article
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Article</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Featured</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Breaking</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {filteredArticles.map(art => (
                  <tr key={art.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-10 rounded bg-gray-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-gray-200 dark:border-slate-800">
                          {art.featured_image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={art.featured_image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold">News</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white line-clamp-1 text-sm">{art.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">By {art.author_name} • {art.created_at ? new Date(art.created_at).toLocaleDateString() : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {CATEGORIES.find(c => c.value === art.category)?.label || art.category}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleBoolean(art.id || '', 'is_featured', !!art.is_featured)}
                        className={`p-1.5 rounded-full transition-colors ${art.is_featured ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20' : 'text-gray-300 dark:text-slate-600 hover:text-gray-400'}`}
                        title="Toggle Featured placement"
                      >
                        <Star size={18} fill={art.is_featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleBoolean(art.id || '', 'is_breaking', !!art.is_breaking)}
                        className={`p-1.5 rounded-full transition-colors ${art.is_breaking ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20' : 'text-gray-300 dark:text-slate-600 hover:text-gray-400'}`}
                        title="Toggle Breaking alert"
                      >
                        <Zap size={18} fill={art.is_breaking ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(art.id || '', art.status)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer select-none transition-colors ${
                          art.status === 'published'
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 hover:bg-emerald-100'
                            : art.status === 'draft'
                            ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-200'
                            : art.status === 'scheduled'
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/30'
                        }`}
                        title={art.status === 'published' ? 'Click to revert to Draft' : 'Click to Publish immediately'}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          art.status === 'published' ? 'bg-emerald-500' : art.status === 'draft' ? 'bg-gray-400' : art.status === 'scheduled' ? 'bg-blue-500' : 'bg-red-500'
                        }`} />
                        {art.status.charAt(0).toUpperCase() + art.status.slice(1)}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/articles/${art.id}`}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-md transition-colors"
                          title="Edit article"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(art.id || '')}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-500 hover:text-red-600 rounded-md transition-colors"
                          title="Delete article"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
