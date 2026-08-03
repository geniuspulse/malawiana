'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Eye, Heart, Users, FileText, Plus, Edit3, Trash2, Loader2, TrendingUp, Wallet } from 'lucide-react'
import { formatDate, timeAgo } from '@/lib/utils'

interface StoryStat {
  id: string
  title: string
  slug: string
  status: string
  views: number
  likes_count: number
  category: string
  published_at: string | null
  created_at: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, writer, loading, signOut } = useAuth()
  const [stories, setStories] = useState<StoryStat[]>([])
  const [followerCount, setFollowerCount] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) router.push('/auth')
    if (!loading && user && !writer) router.push('/onboarding')
  }, [user, writer, loading, router])

  useEffect(() => {
    if (!writer) return
    const fetchData = async () => {
      try {
        const { data: articles } = await supabase
          .from('malawiana_articles')
          .select('id, title, slug, status, views, likes_count, category, published_at, created_at')
          .eq('writer_id', writer.id)
          .order('created_at', { ascending: false })

        setStories(articles || [])

        const { count } = await supabase
          .from('writer_follows')
          .select('*', { count: 'exact', head: true })
          .eq('writer_id', writer.id)

        setFollowerCount(count || 0)
      } catch (e) {
        console.error(e)
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()
  }, [writer])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this story permanently?')) return
    await supabase.from('malawiana_articles').delete().eq('id', id)
    setStories(stories.filter((s) => s.id !== id))
  }

  const totalViews = stories.reduce((acc, s) => acc + (s.views || 0), 0)
  const totalLikes = stories.reduce((acc, s) => acc + (s.likes_count || 0), 0)
  const publishedCount = stories.filter((s) => s.status === 'published').length
  const draftCount = stories.filter((s) => s.status === 'draft').length
  // Earnings: MK 5 per view (ad revenue share model)
  const estimatedEarnings = (totalViews * 5).toLocaleString()

  if (loading || dataLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    )
  }

  if (!user || !writer) return null

  const stats = [
    { label: 'Total Views', value: totalViews.toLocaleString(), icon: <Eye size={20} /> },
    { label: 'Total Likes', value: totalLikes.toLocaleString(), icon: <Heart size={20} /> },
    { label: 'Followers', value: followerCount.toLocaleString(), icon: <Users size={20} /> },
    { label: 'Stories', value: stories.length.toString(), icon: <FileText size={20} /> },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800 border-2 border-emerald-600/20">
            <img
              src={writer.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(writer.display_name)}`}
              alt={writer.display_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
              {writer.display_name}
            </h1>
            <p className="text-sm text-gray-500">@{writer.username}</p>
          </div>
        </div>
        <Link
          href="/write"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors"
        >
          <Plus size={16} /> Write a Story
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-5"
          >
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Earnings section */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <Wallet size={20} className="text-emerald-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Earnings</h3>
        </div>
        <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
          MK {estimatedEarnings}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Estimated earnings this month based on {totalViews.toLocaleString()} total views. Malawiana
          shares ad revenue with writers at MK 5 per view.
        </p>
      </div>

      {/* My Stories */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Stories</h2>
        <div className="flex gap-4 text-xs">
          <span className="text-gray-400">
            {publishedCount} published · {draftCount} drafts
          </span>
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
          <FileText size={40} className="mx-auto mb-4 text-gray-300 dark:text-slate-700" />
          <p className="text-gray-500 dark:text-gray-400 mb-1">You haven't written any stories yet.</p>
          <Link
            href="/write"
            className="mt-4 inline-block bg-emerald-600 text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-emerald-700 transition-colors"
          >
            Write your first story
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <div
              key={story.id}
              className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      story.status === 'published'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-500'
                    }`}
                  >
                    {story.status}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase">{story.category}</span>
                </div>
                <h3 className="font-serif font-bold text-gray-900 dark:text-white truncate">
                  {story.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Eye size={11} /> {story.views || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={11} /> {story.likes_count || 0}
                  </span>
                  <span>{story.published_at ? timeAgo(story.published_at) : timeAgo(story.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {story.status === 'published' && (
                  <Link
                    href={`/article/${story.slug}`}
                    className="text-gray-400 hover:text-emerald-600 p-2"
                  >
                    <Eye size={16} />
                  </Link>
                )}
                <button
                  onClick={() => router.push(`/admin/articles/${story.id}`)}
                  className="text-gray-400 hover:text-blue-600 p-2"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(story.id)}
                  className="text-gray-400 hover:text-red-600 p-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
