'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { BookOpen, User, Check, Edit2, ChevronRight, Sparkles, Award } from 'lucide-react'

const TOPICS_LIST = [
  'Politics', 'Business', 'Agriculture', 'Technology', 
  'Education', 'Health', 'Sports', 'Opinion', 'Culture'
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, refreshWriter, loading: authLoading } = useAuth()
  const [step, setStep] = useState(1)
  
  // Form States
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [isWriter, setIsWriter] = useState<boolean | null>(null)
  
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Pre-populate display name and username once user is loaded
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
      return
    }

    if (user) {
      const defaultName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Writer'
      setDisplayName(defaultName)
      const cleanUsername = defaultName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000)
      setUsername(cleanUsername)
    }
  }, [user, authLoading, router])

  const handleNameChange = (val: string) => {
    setDisplayName(val)
    const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (clean) {
      setUsername(clean)
    }
  }

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic))
    } else {
      setSelectedTopics([...selectedTopics, topic])
    }
  }

  const handleComplete = async (wantToWrite: boolean) => {
    setError('')
    setSaving(true)

    try {
      if (!user) throw new Error('Not authenticated')

      // Save user metadata with selected topics
      await supabase.auth.updateUser({
        data: {
          onboarded: true,
          topics: selectedTopics,
          want_to_write: wantToWrite
        }
      })

      if (wantToWrite) {
        // Create writer profile in `writers` table
        const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`
        const { error: insertError } = await supabase
          .from('writers')
          .insert({
            user_id: user.id,
            display_name: displayName,
            username: username || `user_${user.id.substring(0, 8)}`,
            bio: 'A passionate writer sharing thoughts on Malawiana.',
            avatar_url: avatarUrl,
            total_views: 0,
            is_verified: false,
          })

        if (insertError) {
          // If there's an error (e.g. duplicate username), try fallback with random number
          const uniqueUsername = (username || 'user') + Math.floor(Math.random() * 10000)
          const { error: retryError } = await supabase
            .from('writers')
            .insert({
              user_id: user.id,
              display_name: displayName,
              username: uniqueUsername,
              bio: 'A passionate writer sharing thoughts on Malawiana.',
              avatar_url: avatarUrl,
              total_views: 0,
              is_verified: false,
            })
          
          if (retryError) throw retryError
        }
      }

      await refreshWriter()
      router.push(wantToWrite ? '/dashboard' : '/')
    } catch (err: any) {
      console.error('Error in onboarding:', err)
      setError(err.message || 'Could not complete onboarding. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50/50 dark:bg-slate-950/10">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-150 dark:border-slate-800 p-8">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-emerald-600' : 'bg-gray-100 dark:bg-slate-800'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-emerald-600' : 'bg-gray-100 dark:bg-slate-800'}`} />
          <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-emerald-600' : 'bg-gray-100 dark:bg-slate-800'}`} />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* STEP 1: What's your name? */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white mb-2">
                What's your name?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This is how you will appear to readers and other writers on Malawiana.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Display Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chisomo Banda"
                    value={displayName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">@</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => displayName.trim() && setStep(2)}
              disabled={!displayName.trim()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors mt-8 flex justify-center items-center gap-1"
            >
              <span>Continue</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: Pick topics you're interested in */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white mb-2">
                What interests you?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose the topics you are interested in. This helps us customize your home feed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {TOPICS_LIST.map((topic) => {
                const isSelected = selectedTopics.includes(topic)
                return (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                        : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-750 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{topic}</span>
                    {isSelected && <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />}
                  </button>
                )
              })}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-200 dark:border-slate-700 hover:bg-gray-55 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-sm transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors flex justify-center items-center gap-1"
              >
                <span>Continue</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Do you want to write on Malawiana? */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <BookOpen size={48} className="mx-auto text-emerald-600 mb-4 animate-bounce" />
              <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white mb-2">
                Share your stories?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Do you want to write and share articles on Malawiana? Writers can share their perspectives and earn ad revenue based on reads!
              </p>
            </div>

            <div className="space-y-3 mt-6">
              <button
                onClick={() => handleComplete(true)}
                disabled={saving}
                className="w-full p-4 border border-emerald-600 bg-emerald-50/10 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl text-sm transition-all flex flex-col items-center justify-center gap-1"
              >
                <span>Yes, I want to write & earn</span>
                <span className="text-[11px] font-medium text-gray-450">I want to publish stories, poems, and ideas.</span>
              </button>

              <button
                onClick={() => handleComplete(false)}
                disabled={saving}
                className="w-full p-4 border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-750 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-sm transition-all flex flex-col items-center justify-center gap-1"
              >
                <span>Just reading for now</span>
                <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">I want to explore stories and support writers.</span>
              </button>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={saving}
              className="w-full text-center text-xs font-semibold text-gray-400 hover:text-gray-550 transition-colors pt-4 block"
            >
              Back to topics
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
