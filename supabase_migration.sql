
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
