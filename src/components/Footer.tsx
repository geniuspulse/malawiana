import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-slate-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="text-2xl font-black text-white mb-3">MALAWI<span className="text-red-500">ANA</span></div>
            <p className="text-sm leading-relaxed mb-4">Malawi's independent digital news platform. Inform. Explain. Inspire.</p>
            <p className="text-xs">Covering Malawi with accuracy, integrity, and purpose.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">News</h4>
            <ul className="space-y-2 text-sm">
              {['Politics', 'Business', 'Economy', 'Education', 'Technology', 'Health'].map(c => (
                <li key={c}><Link href={`/category/${c.toLowerCase()}`} className="hover:text-white transition-colors">{c}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">More</h4>
            <ul className="space-y-2 text-sm">
              {['Sports', 'Entertainment', 'Culture', 'Agriculture', 'Environment', 'Opinion'].map(c => (
                <li key={c}><Link href={`/category/${c.toLowerCase()}`} className="hover:text-white transition-colors">{c}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wide">About</h4>
            <ul className="space-y-2 text-sm">
              {[['About Us', '/about'], ['Contact', '/contact'], ['Fact Check', '/fact-check'], ['Explainers', '/explainers'], ['Advertise', '/advertise']].map(([l, h]) => (
                <li key={l}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p>© {year} Malawiana. All rights reserved. Built by Brandfletch Dev Studio.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/corrections" className="hover:text-white">Corrections</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
