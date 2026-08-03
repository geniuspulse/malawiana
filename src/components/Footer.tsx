import Link from 'next/link'

const links = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/about', label: 'About' },
  { href: '/auth', label: 'Write for Us' },
  { href: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col gap-8 mb-8">
          <div className="max-w-xs">
            <p className="font-serif font-black text-xl text-gray-900 dark:text-white mb-2">Malawiana</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              An open writing platform where Malawian voices are heard. Write, read, and earn from your stories.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Platform</p>
              <div className="flex flex-col gap-2">
                {links.map((l) => (
                  <Link key={l.href} href={l.href} className="text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Writers</p>
              <div className="flex flex-col gap-2">
                <Link href="/write" className="text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors">Start Writing</Link>
                <Link href="/dashboard" className="text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors">Dashboard</Link>
                <Link href="/admin" className="text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-colors">Admin</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-slate-800 pt-6 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} Malawiana. A platform for Malawian voices. 🇲🇼
          </p>
        </div>
      </div>
    </footer>
  )
}
