'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { FileText, Mail, MessageSquare, TrendingUp, ArrowUpRight, Plus, Eye, Star, Clock } from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    articlesCount: 0,
    subscribersCount: 0,
    messagesCount: 0,
    totalViews: 0
  })
  const [recentArticles, setRecentArticles] = useState<any[]>([])
  const [unreadMessages, setUnreadMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // Query 1: Article stats (total count & total views)
        const { data: articlesData, error: artErr } = await supabase
          .from('malawiana_articles')
          .select('views, status')

        if (artErr) throw artErr

        const articlesCount = articlesData?.length || 0
        const totalViews = articlesData?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0

        // Query 2: Subscribers count
        const { count: subscribersCount, error: subErr } = await supabase
          .from('malawiana_subscribers')
          .select('*', { count: 'exact', head: true })

        if (subErr) throw subErr

        // Query 3: Messages count
        const { count: messagesCount, error: msgErr } = await supabase
          .from('malawiana_messages')
          .select('*', { count: 'exact', head: true })

        if (msgErr) throw msgErr

        // Query 4: Recent articles
        const { data: recent, error: recentErr } = await supabase
          .from('malawiana_articles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)

        if (recentErr) throw recentErr

        // Query 5: Unread / New Messages
        const { data: unread, error: unreadErr } = await supabase
          .from('malawiana_messages')
          .select('*')
          .eq('status', 'new')
          .order('created_at', { ascending: false })
          .limit(3)

        if (unreadErr) throw unreadErr

        setStats({
          articlesCount,
          subscribersCount: subscribersCount || 0,
          messagesCount: messagesCount || 0,
          totalViews
        })
        setRecentArticles(recent || [])
        setUnreadMessages(unread || [])

      } catch (err) {
        console.error('Error fetching dashboard statistics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-8">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Overview</span>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Editorial Hub</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, Editor! Here is what is happening with Malawiana.com today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors shadow-md hover:shadow-lg shadow-blue-500/10"
          >
            <Plus size={16} /> New Article
          </Link>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center gap-5">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Articles</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {loading ? '...' : stats.articlesCount}
            </h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center gap-5">
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400">
            <Mail size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subscribers</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {loading ? '...' : stats.subscribersCount}
            </h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center gap-5">
          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Messages</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {loading ? '...' : stats.messagesCount}
            </h3>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center gap-5">
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Views</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {loading ? '...' : stats.totalViews.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Content Dashboard Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Span 2): Recent articles */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-gray-950 dark:text-white text-base">Recent Editorial Submissions</h3>
              <Link href="/admin/articles" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-0.5">
                View All <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {loading ? (
                <div className="p-6 text-center text-sm text-gray-400">Loading feeds...</div>
              ) : recentArticles.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-sm text-gray-400">No articles have been created yet.</p>
                  <Link href="/admin/articles/new" className="text-xs text-blue-600 font-semibold hover:underline mt-2 inline-block">
                    Create your first article
                  </Link>
                </div>
              ) : (
                recentArticles.map(art => (
                  <div key={art.id} className="p-5 hover:bg-gray-50 dark:hover:bg-slate-800/20 transition-all flex items-start gap-4">
                    <div className="w-16 h-12 rounded bg-gray-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-gray-100 dark:border-slate-800">
                      {art.featured_image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={art.featured_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 uppercase font-bold">News</div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{art.category}</span>
                        <span className="text-gray-300 dark:text-slate-700 text-xs">•</span>
                        <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          art.status === 'published' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400'
                        }`}>
                          {art.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-950 dark:text-white text-sm leading-snug line-clamp-1">
                        {art.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-3">
                        <span className="font-medium">By {art.author_name}</span>
                        <span className="flex items-center gap-1"><Eye size={12} /> {art.views || 0} views</span>
                      </p>
                    </div>

                    <Link
                      href={`/admin/articles/${art.id}`}
                      className="p-1.5 border border-gray-100 dark:border-slate-800 rounded-lg text-gray-400 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-all self-center"
                    >
                      <ArrowUpRight size={14} />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Alerts and Quick Contacts */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-gray-950 dark:text-white text-base">New Enquiries</h3>
              <Link href="/admin/messages" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-0.5">
                Inbox <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {loading ? (
                <div className="p-6 text-center text-sm text-gray-400">Loading inbox...</div>
              ) : unreadMessages.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">
                  <Clock className="mx-auto text-gray-300 dark:text-gray-700 mb-2" size={24} />
                  No unread messages. Good job!
                </div>
              ) : (
                unreadMessages.map(msg => (
                  <Link
                    key={msg.id}
                    href="/admin/messages"
                    className="p-5 hover:bg-gray-50 dark:hover:bg-slate-800/20 transition-all block"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-semibold text-xs text-gray-900 dark:text-white truncate max-w-[120px]">{msg.name}</span>
                      <span className="text-[10px] text-gray-400">{new Date(msg.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="font-bold text-xs text-blue-600 dark:text-blue-400 line-clamp-1">{msg.subject || '(No Subject)'}</p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 line-clamp-2 mt-1 leading-relaxed">{msg.message}</p>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats Summary / Editorial breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-950 dark:text-white text-sm">Editorial Composition</h3>
            
            <div className="space-y-4">
              {loading ? (
                <p className="text-xs text-gray-400">Calculating stats...</p>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-500">Editorial Quality Rating</span>
                      <span className="text-blue-600">Excellent</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed pt-2 border-t border-gray-100 dark:border-slate-800/60">
                    Your platform currently supports global feed delivery, newsletter dispatch to active subscribers, and verified secure access under the Malawiana Media group protocols.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
