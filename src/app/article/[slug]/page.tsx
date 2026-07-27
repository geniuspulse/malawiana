import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { formatDate, readingTime } from '@/lib/utils'
import ArticleCard from '@/components/ArticleCard'
import type { Metadata } from 'next'
import { Clock, Calendar, User, Share2, Bookmark, Tag } from 'lucide-react'
import Link from 'next/link'
import AdRenderer from '@/components/AdRenderer'
import YouTubeEmbed from '@/components/YouTubeEmbed'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: article } = await supabase.from('malawiana_articles').select('title, summary, featured_image, category, author_name, published_at').eq('slug', params.slug).single()
  if (!article) return { title: 'Not Found' }
  return {
    title: article.title,
    description: article.summary,
    openGraph: { title: article.title, description: article.summary, images: article.featured_image ? [article.featured_image] : [], type: 'article', publishedTime: article.published_at },
    twitter: { card: 'summary_large_image', title: article.title, description: article.summary },
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { data: article } = await supabase.from('malawiana_articles').select('*').eq('slug', params.slug).eq('status', 'published').single()
  if (!article) notFound()

  // Increment views
  await supabase.from('malawiana_articles').update({ views: (article.views || 0) + 1 }).eq('id', article.id)

  const { data: related } = await supabase.from('malawiana_articles').select('*').eq('category', article.category).eq('status', 'published').neq('id', article.id).order('published_at', { ascending: false }).limit(4)

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-blue-600">Home</Link> <span>/</span>
        <Link href={`/category/${article.category}`} className="hover:text-blue-600 capitalize">{article.category}</Link> <span>/</span>
        <span className="truncate text-gray-400">{article.title}</span>
      </nav>

      {/* Category tag */}
      <div className="mb-4">
        <Link href={`/category/${article.category}`} className="text-xs font-bold px-3 py-1 bg-blue-600 text-white rounded uppercase tracking-wide hover:bg-blue-700">{article.category}</Link>
      </div>

      {/* Headline */}
      <h1 className="text-3xl md:text-4xl font-black font-serif leading-tight text-gray-900 dark:text-white mb-4">{article.title}</h1>

      {/* Summary */}
      {article.summary && <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6 font-medium border-l-4 border-blue-600 pl-4">{article.summary}</p>}

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5">
          <User size={14} />
          <span className="font-medium text-gray-700 dark:text-gray-300">{article.author_name || 'Malawiana Staff'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={14} />
          <span>{formatDate(article.published_at)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span>{readingTime(article.body || '')} min read</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500">
            <Bookmark size={16} />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-500">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      {/* Featured image */}
      {article.featured_image && (
        <div className="mb-8 rounded-xl overflow-hidden">
          <img src={article.featured_image} alt={article.title} className="w-full aspect-video object-cover" />
          {article.image_caption && <p className="text-xs text-gray-400 mt-2 italic text-center">{article.image_caption}</p>}
        </div>
      )}

      {/* YouTube embed if video ID set */}
      {article.youtube_video_id && (
        <div className="mb-8">
          <YouTubeEmbed videoId={article.youtube_video_id} title={article.title} />
        </div>
      )}

      {/* In-article ad */}
      <AdRenderer placement="in-article" className="my-6" />

      {/* Article body */}
      <div className="article-body prose max-w-none" dangerouslySetInnerHTML={{ __html: article.body || '<p>Content loading...</p>' }} />

      {/* In-article ad - bottom */}
      <AdRenderer placement="in-article" className="my-6" />

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 flex items-center gap-2 flex-wrap">
          <Tag size={14} className="text-gray-400" />
          {article.tags.map((tag: string) => (
            <span key={tag} className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      {/* Author bio */}
      {article.author_bio && (
        <div className="mt-8 p-5 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">{(article.author_name || 'M')[0]}</div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{article.author_name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{article.author_title}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{article.author_bio}</p>
          </div>
        </div>
      )}

      {/* Sidebar ad */}
      <AdRenderer placement="sidebar" className="my-8" />

      {/* Related articles */}
      {related && related.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
          <h3 className="text-xl font-black uppercase tracking-wide border-l-4 border-blue-600 pl-3 mb-6">Related Stories</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        </section>
      )}
    </article>
  )
}

