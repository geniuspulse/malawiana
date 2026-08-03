import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Heart, Clock, Award } from 'lucide-react'

interface Props {
  article: any
  variant?: 'default' | 'horizontal' | 'minimal' | 'featured'
}

export default function ArticleCard({ article, variant = 'default' }: Props) {
  const coverImg = article.cover_image || article.featured_image
  const authorName = article.author_name || 'Staff Writer'
  const authorAvatar = article.author_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`
  const excerpt = article.excerpt || article.summary || (article.body ? article.body.substring(0, 150).replace(/<[^>]*>/g, '') + '...' : '')
  const readingTime = article.reading_time || 5
  const likesCount = article.likes_count || 0
  const isVerified = article.is_verified || false

  return (
    <div className="border-b border-gray-100 dark:border-gray-800/60 py-5 sm:py-6 last:border-b-0">
      <Link href={`/article/${article.slug}`} className="group flex gap-3 sm:gap-6 justify-between items-start">
        <div className="flex-1 min-w-0">
          {/* Author row */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-gray-150 dark:bg-slate-800 shrink-0 border border-gray-100 dark:border-slate-800">
              <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate">
              {authorName}
            </span>
            {isVerified && <Award size={10} className="text-emerald-600 shrink-0" />}
            <span className="text-gray-400 dark:text-gray-550 text-[10px] sm:text-[11px] shrink-0">·</span>
            <span className="text-gray-400 dark:text-gray-550 text-[10px] sm:text-[11px] font-medium shrink-0">
              {article.published_at ? formatDate(article.published_at) : 'Draft'}
            </span>
          </div>

          {/* Title + excerpt */}
          <h2 className="text-base sm:text-lg md:text-xl font-serif font-black mb-1 sm:mb-1.5 leading-snug text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
            {article.title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm line-clamp-2 leading-relaxed mb-2 sm:mb-3 hidden sm:block">
            {excerpt}
          </p>

          {/* Bottom row */}
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium flex-wrap">
            <span className="bg-gray-100 dark:bg-slate-800/80 px-2 sm:px-2.5 py-0.5 rounded-full capitalize text-gray-600 dark:text-gray-400">
              {article.category || 'General'}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              <span>{readingTime} min</span>
            </span>
            <span className="flex items-center gap-1">
              <Heart size={11} className="fill-current text-gray-300 dark:text-slate-700" />
              <span>{likesCount}</span>
            </span>
          </div>
        </div>

        {/* Cover image thumbnail */}
        {coverImg && (
          <div className="w-20 h-14 sm:w-36 sm:h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 shrink-0 border border-gray-100 dark:border-slate-800">
            <img
              src={coverImg}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
      </Link>
    </div>
  )
}
