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
    <section className="bg-blue-700 dark:bg-blue-900 py-14 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <Mail size={36} className="text-blue-200 mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-black text-white mb-3">Stay Informed</h2>
        <p className="text-blue-200 mb-8">Malawi's latest news delivered straight to your inbox. No spam, just credible journalism.</p>
        {status === 'success' ? (
          <div className="flex items-center justify-center gap-3 text-white">
            <Check size={24} /><span className="text-lg font-semibold">You're subscribed! Welcome to Malawiana.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white text-sm" />
            <input type="email" required placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white text-sm" />
            <button type="submit" disabled={status === 'loading'}
              className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm disabled:opacity-60 whitespace-nowrap">
              {status === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
            </button>
          </form>
        )}
        {message && <p className="text-red-300 text-sm mt-2">{message}</p>}
      </div>
    </section>
  )
}
