-- Articles table
create table if not exists articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  summary text,
  body text,
  featured_image text,
  image_caption text,
  author_name text default 'Malawiana Staff',
  author_title text,
  author_bio text,
  author_avatar text,
  category text not null default 'general',
  tags text[] default '{}',
  status text default 'draft' check (status in ('draft', 'published', 'scheduled', 'archived')),
  is_featured boolean default false,
  is_breaking boolean default false,
  is_editors_pick boolean default false,
  views integer default 0,
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Newsletter subscribers
create table if not exists newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  status text default 'active' check (status in ('active', 'unsubscribed')),
  subscribed_at timestamptz default now()
);

-- Contact messages
create table if not exists contact_messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text default 'new' check (status in ('new', 'read', 'replied')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table articles enable row level security;
alter table newsletter_subscribers enable row level security;
alter table contact_messages enable row level security;

-- Public can read published articles
create policy "Public read articles" on articles for select using (status = 'published');
-- Public can insert subscribers and messages
create policy "Public subscribe" on newsletter_subscribers for insert with check (true);
create policy "Public contact" on contact_messages for insert with check (true);
-- Authenticated (admin) can do everything
create policy "Admin all articles" on articles for all using (auth.role() = 'authenticated');
create policy "Admin all subscribers" on newsletter_subscribers for all using (auth.role() = 'authenticated');
create policy "Admin all messages" on contact_messages for all using (auth.role() = 'authenticated');

-- Indexes
create index if not exists idx_articles_status on articles(status);
create index if not exists idx_articles_category on articles(category);
create index if not exists idx_articles_slug on articles(slug);
create index if not exists idx_articles_published_at on articles(published_at desc);
create index if not exists idx_articles_views on articles(views desc);
