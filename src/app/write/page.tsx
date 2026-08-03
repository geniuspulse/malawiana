'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import RichEditor from '@/components/admin/RichEditor'
import { ArrowLeft, Save, Eye, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'politics', label: 'Politics' },
  { value: 'business', label: 'Business' },
  { value: 'technology', label: 'Technology' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health' },
  { value: 'sports', label: 'Sports' },
  { value: 'opinion', label: 'Opinion' },
  { value: 'culture', label: 'Culture' },
  { value: 'environment', label: 'Environment' },
]

export default function WritePage() {
  const router = useRouter()
  const { user, writer, loading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('general')
  const [tagsInput, setTagsInput] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [uploadingCover, setUploadingCover] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'write' | 'preview'>('write')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
    if (!loading && user && !writer) {
      router.push('/onboarding')
    }
  }, [user, writer, loading, router])

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'article-images')
      formData.append('folder', 'covers')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.url) setCoverImage(data.url)
      else setError(data.error || 'Upload failed')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploadingCover(false)
    }
  }

  const handleSave = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      setError('Please enter a title.')
      return
    }
    setSaving(true)
    setError('')

    try {
      const slug = slugify(title)
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const { data, error: insertError } = await supabase
        .from('malawiana_articles')
        .insert({
          title: title.trim(),
          slug,
          summary: subtitle.trim(),
          body,
          featured_image: coverImage || null,
          author_name: writer?.display_name || user?.email?.split('@')[0] || 'Anonymous',
          author_avatar: writer?.avatar_url || null,
          category,
          tags: tags.length > 0 ? tags : null,
          status,
          published_at: status === 'published' ? new Date().toISOString() : null,
          writer_id: writer?.id || null,
        })
        .select('slug')
        .single()

      if (insertError) throw insertError

      router.push(status === 'published' ? `/article/${data.slug}` : '/dashboard')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    )
  }

  if (!user || !writer) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="flex flex-col gap-4 mb-8 pb-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setMode(mode === 'write' ? 'preview' : 'write')}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1.5"
          >
            <Eye size={15} /> {mode === 'write' ? 'Preview' : 'Edit'}
          </button>
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-4 py-2"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={saving}
            className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full transition-colors"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        </div>
      )}

      {mode === 'write' ? (
        <>
          {/* Cover image upload */}
          <div className="mb-6">
            {coverImage ? (
              <div className="relative rounded-xl overflow-hidden group">
                <img src={coverImage} alt="Cover" className="w-full aspect-video object-cover" />
                <button
                  onClick={() => setCoverImage('')}
                  className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCover}
                className="w-full border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl py-8 text-gray-400 hover:border-emerald-400 hover:text-emerald-600 transition-colors text-sm"
              >
                {uploadingCover ? 'Uploading...' : '+ Add cover image'}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleCoverUpload(file)
              }}
            />
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-2xl sm:text-3xl md:text-4xl font-serif font-bold bg-transparent text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-slate-600 focus:outline-none mb-3"
          />

          {/* Subtitle */}
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Write a subtitle..."
            className="w-full text-base sm:text-lg text-gray-500 dark:text-gray-400 bg-transparent placeholder-gray-300 dark:placeholder-slate-600 focus:outline-none mb-6"
          />

          {/* Rich editor */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <RichEditor value={body} onChange={setBody} placeholder="Tell your story..." />
          </div>

          {/* Meta row */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700 space-y-4 overflow-x-auto">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Topic
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. malawi, agriculture, policy"
                  className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Preview mode */
        <article>
          {coverImage && (
            <img src={coverImage} alt="" className="w-full aspect-video object-cover rounded-xl mb-6" />
          )}
          <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-3">
            {title || 'Untitled'}
          </h1>
          {subtitle && (
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-6">{subtitle}</p>
          )}
          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: body || '<p class="text-gray-400">Nothing written yet.</p>' }}
          />
        </article>
      )}
    </div>
  )
}
