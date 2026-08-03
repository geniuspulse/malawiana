import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}))
  if (token !== 'malawiana-migrate-2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabaseAdmin = createClient(url, serviceKey, { auth: { persistSession: false } })
  const results: string[] = []

  // ── Check each table ──
  const tables = [
    { name: 'writers', ddl: `
      CREATE TABLE IF NOT EXISTS writers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
        display_name text NOT NULL DEFAULT 'Writer',
        username text UNIQUE NOT NULL,
        bio text,
        avatar_url text,
        cover_url text,
        website text,
        twitter text,
        total_views bigint DEFAULT 0,
        is_verified boolean DEFAULT false,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
      ALTER TABLE writers ENABLE ROW LEVEL SECURITY;
      CREATE POLICY IF NOT EXISTS "writers_public_read" ON writers FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "writers_self_insert" ON writers FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "writers_self_update" ON writers FOR UPDATE USING (auth.uid() = user_id);
    `},
    { name: 'writer_follows', ddl: `
      CREATE TABLE IF NOT EXISTS writer_follows (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        follower_id uuid NOT NULL,
        writer_id uuid NOT NULL,
        created_at timestamptz DEFAULT now(),
        UNIQUE(follower_id, writer_id)
      );
      ALTER TABLE writer_follows ENABLE ROW LEVEL SECURITY;
      CREATE POLICY IF NOT EXISTS "follows_public_read" ON writer_follows FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "follows_self_insert" ON writer_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
      CREATE POLICY IF NOT EXISTS "follows_self_delete" ON writer_follows FOR DELETE USING (auth.uid() = follower_id);
    `},
    { name: 'malawiana_likes', ddl: `
      CREATE TABLE IF NOT EXISTS malawiana_likes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        article_id uuid NOT NULL,
        user_id uuid NOT NULL,
        created_at timestamptz DEFAULT now(),
        UNIQUE(article_id, user_id)
      );
      ALTER TABLE malawiana_likes ENABLE ROW LEVEL SECURITY;
      CREATE POLICY IF NOT EXISTS "likes_public_read" ON malawiana_likes FOR SELECT USING (true);
      CREATE POLICY IF NOT EXISTS "likes_self_insert" ON malawiana_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "likes_self_delete" ON malawiana_likes FOR DELETE USING (auth.uid() = user_id);
    `},
    { name: 'malawiana_comments', ddl: `
      CREATE TABLE IF NOT EXISTS malawiana_comments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        article_id uuid NOT NULL,
        user_id uuid,
        author_name text NOT NULL DEFAULT 'Anonymous',
        content text NOT NULL,
        is_hidden boolean DEFAULT false,
        created_at timestamptz DEFAULT now()
      );
      ALTER TABLE malawiana_comments ENABLE ROW LEVEL SECURITY;
      CREATE POLICY IF NOT EXISTS "comments_public_read" ON malawiana_comments FOR SELECT USING (is_hidden = false);
      CREATE POLICY IF NOT EXISTS "comments_self_insert" ON malawiana_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY IF NOT EXISTS "comments_self_delete" ON malawiana_comments FOR DELETE USING (auth.uid() = user_id);
    `},
    { name: 'article_analytics', ddl: `
      CREATE TABLE IF NOT EXISTS article_analytics (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        article_id uuid,
        visitor_hash varchar(32),
        referrer text,
        user_agent text,
        created_at timestamptz DEFAULT now()
      );
      ALTER TABLE article_analytics ENABLE ROW LEVEL SECURITY;
      CREATE POLICY IF NOT EXISTS "analytics_service_role" ON article_analytics FOR ALL USING (true);
      CREATE INDEX IF NOT EXISTS idx_analytics_article_id ON article_analytics(article_id);
      CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON article_analytics(created_at);
      CREATE INDEX IF NOT EXISTS idx_analytics_visitor_hash ON article_analytics(visitor_hash);
    `},
  ]

  // Check articles columns
  const { data: articles } = await supabaseAdmin
    .from('malawiana_articles')
    .select('writer_id, cover_image, reading_time, likes_count')
    .limit(1)

  if (articles && articles.length > 0) {
    results.push('articles columns: ✅ EXISTS')
  } else {
    results.push('articles columns: ⚠️ Could not verify (no rows or missing columns)')
  }

  // ── Check + create each table ──
  const projectRef = url.match(/\/\/(.+?)\.supabase/)?.[1]
  const missingDDL: string[] = []

  for (const { name, ddl } of tables) {
    const { error } = await supabaseAdmin.from(name).select('id').limit(1)
    if (error && error.code === '42P01') {
      results.push(`${name}: ❌ MISSING — will create`)
      missingDDL.push(ddl)
    } else if (error) {
      results.push(`${name}: ⚠️ ${error.message}`)
    } else {
      results.push(`${name}: ✅ EXISTS`)
    }
  }

  // Add column migration for articles
  missingDDL.push(`
    ALTER TABLE malawiana_articles ADD COLUMN IF NOT EXISTS writer_id uuid;
    ALTER TABLE malawiana_articles ADD COLUMN IF NOT EXISTS cover_image text;
    ALTER TABLE malawiana_articles ADD COLUMN IF NOT EXISTS reading_time int DEFAULT 5;
    ALTER TABLE malawiana_articles ADD COLUMN IF NOT EXISTS likes_count int DEFAULT 0;
  `)

  // ── Execute DDL via Supabase Management API ──
  if (missingDDL.length > 0) {
    try {
      const pgRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: missingDDL.join('\n') })
      })

      if (pgRes.ok) {
        results.push('DDL: ✅ All missing tables/columns created')
      } else {
        const errText = await pgRes.text()
        results.push(`DDL: ⚠️ Management API returned ${pgRes.status}: ${errText.substring(0, 300)}`)
      }
    } catch (e: any) {
      results.push(`DDL: ❌ ${e.message}`)
    }
  } else {
    results.push('DDL: ⏭️ Nothing to create')
  }

  return NextResponse.json({ results })
}

// Keep the old GET for backward compat
export async function GET() {
  return NextResponse.json({ message: 'Use POST with { "token": "malawiana-migrate-2026" } to run migrations' })
}
