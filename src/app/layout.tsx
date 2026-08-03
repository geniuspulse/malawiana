import type { Metadata } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ThemeProvider from '@/components/ThemeProvider'
import AdRenderer from '@/components/AdRenderer'
import { AuthProvider } from '@/lib/auth-context'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans' 
})

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-serif',
})

export const metadata: Metadata = {
  title: 'Malawiana — Stories from Malawi',
  description: 'A platform for Malawian writers to share ideas, stories, and knowledge with the world.',
  keywords: ['Malawi stories', 'Malawiana', 'Malawi writing', 'Malawi blog', 'Malawi authors'],
  openGraph: {
    siteName: 'Malawiana',
    locale: 'en_MW',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${merriweather.variable}`}>
      <body className="font-sans bg-white text-gray-900 dark:bg-slate-900 dark:text-gray-100 min-h-screen flex flex-col antialiased">
        <AuthProvider>
          <ThemeProvider>
            <AdRenderer placement="header" />
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
