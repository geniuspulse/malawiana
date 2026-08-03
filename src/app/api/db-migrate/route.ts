import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({}))
  if (token !== 'malawiana-migrate-2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectRef = 'pfbaepibelomiutlotkn'
  const results: string[] = []
  const passwords = ['Arthur@472003Chibondo']
  
  const hosts = [
    { type: 'direct', host: `db.${projectRef}.supabase.co`, port: 5432, user: 'postgres' },
    { type: 'pooler-us-east-1', host: 'aws-0-us-east-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'pooler-us-west-1', host: 'aws-0-us-west-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'pooler-eu-west-1', host: 'aws-0-eu-west-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'pooler-eu-central-1', host: 'aws-0-eu-central-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'pooler-ap-southeast-1', host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
    { type: 'pooler-ap-northeast-1', host: 'aws-0-ap-northeast-1.pooler.supabase.com', port: 6543, user: `postgres.${projectRef}` },
  ]

  let connected = false
  
  for (const h of hosts) {
    for (const pwd of passwords) {
      if (connected) break
      try {
        const pool = new Pool({
          host: h.host,
          database: 'postgres',
          user: h.user,
          password: pwd,
          port: h.port,
          connectionTimeoutMillis: 10000,
          ssl: { rejectUnauthorized: false },
        })
        
        const client = await pool.connect()
        results.push(`✅ Connected via ${h.type}`)
        connected = true
        
        const ddl = `
          CREATE TABLE IF NOT EXISTS writers (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
            display_name text NOT NULL DEFAULT 'Writer',
            username text UNIQUE NOT NULL,
            bio text, avatar_url text, cover_url text, website text, twitter text,
            total_views bigint DEFAULT 0, is_verified boolean DEFAULT false,
            created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
          );
          ALTER TABLE writers ENABLE ROW LEVEL SECURITY;
          CREATE POLICY IF NOT EXISTS "writers_public_read" ON writers FOR SELECT USING (true);
          CREATE POLICY IF NOT EXISTS "writers_self_insert" ON writers FOR INSERT WITH CHECK (auth.uid() = user_id);
          CREATE POLICY IF NOT EXISTS "writers_self_update" ON writers FOR UPDATE USING (auth.uid() = user_id);

          CREATE TABLE IF NOT EXISTS writer_follows (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            follower_id uuid NOT NULL, writer_id uuid NOT NULL,
            created_at timestamptz DEFAULT now(), UNIQUE(follower_id, writer_id)
          );
          ALTER TABLE writer_follows ENABLE ROW LEVEL SECURITY;
          CREATE POLICY IF NOT EXISTS "follows_public_read" ON writer_follows FOR SELECT USING (true);
          CREATE POLICY IF NOT EXISTS "follows_self_insert" ON writer_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
          CREATE POLICY IF NOT EXISTS "follows_self_delete" ON writer_follows FOR DELETE USING (auth.uid() = follower_id);

          CREATE TABLE IF NOT EXISTS malawiana_likes (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            article_id uuid NOT NULL, user_id uuid NOT NULL,
            created_at timestamptz DEFAULT now(), UNIQUE(article_id, user_id)
          );
          ALTER TABLE malawiana_likes ENABLE ROW LEVEL SECURITY;
          CREATE POLICY IF NOT EXISTS "likes_public_read" ON malawiana_likes FOR SELECT USING (true);
          CREATE POLICY IF NOT EXISTS "likes_self_insert" ON malawiana_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
          CREATE POLICY IF NOT EXISTS "likes_self_delete" ON malawiana_likes FOR DELETE USING (auth.uid() = user_id);

          CREATE TABLE IF NOT EXISTS malawiana_comments (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            article_id uuid NOT NULL, user_id uuid,
            author_name text NOT NULL DEFAULT 'Anonymous',
            content text NOT NULL, is_hidden boolean DEFAULT false,
            created_at timestamptz DEFAULT now()
          );
          ALTER TABLE malawiana_comments ENABLE ROW LEVEL SECURITY;
          CREATE POLICY IF NOT EXISTS "comments_public_read" ON malawiana_comments FOR SELECT USING (is_hidden = false);
          CREATE POLICY IF NOT EXISTS "comments_self_insert" ON malawiana_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
          CREATE POLICY IF NOT EXISTS "comments_self_delete" ON malawiana_comments FOR DELETE USING (auth.uid() = user_id);

          CREATE TABLE IF NOT EXISTS article_analytics (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            article_id uuid, visitor_hash varchar(32), referrer text, user_agent text,
            created_at timestamptz DEFAULT now()
          );
          ALTER TABLE article_analytics ENABLE ROW LEVEL SECURITY;
          CREATE POLICY IF NOT EXISTS "analytics_service_role" ON article_analytics FOR ALL USING (true);
          CREATE INDEX IF NOT EXISTS idx_analytics_article_id ON article_analytics(article_id);
          CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON article_analytics(created_at);
          CREATE INDEX IF NOT EXISTS idx_analytics_visitor_hash ON article_analytics(visitor_hash);

          ALTER TABLE malawiana_articles ADD COLUMN IF NOT EXISTS writer_id uuid;
          ALTER TABLE malawiana_articles ADD COLUMN IF NOT EXISTS cover_image text;
          ALTER TABLE malawiana_articles ADD COLUMN IF NOT EXISTS reading_time int DEFAULT 5;
          ALTER TABLE malawiana_articles ADD COLUMN IF NOT EXISTS likes_count int DEFAULT 0;
        `
        
        await client.query(ddl)
        results.push('✅ All tables created')
        
        const tables = ['writers', 'writer_follows', 'malawiana_likes', 'malawiana_comments', 'article_analytics']
        for (const t of tables) {
          const check = await client.query(`SELECT count(*) FROM information_schema.tables WHERE table_name = '${t}'`)
          results.push(`${t}: ${check.rows[0].count > 0 ? '✅' : '❌'}`)
        }
        
        client.release()
        await pool.end()
      } catch (e: any) {
        const msg = e.message.substring(0, 100)
        if (!results.some(r => r.includes(msg))) {
          results.push(`❌ ${h.type}: ${msg}`)
        }
      }
    }
  }
  
  if (!connected) {
    results.push('Could not connect to database with any host/password combination')
  }
  
  return NextResponse.json({ results })
}
