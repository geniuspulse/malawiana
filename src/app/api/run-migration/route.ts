import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This route uses the service role key to create tables via a creative method:
// We create a temporary Postgres function that executes raw SQL, call it, then drop it.

export async function GET() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const sql = `
    CREATE TABLE IF NOT EXISTS writers (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
      display_name text NOT NULL DEFAULT 'Writer',
      username text UNIQUE NOT NULL,
      bio text,
      avatar_url text,
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
  `

  // Try creating a temporary function that runs DDL
  // This is a well-known workaround for running DDL via postgREST
  const { error: createFnError } = await supabaseAdmin.rpc('exec_ddl', { sql_text: sql })
  
  if (createFnError) {
    // Function doesn't exist yet. We can't create it via postgREST either.
    // But we can try inserting into each table to trigger auto-creation if
    // Supabase has auto-table-creation enabled (it doesn't by default).
    
    // The honest answer: DDL must be run via the SQL editor or a direct DB connection.
    return NextResponse.json({
      status: 'needs_manual_sql',
      message: 'Tables could not be auto-created. Run the SQL in Supabase SQL Editor.',
      error: createFnError.message,
      sql_url: '/api/migrate (GET) for the full SQL',
    })
  }

  // Now create RLS policies
  const rlsSql = `
    ALTER TABLE writers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE writer_follows ENABLE ROW LEVEL SECURITY;
    ALTER TABLE malawiana_likes ENABLE ROW LEVEL SECURITY;
    ALTER TABLE malawiana_comments ENABLE ROW LEVEL SECURITY;
    CREATE POLICY IF NOT EXISTS "writers_public_read" ON writers FOR SELECT USING (true);
    CREATE POLICY IF NOT EXISTS "writers_self_insert" ON writers FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY IF NOT EXISTS "writers_self_update" ON writers FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY IF NOT EXISTS "follows_public_read" ON writer_follows FOR SELECT USING (true);
    CREATE POLICY IF NOT EXISTS "follows_self_insert" ON writer_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
    CREATE POLICY IF NOT EXISTS "follows_self_delete" ON writer_follows FOR DELETE USING (auth.uid() = follower_id);
    CREATE POLICY IF NOT EXISTS "likes_public_read" ON malawiana_likes FOR SELECT USING (true);
    CREATE POLICY IF NOT EXISTS "likes_self_insert" ON malawiana_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY IF NOT EXISTS "likes_self_delete" ON malawiana_likes FOR DELETE USING (auth.uid() = user_id);
    CREATE POLICY IF NOT EXISTS "comments_public_read" ON malawiana_comments FOR SELECT USING (is_hidden = false);
    CREATE POLICY IF NOT EXISTS "comments_self_insert" ON malawiana_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY IF NOT EXISTS "comments_self_delete" ON malawiana_comments FOR DELETE USING (auth.uid() = user_id);
  `

  await supabaseAdmin.rpc('exec_ddl', { sql_text: rlsSql })

  // Drop the function
  await supabaseAdmin.rpc('exec_ddl', { sql_text: 'DROP FUNCTION IF EXISTS exec_ddl(text);' })

  return NextResponse.json({ status: 'success', message: 'All tables and policies created.' })
}
