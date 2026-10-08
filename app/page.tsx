'use client'

import Link from 'next/link'
import { ArrowRight, Check, Eye, FileCheck2, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CONFIG } from '@/lib/config'
import { useDemoStoreContext } from '@/lib/store'

type Spot = { id: string; label: string; roleTag: string };

export default function HomePage() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { dispatch } = useDemoStoreContext();
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
  return <div className="home-page"><section className="hero wrap"><div className="hero-orbs" aria-hidden="true"><span className="orb o1" /><span className="orb o2" /></div><div className="hero-copy"><p className="eyebrow">{CONFIG.CLIENT} · Safety induction</p><h1>Learn warehouse safety in 5 minutes.</h1><p className="lede">Look around a real warehouse. Learn {n} key risks. Pass a short quiz. Get your certificate.</p><form className="start-form" onSubmit={start}><label htmlFor="learner-name">Your name</label><input id="learner-name" value={name} onChange={(e) => { setName(e.target.value); setError('') }} aria-invalid={!!error} aria-describedby={error ? 'name-error' : undefined} placeholder="Enter your full name" required minLength={2} />{error && <span id="name-error" className="form-error">{error}</span>}<button className="button primary glow" type="submit">Start induction <ArrowRight /></button></form></div><div className="preview-card live" aria-label="Live preview of the warehouse hotspots"><div className="preview-grid" /><div className="preview-label"><span className="live-dot pulse" />{n} live hazards</div>{labels.map((s, i) => <span className="preview-hotspot hot" key={s.id} style={{ left: `${12 + i * (76 / Math.max(n - 1, 1))}%` }} title={s.label} />)}<div className="preview-floor" /><div className="preview-tags">{labels.map((s) => <span key={s.id}>{s.label}</span>)}</div></div></section><div className="ticker" aria-hidden="true"><div className="ticker-track">{labels.concat(labels).map((s, i) => <span key={s.id + i}>{s.label} · </span>)}</div></div><section className="stats wrap" aria-label="Live program stats"><div className="stat pop"><strong>{n}</strong><span>live hazards</span></div><div className="stat pop"><strong>6</strong><span>quiz questions</span></div><div className="stat pop"><strong>70%</strong><span>pass mark</span></div><div className="stat pop"><strong>{passes === null ? '–' : passes}</strong><span>passes logged</span></div></section><section className="steps wrap" aria-label="Induction steps"><div><span className="step-number">01</span><Eye /><h2>Look around</h2><p>Open every hazard point in the scene.</p></div><div><span className="step-number">02</span><ShieldCheck /><h2>Answer 6 questions</h2><p>Five linked plus one written answer.</p></div><div><span className="step-number">03</span><FileCheck2 /><h2>Get your certificate</h2><p>Save proof of your completed induction.</p></div></section><section className="manager-teaser wrap"><Check /><span>For managers: live training records with filter, search and hotspot admin.</span><Link href="/manager">Open manager view <ArrowRight /></Link></section></div>
}
