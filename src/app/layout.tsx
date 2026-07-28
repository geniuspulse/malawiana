import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ThemeProvider from '@/components/ThemeProvider'
import AdRenderer from '@/components/AdRenderer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Malawiana - Inform. Explain. Inspire.', template: '%s | Malawiana' },
  description: "Malawi's leading independent digital news platform covering politics, business, education, technology, culture, sports, and society.",
  keywords: ['Malawi news', 'Malawiana', 'Malawi politics', 'Malawi business'],
  openGraph: {
    siteName: 'Malawiana',
    locale: 'en_MW',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AdRenderer placement="header" /><Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
