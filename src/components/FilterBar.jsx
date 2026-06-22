import { CATEGORIES } from '../utils/categoryColors'

export default function FilterBar({ active, onSelect, availableCategories, bottomOffset = 20 }) {
  // Only show categories that appear in the current data + 'all'
  const keys = ['all', ...availableCategories]

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 flex gap-2 flex-wrap justify-center"
      style={{ maxWidth: '90vw', zIndex: 1000, bottom: bottomOffset }}
    >
      {keys.map((key) => {
        const cat = CATEGORIES[key] ?? CATEGORIES.other
        const isActive = active === key
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.07em',
              padding: '6px 14px',
              borderRadius: 999,
              border: `1.5px solid ${cat.border}`,
              background: isActive ? cat.border : 'rgba(255,255,255,0.85)',
              color: isActive ? (key === 'all' ? '#fff' : cat.text) : cat.text,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              boxShadow: isActive
                ? `0 2px 12px ${cat.border}55`
                : '0 1px 6px rgba(0,0,0,0.08)',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
