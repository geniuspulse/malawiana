import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/ArticleCard'
import BreakingNewsTicker from '@/components/BreakingNewsTicker'
import NewsletterSignup from '@/components/NewsletterSignup'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Star, BookOpen } from 'lucide-react'
import AdRenderer from '@/components/AdRenderer'

export const revalidate = 60

const CATEGORIES = [
  { name: 'Politics', slug: 'politics', icon: '🏛️', color: 'bg-red-600' },
  { name: 'Business', slug: 'business', icon: '💼', color: 'bg-blue-600' },
  { name: 'Education', slug: 'education', icon: '📚', color: 'bg-yellow-600' },
  { name: 'Technology', slug: 'technology', icon: '💻', color: 'bg-purple-600' },
  { name: 'Agriculture', slug: 'agriculture', icon: '🌾', color: 'bg-green-600' },
  { name: 'Sports', slug: 'sports', icon: '⚽', color: 'bg-emerald-600' },
  { name: 'Entertainment', slug: 'entertainment', icon: '🎬', color: 'bg-pink-600' },
]

export default async function HomePage() {
  const [{ data: featured }, { data: latest }, { data: trending }, { data: opinion }, { data: editorsPicks }] = await Promise.all([
    supabase.from('malawiana_articles').select('*').eq('status', 'published').eq('is_featured', true).order('published_at', { ascending: false }).limit(5),
    supabase.from('malawiana_articles').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(12),
    supabase.from('malawiana_articles').select('*').eq('status', 'published').order('views', { ascending: false }).limit(5),
    supabase.from('malawiana_articles').select('*').eq('status', 'published').eq('category', 'opinion').order('published_at', { ascending: false }).limit(3),
    supabase.from('malawiana_articles').select('*').eq('status', 'published').eq('is_editors_pick', true).order('published_at', { ascending: false }).limit(4),
  ])

  const hero = featured?.[0]
  const secondaryFeatured = featured?.slice(1, 4) || []
  const latestArticles = latest || []
  const trendingArticles = trending || []
  const opinionArticles = opinion || []
  const editorsPickArticles = editorsPicks || []

  return (
    <div>
      <BreakingNewsTicker />
      <AdRenderer placement="header" className="max-w-7xl mx-auto px-4 mt-2" />

      {/* HERO SECTION */}
      {hero && (
        <section className="max-w-7xl mx-auto px-4 pt-6">
          <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Main hero */}
            <div className="lg:col-span-2">
              <ArticleCard article={hero} variant="featured" />
            </div>
            {/* Secondary featured */}
            <div className="flex flex-col gap-4">
              {secondaryFeatured.map(a => (
                <ArticleCard key={a.id} article={a} variant="horizontal" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LATEST NEWS + TRENDING SIDEBAR */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Latest news */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase tracking-wide border-l-4 border-blue-600 pl-3">Latest News</h2>
              <Link href="/latest" className="text-sm text-blue-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">View All <ArrowRight size={14} /></Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {latestArticles.slice(0, 6).map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
            {latestArticles.length === 0 && (
              <div className="col-span-2 text-center py-16 text-gray-400">
                <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
                <p>Stories coming soon. Check back shortly.</p>
              </div>
            )}
          </div>

          {/* Trending sidebar */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={18} className="text-red-500" />
              <h2 className="text-xl font-black uppercase tracking-wide">Trending</h2>
            </div>
            <div className="space-y-5">
              {trendingArticles.map((a, i) => (
                <div key={a.id} className="flex items-start gap-3">
                  <span className="text-3xl font-black text-gray-250 dark:text-gray-700 leading-none w-8 flex-shrink-0">{i + 1}</span>
                  <Link href={`/article/${a.slug}`} className="flex-1 group">
                    <span className="text-xs font-bold text-blue-600 uppercase">{a.category}</span>
                    <h4 className="font-serif font-bold text-sm leading-snug text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-3">{a.title}</h4>
                  </Link>
                </div>
              ))}
              {trendingArticles.length === 0 && <p className="text-gray-400 text-sm">Stories loading soon...</p>}
            </div>

            {/* Live Ad Slot - Sidebar */}
            <AdRenderer placement="sidebar" className="mt-8" />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="bg-gray-50 dark:bg-slate-800/50 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-black uppercase tracking-wide border-l-4 border-blue-600 pl-3 mb-6">Browse by Topic</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-2 bg-white dark:bg-slate-800 rounded-xl p-4 hover:shadow-md transition-all group border border-gray-100 dark:border-slate-700 hover:border-blue-300">
                <div className={`w-10 h-10 rounded-full ${cat.color} flex items-center justify-center text-lg`}>{cat.icon}</div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* EDITOR'S PICKS */}
      {editorsPickArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-2 mb-6">
            <Star size={18} className="text-yellow-500 fill-yellow-500" />
            <h2 className="text-xl font-black uppercase tracking-wide">Editor's Picks</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {editorsPickArticles.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        </section>
      )}

      {/* OPINION */}
      {opinionArticles.length > 0 && (
        <section className="bg-slate-900 text-white py-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase tracking-wide border-l-4 border-red-500 pl-3">Opinion</h2>
              <Link href="/opinion" className="text-sm text-blue-400 flex items-center gap-1">All Opinion <ArrowRight size={14} /></Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {opinionArticles.map(a => (
                <Link key={a.id} href={`/article/${a.slug}`} className="group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">{(a.author_name || 'M')[0]}</div>
                    <div>
                      <p className="font-semibold text-sm">{a.author_name || 'Editor'}</p>
                      <p className="text-xs text-gray-400">{a.author_title || 'Columnist'}</p>
                    </div>
                  </div>
                  <h3 className="font-serif font-bold leading-snug group-hover:text-blue-400 transition-colors line-clamp-3">{a.title}</h3>
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{a.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEWSLETTER */}
      <NewsletterSignup />
    </div>
  )
}

