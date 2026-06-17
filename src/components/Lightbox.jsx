import { useState, useEffect, useCallback } from 'react'
import { getCategoryColor } from '../utils/categoryColors'

export default function Lightbox({ entry, onClose }) {
  const [imgIdx, setImgIdx] = useState(0)

  const images = entry?.images ?? []
  const color = getCategoryColor(entry?.category)

  const prev = useCallback(() => setImgIdx(i => (i - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setImgIdx(i => (i + 1) % images.length), [images.length])

  useEffect(() => {
    setImgIdx(0)
  }, [entry])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, prev, next])

  if (!entry) return null

  return (
    <div
      className="lightbox-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass relative flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxWidth: 680, width: '100%', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-black/10 transition-colors"
          style={{ fontFamily: 'sans-serif', fontSize: 18, lineHeight: 1 }}
        >
          ×
        </button>

        {/* Image area */}
        <div className="relative bg-gray-100 flex-shrink-0" style={{ height: 380 }}>
          {images.length > 0 ? (
            <img
              src={images[imgIdx]}
              alt={entry.location_name}
              className="w-full h-full object-cover"
              style={{ border: `4px solid ${color.border}` }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span style={{ fontSize: 60 }}>🏙️</span>
            </div>
          )}

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center text-gray-700 hover:bg-white/80 transition-colors shadow"
                style={{ fontSize: 18 }}
              >‹</button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center text-gray-700 hover:bg-white/80 transition-colors shadow"
                style={{ fontSize: 18 }}
              >›</button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: i === imgIdx ? color.border : 'rgba(255,255,255,0.6)',
                    border: `1px solid ${color.border}`,
                    transition: 'background 0.2s',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="p-5 overflow-y-auto flex-1">
          {/* Category badge + location */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase"
              style={{
                background: color.bg,
                color: color.text,
                border: `1px solid ${color.border}`,
                fontFamily: '"IBM Plex Mono", monospace',
              }}
            >
              {entry.category}
            </span>
            <span className="text-xs text-gray-400 font-mono">DAY {entry.day}</span>
          </div>

          <h2
            className="text-lg font-semibold tracking-wide mb-3"
            style={{ fontFamily: '"IBM Plex Mono", monospace', color: '#2a2724' }}
          >
            {entry.location_name}
          </h2>

          {entry.description && (
            <p className="text-sm text-gray-600 leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
              {entry.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
