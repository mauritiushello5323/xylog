import { getCategoryColor } from '../utils/categoryColors'

// Photo rotation offsets for stacked polaroid look
const STACK_ROTATIONS = [[-5, -4], [3, 2], [0, 0]]
const STACK_TRANSLATE = [[-7, 5], [4, 3], [0, 0]]

function PhotoStack({ images, borderColor }) {
  const count = Math.min(images.length, 3)
  const size = 80

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      {Array.from({ length: count }).map((_, idx) => {
        const layer = count - 1 - idx // render back-to-front
        const [rot] = [STACK_ROTATIONS[layer]]
        const [tx, ty] = STACK_TRANSLATE[layer]
        return (
          <div
            key={layer}
            style={{
              position: 'absolute',
              inset: 0,
              border: `3px solid ${borderColor}`,
              borderRadius: 5,
              overflow: 'hidden',
              boxShadow: '0 3px 10px rgba(0,0,0,0.14)',
              transform: `rotate(${STACK_ROTATIONS[layer][0]}deg) translate(${tx}px, ${ty}px)`,
              background: '#fff',
              zIndex: layer,
            }}
          >
            <img
              src={images[layer]}
              alt=""
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              loading="lazy"
            />
          </div>
        )
      })}
    </div>
  )
}

export default function LocationPin({ entry, onClick, dimmed }) {
  const { location_name, category, x, y, images = [] } = entry
  const color = getCategoryColor(category)

  return (
    <div
      className="pin-hover"
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: 0,
        height: 0,
        zIndex: dimmed ? 1 : 10,
        opacity: dimmed ? 0.25 : 1,
        transition: 'opacity 0.25s ease',
      }}
    >
      {/* Column: stack → label → connector → dot — bottom aligned to (x,y) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
        }}
        onClick={() => onClick(entry)}
      >
        {/* Photo stack */}
        <div className="pin-stack">
          {images.length > 0 ? (
            <PhotoStack images={images} borderColor={color.border} />
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                border: `3px solid ${color.border}`,
                borderRadius: 5,
                background: color.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(0,0,0,0.14)',
              }}
            >
              <span style={{ fontSize: 28 }}>📍</span>
            </div>
          )}
        </div>

        {/* Location name label */}
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            fontFamily: '"IBM Plex Mono", monospace',
            letterSpacing: '0.06em',
            color: '#3a3730',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 3px rgba(255,255,255,0.9)',
          }}
        >
          {location_name}
        </span>

        {/* Dashed connector line */}
        <div
          className="pin-connector"
          style={{ width: 1.5, height: 40 }}
        />
      </div>

      {/* Anchor dot at geographic position */}
      <div
        style={{
          position: 'absolute',
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: color.border,
          border: '1.5px solid rgba(255,255,255,0.8)',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }}
      />
    </div>
  )
}
