import { useState, useEffect } from 'react'
import MapBackground from './MapBackground'
import LocationPin from './LocationPin'
import Lightbox from './Lightbox'
import FilterBar from './FilterBar'
import DayNav from './DayNav'
import MusicPlayer from './MusicPlayer'
import { getEntries, getDays, getDayMusic } from '../lib/api'
import { isDemo } from '../lib/supabase'

export default function MapView() {
  const [days, setDays] = useState([1])
  const [currentDay, setCurrentDay] = useState(1)
  const [entries, setEntries] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [musicUrl, setMusicUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load available days once
  useEffect(() => {
    getDays().then(d => {
      setDays(d.length > 0 ? d : [1])
      setCurrentDay(d[0] ?? 1)
    }).catch(console.error)
  }, [])

  // Load entries + music for current day
  useEffect(() => {
    setLoading(true)
    setActiveFilter('all')
    Promise.all([
      getEntries(currentDay),
      getDayMusic(currentDay),
    ])
      .then(([data, music]) => {
        setEntries(data)
        setMusicUrl(music)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [currentDay])

  // Derived: categories present in current data
  const availableCategories = [...new Set(entries.map(e => e.category).filter(Boolean))]

  // Filtered entries for display
  const visible = activeFilter === 'all'
    ? entries
    : entries.filter(e => e.category === activeFilter)

  const handlePrev = () => {
    const i = days.indexOf(currentDay)
    if (i > 0) setCurrentDay(days[i - 1])
  }
  const handleNext = () => {
    const i = days.indexOf(currentDay)
    if (i < days.length - 1) setCurrentDay(days[i + 1])
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#eeebe4]">
      {/* Demo mode banner */}
      {isDemo && (
        <div
          className="fixed top-10 left-1/2 -translate-x-1/2 z-40 text-xs px-3 py-1 rounded-full"
          style={{
            background: 'rgba(255,200,100,0.9)',
            color: '#6b4a00',
            fontFamily: '"IBM Plex Mono", monospace',
            letterSpacing: '0.05em',
          }}
        >
          演示模式 · 数据仅供预览
        </div>
      )}

      {/* Map background */}
      <MapBackground />

      {/* Pins layer */}
      <div className="absolute inset-0">
        {!loading && entries.map(entry => (
          <LocationPin
            key={entry.id}
            entry={entry}
            onClick={setSelected}
            dimmed={activeFilter !== 'all' && entry.category !== activeFilter}
          />
        ))}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 12,
              color: '#a0998f',
              letterSpacing: '0.12em',
            }}
          >
            loading...
          </div>
        </div>
      )}

      {/* Day navigation (top) */}
      <DayNav
        days={days}
        currentDay={currentDay}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {/* Category filter bar (bottom centre) */}
      <FilterBar
        active={activeFilter}
        onSelect={setActiveFilter}
        availableCategories={availableCategories}
      />

      {/* Music player (bottom left) */}
      <MusicPlayer musicUrl={musicUrl} />

      {/* Admin link (bottom right, subtle) — uses hash routing for GitHub Pages */}
      <a
        href="#/admin"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 30,
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 10,
          color: '#c0bab4',
          letterSpacing: '0.08em',
          textDecoration: 'none',
        }}
      >
        admin
      </a>

      {/* Lightbox */}
      {selected && (
        <Lightbox entry={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
