'use client';

import { FormEvent, useState } from 'react';
import { useDemoStoreContext } from '@/lib/store';
import { useHotspots, AdminHotspot } from '@/lib/hotspots';

const ACCESS_KEY = 'atlas-manager-unlocked';

export default function AdminPage() {
  const { ready } = useDemoStoreContext();
  const { all, ready: hsReady } = useHotspots();
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [label, setLabel] = useState('');
  const [roleTag, setRoleTag] = useState('all');
  const [yaw, setYaw] = useState('0');
  const [pitch, setPitch] = useState('0');
  const [hazard, setHazard] = useState('');
  const [fix, setFix] = useState('');
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);

  function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code === 'COLAB-2026') {
      window.sessionStorage.setItem(ACCESS_KEY, 'true');
      setUnlocked(true);
      setError('');
    } else setError('Incorrect access code.');
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setSaved('');
    try {
      const res = await fetch('/api/hotspots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, roleTag, yaw: Number(yaw), pitch: Number(pitch), hazard, fix }),
      });
      if (!res.ok) throw new Error('save');
      setSaved('Hotspot saved. Reload the scene to see the new marker.');
      setLabel('');
      setHazard('');
      setFix('');
      setYaw('0');
      setPitch('0');
    } catch {
      setSaved('Save failed. Check the text is under 40 words and retry.');
    }
    setBusy(false);
  }

  async function toggle(spot: AdminHotspot) {
    await fetch('/api/hotspots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...spot, active: !spot.active }),
    });
    window.location.reload();
  }

  if (!ready || !hsReady) return <div className="loading-state">Loading admin…</div>;
  if (!unlocked)
    return (
      <div className="manager-gate wrap">
        <div className="gate-card">
          <p className="eyebrow">Hotspot admin</p>
          <h1>Add hazards without a rebuild.</h1>
          <form onSubmit={unlock}>
            <label htmlFor="admin-code">Manager code</label>
            <input id="admin-code" value={code} onChange={(e) => { setCode(e.target.value); setError(''); }} autoComplete="off" placeholder="Enter access code" />
            {error && <p className="gate-error" role="alert">{error}</p>}
            <button className="button primary" type="submit">Unlock admin</button>
          </form>
        </div>
      </div>
    );

  return (
    <div className="manager-page wrap">
      <p className="eyebrow">Admin - {all.length} hotspots live</p>
      <h1>Manage hotspots</h1>
      <div className="records-table" role="table">
        {all.map((spot) => (
          <div className="table-row" role="row" key={spot.id}>
            <span className="name-cell">{spot.label} <em>{spot.roleTag}</em></span>
            <span>{spot.yaw}/{spot.pitch}</span>
            <span>{spot.active ? 'Live' : 'Off'}</span>
            <button className="filter" onClick={() => toggle(spot)}>{spot.active ? 'Deactivate' : 'Activate'}</button>
          </div>
        ))}
      </div>
      <h2>Add hotspot</h2>
      <form onSubmit={add} className="gate-card">
        <label htmlFor="hs-label">Label</label>
        <input id="hs-label" value={label} onChange={(e) => setLabel(e.target.value)} required maxLength={60} placeholder="e.g. Loading bay" />
        <label htmlFor="hs-role">Role tag</label>
        <input id="hs-role" value={roleTag} onChange={(e) => setRoleTag(e.target.value)} placeholder="all, picker, forklift-driver" />
        <label htmlFor="hs-yaw">Yaw -180 to 180</label>
        <input id="hs-yaw" value={yaw} onChange={(e) => setYaw(e.target.value)} inputMode="numeric" />
        <label htmlFor="hs-pitch">Pitch -90 to 90</label>
        <input id="hs-pitch" value={pitch} onChange={(e) => setPitch(e.target.value)} inputMode="numeric" />
        <label htmlFor="hs-hazard">Hazard, under 40 words</label>
        <input id="hs-hazard" value={hazard} onChange={(e) => setHazard(e.target.value)} required maxLength={240} />
        <label htmlFor="hs-fix">Safe action, under 40 words</label>
        <input id="hs-fix" value={fix} onChange={(e) => setFix(e.target.value)} required maxLength={240} />
        <button className="button primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save hotspot'}</button>
        {saved && <p role="status">{saved}</p>}
      </form>
    </div>
  );
}
