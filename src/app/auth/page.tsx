'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Mail, Lock, User as UserIcon, AlertCircle, Sparkles } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)

    try {
      if (isSignUp) {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName,
            }
          }
        })

        if (error) throw error

        if (data.user) {
          setSignUpSuccess(true)
          setAuthLoading(false)
          // Wait 2 seconds and push to onboarding
          setTimeout(() => {
            router.push(`/onboarding?email=${encodeURIComponent(email)}`)
          }, 1500)
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          router.push('/')
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err)
      setAuthError(err.message || 'An unexpected error occurred. Please try again.')
      setAuthLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-slate-950/20">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-800 p-8">
        <div className="text-center mb-8">
          <span className="text-3xl font-serif font-black tracking-tight text-gray-950 dark:text-white">
            Malawiana
          </span>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {isSignUp ? 'Create an account to start writing and reading' : 'Welcome back! Sign in to your account'}
          </p>
        </div>

        {authError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg flex items-start gap-3 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {signUpSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-lg flex items-start gap-3 text-emerald-600 dark:text-emerald-400 text-sm">
            <Sparkles size={18} className="shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-semibold">Sign Up Successful!</p>
              <p className="text-xs mt-0.5">Redirecting you to onboarding...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. John Phiri"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Password
              </label>
              {!isSignUp && (
                <Link href="/admin/forgot-password" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700">
                  Forgot Password?
                </Link>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading || signUpSuccess}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors mt-6 flex justify-center items-center"
          >
            {authLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isSignUp ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-150 dark:border-slate-800 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-450 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  )
}
