'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { FileText, Mail, MessageSquare, TrendingUp, ArrowUpRight, Plus, Eye, Megaphone, Loader2 } from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    postsCount: 0,
    subscribersCount: 0,
    unreadMessagesCount: 0,
    totalViews: 0
  })
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [recentMessages, setRecentMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Query 1: Fetch total posts & views from malawiana_articles
        const { data: postsData, error: postsErr } = await supabase
          .from('malawiana_articles')
          .select('views, status')

        if (postsErr) throw postsErr

        const postsCount = postsData?.length || 0
        const totalViews = postsData?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0

        // Query 2: Subscribers count from malawiana_subscribers
        const { count: subscribersCount, error: subErr } = await supabase
          .from('malawiana_subscribers')
          .select('*', { count: 'exact', head: true })

        if (subErr) throw subErr

        // Query 3: Unread messages count from malawiana_messages
        const { count: unreadCount, error: msgErr } = await supabase
          .from('malawiana_messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'new')

        if (msgErr) throw msgErr

        // Query 4: Recent posts (last 5)
        const { data: recent, error: recentErr } = await supabase
          .from('malawiana_articles')
          .select('id, title, category, status, views, created_at')
          .order('created_at', { ascending: false })
          .limit(5)

        if (recentErr) throw recentErr

        // Query 5: Recent messages (last 4)
        const { data: messages, error: messagesErr } = await supabase
          .from('malawiana_messages')
          .select('id, name, subject, status, created_at')
          .order('created_at', { ascending: false })
          .limit(4)

        if (messagesErr) throw messagesErr

        setStats({
          postsCount,
          subscribersCount: subscribersCount || 0,
          unreadMessagesCount: unreadCount || 0,
          totalViews
        })
        setRecentPosts(recent || [])
        setRecentMessages(messages || [])

      } catch (err: any) {
        console.error('Error fetching dashboard statistics:', err)
        setError(err.message || 'An error occurred while loading dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading Dashboard statistics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl max-w-2xl mx-auto mt-8">
        <h3 className="text-red-800 dark:text-red-400 font-bold text-lg mb-2">Error Loading Dashboard</h3>
        <p className="text-sm text-red-600 dark:text-red-300 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Overview</span>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mt-1">Blog Hub</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Welcome back! Here is what is happening with Malawiana stories, subscribers, and ads today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors shadow-md hover:shadow-lg shadow-blue-500/10"
          >
            <Plus size={16} /> New Story
          </Link>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 - Total Posts */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.01]">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Stories</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.postsCount}
            </h3>
          </div>
        </div>

        {/* Metric 2 - Subscribers */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.01]">
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400">
            <Mail size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Subscribers</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.subscribersCount}
            </h3>
          </div>
        </div>

        {/* Metric 3 - Unread Messages */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.01]">
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Unread Messages</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.unreadMessagesCount}
            </h3>
          </div>
        </div>

        {/* Metric 4 - Total Views */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center gap-5 transition-transform hover:scale-[1.01]">
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Views</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stats.totalViews.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 dark:text-white text-base mb-4">Quick Management Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/articles/new" className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-gray-100 dark:border-slate-800 rounded-xl text-center transition-all group">
            <Plus className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 transition-colors" size={20} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">New Story</span>
          </Link>
          <Link href="/admin/ads" className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-gray-100 dark:border-slate-800 rounded-xl text-center transition-all group">
            <Megaphone className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 transition-colors" size={20} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">Manage Ads</span>
          </Link>
          <Link href="/admin/subscribers" className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-gray-100 dark:border-slate-800 rounded-xl text-center transition-all group">
            <Mail className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 transition-colors" size={20} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">Subscribers</span>
          </Link>
          <Link href="/admin/messages" className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 border border-gray-100 dark:border-slate-800 rounded-xl text-center transition-all group">
            <MessageSquare className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2 transition-colors" size={20} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">View Messages</span>
          </Link>
        </div>
      </div>

      {/* Main Content Dashboard Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Span 2): Recent Stories */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-gray-950 dark:text-white text-base">Recent Stories</h3>
              <Link href="/admin/articles" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
                View All <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {recentPosts.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">No stories have been created yet.</p>
                  <Link href="/admin/articles/new" className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline mt-2 inline-block">
                    Create your first story
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-slate-850 bg-gray-50/20 dark:bg-slate-900/20 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <th className="px-6 py-3">Title</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Views</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {recentPosts.map(post => (
                        <tr key={post.id} className="text-sm hover:bg-gray-50 dark:hover:bg-slate-800/20 transition-all">
                          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white max-w-[200px] truncate">
                            {post.title}
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                            {post.category || 'General'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              post.status === 'published'
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-gray-150 dark:bg-slate-800 text-gray-500 dark:text-gray-400'
                            }`}>
                              {post.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-xs text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1 font-medium"><Eye size={12} /> {(post.views || 0).toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/admin/articles/${post.id}`} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Messages */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-gray-950 dark:text-white text-base">Recent Messages</h3>
              <Link href="/admin/messages" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-800 flex-1">
              {recentMessages.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
                  No messages in your inbox.
                </div>
              ) : (
                recentMessages.map(msg => (
                  <Link
                    key={msg.id}
                    href="/admin/messages"
                    className="p-5 block hover:bg-gray-50 dark:hover:bg-slate-800/20 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-xs text-gray-900 dark:text-white truncate max-w-[120px]">
                        {msg.name}
                      </p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {msg.status === 'new' && (
                          <span className="w-2 h-2 rounded-full bg-blue-600" title="Unread" />
                        )}
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                      {msg.subject || '(No Subject)'}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
