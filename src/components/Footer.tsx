import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-slate-950 text-gray-450 border-t border-slate-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 border-b border-slate-900 pb-8">
          <div>
            <div className="text-xl font-serif font-black text-white mb-2">Malawiana</div>
            <p className="text-sm text-gray-400">"A platform where Malawian voices are heard."</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
            <Link href="/auth" className="hover:text-white transition-colors">Become a Writer</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {year} Malawiana. All rights reserved. Stories from Malawi.</p>
          <div className="flex gap-4">
            <Link href="/admin/login" className="hover:text-gray-400 transition-colors">Platform Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
