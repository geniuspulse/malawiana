'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Menu, X, Sun, Moon, Bell } from 'lucide-react'
import { useTheme } from './ThemeProvider'

const PRIMARY_NAV = [
  { label: 'Home', href: '/' },
  { label: 'Latest', href: '/latest' },
  { label: 'Politics', href: '/category/politics' },
  { label: 'Business', href: '/category/business' },
  { label: 'Economy', href: '/category/economy' },
  { label: 'Technology', href: '/category/technology' },
  { label: 'Sports', href: '/category/sports' },
  { label: 'Entertainment', href: '/category/entertainment' },
]

const ALL_CATEGORIES = [
  { label: 'Politics', href: '/category/politics' },
  { label: 'Business', href: '/category/business' },
  { label: 'Economy', href: '/category/economy' },
  { label: 'Education', href: '/category/education' },
  { label: 'Technology', href: '/category/technology' },
  { label: 'Health', href: '/category/health' },
  { label: 'Agriculture', href: '/category/agriculture' },
  { label: 'Environment', href: '/category/environment' },
  { label: 'Sports', href: '/category/sports' },
  { label: 'Entertainment', href: '/category/entertainment' },
  { label: 'Culture', href: '/category/culture' },
  { label: 'Opinion', href: '/opinion' },
  { label: 'Fact Check', href: '/fact-check' },
  { label: 'Explainers', href: '/explainers' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-blue-800 dark:bg-blue-950 text-white py-1.5 px-4 hidden md:flex items-center justify-between text-xs">
        <span className="font-medium tracking-wide">MALAWIANA — Inform. Explain. Inspire.</span>
        <div className="flex items-center gap-4">
          <span>{new Date().toLocaleDateString('en-MW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Main navbar */}
      <div className={`bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-black tracking-tight text-blue-700 dark:text-blue-400">MALAWI<span className="text-red-500">ANA</span></span>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search Malawiana..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800">
              <Search size={20} />
            </button>
            <button onClick={toggle} className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <nav className="hidden md:block bg-blue-700 dark:bg-blue-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {PRIMARY_NAV.map(item => (
              <Link key={item.href} href={item.href}
                className="px-3 py-3 text-sm font-medium text-white/90 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-800 whitespace-nowrap transition-colors flex-shrink-0">
                {item.label}
              </Link>
            ))}
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              <Link href="/opinion" className="px-3 py-3 text-sm font-medium text-white/90 hover:text-white whitespace-nowrap">Opinion</Link>
              <Link href="/fact-check" className="px-3 py-3 text-sm font-bold text-yellow-300 hover:text-yellow-200 whitespace-nowrap">Fact Check</Link>
              <Link href="/explainers" className="px-3 py-3 text-sm font-medium text-white/90 hover:text-white whitespace-nowrap">Explainers</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-white dark:bg-slate-900 overflow-y-auto">
          <div className="p-4 space-y-1">
            {ALL_CATEGORIES.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Mobile search */}
      {searchOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3">
          <input autoFocus type="text" placeholder="Search news..." className="w-full px-4 py-2.5 rounded-full border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      )}
    </header>
  )
}
