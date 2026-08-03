import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/ArticleCard'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Award, FileText, Eye, Users } from 'lucide-react'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: { username: string }
}): Promise<Metadata> {
  const { data: writer } = await supabase
    .from('writers')
    .select('display_name, bio')
    .eq('username', params.username)
    .single()
  if (!writer) return { title: 'Writer not found — Malawiana' }
  return {
    title: `${writer.display_name} — Malawiana`,
    description: writer.bio || `Stories by ${writer.display_name} on Malawiana.`,
  }
}

export default async function WriterProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const { data: writer } = await supabase
    .from('writers')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!writer) notFound()

  const { data: articles } = await supabase
    .from('malawiana_articles')
    .select('*')
    .eq('writer_id', writer.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const { count: followerCount } = await supabase
    .from('writer_follows')
    .select('*', { count: 'exact', head: true })
    .eq('writer_id', writer.id)

  const publishedArticles = articles || []
  const totalViews = publishedArticles.reduce((acc, a) => acc + (a.views || 0), 0)

  return (
    <div>
      {/* Cover banner */}
      <div className="h-40 bg-gradient-to-br from-emerald-600 to-emerald-800 dark:from-emerald-900 dark:to-slate-900" />

      <div className="max-w-4xl mx-auto px-4 -mt-16">
        {/* Avatar + info */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-900 bg-gray-100 shrink-0">
            <img
              src={
                writer.avatar_url ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(writer.display_name)}`
              }
              alt={writer.display_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
                {writer.display_name}
              </h1>
              {writer.is_verified && <Award size={20} className="text-emerald-600" />}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">@{writer.username}</p>
          </div>
        </div>

        {/* Bio */}
        {writer.bio && (
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">{writer.bio}</p>
        )}

        {/* Links */}
        {(writer.website || writer.twitter) && (
          <div className="flex gap-4 mb-6">
            {writer.website && (
              <a
                href={writer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-600 hover:underline"
              >
                {writer.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {writer.twitter && (
              <a
                href={`https://twitter.com/${writer.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-600 hover:underline"
              >
                @{writer.twitter}
              </a>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-6 mb-10 pb-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm">
            <Users size={16} className="text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">{followerCount || 0}</span>
            <span className="text-gray-400">Followers</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText size={16} className="text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">{publishedArticles.length}</span>
            <span className="text-gray-400">Stories</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Eye size={16} className="text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-white">{totalViews.toLocaleString()}</span>
            <span className="text-gray-400">Views</span>
          </div>
        </div>

        {/* Stories */}
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Stories</h2>
        {publishedArticles.length > 0 ? (
          <div className="space-y-2 pb-12">
            {publishedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <FileText size={40} className="mx-auto mb-4 text-gray-300 dark:text-slate-700" />
            <p>No published stories yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
