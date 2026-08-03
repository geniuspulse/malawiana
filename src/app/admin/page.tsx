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
    totalViews: 0,
    writersCount: 0,
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
        const { data: postsData, error: postsErr } = await supabase
          .from('malawiana_articles').select('views, status')
        if (postsErr) throw postsErr
        const postsCount = postsData?.length || 0
        const totalViews = postsData?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0

        const { count: subscribersCount, error: subErr } = await supabase
          .from('malawiana_subscribers').select('*', { count: 'exact', head: true })
        if (subErr) throw subErr

        const { count: unreadCount, error: msgErr } = await supabase
          .from('malawiana_messages').select('*', { count: 'exact', head: true }).eq('status', 'new')
        if (msgErr) throw msgErr

        let writersCount = 0
        try {
          const { count } = await supabase
            .from('writers').select('*', { count: 'exact', head: true })
          writersCount = count || 0
        } catch {}

        const { data: recent, error: recentErr } = await supabase
          .from('malawiana_articles')
          .select('id, title, category, status, views, created_at')
          .order('created_at', { ascending: false }).limit(5)
        if (recentErr) throw recentErr

        const { data: messages, error: messagesErr } = await supabase
          .from('malawiana_messages')
          .select('id, name, subject, status, created_at')
          .order('created_at', { ascending: false }).limit(4)
        if (messagesErr) throw messagesErr

        setStats({ postsCount, subscribersCount: subscribersCount || 0, unreadMessagesCount: unreadCount || 0, totalViews, writersCount })
        setRecentPosts(recent || [])
        setRecentMessages(messages || [])
      } catch (err: any) {
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl max-w-2xl mx-auto mt-8">
        <h3 className="text-red-800 dark:text-red-400 font-bold mb-2">Error</h3>
        <p className="text-sm text-red-600 dark:text-red-300 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg">Try Again</button>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Stories', value: stats.postsCount, icon: <FileText size={22} />, color: 'emerald' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: <Eye size={22} />, color: 'emerald' },
    { label: 'Writers', value: stats.writersCount, icon: <TrendingUp size={22} />, color: 'emerald' },
    { label: 'Subscribers', value: stats.subscribersCount, icon: <Mail size={22} />, color: 'emerald' },
  ]

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Overview</span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mt-1">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage stories, writers, and ads on Malawiana.</p>
        </div>
        <Link href="/admin/articles/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg transition-colors shadow-md">
          <Plus size={16} /> New Story
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center gap-5">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400">{card.icon}</div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText size={18} className="text-emerald-600" /> Recent Stories
          </h2>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <Link key={post.id} href={`/admin/articles/${post.id}`} className="flex items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl hover:shadow-sm transition-shadow">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{post.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${post.status === 'published' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-slate-800 text-gray-500'}`}>{post.status}</span>
                    <span className="text-xs text-gray-400">{post.category}</span>
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Eye size={10} />{post.views || 0}</span>
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-gray-400 shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-emerald-600" /> Recent Messages
          </h2>
          <div className="space-y-3">
            {recentMessages.length > 0 ? recentMessages.map((msg) => (
              <Link key={msg.id} href="/admin/messages" className="block p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{msg.name}</span>
                  {msg.status === 'new' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                </div>
                <p className="text-xs text-gray-400 mt-1 truncate">{msg.subject}</p>
              </Link>
            )) : <p className="text-sm text-gray-400 p-4">No messages yet.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
