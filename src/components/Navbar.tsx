'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Menu, X, User as UserIcon, LogOut, Edit3 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function Navbar() {
  const router = useRouter()
  const { user, writer, signOut, loading } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 border-b border-gray-150 dark:border-slate-800 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="text-2xl font-serif font-black tracking-tight text-gray-900 dark:text-white">
            Malawiana
          </span>
        </Link>

        {/* Center: Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Home</Link>
          <Link href="/explore" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Explore</Link>
          <Link href="/about" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">About</Link>
          {!loading && user && (
            <>
              <Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Dashboard</Link>
            </>
          )}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search trigger (desktop search bar, togglable or always visible) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 focus:w-64 transition-all duration-300 pl-8 pr-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <Search size={14} className="absolute left-2.5 text-gray-400" />
          </form>

          <button onClick={() => setSearchOpen(!searchOpen)} className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800">
            <Search size={18} />
          </button>

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/write" className="hidden sm:flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-colors">
                    <Edit3 size={12} />
                    <span>Start Writing</span>
                  </Link>

                  {/* Profile Dropdown / Logged in view */}
                  <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {writer?.avatar_url ? (
                          <img src={writer.avatar_url} alt={writer.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon size={14} className="text-gray-500" />
                        )}
                      </div>
                      <span className="hidden lg:inline text-xs font-semibold text-gray-700 dark:text-gray-350 group-hover:text-emerald-600 transition-colors">
                        {writer?.display_name || user.email?.split('@')[0]}
                      </span>
                    </Link>
                    <button 
                      onClick={signOut} 
                      title="Sign Out"
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-red-500 transition-colors"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/auth" className="text-sm font-medium text-gray-600 dark:text-gray-350 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/auth" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-full text-xs font-semibold transition-colors">
                    Start Writing
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Hamburger (mobile) */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile search input */}
      {searchOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-150 dark:border-slate-800 px-4 py-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              autoFocus
              type="text"
              placeholder="Search stories & writers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </form>
        </div>
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 overflow-y-auto">
          <div className="p-4 space-y-4">
            <nav className="flex flex-col gap-2">
              <Link href="/" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                Home
              </Link>
              <Link href="/explore" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                Explore
              </Link>
              <Link href="/about" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                About
              </Link>
              {!loading && user && (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    Dashboard
                  </Link>
                  <Link href="/write" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-lg text-emerald-600 dark:text-emerald-450 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    + Write a Story
                  </Link>
                </>
              )}
            </nav>

            {!loading && !user && (
              <div className="border-t border-gray-100 dark:border-slate-800 pt-4 flex flex-col gap-2">
                <Link href="/auth" onClick={() => setMobileOpen(false)} className="text-center py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  Sign In
                </Link>
                <Link href="/auth" onClick={() => setMobileOpen(false)} className="text-center py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
