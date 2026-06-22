import { useState, useEffect, useRef } from 'react'
import DayNav from './DayNav'
import FilterBar from './FilterBar'
import MusicPlayer from './MusicPlayer'
import Lightbox from './Lightbox'
import { getEntries, getDays, getDayMusic } from '../lib/api'
import { isDemo } from '../lib/supabase'
import { MAP_CENTER, MAP_ZOOM, MAP_STYLE } from '../config'
import { buildPinHtml } from '../utils/pinHtml'
import { getCategoryColor } from '../utils/categoryColors'

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY

// Loads the AMap JS API v1.4 script once; resolves when AMap is ready
function loadAMap(key) {
  return new Promise((resolve, reject) => {
    if (window.AMap) { resolve(window.AMap); return }
    const s = document.createElement('script')
    s.src = `https://webapi.amap.com/maps?v=1.4.15&key=${key}`
    s.onload  = () => resolve(window.AMap)
    s.onerror = () => reject(new Error('AMap SDK 加载失败，请检查 API key 是否正确'))
    document.head.appendChild(s)
  })
}

export default function MapView() {
  const containerRef   = useRef(null)
  const mapRef         = useRef(null)        // AMap.Map instance
  const markersRef     = useRef([])          // active AMap.Marker[]

  const [mapReady,      setMapReady]      = useState(false)
  const [days,          setDays]          = useState([1])
  const [currentDay,    setCurrentDay]    = useState(1)
  const [entries,       setEntries]       = useState([])
  const [activeFilter,  setActiveFilter]  = useState('all')
  const [selected,      setSelected]      = useState(null)
  const [musicUrl,      setMusicUrl]      = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [mapError,      setMapError]      = useState(null)

  // ── 1. Init AMap ───────────────────────────────────────────────
  useEffect(() => {
    if (!AMAP_KEY) return
    if (!containerRef.current) return

    loadAMap(AMAP_KEY)
      .then(AMap => {
        if (mapRef.current) return        // already created (StrictMode double-mount)

        const map = new AMap.Map(containerRef.current, {
          zoom:      MAP_ZOOM,
          center:    [MAP_CENTER[1], MAP_CENTER[0]],  // AMap uses [lng, lat]
          mapStyle:  MAP_STYLE,
          resizeEnable: true,
          rotateEnable: false,
        })

        mapRef.current = map
        setMapReady(true)
      })
      .catch(err => {
        console.error(err)
        setMapError(err.message)
      })

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }
      setMapReady(false)
    }
  }, [])   // run once

  // ── 2. Load days ───────────────────────────────────────────────
  useEffect(() => {
    getDays()
      .then(d => {
        const sorted = d.length > 0 ? d : [1]
        setDays(sorted)
        setCurrentDay(sorted[0])
      })
      .catch(console.error)
  }, [])

  // ── 3. Load entries + music when day changes ───────────────────
  useEffect(() => {
    setLoading(true)
    setActiveFilter('all')
    Promise.all([getEntries(currentDay), getDayMusic(currentDay)])
      .then(([data, music]) => { setEntries(data); setMusicUrl(music) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [currentDay])

  // ── 4. Sync markers when entries / filter / map change ─────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return
    const AMap = window.AMap
    const map  = mapRef.current

    // Remove old markers
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    if (loading) return

    entries.forEach(entry => {
      if (!entry.lat || !entry.lng) return

      const dimmed = activeFilter !== 'all' && entry.category !== activeFilter
      const color  = getCategoryColor(entry.category)

      const marker = new AMap.Marker({
        map,
        position: new AMap.LngLat(entry.lng, entry.lat),
        content:  buildPinHtml(entry, color, dimmed),
        // offset: places top-left corner; (-60, -150) → bottom-centre = map point
        offset:   new AMap.Pixel(-60, -150),
        zIndex:   dimmed ? 10 : 100,
      })

      if (!dimmed) {
        marker.on('click', () => setSelected(entry))
      }

      markersRef.current.push(marker)
    })
  }, [entries, activeFilter, mapReady, loading])

  // ── Navigation helpers ─────────────────────────────────────────
  const handlePrev = () => {
    const i = days.indexOf(currentDay)
    if (i > 0) setCurrentDay(days[i - 1])
  }
  const handleNext = () => {
    const i = days.indexOf(currentDay)
    if (i < days.length - 1) setCurrentDay(days[i + 1])
  }

  const availableCategories = [...new Set(entries.map(e => e.category).filter(Boolean))]

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      {/* ── Map container ── */}
      <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#f0eeea' }} />

      {/* ── No API key placeholder ── */}
      {!AMAP_KEY && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: '#f4f2ec', gap: 10,
        }}>
          <span style={{ fontSize: 28 }}>🗺️</span>
          <p style={{ fontSize: 12, fontFamily: '"IBM Plex Mono",monospace', color: '#7a7470', textAlign: 'center', lineHeight: 1.8 }}>
            需要配置高德地图 API Key<br/>
            <span style={{ fontSize: 10, color: '#a0998f' }}>
              在 GitHub Secrets 中添加 VITE_AMAP_KEY
            </span>
          </p>
          <a href="#/admin" style={{ fontSize: 10, color: '#6FA8FF', fontFamily: '"IBM Plex Mono",monospace' }}>
            前往后台查看说明
          </a>
        </div>
      )}

      {/* ── SDK load error ── */}
      {mapError && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(244,242,236,0.92)',
        }}>
          <p style={{ fontSize: 11, fontFamily: '"IBM Plex Mono",monospace', color: '#c04040', textAlign: 'center' }}>
            {mapError}
          </p>
        </div>
      )}

      {/* ── Demo mode banner ── */}
      {isDemo && (
        <div style={{
          position: 'fixed', top: 44, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, fontSize: 11, padding: '4px 14px', borderRadius: 999,
          background: 'rgba(255,200,80,0.92)', color: '#6b4a00',
          fontFamily: '"IBM Plex Mono",monospace', letterSpacing: '0.05em',
          pointerEvents: 'none',
        }}>
          演示模式 · 数据仅供预览
        </div>
      )}

      {/* ── UI overlays (z-index > AMap's internal layers) ── */}
      <DayNav days={days} currentDay={currentDay} onPrev={handlePrev} onNext={handleNext} />
      <FilterBar active={activeFilter} onSelect={setActiveFilter} availableCategories={availableCategories} />
      <MusicPlayer musicUrl={musicUrl} />

      <a
        href="#/admin"
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 1000,
          fontFamily: '"IBM Plex Mono",monospace', fontSize: 10,
          color: '#c0bab4', textDecoration: 'none',
        }}
      >
        admin
      </a>

      {selected && <Lightbox entry={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
