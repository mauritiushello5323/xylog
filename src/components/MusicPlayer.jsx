import { useState, useRef, useEffect } from 'react'

const DOT_COUNT = 16

export default function MusicPlayer({ musicUrl }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0) // 0-1

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.src = musicUrl || ''
    setPlaying(false)
    setProgress(0)
  }, [musicUrl])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio || !musicUrl) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    setProgress(audio.currentTime / audio.duration)
  }

  const handleEnded = () => setPlaying(false)

  // How many dots to fill
  const filledDots = Math.round(progress * DOT_COUNT)

  return (
    <div
      style={{
        position: 'fixed', bottom: 68, left: 20, zIndex: 1000,
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: 999,
        padding: '5px 12px 5px 6px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        loop
      />

      {/* Play / Pause button */}
      <button
        onClick={toggle}
        disabled={!musicUrl}
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: musicUrl ? '#1a1a1a' : '#d0ccc8',
          color: '#fff',
          border: 'none',
          cursor: musicUrl ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          flexShrink: 0,
          transition: 'background 0.2s',
        }}
      >
        {playing ? '❙❙' : '▶'}
      </button>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {Array.from({ length: DOT_COUNT }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: i < filledDots ? '#1a1a1a' : '#d0ccc8',
              transition: 'background 0.1s',
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}
