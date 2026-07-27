export interface Article {
  id?: string
  title: string
  slug: string
  summary?: string
  body?: string
  featured_image?: string
  image_caption?: string
  author_name?: string
  author_title?: string
  author_bio?: string
  author_avatar?: string
  category: string
  tags?: string[]
  status: 'draft' | 'published' | 'scheduled' | 'archived' | string
  is_featured?: boolean
  is_breaking?: boolean
  is_editors_pick?: boolean
  views?: number
  scheduled_at?: string | null
  published_at?: string | null
  youtube_video_id?: string | null
  created_at?: string
  updated_at?: string
}

export interface Subscriber {
  id: string
  email: string
  name?: string | null
  status: 'active' | 'unsubscribed' | string
  subscribed_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  subject?: string | null
  message: string
  status: 'new' | 'read' | 'replied' | string
  created_at: string
}
