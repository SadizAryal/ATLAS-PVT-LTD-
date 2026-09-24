'use client'

import Link from 'next/link'
import { ArrowRight, Printer, ShieldCheck } from 'lucide-react'
import { useEffect } from 'react'
import { CONFIG, formatLongDate } from '@/lib/config'
import { useDemoStoreContext } from '@/lib/store'

export default function CertificatePage() { const { state, ready } = useDemoStoreContext(); useEffect(() => { if (ready && (!state.learnerName || !state.passed)) window.location.replace(state.learnerName ? '/quiz' : '/') }, [ready, state.learnerName, state.passed]); if (!ready || !state.passed) return <div className="loading-state">Loading certificate…</div>; return <div className="certificate-page wrap"><div className="certificate-actions"><Link href="/manager" className="text-link">Manager view <ArrowRight /></Link><button className="button primary" onClick={() => window.print()}><Printer /> Print certificate</button></div><article className="certificate"><div className="certificate-inner"><div className="seal"><ShieldCheck /></div><p className="eyebrow">{CONFIG.COMPANY} · {CONFIG.CLIENT}</p><h1>Certificate of Completion</h1><p className="certificate-subtitle">Warehouse Safety Induction</p><div className="certificate-rule" /><p className="issued-label">This certifies that</p><h2>{state.learnerName}</h2><p className="certificate-copy">has completed the {CONFIG.CLIENT} warehouse safety induction.</p><div className="certificate-meta"><div><span>Score</span><strong>{state.lastScore}%</strong></div><div><span>Completed</span><strong>{formatLongDate(state.completedAt || new Date().toISOString())}</strong></div></div><div className="certificate-foot"><span>Issued by {CONFIG.COMPANY}</span><span>For {CONFIG.CLIENT}</span></div></div></article></div>
}
