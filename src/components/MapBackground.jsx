// Full-screen city map SVG background
// Star-shaped road network radiating from a central intersection
// Coordinates: viewBox 0 0 1440 900

const C = { x: 720, y: 430 } // map center

// ── colour palette ────────────────────────────────────────────
const BG          = '#eeebe4'  // overall ground / block fill
const BLOCK       = '#f7f5f0'  // elevated block areas (lighter)
const BLOCK_OUTER = '#f2efe9'  // far-edge blocks
const ROAD_MJ     = '#d8d4cc'  // major road colour
const ROAD_MN     = '#e0ddd5'  // minor road colour
const PARK        = '#dce8cc'  // park / green space
const WATER       = '#cce0ea'  // water
const AIRPORT_GND = '#e6e3db'  // airport apron
const RUNWAY      = '#d4d0c8'  // runway strips

// ── ring corner coordinates ───────────────────────────────────
// Inner octagon at r≈175
const IR = [
  [720, 255], [844, 306], [895, 430], [844, 554],
  [720, 605], [596, 554], [545, 430], [596, 306],
]
// Outer octagon at r≈340
const OR = [
  [720,  90], [960, 190], [1060, 430], [960, 670],
  [720, 770], [480, 670], [ 380, 430], [480, 190],
]

const pts = (arr) => arr.map(p => p.join(',')).join(' ')

// ── sector block polygons (between inner & outer ring) ────────
const outerBlocks = [
  [IR[0], IR[1], OR[1], OR[0]],  // N-NE
  [IR[1], IR[2], OR[2], OR[1]],  // NE-E
  [IR[2], IR[3], OR[3], OR[2]],  // E-SE
  [IR[3], IR[4], OR[4], OR[3]],  // SE-S
  [IR[4], IR[5], OR[5], OR[4]],  // S-SW
  [IR[5], IR[6], OR[6], OR[5]],  // SW-W
  [IR[6], IR[7], OR[7], OR[6]],  // W-NW
  [IR[7], IR[0], OR[0], OR[7]],  // NW-N
]

// ── inner sector triangles (center → inner ring) ──────────────
const innerBlocks = IR.map((pt, i) => [
  [C.x, C.y], pt, IR[(i + 1) % IR.length],
])

// ── exterior far blocks (outer ring → map edge) ───────────────
const farBlocks = [
  // Upper-right quadrant
  [[720,90],[960,190],[1060,430],[1440,430],[1440,0],[1150,0]],
  // Right → lower-right
  [[1060,430],[960,670],[1190,900],[1440,900],[1440,430]],
  // Lower centre
  [[960,670],[720,770],[720,900],[1190,900]],
  // Lower-left (excluding airport zone)
  [[720,770],[480,670],[380,700],[380,900],[720,900]],
  // Left upper
  [[380,430],[480,190],[290,0],[0,0],[0,430]],
  // Upper-left
  [[480,190],[720,90],[720,0],[1150,0],[960,190]], // ← connects to top
]

// ── radial roads (centre → edge) ─────────────────────────────
const radials = [
  [[C.x,C.y],[720,0]],         // N
  [[C.x,C.y],[1150,0]],        // NE
  [[C.x,C.y],[1440,430]],      // E
  [[C.x,C.y],[1190,900]],      // SE
  [[C.x,C.y],[720,900]],       // S
  [[C.x,C.y],[250,900]],       // SW
  [[C.x,C.y],[0,430]],         // W
  [[C.x,C.y],[290,0]],         // NW
]

// ── secondary / cross streets ─────────────────────────────────
const secondary = [
  // Horizontal cross-city
  [[0,300],[560,300]], [[0,530],[570,530]],
  [[860,280],[1440,230]], [[880,590],[1440,650]],
  // Vertical cross-city
  [[620,0],[620,260]], [[820,0],[820,270]],
  [[610,600],[580,900]], [[850,600],[880,900]],
  // NW quadrant streets
  [[290,0],[390,180],[380,430]],
  // NE quadrant
  [[1150,0],[1040,200],[1060,430]],
  // Inner horizontal
  [[545,430],[380,430]], [[895,430],[1060,430]],
  // Diagonal extras
  [[380,430],[250,900]], [[0,430],[0,900]],
  [[480,670],[250,900]], [[960,670],[1190,900]],
]

