import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/ArticleCard'

export const revalidate = 30

export default async function LatestPage() {
  const { data: articles } = await supabase.from('malawiana_articles').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(30)
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black uppercase tracking-wide border-b border-gray-200 dark:border-slate-700 pb-6 mb-8">Latest News</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {articles?.map(a => <ArticleCard key={a.id} article={a} />)}
      </div>
    </div>
  )
}
