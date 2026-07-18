import Link from 'next/link'
import Image from 'next/image'
import { formatDate, timeAgo, readingTime } from '@/lib/utils'
import { Clock } from 'lucide-react'

interface Props {
  article: any
  variant?: 'default' | 'horizontal' | 'minimal' | 'featured'
}

export default function ArticleCard({ article, variant = 'default' }: Props) {
  const categoryColors: Record<string, string> = {
    politics: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    business: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    technology: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    sports: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    entertainment: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    education: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    health: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    economy: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    opinion: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  }
  const color = categoryColors[article.category?.toLowerCase()] || categoryColors.default

  if (variant === 'featured') return (
    <Link href={`/article/${article.slug}`} className="group block relative overflow-hidden rounded-xl h-full min-h-[400px]">
      {article.featured_image ? (
        <img src={article.featured_image} alt={article.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-600" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide ${color} mb-3 inline-block`}>{article.category}</span>
        <h2 className="text-white font-bold font-serif text-2xl md:text-3xl leading-tight mb-2 group-hover:text-blue-200 transition-colors">{article.title}</h2>
        <p className="text-gray-300 text-sm line-clamp-2 mb-3">{article.summary}</p>
        <div className="flex items-center gap-3 text-gray-400 text-xs">
          <span>{article.author_name || 'Malawiana Staff'}</span>
          <span>•</span>
          <span>{timeAgo(article.published_at)}</span>
          <span>•</span>
          <Clock size={11} /><span>{readingTime(article.body || '')} min read</span>
        </div>
      </div>
    </Link>
  )

  if (variant === 'horizontal') return (
    <Link href={`/article/${article.slug}`} className="group flex gap-4 items-start">
      {article.featured_image && (
        <div className="flex-shrink-0 w-28 h-20 rounded-lg overflow-hidden">
          <img src={article.featured_image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${color} mb-1.5 inline-block`}>{article.category}</span>
        <h3 className="font-serif font-bold text-gray-900 dark:text-white text-sm leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">{article.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{timeAgo(article.published_at)}</p>
      </div>
    </Link>
  )

  return (
    <Link href={`/article/${article.slug}`} className="group block">
      {article.featured_image && (
        <div className="overflow-hidden rounded-lg mb-3 aspect-video">
          <img src={article.featured_image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <span className={`text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wide ${color} mb-2 inline-block`}>{article.category}</span>
      <h3 className="font-serif font-bold text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 mb-2">{article.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{article.summary}</p>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span>{article.author_name || 'Staff'}</span>
        <span>•</span>
        <span>{timeAgo(article.published_at)}</span>
        <span>•</span>
        <Clock size={10} /><span>{readingTime(article.body || '')} min</span>
      </div>
    </Link>
  )
}
