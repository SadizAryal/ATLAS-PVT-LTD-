import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppShell } from '@/components/AppShell'
import { DemoStoreProvider } from '@/lib/store'

export const metadata: Metadata = { title: 'Atlas Induct 360', description: 'A short warehouse safety induction for Colab Warehouse.' }
export const viewport: Viewport = { themeColor: '#F4F4F4', colorScheme: 'light', userScalable: false }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><DemoStoreProvider><AppShell>{children}</AppShell></DemoStoreProvider></body></html> }
