'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { CONFIG } from '@/lib/config'
import { useDemoStoreContext } from '@/lib/store'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const { reset } = useDemoStoreContext(); const [open, setOpen] = useState(false)
  function resetDemo() { if (window.confirm('Reset this demo? Your learner name and progress will be cleared.')) { reset(); router.push('/') } }
  return <div className="site-shell"><a className="skip-link" href="#main">Skip to content</a><header className="site-header"><Link href="/" className="brand" aria-label={`${CONFIG.APP_NAME} home`}><span className="brand-mark">A</span><span>{CONFIG.APP_NAME}</span></Link><button className="menu-button" aria-label="Open menu" onClick={() => setOpen(!open)}><Menu /></button><nav className={open ? 'nav-links nav-open' : 'nav-links'}><Link className={pathname === '/' ? 'active' : ''} href="/">Induction</Link><Link className={pathname === '/manager' ? 'active' : ''} href="/manager">Manager view</Link></nav></header><main id="main">{children}</main><footer className="site-footer"><span>Built for {CONFIG.CLIENT}</span><button className="reset-button" onClick={resetDemo}><RotateCcw /> Reset demo</button></footer></div>
}
