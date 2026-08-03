import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

function hashVisitor(ip: string, userAgent: string): string {
  return createHash('sha256').update(ip + userAgent).digest('hex').substring(0, 32)
}

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json()
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 })
    }

    const { data: article, error: fetchError } = await supabaseAdmin
      .from('malawiana_articles')
      .select('id, views')
      .eq('slug', slug)
      .single()

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Increment total views
    const { error: updateError } = await supabaseAdmin
      .from('malawiana_articles')
      .update({ views: (article.views || 0) + 1 })
      .eq('id', article.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log analytics event (best-effort — don't fail the request if analytics table doesn't exist)
    try {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
      const userAgent = req.headers.get('user-agent') || 'unknown'
      const visitorHash = hashVisitor(ip, userAgent)
      const referrer = req.headers.get('referer') || req.headers.get('referrer') || null

      await supabaseAdmin
        .from('article_analytics')
        .insert({
          article_id: article.id,
          visitor_hash: visitorHash,
          referrer: referrer,
          user_agent: userAgent.substring(0, 255),
        })
    } catch {
      // Analytics table might not exist yet — silently skip
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 })
  }
}
