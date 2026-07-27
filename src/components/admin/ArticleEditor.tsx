'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Article } from '@/types'

const CATEGORIES = [
  { value: 'politics', label: 'Politics & Governance' },
  { value: 'business', label: 'Business & Finance' },
  { value: 'sports', label: 'Sports' },
  { value: 'entertainment', label: 'Entertainment & Arts' },
  { value: 'lifestyle', label: 'Lifestyle & Culture' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health & Medicine' },
  { value: 'technology', label: 'Science & Tech' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'environment', label: 'Environment' },
  { value: 'opinion', label: 'Opinion & Editorial' },
  { value: 'international', label: 'International' },
  { value: 'law-justice', label: 'Law & Justice' },
  { value: 'general', label: 'General News' }
]

const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'archived', label: 'Archived' }
]

interface ArticleEditorProps {
  initialData?: Article
}

export default function ArticleEditor({ initialData }: ArticleEditorProps) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    body: '',
    featured_image: '',
    image_caption: '',
    author_name: 'Malawiana Staff',
    author_title: 'Senior Journalist',
    author_bio: '',
    author_avatar: '',
    category: 'general',
    tagsInput: '',
    status: 'draft',
    is_featured: false,
    is_breaking: false,
    is_editors_pick: false,
    scheduled_at: '',
    youtube_video_id: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [slugManual, setSlugManual] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        slug: initialData.slug || '',
        summary: initialData.summary || '',
        body: initialData.body || '',
        featured_image: initialData.featured_image || '',
        image_caption: initialData.image_caption || '',
        author_name: initialData.author_name || 'Malawiana Staff',
        author_title: initialData.author_title || 'Senior Journalist',
        author_bio: initialData.author_bio || '',
        author_avatar: initialData.author_avatar || '',
        category: initialData.category || 'general',
        tagsInput: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
        status: initialData.status || 'draft',
        is_featured: !!initialData.is_featured,
        is_breaking: !!initialData.is_breaking,
        is_editors_pick: !!initialData.is_editors_pick,
        scheduled_at: initialData.scheduled_at 
          ? new Date(initialData.scheduled_at).toISOString().slice(0, 16)
          : '',
        youtube_video_id: initialData.youtube_video_id || ''
      })
      setSlugManual(true)
    }
  }, [initialData])

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData(prev => {
      const updated = { ...prev, title }
      if (!slugManual) {
        updated.slug = slugify(title)
      }
      return updated
    })
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManual(true)
    setFormData(prev => ({ ...prev, slug: slugify(e.target.value) }))
  }

  const handleSubmit = async (e: React.FormEvent, forceStatus?: string) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const finalStatus = forceStatus || formData.status
    const tags = formData.tagsInput
      ? formData.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      : []

    const articlePayload: Partial<Article> = {
      title: formData.title,
      slug: formData.slug || slugify(formData.title),
      summary: formData.summary,
      body: formData.body,
      featured_image: formData.featured_image,
      image_caption: formData.image_caption,
      author_name: formData.author_name,
      author_title: formData.author_title,
      author_bio: formData.author_bio,
      author_avatar: formData.author_avatar,
      category: formData.category,
      tags,
      status: finalStatus,
      is_featured: formData.is_featured,
      is_breaking: formData.is_breaking,
      is_editors_pick: formData.is_editors_pick,
      scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null,
      updated_at: new Date().toISOString(),
      youtube_video_id: formData.youtube_video_id || null
    }

    if (finalStatus === 'published') {
      articlePayload.published_at = initialData?.published_at || new Date().toISOString()
    }

    try {
      if (isEdit && initialData) {
        const { error: updateError } = await supabase
          .from('malawiana_articles')
          .update(articlePayload)
          .eq('id', initialData.id)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('malawiana_articles')
          .insert([{ ...articlePayload, views: 0 }])

        if (insertError) throw insertError
      }

      setSuccess(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => {
        router.push('/admin/articles')
        router.refresh()
      }, 1500)
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err)
      setError(errMsg || 'Something went wrong saving the article.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Articles Workspace</span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Article' : 'Create New Article'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg transition-all"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-lg shadow-blue-500/10"
          >
            <Save size={16} />
            Publish Now
          </button>
        </div>
      </div>

      {/* Alert Notifications */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-900/30 flex gap-3 items-start">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <div>{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm border border-emerald-200 dark:border-emerald-900/30 flex gap-3 items-start">
          <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
          <div>Article saved successfully! Redirecting back to articles...</div>
        </div>
      )}

      {/* Main Form Fields */}
      <form onSubmit={(e) => handleSubmit(e)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Main Editorial Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Article Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Enter a compelling, high-quality headline..."
                className="w-full px-4 py-3 text-lg font-semibold rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Slug (URL Path)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setSlugManual(false)
                    setFormData(prev => ({ ...prev, slug: slugify(prev.title) }))
                  }}
                  className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Sparkles size={12} /> Auto-generate
                </button>
              </div>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-400 text-sm">
                  malawiana.com/
                </span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="article-slug-path"
                  className="flex-1 min-w-0 px-4 py-2 rounded-r-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Lead Summary (Snippet)
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Write a concise paragraph summarizing the story. This appears on lists and social shares."
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Body Content
              </label>
              <textarea
                required
                value={formData.body}
                onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Write the full report here. Support formatting using custom markup if needed."
                rows={18}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm font-sans"
              />
            </div>
          </div>

          {/* Media Section */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Media Assets</h3>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Featured Image URL
              </label>
              <input
                type="url"
                value={formData.featured_image}
                onChange={(e) => setFormData(prev => ({ ...prev, featured_image: e.target.value }))}
                placeholder="https://images.unsplash.com/... or a public upload link"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
              />
            </div>


            {/* YouTube Video ID */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                YouTube Video ID <span className="text-gray-400 font-normal normal-case">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.youtube_video_id}
                onChange={(e) => setFormData(prev => ({ ...prev, youtube_video_id: e.target.value }))}
                placeholder="e.g. dQw4w9WgXcQ"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">Paste just the video ID from youtube.com/watch?v=<strong>ID</strong></p>
              {formData.youtube_video_id && (
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${formData.youtube_video_id}/hqdefault.jpg`}
                    alt="YouTube thumbnail preview"
                    className="w-full h-auto"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <p className="text-xs text-center text-gray-400 py-1.5">Thumbnail preview</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Image Caption
              </label>
              <input
                type="text"
                value={formData.image_caption}
                onChange={(e) => setFormData(prev => ({ ...prev, image_caption: e.target.value }))}
                placeholder="Who or what is pictured in this featured image? Credit the photographer."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
              />
            </div>

            {formData.featured_image && (
              <div className="mt-2 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden relative aspect-video bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.featured_image}
                  alt="Featured Preview"
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    ;(e.target as HTMLElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          {/* Author Details Section */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Author Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Author Name
                </label>
                <input
                  type="text"
                  value={formData.author_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Author Title / Role
                </label>
                <input
                  type="text"
                  value={formData.author_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, author_title: e.target.value }))}
                  placeholder="Senior Correspondent, Editor-In-Chief"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Author Bio
                </label>
                <input
                  type="text"
                  value={formData.author_bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, author_bio: e.target.value }))}
                  placeholder="Short editorial biography..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Author Avatar URL
                </label>
                <input
                  type="url"
                  value={formData.author_avatar}
                  onChange={(e) => setFormData(prev => ({ ...prev, author_avatar: e.target.value }))}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Taxonomy, Status & Visibility Options */}
        <div className="space-y-6">
          {/* Status & Schedule */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Publishing Controls</h3>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Article Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm appearance-none cursor-pointer"
              >
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Scheduled Date/Time
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm cursor-pointer"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Only relevant if status is set to &apos;Scheduled&apos;.
              </p>
            </div>
          </div>

          {/* Taxonomy / Categories / Tags */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Taxonomy</h3>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Primary Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm appearance-none cursor-pointer"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value} className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={formData.tagsInput}
                onChange={(e) => setFormData(prev => ({ ...prev, tagsInput: e.target.value }))}
                placeholder="malawi, Lilongwe, Kwacha, inflation"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Press comma to divide terms.
              </p>
            </div>
          </div>

          {/* Placement / Promotion Options */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Editorial Priority</h3>
            
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="mt-1 w-4.5 h-4.5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-700 focus:outline-none bg-transparent"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    Featured Hero
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Place at the absolute top/hero slot of the homepage.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.is_breaking}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_breaking: e.target.checked }))}
                  className="mt-1 w-4.5 h-4.5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-700 focus:outline-none bg-transparent"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    Breaking News banner
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Broadcast on global top ticker alerts immediately.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.is_editors_pick}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_editors_pick: e.target.checked }))}
                  className="mt-1 w-4.5 h-4.5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-700 focus:outline-none bg-transparent"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    Editor&apos;s Pick
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Feature in curated list of recommended commentary or investigations.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
