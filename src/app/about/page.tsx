import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, Pen, Users, Globe } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About — Malawiana',
  description: 'Malawiana is an open writing platform for Malawian voices.',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white mb-6">
        About Malawiana
      </h1>

      <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif">
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-medium mb-8">
          Malawiana is an open writing platform where Malawians share ideas, stories, and knowledge with
          the world.
        </p>

        <p>
          We believe Malawi's stories deserve a stage. For too long, the narrative about Malawi has been
          shaped by outsiders. Malawiana flips that — we give the tools to the writers, thinkers, and
          creators who actually live these stories.
        </p>

        <p>
          Whether you write about politics, agriculture, technology, culture, or your personal
          experience growing up in Lilongwe — there's a place for your voice here.
        </p>

        <h2 className="text-xl font-bold mt-10 mb-4">How it works</h2>
        <div className="not-prose space-y-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 shrink-0">
              <Pen size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Write freely</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Sign up, create your writer profile, and start publishing stories with our distraction-free
                editor. No gatekeeping.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Build an audience</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Readers follow you, like your stories, and engage with your ideas. Your profile page
                showcases everything you've written.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Earn from your writing</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Malawiana shares ad revenue with writers. The more people read your stories, the more you
                earn. Track your earnings in your dashboard.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 shrink-0">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Reach the world</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your stories are public, SEO-optimized, and shareable across social media. Your voice
                reaches readers across Malawi and beyond.
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mt-10 mb-4">Our promise</h2>
        <p>
          We will never charge writers to publish. We will never gatekeep who gets to write. And we will
          always share revenue with the people who make this platform worth reading.
        </p>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row gap-4">
        <Link
          href="/auth"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3 rounded-full text-center text-sm transition-colors"
        >
          Start Writing
        </Link>
        <Link
          href="/explore"
          className="border border-gray-300 dark:border-slate-700 hover:border-gray-400 text-gray-700 dark:text-gray-200 font-semibold px-8 py-3 rounded-full text-center text-sm transition-colors"
        >
          Explore Stories
        </Link>
      </div>
    </div>
  )
}
