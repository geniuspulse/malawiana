import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/ArticleCard'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  return { title: `${params.slug.charAt(0).toUpperCase() + params.slug.slice(1)} News | Malawiana` }
}

export const revalidate = 60

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = params.slug
  const { data: articles } = await supabase.from('malawiana_articles').select('*').eq('status', 'published').eq('category', category).order('published_at', { ascending: false }).limit(20)
  const displayName = category.charAt(0).toUpperCase() + category.slice(1)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="border-b border-gray-200 dark:border-slate-700 pb-6 mb-8">
        <h1 className="text-3xl font-black uppercase tracking-wide">{displayName}</h1>
        <p className="text-gray-500 mt-1">{articles?.length || 0} stories</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {articles?.map(a => <ArticleCard key={a.id} article={a} />)}
        {(!articles || articles.length === 0) && (
          <p className="col-span-4 text-center text-gray-400 py-20">No stories in this category yet.</p>
        )}
      </div>
    </div>
  )
}
