'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Mail, Check } from 'lucide-react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    const { error } = await supabase.from('malawiana_subscribers').upsert({ email, name, status: 'active', subscribed_at: new Date().toISOString() }, { onConflict: 'email' })
    if (error) { setStatus('error'); setMessage('Something went wrong. Please try again.') }
    else { setStatus('success'); setMessage('') }
  }

  return (
    <div className="bg-emerald-700 dark:bg-emerald-900 rounded-2xl py-10 px-5 sm:py-12 sm:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <Mail size={32} className="text-emerald-200 mx-auto mb-4" />
        <h2 className="text-xl sm:text-2xl font-black text-white mb-2.5">Never Miss a Story</h2>
        <p className="text-emerald-100 text-sm mb-6 leading-relaxed">
          Fresh stories from Malawian writers, straight to your inbox. No spam — just great storytelling.
        </p>
        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2.5 text-white">
            <Check size={22} /><span className="text-base font-semibold">You're subscribed! Welcome to Malawiana.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
            <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white text-sm" />
            <input type="email" required placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white text-sm" />
            <button type="submit" disabled={status === 'loading'}
              className="w-full px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors text-sm disabled:opacity-60">
              {status === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
            </button>
          </form>
        )}
        {message && <p className="text-red-200 text-sm mt-2">{message}</p>}
      </div>
    </div>
  )
}
