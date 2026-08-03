import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const results: string[] = []

  // We can't run DDL via the REST API, so we test each table and report status.
  // The tables should be created via the Supabase SQL editor using the SQL below.

  const tables = ['writers', 'writer_follows', 'malawiana_likes', 'malawiana_comments']
  for (const table of tables) {
    const { error } = await supabaseAdmin.from(table).select('id').limit(1)
    results.push(`${table}: ${error ? '❌ MISSING' : '✅ EXISTS'}`)
  }

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

  return NextResponse.json({
    status: 'Check complete',
    results,
    sql_to_run: `
-- Run this in the Supabase SQL Editor:

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

CREATE TABLE IF NOT EXISTS writer_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  writer_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, writer_id)
);

CREATE TABLE IF NOT EXISTS malawiana_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(article_id, user_id)
);

CREATE TABLE IF NOT EXISTS malawiana_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  user_id uuid,
  author_name text NOT NULL DEFAULT 'Anonymous',
  content text NOT NULL,
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE malawiana_articles ADD COLUMN IF NOT EXISTS writer_id uuid;
ALTER TABLE malawiana_articles ADD COLUMN IF NOT EXISTS cover_image text;
ALTER TABLE malawiana_articles ADD COLUMN IF NOT EXISTS reading_time int DEFAULT 5;
ALTER TABLE malawiana_articles ADD COLUMN IF NOT EXISTS likes_count int DEFAULT 0;

-- Analytics table for per-article visitor tracking
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

-- Enable RLS
ALTER TABLE writers ENABLE ROW LEVEL SECURITY;
ALTER TABLE writer_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE malawiana_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE malawiana_comments ENABLE ROW LEVEL SECURITY;

-- Public read for writers, self-write
CREATE POLICY "writers_public_read" ON writers FOR SELECT USING (true);
CREATE POLICY "writers_self_insert" ON writers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "writers_self_update" ON writers FOR UPDATE USING (auth.uid() = user_id);

-- Public read for follows, authenticated can insert
CREATE POLICY "follows_public_read" ON writer_follows FOR SELECT USING (true);
CREATE POLICY "follows_self_insert" ON writer_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_self_delete" ON writer_follows FOR DELETE USING (auth.uid() = follower_id);

-- Likes: public read, auth users can insert/delete own
CREATE POLICY "likes_public_read" ON malawiana_likes FOR SELECT USING (true);
CREATE POLICY "likes_self_insert" ON malawiana_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_self_delete" ON malawiana_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments: public read, auth users can insert, own delete
CREATE POLICY "comments_public_read" ON malawiana_comments FOR SELECT USING (is_hidden = false);
CREATE POLICY "comments_self_insert" ON malawiana_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_self_delete" ON malawiana_comments FOR DELETE USING (auth.uid() = user_id);
`,
  })
}
