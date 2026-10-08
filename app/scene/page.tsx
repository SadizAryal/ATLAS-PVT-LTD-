'use client'

import Link from 'next/link'
import { Check, LockKeyhole, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDemoStoreContext } from '@/lib/store'
import { useHotspots, AdminHotspot } from '@/lib/hotspots'
import PanoViewer from '@/components/PanoViewer'
import type { Hotspot } from '@/lib/config'

export default function ScenePage() {
  const { state, ready, dispatch } = useDemoStoreContext();
  const { spots, ready: hsReady } = useHotspots();
  const [active, setActive] = useState<AdminHotspot | null>(null)
  useEffect(() => { if (ready && !state.learnerName) window.location.replace('/') }, [ready, state.learnerName]);
  useEffect(() => { const close = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null); window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close) }, [])
  if (!ready || !hsReady || !state.learnerName) return <div className="loading-state" aria-busy="true">Loading induction…</div>
  const total = spots.length;
  function open(spot: Hotspot) { const full = spots.find((s) => s.id === (spot as unknown as { id: string }).id) ?? null; setActive(full); dispatch({ type: 'viewHotspot', id: (spot as unknown as { id: string }).id }) }
  function openRow(spot: AdminHotspot) { setActive(spot); dispatch({ type: 'viewHotspot', id: spot.id }) }
  const count = spots.filter((s) => state.viewedHotspots.includes(s.id)).length;
  const unlocked = total > 0 && count >= total
  return <div className="scene-page"><div className="scene-top wrap"><div><p className="eyebrow">Step 1 of 3</p><h1>Look around the warehouse</h1><p>Open all {total} points. Each one shows a safety risk.</p></div><div className="learner-chip">{state.learnerName}</div></div><div className="scene-layout"><PanoViewer spots={spots as unknown as Hotspot[]} onOpen={open} /><aside className={active ? 'scene-panel panel-active' : 'scene-panel'} aria-label="Hazards and quiz progress"><div className="panel-header"><div><span className="eyebrow">Your progress</span><strong aria-live="polite">{count} of {total} viewed</strong></div><div className="progress-ring">{count}/{total}</div></div><div className="progress-track"><span style={{ width: `${total ? (count / total) * 100 : 0}%` }} /></div><div className="hotspot-list">{spots.map((spot) => { const viewed = state.viewedHotspots.includes(spot.id); return <button className={active?.id === spot.id ? 'hotspot-row selected' : 'hotspot-row'} key={spot.id} onClick={() => openRow(spot)}><span className={viewed ? 'hotspot-icon viewed' : 'hotspot-icon'}>{viewed ? <Check /> : <span />}</span><span>{spot.label}</span>{viewed && <em>Viewed</em>}</button> })}</div>{active ? <div className="hotspot-detail"><button className="close-detail" aria-label="Close hazard detail" onClick={() => setActive(null)}><X /></button><span className="eyebrow">Safety point - {active.roleTag}</span><h2>{active.label}</h2><p><strong>Hazard</strong>{active.hazard}</p><p><strong>Fix</strong>{active.fix}</p></div> : <div className="detail-empty">Select a point to read its safety note.</div>}<div className="quiz-lock">{unlocked ? <><div className="unlock-line"><Check /> <span>All safety points viewed</span></div><Link href="/quiz" className="button primary full">Start quiz</Link></> : <><div className="unlock-line"><LockKeyhole /> <span>Quiz locked</span></div><p>Open all {total} hotspots to unlock the quiz.</p><button className="button disabled full" aria-disabled="true" disabled>Start quiz</button></>}</div></aside></div></div>
}
