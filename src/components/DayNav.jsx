export default function DayNav({ days, currentDay, onPrev, onNext }) {
  const idx = days.indexOf(currentDay)

  return (
    <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-5 py-3 pointer-events-none" style={{ zIndex: 1000 }}>
      {/* Left: prev arrow */}
      <button
        className="pointer-events-auto w-8 h-8 flex items-center justify-center rounded-full glass shadow hover:bg-white/80 transition-colors disabled:opacity-30"
        onClick={onPrev}
        disabled={idx <= 0}
        style={{ fontSize: 18, color: '#3a3730' }}
      >
        ‹
      </button>

      {/* Centre: Day label */}
      <div className="pointer-events-none text-center">
        <span
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.15em',
            color: '#2a2724',
            textShadow: '0 1px 4px rgba(255,255,255,0.9)',
          }}
        >
          DAY {currentDay}
        </span>
      </div>

      {/* Right: logo + next arrow */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Site logo */}
        <a
          href="#/"
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: '#1a1a1a',
            textDecoration: 'none',
          }}
        >
          xylog
        </a>

        {/* Next arrow */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full glass shadow hover:bg-white/80 transition-colors disabled:opacity-30"
          onClick={onNext}
          disabled={idx >= days.length - 1}
          style={{ fontSize: 18, color: '#3a3730' }}
        >
          ›
        </button>
      </div>
    </div>
  )
}
