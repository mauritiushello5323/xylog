import { useState, useEffect } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import LocationPin from './LocationPin'
import Lightbox from './Lightbox'
import FilterBar from './FilterBar'
import DayNav from './DayNav'
import MusicPlayer from './MusicPlayer'
import { getEntries, getDays, getDayMusic } from '../lib/api'
import { isDemo } from '../lib/supabase'
import { MAP_CENTER, MAP_ZOOM } from '../config'

// 高德地图瓦片（中国大陆速度快，中文标注，无需 API key）
// 坐标系：GCJ-02（火星坐标系）—— 通过管理后台点击地图设置位置即可对齐
const TILE_URL  = 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
const TILE_SUB  = ['1', '2', '3', '4']
const TILE_ATTR = '&copy; <a href="https://www.amap.com/">高德地图</a>'

export default function MapView() {
  const [days, setDays]               = useState([1])
  const [currentDay, setCurrentDay]   = useState(1)
  const [entries, setEntries]         = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [selected, setSelected]       = useState(null)
  const [musicUrl, setMusicUrl]       = useState(null)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    getDays().then(d => {
      const sorted = d.length > 0 ? d : [1]
      setDays(sorted)
      setCurrentDay(sorted[0])
    }).catch(console.error)
  }, [])

  useEffect(() => {
    setLoading(true)
    setActiveFilter('all')
    Promise.all([getEntries(currentDay), getDayMusic(currentDay)])
      .then(([data, music]) => { setEntries(data); setMusicUrl(music) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [currentDay])

  const availableCategories = [...new Set(entries.map(e => e.category).filter(Boolean))]

  const handlePrev = () => {
    const i = days.indexOf(currentDay)
    if (i > 0) setCurrentDay(days[i - 1])
  }
  const handleNext = () => {
    const i = days.indexOf(currentDay)
    if (i < days.length - 1) setCurrentDay(days[i + 1])
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      {/* ── Real Leaflet Map ── */}
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer url={TILE_URL} subdomains={TILE_SUB} attribution={TILE_ATTR} />

        {!loading && entries.map(entry => (
          <LocationPin
            key={entry.id}
            entry={entry}
            onClick={setSelected}
            dimmed={activeFilter !== 'all' && entry.category !== activeFilter}
          />
        ))}
      </MapContainer>

      {/* ── UI overlays (z-index above Leaflet panes ~700) ── */}

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

      <DayNav
        days={days}
        currentDay={currentDay}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <FilterBar
        active={activeFilter}
        onSelect={setActiveFilter}
        availableCategories={availableCategories}
      />

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
