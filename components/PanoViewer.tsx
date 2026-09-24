'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { Minus, Move, Plus } from 'lucide-react'
import { CONFIG, Hotspot } from '@/lib/config'

type Props = { onOpen: (hotspot: Hotspot) => void; onReady?: (api: { lookAt: (yaw: number, pitch: number) => void }) => void }
type Viewer = { lookAt: (pitch: number, yaw: number, hfov?: number) => void; getYaw: () => number; getPitch: () => number; getHfov: () => number; resize: () => void; destroy: () => void }

export default function PanoViewer({ onOpen, onReady }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const viewer = useRef<Viewer | null>(null)
  const initialized = useRef(false)
  const resizeObserver = useRef<ResizeObserver | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => { onReady?.({ lookAt: (yaw, pitch) => viewer.current?.lookAt(pitch, yaw, viewer.current.getHfov()) }) }, [onReady])
  useEffect(() => () => {
    resizeObserver.current?.disconnect()
    resizeObserver.current = null
    window.removeEventListener('resize', resizeViewer)
    viewer.current?.destroy()
    viewer.current = null
    initialized.current = false
  }, [])
  function resizeViewer() {
    if (!ref.current || !viewer.current) return
    viewer.current.resize()
  }
  function init() {
    const pannellum = (window as Window & { pannellum?: { viewer: (el: HTMLDivElement, opts: Record<string, unknown>) => Viewer } }).pannellum
    if (!pannellum || !ref.current || initialized.current) return
    try {
      viewer.current = pannellum.viewer(ref.current, { type: CONFIG.PANO.TYPE, panorama: CONFIG.PANO.SRC, autoLoad: true, showControls: false, draggable: true, keyboardZoom: true, mouseZoom: true, touchPanEnabled: true, friction: 0.15, compass: false, yaw: CONFIG.PANO.INITIAL_YAW, pitch: CONFIG.PANO.INITIAL_PITCH, hfov: CONFIG.PANO.INITIAL_HFOV, onLoad: resizeViewer, hotSpots: CONFIG.HOTSPOTS.map((spot) => ({ pitch: spot.pitch, yaw: spot.yaw, cssClass: 'atlas-hotspot', createTooltipFunc: (hotspot: HTMLElement) => { hotspot.setAttribute('aria-label', spot.label); hotspot.title = spot.label }, clickHandlerFunc: () => onOpen(spot) })) })
      initialized.current = true
      requestAnimationFrame(resizeViewer)
      resizeObserver.current = new ResizeObserver(resizeViewer)
      resizeObserver.current.observe(ref.current)
      window.addEventListener('resize', resizeViewer)
    } catch { setFailed(true) }
  }
  function pan(direction: 'left' | 'right' | 'up' | 'down') { if (!viewer.current) return; const yaw = viewer.current.getYaw(); const pitch = viewer.current.getPitch(); const delta = direction === 'left' ? -15 : direction === 'right' ? 15 : direction === 'up' ? 10 : -10; viewer.current.lookAt(direction === 'up' || direction === 'down' ? pitch + delta : pitch, direction === 'left' || direction === 'right' ? yaw + delta : yaw, viewer.current.getHfov()) }
  function zoom(amount: number) { if (viewer.current) viewer.current.lookAt(viewer.current.getPitch(), viewer.current.getYaw(), viewer.current.getHfov() + amount) }
  return <div className="viewer-wrap"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css" /><Script src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js" onLoad={init} onError={() => setFailed(true)} /><div ref={ref} className="pano" role="application" aria-label="360 warehouse scene. Drag to look around. Use arrow keys. Press plus or minus to zoom." />{failed && <div className="pano-error"><strong>Scene image failed to load.</strong><span>Fix the panorama path in lib/config.ts: {CONFIG.PANO.SRC}</span><small>The hotspot list stays available on the right.</small></div>}<div className="scene-controls" aria-label="Scene controls"><button onClick={() => zoom(-10)} aria-label="Zoom in" title="Zoom in"><Plus /></button><button onClick={() => zoom(10)} aria-label="Zoom out" title="Zoom out"><Minus /></button><button onClick={() => pan('right')} aria-label="Pan" title="Pan"><Move /></button></div><p className="scene-hint">Drag to look around. Use arrow keys. Press + or - to zoom.</p></div>
}
