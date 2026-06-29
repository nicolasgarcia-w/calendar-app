import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tu Calendario',
  description: 'A special gift, just for you.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tu Calendario',
  },
}

export const viewport: Viewport = {
  themeColor: '#be123c',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geist.className} h-full antialiased`}>{children}</body>
    </html>
  )
}
