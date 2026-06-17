import { useRef, useCallback } from 'react'
import MapBackground from '../MapBackground'

// Mini interactive map for choosing entry coordinates (0-100%)
export default function DraggableMap({ x, y, onChange }) {
  const containerRef = useRef(null)

  const updateFromEvent = useCallback((e) => {
    const rect = containerRef.current.getBoundingClientRect()
    const nx = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const ny = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    onChange(parseFloat(nx.toFixed(1)), parseFloat(ny.toFixed(1)))
  }, [onChange])

  const handleMouseDown = (e) => {
    e.preventDefault()
    updateFromEvent(e)
    const move = (ev) => updateFromEvent(ev)
    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  return (
    <div>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        style={{
          position: 'relative',
          width: '100%',
          height: 180,
          borderRadius: 10,
          overflow: 'hidden',
          cursor: 'crosshair',
          border: '1.5px solid #e0ddd8',
          userSelect: 'none',
        }}
      >
        {/* Mini map */}
        <div style={{ position: 'absolute', inset: 0, transform: 'scale(1)', transformOrigin: '0 0' }}>
          <MapBackground />
        </div>

        {/* Pin */}
        <div
          style={{
            position: 'absolute',
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)',
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#FF6B7A',
            border: '2.5px solid white',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        {['X', 'Y'].map((label, li) => (
          <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b6560', fontFamily: '"IBM Plex Mono", monospace' }}>
            {label}
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={li === 0 ? x : y}
              onChange={e => {
                const v = parseFloat(e.target.value)
                if (!isNaN(v)) li === 0 ? onChange(v, y) : onChange(x, v)
              }}
              style={{
                width: 64,
                border: '1.5px solid #e0ddd8',
                borderRadius: 6,
                padding: '4px 8px',
                fontSize: 12,
                fontFamily: '"IBM Plex Mono", monospace',
                background: '#faf9f6',
              }}
            />
          </label>
        ))}
      </div>
      <p style={{ fontSize: 10, color: '#b0a8a0', marginTop: 4, fontFamily: '"IBM Plex Mono", monospace' }}>
        点击或拖拽地图设置位置
      </p>
    </div>
  )
}
