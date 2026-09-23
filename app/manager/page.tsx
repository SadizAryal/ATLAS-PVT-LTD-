'use client'

import { Check, ChevronDown, Search, X } from 'lucide-react'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { formatDate } from '@/lib/config'
import { useDemoStoreContext } from '@/lib/store'

const ACCESS_KEY = 'atlas-manager-unlocked'

export default function ManagerPage() {
  const { state, ready } = useDemoStoreContext()
  const [unlocked, setUnlocked] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all')
  const [search, setSearch] = useState('')
  const [newest, setNewest] = useState(true)
  useEffect(() => { setUnlocked(window.sessionStorage.getItem(ACCESS_KEY) === 'true') }, [])
  function unlock(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (code === 'COLAB-2026') { window.sessionStorage.setItem(ACCESS_KEY, 'true'); setUnlocked(true); setError('') } else setError('Incorrect access code.') }
  const records = useMemo(() => state.records.filter((r) => (filter === 'all' || (filter === 'passed' ? r.passed : !r.passed)) && r.name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => newest ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)), [state.records, filter, search, newest])
  const passed = state.records.filter((r) => r.passed).length
  if (!ready) return <div className="loading-state">Loading records…</div>
  if (!unlocked) return <div className="manager-gate wrap"><div className="gate-card"><div className="gate-mark" aria-hidden="true">A</div><p className="eyebrow">Manager view <span>• Secure demo area</span></p><h1>See the floor at a glance.</h1><p className="gate-intro">Review induction outcomes, spot follow-ups, and keep every learner moving safely.</p><form onSubmit={unlock}><label htmlFor="manager-code">Demo access code</label><input id="manager-code" value={code} onChange={(event) => { setCode(event.target.value); setError('') }} autoComplete="off" placeholder="Enter access code" aria-describedby="manager-code-hint manager-code-error" aria-invalid={Boolean(error)} /><small id="manager-code-hint">For this demo use <strong>COLAB-2026</strong>.</small>{error && <p id="manager-code-error" className="gate-error" role="alert">{error}</p>}<button className="button primary" type="submit" aria-label="Unlock manager view">Unlock manager view <span aria-hidden="true">→</span></button></form><div className="gate-meta"><span className="gate-dot" aria-hidden="true" /> Demo records only</div></div></div>
  return <div className="manager-page wrap"><div className="page-heading"><div><p className="eyebrow">Overview</p><h1>Training records</h1></div><span className="demo-badge">Demo data</span></div><div className="summary-row"><div><span>Total</span><strong>{state.records.length}</strong></div><div><span>Passed</span><strong>{passed}</strong></div><div><span>Failed</span><strong>{state.records.length - passed}</strong></div></div><div className="table-controls"><div className="filter-group" role="group" aria-label="Filter results">{(['all', 'passed', 'failed'] as const).map((item) => <button key={item} className={filter === item ? 'filter active' : 'filter'} onClick={() => setFilter(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div><label className="search-box"><span className="sr-only">Search by name</span><Search /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name" /></label></div>{records.length ? <div className="records-table" role="table"><div className="table-head" role="row"><span>Name</span><span>Score</span><button onClick={() => setNewest(!newest)} aria-sort={newest ? 'descending' : 'ascending'}>Date <ChevronDown /></button><span>Result</span></div>{records.map((record) => <div className={record.learner ? 'table-row learner-row' : 'table-row'} role="row" key={`${record.name}-${record.date}`}><span className="name-cell">{record.name}{record.learner && <em>You</em>}</span><span>{record.score}%</span><span>{formatDate(record.date)}</span><span className={record.passed ? 'status pass' : 'status fail'}>{record.passed ? <Check /> : <X />} {record.passed ? 'Passed' : 'Failed'}</span></div>)}</div> : <div className="empty-state"><p>No records match.</p><button className="button secondary" onClick={() => { setFilter('all'); setSearch('') }}>Clear filters</button></div>}</div>
}
