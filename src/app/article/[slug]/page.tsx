import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { formatDate, readingTime } from '@/lib/utils'
import ArticleCard from '@/components/ArticleCard'
import type { Metadata } from 'next'
import { Clock, Calendar, Bookmark, Tag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import AdRenderer from '@/components/AdRenderer'
import YouTubeEmbed from '@/components/YouTubeEmbed'
import ArticleViewTracker from '@/components/ArticleViewTracker'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const { data: article } = await supabase
    .from('malawiana_articles')
    .select('title, summary, featured_image, category, author_name, published_at')
    .eq('slug', params.slug)
    .single()
  if (!article) return { title: 'Not Found' }
  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: article.featured_image ? [article.featured_image] : [],
      type: 'article',
      publishedTime: article.published_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
    },
  }
}

export const dynamic = 'force-dynamic'

export default async function ArticlePage({
  params,
}: {
  params: { slug: string }
}) {
  const { data: article } = await supabase
    .from('malawiana_articles')
    .select('*')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()
  if (!article) notFound()

  // Get writer info if linked
  let writerProfile = null
  if (article.writer_id) {
    const { data: wp } = await supabase
      .from('writers')
      .select('username, display_name, avatar_url, bio, is_verified')
      .eq('id', article.writer_id)
      .single()
    writerProfile = wp
  }

  const { data: related } = await supabase
    .from('malawiana_articles')
    .select('*')
    .eq('category', article.category)
    .eq('status', 'published')
    .neq('id', article.id)
    .order('published_at', { ascending: false })
    .limit(4)

  const authorName = article.author_name || 'Malawiana Writer'
  const authorAvatar =
    article.author_avatar ||
    writerProfile?.avatar_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`

  return (
    <article className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <ArticleViewTracker slug={article.slug} />

      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-emerald-600 mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> Back
      </Link>

      {/* Category tag */}
      <div className="mb-4">
        <Link
          href={`/explore?category=${article.category}`}
          className="text-xs font-bold px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full uppercase tracking-wide hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
        >
          {article.category}
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl md:text-5xl font-serif font-bold leading-tight text-gray-900 dark:text-white mb-3 sm:mb-4">
        {article.title}
      </h1>

      {/* Subtitle/summary */}
      {article.summary && (
        <p className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-5 sm:mb-6 font-medium">
          {article.summary}
        </p>
      )}

      {/* Author row */}
      <div className="flex items-center gap-3 pb-6 mb-6 border-b border-gray-200 dark:border-slate-700">
        <img src={authorAvatar} alt={authorName} className="w-11 h-11 rounded-full" />
        <div className="flex-1">
          {writerProfile ? (
            <Link
              href={`/writer/${writerProfile.username}`}
              className="font-semibold text-gray-900 dark:text-white hover:text-emerald-600 transition-colors"
            >
              {authorName}
            </Link>
          ) : (
            <p className="font-semibold text-gray-900 dark:text-white">{authorName}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
            <span>{formatDate(article.published_at || article.created_at)}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {readingTime(article.body || '')} min read
            </span>
          </div>
        </div>
        <button className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors">
          <Bookmark size={18} />
        </button>
      </div>

      {/* Cover image */}
      {(article.cover_image || article.featured_image) && (
        <div className="mb-8 rounded-xl overflow-hidden">
          <img
            src={article.cover_image || article.featured_image}
            alt={article.title}
            className="w-full aspect-video object-cover"
          />
          {article.image_caption && (
            <p className="text-xs text-gray-400 mt-2 italic text-center">{article.image_caption}</p>
          )}
        </div>
      )}

      {/* YouTube embed */}
      {article.youtube_video_id && (
        <div className="mb-8">
          <YouTubeEmbed videoId={article.youtube_video_id} title={article.title} />
        </div>
      )}

      {/* Article body */}
      <div className="overflow-x-hidden">
        <div
          className="prose prose-sm sm:prose-base md:prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-emerald-600 prose-img:rounded-xl prose-img:max-w-full prose-table:w-full prose-table:overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: article.body || '' }}
        />
      </div>

      {/* In-article ad */}
      <AdRenderer placement="in-article" className="my-8" />

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 flex items-center gap-2 flex-wrap">
          <Tag size={14} className="text-gray-400" />
          {article.tags.map((tag: string) => (
            <span
              key={tag}
              className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Author bio box */}
      {writerProfile && (
        <div className="mt-8 sm:mt-10 p-4 sm:p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl flex items-start gap-3 sm:gap-4">
          <img
            src={
              writerProfile.avatar_url ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`
            }
            alt={authorName}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shrink-0"
          />
          <div>
            <Link
              href={`/writer/${writerProfile.username}`}
              className="font-bold text-gray-900 dark:text-white hover:text-emerald-600 transition-colors"
            >
              {authorName}
            </Link>
            {writerProfile.bio && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{writerProfile.bio}</p>
            )}
            <Link
              href={`/writer/${writerProfile.username}`}
              className="inline-block mt-2 text-xs font-semibold text-emerald-600 hover:underline"
            >
              See all stories →
            </Link>
          </div>
        </div>
      )}

      {/* Related articles */}
      {related && related.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">More from {authorName}</h3>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
