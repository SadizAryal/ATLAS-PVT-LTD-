'use client'

import Link from 'next/link'
import { ArrowRight, Check, Eye, FileCheck2, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CONFIG } from '@/lib/config'
import { useDemoStoreContext } from '@/lib/store'

type Spot = { id: string; label: string; roleTag: string };

export default function HomePage() { const [name, setName] = useState(''); const [error, setError] = useState(''); const router = useRouter(); const { dispatch } = useDemoStoreContext()
  const [spots, setSpots] = useState<Spot[]>([]);
  const [passes, setPasses] = useState<number | null>(null);
  useEffect(() => {
    let dead = false;
    async function load() {
      try {
        const r = await fetch('/api/hotspots', { cache: 'no-store' });
        if (r.ok) {
          const d = (await r.json()) as { hotspots: Spot[] };
          if (!dead && d.hotspots?.length) setSpots(d.hotspots);
        }
      } catch { /* static fallback below */ }
      try {
        const r = await fetch('/api/attempts', { cache: 'no-store' });
        if (r.ok) {
          const d = (await r.json()) as { attempts: { passed: boolean }[] };
          if (!dead) setPasses(d.attempts.filter((a) => a.passed).length);
        }
      } catch { /* stays null */ }
    }
    load();
    return () => { dead = true };
  }, []);
  const labels = spots.length ? spots : [
    { id: 'forklift', label: 'Forklift zone', roleTag: 'all' },
    { id: 'ppe', label: 'PPE rack', roleTag: 'all' },
    { id: 'exit', label: 'Fire exit', roleTag: 'all' },
    { id: 'manual', label: 'Manual handling bay', roleTag: 'picker' },
    { id: 'spill', label: 'Spill point', roleTag: 'picker' },
  ];
  const n = labels.length;
  function start(e: React.FormEvent) { e.preventDefault(); if (name.trim().length < 2) { setError('Enter at least 2 characters.'); return } dispatch({ learnerName: name.trim(), viewedHotspots: [], passed: false, lastScore: null, completedAt: null }); router.push('/scene') }
  return <div className="home-page"><section className="hero wrap"><div className="hero-copy"><p className="eyebrow">{CONFIG.CLIENT} · Safety induction</p><h1>Learn warehouse safety in 5 minutes.</h1><p className="lede">Look around a real warehouse. Learn 5 key risks. Pass a short quiz. Get your certificate.</p><form className="start-form" onSubmit={start}><label htmlFor="learner-name">Your name</label><input id="learner-name" value={name} onChange={(e) => { setName(e.target.value); setError('') }} aria-invalid={!!error} aria-describedby={error ? 'name-error' : undefined} placeholder="Enter your full name" required minLength={2} />{error && <span id="name-error" className="form-error">{error}</span>}<button className="button primary" type="submit">Start induction <ArrowRight /></button></form></div><div className="preview-card" aria-label="Preview of a 360 warehouse scene"><div className="preview-grid" /><div className="preview-label"><span className="live-dot" />360° warehouse view</div><span className="preview-hotspot dot-one" /><span className="preview-hotspot dot-two" /><span className="preview-hotspot dot-three" /><div className="preview-floor" /></div></section><div className="ticker" aria-hidden="true"><div className="ticker-track">{labels.concat(labels).map((s, i) => <span key={s.id + i}>{s.label} · </span>)}</div></div><section className="stats wrap" aria-label="Live program stats"><div className="stat pop"><strong>{n}</strong><span>live hazards</span></div><div className="stat pop"><strong>6</strong><span>quiz questions</span></div><div className="stat pop"><strong>70%</strong><span>pass mark</span></div><div className="stat pop"><strong>{passes === null ? '–' : passes}</strong><span>passes logged</span></div></section><section className="steps wrap" aria-label="Induction steps"><div><span className="step-number">01</span><Eye /><h2>Look around</h2><p>Open every hazard point in the scene.</p></div><div><span className="step-number">02</span><ShieldCheck /><h2>Answer 6 questions</h2><p>Show what you know about safe work.</p></div><div><span className="step-number">03</span><FileCheck2 /><h2>Get your certificate</h2><p>Save proof of your completed induction.</p></div></section><section className="wrap hazards" aria-label="Hazards covered"><p className="eyebrow">Hazards covered</p><h2>Five points that hurt starters most.</h2><div className="hazard-grid">{labels.map((s) => <div className="hazard-card" key={s.id}><strong>{s.label}</strong><span>{s.roleTag === 'all' ? 'Every role' : s.roleTag}</span></div>)}</div><p className="hint">Managers add more anytime from Hotspots admin. No rebuild, no redeploy.</p></section><section className="wrap scoring" aria-label="How scoring works"><p className="eyebrow">Scoring</p><h2>70 percent to pass. Feedback every question.</h2><p>Each multiple choice answer explains its reason at once. The written answer is checked for meaning with a safe fallback and flagged for manager review when unsure. Fail and you retry with review points, keeping your name and progress.</p></section><section className="wrap faq" aria-label="Questions"><p className="eyebrow">Questions</p><h2>Asked on site.</h2><div className="faq-grid"><div><strong>How long does it take?</strong><p>About ten minutes: look, answer six, print proof.</p></div><div><strong>What if I fail?</strong><p>You see the correct points and retry. Nothing is lost.</p></div><div><strong>Does it need installing?</strong><p>No. Any warehouse PC browser runs it.</p></div><div><strong>How do managers check?</strong><p>Manager view lists every attempt with filter, search and pass flags.</p></div></div></section><section className="manager-teaser wrap"><Check /><span>For managers: see training records after a pass.</span><Link href="/manager">Open manager view <ArrowRight /></Link></section></div>
}
