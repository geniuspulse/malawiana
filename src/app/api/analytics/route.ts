import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const range = searchParams.get('range') || '7d' // 7d, 30d, all
    const articleId = searchParams.get('article_id')

    const days = range === '30d' ? 30 : range === 'all' ? 365 : 7
    const since = new Date()
    since.setDate(since.getDate() - days)
    const sinceISO = since.toISOString()

    // Get total views from articles table (always works)
    const { data: articles } = await supabaseAdmin
      .from('malawiana_articles')
      .select('id, title, slug, views, status')
      .order('views', { ascending: false })

    const totalViews = articles?.reduce((sum, a) => sum + (a.views || 0), 0) || 0
    const publishedCount = articles?.filter(a => a.status === 'published').length || 0

    // Try to get analytics data (may fail if table doesn't exist)
    let analyticsData: any = {
      totalViews,
      totalArticles: articles?.length || 0,
      publishedArticles: publishedCount,
      uniqueVisitors: 0,
      dailyTrend: [],
      topArticles: articles?.slice(0, 10).map(a => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        views: a.views || 0,
        uniqueVisitors: null,
      })),
      referrers: [],
    }

    try {
      // Unique visitors in range
      let query = supabaseAdmin
        .from('article_analytics')
        .select('visitor_hash, created_at, article_id, referrer')

      if (range !== 'all') {
        query = query.gte('created_at', sinceISO)
      }

      const { data: events, error: analyticsError } = await query

      if (!analyticsError && events) {
        // Unique visitors
        const uniqueHashes = new Set(events.map((e: any) => e.visitor_hash))
        analyticsData.uniqueVisitors = uniqueHashes.size

        // Daily trend
        const dailyMap: Record<string, { views: number; unique: Set<string> }> = {}
        events.forEach((e: any) => {
          const day = new Date(e.created_at).toISOString().split('T')[0]
          if (!dailyMap[day]) dailyMap[day] = { views: 0, unique: new Set() }
          dailyMap[day].views++
          if (e.visitor_hash) dailyMap[day].unique.add(e.visitor_hash)
        })

        analyticsData.dailyTrend = Object.entries(dailyMap)
          .map(([date, data]) => ({
            date,
            views: data.views,
            uniqueVisitors: data.unique.size,
          }))
          .sort((a, b) => a.date.localeCompare(b.date))
          .slice(-days)

        // Top articles with unique visitor counts
        const articleStats: Record<string, { views: number; unique: Set<string> }> = {}
        events.forEach((e: any) => {
          if (!e.article_id) return
          if (!articleStats[e.article_id]) articleStats[e.article_id] = { views: 0, unique: new Set() }
          articleStats[e.article_id].views++
          if (e.visitor_hash) articleStats[e.article_id].unique.add(e.visitor_hash)
        })

        analyticsData.topArticles = (articles || []).slice(0, 20).map(a => ({
          id: a.id,
          title: a.title,
          slug: a.slug,
          views: a.views || 0,
          uniqueVisitors: articleStats[a.id]?.unique.size || 0,
        })).sort((a: any, b: any) => b.views - a.views).slice(0, 10)

        // Top referrers
        const referrerMap: Record<string, number> = {}
        events.forEach((e: any) => {
          const ref = e.referrer || 'Direct'
          // Simplify referrer to domain
          let domain = ref
          try {
            if (ref !== 'Direct' && ref.startsWith('http')) {
              domain = new URL(ref).hostname
            }
          } catch {}
          referrerMap[domain] = (referrerMap[domain] || 0) + 1
        })

        analyticsData.referrers = Object.entries(referrerMap)
          .map(([source, count]) => ({ source, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
      }
    } catch {
      // Analytics table doesn't exist yet — return basic data
    }

    return NextResponse.json(analyticsData)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
