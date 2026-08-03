'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Mail, MessageSquare, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: insertError } = await supabase
        .from('malawiana_messages')
        .insert({ name, email, subject, message, status: 'new' })
      if (insertError) throw insertError
      setSuccess(true)
      setName(''); setEmail(''); setSubject(''); setMessage('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white mb-2">Contact Us</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Questions, feedback, or want to partner with Malawiana? Send us a message.
      </p>

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-lg flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-600" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">Message sent! We'll get back to you.</p>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Subject</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required
            className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5}
            className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-8 py-3 rounded-full transition-colors flex items-center justify-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />} Send Message
        </button>
      </form>
    </div>
  )
}
