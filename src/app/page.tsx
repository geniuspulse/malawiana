import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/ArticleCard'
import NewsletterSignup from '@/components/NewsletterSignup'
import Link from 'next/link'
import { BookOpen, Sparkles, TrendingUp, UserPlus, ArrowRight, Rss } from 'lucide-react'
import AdRenderer from '@/components/AdRenderer'

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
  { name: 'Culture', slug: 'culture' }
]

const FALLBACK_WRITERS = [
  { id: '1', display_name: 'Bright Mtika', username: 'brightm', bio: 'Journalist and tech enthusiast reporting from Lilongwe.', avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Bright%20Mtika', is_verified: true },
  { id: '2', display_name: 'Chisomo Banda', username: 'chisomob', bio: 'Writings on economic policy, culture and development in Malawi.', avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Chisomo%20Banda', is_verified: false },
  { id: '3', display_name: 'Limbani Phiri', username: 'limbanip', bio: 'Agriculture expert & food systems researcher.', avatar_url: 'https://api.dicebear.com/7.x/initials/svg?seed=Limbani%20Phiri', is_verified: true }
]

export default async function HomePage() {
  // Fetch latest 15 published articles
  const { data: articles } = await supabase
    .from('malawiana_articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(15)

  // Fetch trending articles (by views)
  const { data: trending } = await supabase
    .from('malawiana_articles')
    .select('*')
    .eq('status', 'published')
    .order('views', { ascending: false })
    .limit(4)

  // Fetch popular writers
  let writers = null
  try {
    const { data } = await supabase
      .from('writers')
      .select('*')
      .order('total_views', { ascending: false })
      .limit(3)
    writers = data
  } catch (e) {
    // Graceful fallback if writers table isn't created yet or fails
    console.error('Error loading writers:', e)
  }

  const activeWriters = writers && writers.length > 0 ? writers : FALLBACK_WRITERS
  const latestArticles = articles || []
  const trendingArticles = trending || []

  return (
    <div className="bg-white dark:bg-slate-900">
      {/* 1. HERO SECTION */}
      <section className="border-b border-gray-150 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/20 py-10 sm:py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-black tracking-tight text-gray-950 dark:text-white mb-4 sm:mb-6">
            Malawiana
          </h1>
          <p className="text-base sm:text-lg md:text-xl font-medium text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
            Stories from the heart of Malawi. Join our open writing platform to read, write, and earn from your perspectives.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              href="/auth" 
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-full shadow-sm hover:shadow transition-all text-center text-sm"
            >
              Start Writing
            </Link>
            <Link 
              href="/explore" 
              className="w-full sm:w-auto border border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600 text-gray-700 dark:text-gray-200 font-semibold px-8 py-3 rounded-full transition-all text-center text-sm"
            >
              Explore Stories
            </Link>
          </div>
        </div>
      </section>

      {/* 2. TRENDING TOPICS (Horizontal Scroll) */}
      <section className="border-b border-gray-100 dark:border-slate-800/80 py-4 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1 shrink-0">
            <Sparkles size={12} className="text-emerald-600 fill-emerald-600" />
            Topics
          </span>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 mask-linear-right pr-6">
            {TOPICS.map((topic) => (
              <Link 
                key={topic.slug} 
                href={`/explore?category=${topic.slug}`}
                className="bg-gray-100 hover:bg-gray-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border border-gray-150/50 dark:border-slate-700/50"
              >
                {topic.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. MAIN CONTENT: FEED + SIDEBAR */}
      <section className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Feed (Left) */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-slate-800/85 pb-4">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen size={18} className="text-emerald-600" />
                Latest Stories
              </h2>
            </div>

            {latestArticles.length > 0 ? (
              <div className="space-y-2">
                {latestArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-450 border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl">
                <Rss size={44} className="mx-auto mb-4 text-gray-300 dark:text-slate-700" />
                <p className="font-medium text-gray-600 dark:text-gray-400">No stories found.</p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">Be the first to share a story with the world of Malawiana!</p>
                <Link href="/write" className="mt-5 inline-block bg-emerald-600 text-white font-semibold text-xs px-5 py-2.5 rounded-full hover:bg-emerald-700 transition-colors">
                  Create a Story
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-4 space-y-12">
            {/* Trending Sidebar */}
            {trendingArticles.length > 0 && (
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-600" />
                  Trending on Malawiana
                </h3>
                <div className="space-y-6">
                  {trendingArticles.map((art, i) => (
                    <div key={art.id} className="flex gap-4 items-start">
                      <span className="text-2xl font-serif font-black text-gray-200 dark:text-slate-700 leading-none shrink-0 w-6">
                        0{i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                            {art.category}
                          </span>
                        </div>
                        <Link href={`/article/${art.slug}`} className="group block">
                          <h4 className="font-serif font-bold text-sm leading-snug text-gray-950 dark:text-gray-150 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                            {art.title}
                          </h4>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Who to Follow */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <UserPlus size={16} className="text-emerald-600" />
                Who to Follow
              </h3>
              <div className="space-y-5">
                {activeWriters.map((wt) => (
                  <div key={wt.id} className="flex items-center justify-between gap-4">
                    <Link href={`/writer/${wt.username}`} className="flex items-center gap-3 group shrink-0 max-w-[75%] sm:max-w-[70%]">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800 shrink-0 border border-gray-150 dark:border-slate-800">
                        <img 
                          src={wt.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(wt.display_name)}`} 
                          alt={wt.display_name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                          {wt.display_name}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 truncate mt-0.5">
                          {wt.bio || `@${wt.username}`}
                        </p>
                      </div>
                    </Link>
                    <Link 
                      href={`/writer/${wt.username}`} 
                      className="border border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1 rounded-full text-[11px] transition-colors whitespace-nowrap"
                    >
                      Follow
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Ad Slot */}
            <AdRenderer placement="sidebar" />

            {/* Newsletter Signup Widget */}
            <NewsletterSignup />
          </div>
        </div>
      </section>
    </div>
  )
}
