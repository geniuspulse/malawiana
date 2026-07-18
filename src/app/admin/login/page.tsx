'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If session exists, go straight to admin dashboard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/admin')
      }
    })
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else if (data.session) {
        router.push('/admin')
      } else {
        setError('Failed to login. Please try again.')
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="font-black text-3xl tracking-tight text-blue-600">
            MALAWI<span className="text-red-500">ANA</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Sign in to access your editorial dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-200 dark:border-red-900/30">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
              placeholder="editor@malawiana.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
