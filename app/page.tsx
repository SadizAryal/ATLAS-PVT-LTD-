'use client'

import Link from 'next/link'
import { ArrowRight, Check, Eye, FileCheck2, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CONFIG } from '@/lib/config'
import { useDemoStoreContext } from '@/lib/store'

export default function HomePage() { const [name, setName] = useState(''); const [error, setError] = useState(''); const router = useRouter(); const { dispatch } = useDemoStoreContext()
  function start(e: React.FormEvent) { e.preventDefault(); if (name.trim().length < 2) { setError('Enter at least 2 characters.'); return } dispatch({ learnerName: name.trim(), viewedHotspots: [], passed: false, lastScore: null, completedAt: null }); router.push('/scene') }
  return <div className="home-page"><section className="hero wrap"><div className="hero-copy"><p className="eyebrow">{CONFIG.CLIENT} · Safety induction</p><h1>Learn warehouse safety in 5 minutes.</h1><p className="lede">Look around a real warehouse. Learn 3 key risks. Pass a short quiz. Get your certificate.</p><form className="start-form" onSubmit={start}><label htmlFor="learner-name">Your name</label><input id="learner-name" value={name} onChange={(e) => { setName(e.target.value); setError('') }} aria-invalid={!!error} aria-describedby={error ? 'name-error' : undefined} placeholder="Enter your full name" required minLength={2} />{error && <span id="name-error" className="form-error">{error}</span>}<button className="button primary" type="submit">Start induction <ArrowRight /></button></form></div><div className="preview-card" aria-label="Preview of a 360 warehouse scene"><div className="preview-grid" /><div className="preview-label"><span className="live-dot" />360° warehouse view</div><span className="preview-hotspot dot-one" /><span className="preview-hotspot dot-two" /><span className="preview-hotspot dot-three" /><div className="preview-floor" /></div></section><section className="steps wrap" aria-label="Induction steps"><div><span className="step-number">01</span><Eye /><h2>Look around</h2><p>Open three hazard points in the scene.</p></div><div><span className="step-number">02</span><ShieldCheck /><h2>Answer 3 questions</h2><p>Show what you know about safe work.</p></div><div><span className="step-number">03</span><FileCheck2 /><h2>Get your certificate</h2><p>Save proof of your completed induction.</p></div></section><section className="manager-teaser wrap"><Check /><span>For managers: see training records after a pass.</span><Link href="/manager">Open manager view <ArrowRight /></Link></section></div>
}
