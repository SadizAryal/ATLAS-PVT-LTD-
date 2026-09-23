'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { CONFIG, DemoState, initialState, reduceState, StoreAction } from './config'

const StoreContext = createContext<{ state: DemoState; ready: boolean; dispatch: (action: StoreAction) => void; reset: () => void } | null>(null)

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(initialState)
  const [ready, setReady] = useState(false)
  useEffect(() => { try { const saved = window.localStorage.getItem(CONFIG.STORAGE_KEY); setState(saved ? { ...initialState(), ...JSON.parse(saved) } : initialState()) } catch { setState(initialState()) } setReady(true) }, [])
  useEffect(() => { if (ready) window.localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state)) }, [state, ready])
  const value = useMemo(() => ({ state, ready, dispatch: (action: StoreAction) => setState((current) => reduceState(current, action)), reset: () => { window.localStorage.removeItem(CONFIG.STORAGE_KEY); setState(initialState()) } }), [state, ready])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
export function useDemoStoreContext() { const context = useContext(StoreContext); if (!context) throw new Error('DemoStoreProvider is missing'); return context }
