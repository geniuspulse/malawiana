'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ArticleEditor from '@/components/admin/ArticleEditor'
import { AlertCircle } from 'lucide-react'

export default function EditArticlePage() {
  const { id } = useParams()
  const router = useRouter()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchArticle = async () => {
      try {
        const { data, error } = await supabase
          .from('malawiana_articles')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          throw error
        }

        if (!data) {
          setError('Article not found.')
        } else {
          setArticle(data)
        }
      } catch (err: any) {
        console.error('Error fetching article:', err)
        setError(err.message || 'Failed to fetch the article.')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading article...</p>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 shadow-sm text-center">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={40} />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Error Loading Article</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error || 'The requested article could not be loaded.'}</p>
        <button
          onClick={() => router.push('/admin/articles')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Back to Articles
        </button>
      </div>
    )
  }

  return <ArticleEditor initialData={article} />
}
