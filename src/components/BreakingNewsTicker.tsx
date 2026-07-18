import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Flame } from 'lucide-react'

export const revalidate = 60

export default async function BreakingNewsTicker() {
  // Fetch latest 5 published articles as breaking news
  const { data: articles } = await supabase
    .from('malawiana_articles')
    .select('id, title, slug')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(5)

  if (!articles || articles.length === 0) {
    // If no articles exist in database, display a fallback ticker
    const fallbackArticles = [
      { id: 'fb-1', title: 'Welcome to Malawiana.com - Your source for credible journalism in Malawi.', slug: '#' },
      { id: 'fb-2', title: 'Breaking: Malawiana launches digital platform for national news and opinions.', slug: '#' }
    ]
    return (
      <div className="bg-red-600 text-white py-2.5 px-4 overflow-hidden border-b border-red-700">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-1 bg-black/20 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded shrink-0 animate-pulse">
            <Flame size={14} className="fill-white" />
            <span>Breaking</span>
          </div>
          <div className="relative flex-1 overflow-hidden h-5">
            <div className="absolute flex gap-12 whitespace-nowrap animate-marquee hover:[animation-play-state:paused] cursor-pointer">
              {fallbackArticles.map((art) => (
                <div key={art.id} className="font-semibold text-sm flex items-center gap-2">
                  <span>✦</span>
                  <span>{art.title}</span>
                </div>
              ))}
              {/* Duplicate */}
              {fallbackArticles.map((art) => (
                <div key={`dup-${art.id}`} className="font-semibold text-sm flex items-center gap-2">
                  <span>✦</span>
                  <span>{art.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-red-600 text-white py-2.5 px-4 overflow-hidden border-b border-red-700">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="flex items-center gap-1 bg-black/20 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded shrink-0 animate-pulse">
          <Flame size={14} className="fill-white" />
          <span>Breaking News</span>
        </div>
        <div className="relative flex-1 overflow-hidden h-5">
          <div className="absolute flex gap-12 whitespace-nowrap animate-marquee hover:[animation-play-state:paused] cursor-pointer">
            {articles.map((art) => (
              <Link key={art.id} href={`/article/${art.slug}`} className="hover:underline font-semibold text-sm flex items-center gap-2">
                <span>✦</span>
                <span>{art.title}</span>
              </Link>
            ))}
            {/* Duplicate for infinite loop animation */}
            {articles.map((art) => (
              <Link key={`dup-${art.id}`} href={`/article/${art.slug}`} className="hover:underline font-semibold text-sm flex items-center gap-2">
                <span>✦</span>
                <span>{art.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
