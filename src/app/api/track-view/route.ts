import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Service-role client — bypasses RLS so anonymous readers can register a view
// without opening up public UPDATE access on the articles table.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

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

    const { error: updateError } = await supabaseAdmin
      .from('malawiana_articles')
      .update({ views: (article.views || 0) + 1 })
      .eq('id', article.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 })
  }
}
