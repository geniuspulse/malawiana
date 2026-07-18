'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { LayoutDashboard, FileText, Mail, MessageSquare, LogOut, Menu, X, ChevronRight } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, exact: true },
  { href: '/admin/articles', label: 'Articles', icon: <FileText size={18} /> },
  { href: '/admin/subscribers', label: 'Subscribers', icon: <Mail size={18} /> },
  { href: '/admin/messages', label: 'Messages', icon: <MessageSquare size={18} /> },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) { setChecking(false); return }
    const timeout = setTimeout(() => router.replace('/admin/login'), 5000)
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout)
      if (!session) router.replace('/admin/login')
      else setChecking(false)
    }).catch(() => { clearTimeout(timeout); router.replace('/admin/login') })
    return () => clearTimeout(timeout)
  }, [isLoginPage])

  if (isLoginPage) return <>{children}</>
  if (checking) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  )

  const isActive = (item: { href: string; exact?: boolean }) => item.exact ? pathname === item.href : pathname.startsWith(item.href)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-slate-700">
          <div>
            <p className="font-black text-blue-600 tracking-tight text-lg">MALAWI<span className="text-red-500">ANA</span></p>
            <p className="text-xs text-gray-400">Editorial Dashboard</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500"><X size={18} /></button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(item) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
              {item.icon}{item.label}
              {isActive(item) && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200 dark:border-slate-700">
          <button onClick={async () => { await supabase.auth.signOut(); router.replace('/admin/login') }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500"><Menu size={22} /></button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">E</div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">Editor</span>
          </div>
        </header>
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
