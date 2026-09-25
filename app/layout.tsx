import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppShell } from '@/components/AppShell'
import { DemoStoreProvider } from '@/lib/store'

export const metadata: Metadata = {
  title: 'Atlas Induct 360',
  description: 'A short warehouse safety induction for Colab Warehouse.',
  icons: {
    icon: '/atlas-favicon.png',
    apple: '/atlas-favicon.png',
  },
}
export const viewport: Viewport = { themeColor: '#F4F4F4', colorScheme: 'light', userScalable: false }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" /></head><body><DemoStoreProvider><AppShell>{children}</AppShell></DemoStoreProvider></body></html> }
