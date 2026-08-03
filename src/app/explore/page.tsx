import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/ArticleCard'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Explore — Malawiana',
  description: 'Browse stories by topic on Malawiana.',
}

export const revalidate = 60

const TOPICS = [
  { name: 'Politics', slug: 'politics' },
  { name: 'Business', slug: 'business' },
  { name: 'Agriculture', slug: 'agriculture' },
  { name: 'Technology', slug: 'technology' },
  { name: 'Education', slug: 'education' },
  { name: 'Health', slug: 'health' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Opinion', slug: 'opinion' },
  { name: 'Culture', slug: 'culture' },
  { name: 'Environment', slug: 'environment' },
]

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string }
}) {
  const selectedCategory = searchParams.category || ''
  const searchQuery = searchParams.q || ''

  let query = supabase
    .from('malawiana_articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(30)

  if (selectedCategory) {
    query = query.eq('category', selectedCategory)
  }

  const { data: articles } = await query

  let displayArticles = articles || []
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    displayArticles = displayArticles.filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        a.summary?.toLowerCase().includes(q) ||
        a.author_name?.toLowerCase().includes(q)
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-serif font-black text-gray-900 dark:text-white mb-2">
        {selectedCategory
          ? TOPICS.find((t) => t.slug === selectedCategory)?.name || selectedCategory
          : searchQuery
          ? `Results for "${searchQuery}"`
          : 'Explore Stories'}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        {displayArticles.length} {displayArticles.length === 1 ? 'story' : 'stories'}
      </p>

      {/* Topic pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
        <Link
          href="/explore"
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
            !selectedCategory
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-emerald-400'
          }`}
        >
          All
        </Link>
        {TOPICS.map((topic) => (
          <Link
            key={topic.slug}
            href={`/explore?category=${topic.slug}`}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
              selectedCategory === topic.slug
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-emerald-400'
            }`}
          >
            {topic.name}
          </Link>
        ))}
      </div>

      {/* Articles */}
      {displayArticles.length > 0 ? (
        <div className="space-y-2">
          {displayArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="font-medium text-gray-500 dark:text-gray-400">No stories found.</p>
          <p className="text-xs text-gray-400 mt-1">Try a different topic or search term.</p>
        </div>
      )}
    </div>
  )
}