// ── parks ────────────────────────────────────────────────────
const parks = [
  // Large NW park
  [[160,60],[400,40],[490,190],[380,250],[280,200],[120,140]],
  // Small SW park
  [[100,650],[230,620],[280,700],[200,750],[80,720]],
  // East green strip
  [[1180,300],[1340,260],[1380,380],[1280,430],[1160,390]],
]

// ── water (river / canal) ─────────────────────────────────────
const riverD = `M0,580 C150,560 280,590 420,570 C560,548 650,565 720,552
                C800,539 920,560 1060,545 C1180,533 1320,558 1440,540
                L1440,600 C1300,614 1160,592 1030,608
                C900,622 790,602 660,618 C530,634 410,612 280,628
                C160,642 80,628 0,644 Z`

export default function MapBackground() {
  return (
    <svg
      viewBox="0 0 1440 900"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* ── Ground / base ── */}
      <rect width="1440" height="900" fill={BG} />

      {/* ── Airport ground (lower-left) ── */}
      <polygon
        points="0,620 360,610 340,900 0,900"
        fill={AIRPORT_GND}
      />
      {/* Runway 1 */}
      <rect x="30" y="650" width="14" height="220"
        fill={RUNWAY} transform="rotate(-18 37 760)" />
      {/* Runway 2 */}
      <rect x="85" y="645" width="14" height="210"
        fill={RUNWAY} transform="rotate(-18 92 750)" />
      {/* Taxiway */}
      <rect x="140" y="660" width="6" height="160"
        fill={RUNWAY} opacity="0.7" transform="rotate(-18 143 740)" />

      {/* ── Parks ── */}
      {parks.map((p, i) => (
        <polygon key={`park-${i}`} points={pts(p)} fill={PARK} />
      ))}

      {/* ── Water ── */}
      <path d={riverD} fill={WATER} />

      {/* ── Far exterior blocks ── */}
      {farBlocks.map((b, i) => (
        <polygon key={`fb-${i}`} points={pts(b)} fill={BLOCK_OUTER} />
      ))}

      {/* ── Sector blocks between rings ── */}
      {outerBlocks.map((b, i) => (
        <polygon key={`ob-${i}`} points={pts(b)} fill={BLOCK} />
      ))}

      {/* ── Inner blocks (center area) ── */}
      {innerBlocks.map((b, i) => (
        <polygon key={`ib-${i}`} points={pts(b)} fill={BLOCK} />
      ))}

      {/* ── Outer ring road ── */}
      <polygon points={pts(OR)}
        fill="none" stroke={ROAD_MJ} strokeWidth="10"
        strokeLinejoin="round" />

      {/* ── Inner ring road ── */}
      <polygon points={pts(IR)}
        fill="none" stroke={ROAD_MJ} strokeWidth="8"
        strokeLinejoin="round" />

      {/* ── Radial major roads ── */}
      {radials.map(([a, b], i) => (
        <line key={`r-${i}`}
          x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]}
          stroke={ROAD_MJ} strokeWidth="13"
          strokeLinecap="round" />
      ))}

      {/* ── Secondary / minor streets ── */}
      {secondary.map((seg, i) => {
        if (seg.length === 2) {
          return <line key={`s-${i}`}
            x1={seg[0][0]} y1={seg[0][1]}
            x2={seg[1][0]} y2={seg[1][1]}
            stroke={ROAD_MN} strokeWidth="5"
            strokeLinecap="round" />
        }
        return <polyline key={`s-${i}`}
          points={pts(seg)}
          fill="none" stroke={ROAD_MN} strokeWidth="5"
          strokeLinecap="round" strokeLinejoin="round" />
      })}

      {/* ── Fine grid lines (adds density to blocks) ── */}
      {[160,240,320,400,480,560,640,800,880,960,1040,1120,1200,1280,1360].map(x => (
        <line key={`vg-${x}`}
          x1={x} y1="0" x2={x} y2="900"
          stroke={ROAD_MN} strokeWidth="2" opacity="0.35" />
      ))}
      {[90,160,230,310,390,470,550,620,700,780,840,920].map(y => (
        <line key={`hg-${y}`}
          x1="0" y1={y} x2="1440" y2={y}
          stroke={ROAD_MN} strokeWidth="2" opacity="0.35" />
      ))}

      {/* ── Airport label strip ── */}
      <rect x="0" y="885" width="200" height="15" fill={RUNWAY} opacity="0.4" />
    </svg>
  )
}
