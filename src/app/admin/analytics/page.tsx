'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Users, Eye, TrendingUp, Loader2, Globe, FileText } from 'lucide-react'

interface AnalyticsData {
  totalViews: number
  totalArticles: number
  publishedArticles: number
  uniqueVisitors: number
  dailyTrend: { date: string; views: number; uniqueVisitors: number }[]
  topArticles: { id: string; title: string; slug: string; views: number; uniqueVisitors: number | null }[]
  referrers: { source: string; count: number }[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState('7d')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/analytics?range=${range}`)
        if (!res.ok) throw new Error('Failed to fetch analytics')
        const json = await res.json()
        setData(json)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [range])

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-sm text-gray-500">Loading analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl max-w-2xl mx-auto mt-8">
        <h3 className="text-red-800 dark:text-red-400 font-bold mb-2">Error</h3>
        <p className="text-sm text-red-600 dark:text-red-300 mb-4">{error}</p>
        <p className="text-xs text-gray-500 mb-2">To enable detailed analytics, run this SQL in your Supabase SQL Editor:</p>
        <pre className="text-xs bg-gray-100 dark:bg-slate-800 p-3 rounded-lg overflow-x-auto mt-2">{`CREATE TABLE IF NOT EXISTS article_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid,
  visitor_hash varchar(32),
  referrer text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE article_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analytics_service_role" ON article_analytics FOR ALL USING (true);`}</pre>
      </div>
    )
  }

  const maxDailyViews = Math.max(...(data?.dailyTrend?.map(d => d.views) || [1]), 1)

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Insights</span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mt-1">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track views, unique visitors, and traffic sources.</p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
          {['7d', '30d', 'all'].map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${range === r ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-gray-500'}`}>
              {r === '7d' ? '7 days' : r === '30d' ? '30 days' : 'All time'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Views" value={data?.totalViews.toLocaleString() || '0'} icon={<Eye size={22} />} />
        <StatCard label="Unique Visitors" value={data?.uniqueVisitors.toLocaleString() || '0'} icon={<Users size={22} />} />
        <StatCard label="Published Stories" value={data?.publishedArticles || 0} icon={<FileText size={22} />} />
        <StatCard label="Avg Views / Story" value={data?.totalArticles ? Math.round((data.totalViews / data.totalArticles) * 10) / 10 : 0} icon={<TrendingUp size={22} />} />
      </div>

      {/* Daily trend chart */}
      {data?.dailyTrend && data.dailyTrend.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-600" /> Daily Views Trend
          </h2>
          <div className="flex items-end gap-1 h-48 overflow-x-auto">
            {data.dailyTrend.map(d => (
              <div key={d.date} className="flex flex-col items-center gap-1 flex-1 min-w-[40px]">
                <div className="text-[10px] text-gray-400 font-medium">{d.views}</div>
                <div className="w-full bg-emerald-500 rounded-t-sm transition-all hover:bg-emerald-600"
                  style={{ height: `${(d.views / maxDailyViews) * 100}%`, minHeight: '2px' }}
                  title={`${d.date}: ${d.views} views, ${d.uniqueVisitors} unique`} />
                <div className="text-[9px] text-gray-400 whitespace-nowrap">
                  {new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top articles */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText size={18} className="text-emerald-600" /> Top Stories
          </h2>
          <div className="space-y-2">
            {data?.topArticles?.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg">
                <span className="text-xs font-bold text-gray-300 w-5">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Eye size={10} />{a.views}</span>
                    {a.uniqueVisitors !== null && (
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Users size={10} />{a.uniqueVisitors}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top referrers */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe size={18} className="text-emerald-600" /> Traffic Sources
          </h2>
          <div className="space-y-2">
            {data?.referrers && data.referrers.length > 0 ? data.referrers.map((r, i) => (
              <div key={r.source} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{r.source}</span>
                <span className="text-xs font-bold text-emerald-600">{r.count}</span>
              </div>
            )) : (
              <p className="text-sm text-gray-400 p-3">No referrer data yet. Detailed analytics requires the article_analytics table.</p>
            )}
          </div>
        </div>
      </div>

      {data?.uniqueVisitors === 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            <strong>Detailed analytics not yet active.</strong> Total views are tracked, but unique visitors, daily trends, and referrers require the <code className="bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded text-xs">article_analytics</code> table.
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
            Run the SQL shown in the error state (temporarily trigger by setting range to something else and back) in your Supabase SQL Editor to enable full analytics.
          </p>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string; value: any; icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex items-center gap-5">
      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
      </div>
    </div>
  )
}
