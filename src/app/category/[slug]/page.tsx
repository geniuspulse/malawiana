import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/ArticleCard'
import type { Metadata } from 'next'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return { title: `${params.slug.charAt(0).toUpperCase() + params.slug.slice(1)} — Malawiana` }
}

export const revalidate = 60

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = params.slug
  const { data: articles } = await supabase
    .from('malawiana_articles')
    .select('*')
    .eq('status', 'published')
    .eq('category', category)
    .order('published_at', { ascending: false })
    .limit(30)

  const displayName = category.charAt(0).toUpperCase() + category.slice(1)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8 pb-6 border-b border-gray-200 dark:border-slate-700">
        <Link href="/explore" className="text-xs text-emerald-600 hover:underline mb-2 inline-block">
          ← All topics
        </Link>
        <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white">{displayName}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{articles?.length || 0} stories</p>
      </div>
      {articles && articles.length > 0 ? (
        <div className="space-y-2">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="font-medium">No stories in this topic yet.</p>
          <Link href="/write" className="mt-4 inline-block bg-emerald-600 text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-emerald-700 transition-colors">
            Write the first one
          </Link>
        </div>
      )}
    </div>
  )
}
