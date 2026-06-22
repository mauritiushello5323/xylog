import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { getCategoryColor } from '../utils/categoryColors'

// Stacking offsets for polaroid effect
const ROTATIONS  = [[-5, -7,  5], [3, 4, 3], [0, 0, 0]]

function buildPinHtml(entry, color) {
  const photos = entry.images?.slice(0, 3) ?? []

  const photosHtml = photos.map((url, i) => `
    <div style="
      position:absolute;inset:0;
      border:3px solid ${color.border};border-radius:5px;
      overflow:hidden;
      box-shadow:0 3px 10px rgba(0,0,0,0.15);
      transform:rotate(${ROTATIONS[i][0]}deg) translate(${ROTATIONS[i][1]}px,${ROTATIONS[i][2]}px);
      z-index:${i + 1};background:#fff;
    ">
      <img src="${url}"
        style="width:100%;height:100%;object-fit:cover;display:block"
        loading="lazy"
        onerror="this.style.display='none'"
      />
    </div>
  `).join('')

  const placeholderHtml = photos.length === 0 ? `
    <div style="
      position:absolute;inset:0;
      border:3px solid ${color.border};border-radius:5px;
      background:${color.bg};
      display:flex;align-items:center;justify-content:center;font-size:26px;
    ">📍</div>
  ` : ''

  return `
    <div style="
      display:flex;flex-direction:column;align-items:center;
      cursor:pointer;width:120px;height:180px;overflow:visible;
    ">
      <!-- Photo stack -->
      <div style="position:relative;flex:0 0 80px;width:80px;height:80px;overflow:visible;">
        ${photosHtml || placeholderHtml}
      </div>

      <!-- Location label -->
      <span style="
        flex:0;margin-top:5px;
        font-size:10px;font-weight:600;
        font-family:'IBM Plex Mono',monospace;
        letter-spacing:0.06em;white-space:nowrap;
        color:#2a2724;text-shadow:0 1px 3px rgba(255,255,255,0.95);
      ">${entry.location_name}</span>

      <!-- Dashed connector line -->
      <div style="
        flex:1;width:1.5px;margin-top:4px;min-height:20px;
        background:repeating-linear-gradient(
          to bottom,
          #b0aca6 0,#b0aca6 4px,
          transparent 4px,transparent 8px
        );
      "></div>

      <!-- Anchor dot (at geographic position) -->
      <div style="
        flex:0 0 8px;width:8px;height:8px;
        border-radius:50%;
        background:${color.border};
        border:1.5px solid rgba(255,255,255,0.85);
        box-shadow:0 1px 4px rgba(0,0,0,0.22);
      "></div>
    </div>
  `
}

export default function LocationPin({ entry, onClick, dimmed }) {
  if (!entry.lat || !entry.lng) return null

  const color = getCategoryColor(entry.category)

  const icon = L.divIcon({
    html: buildPinHtml(entry, color),
    className: 'xylog-pin',
    iconSize:   [120, 180],
    iconAnchor: [60, 180],   // bottom-centre = the dot = geographic point
  })

  return (
    <Marker
      position={[entry.lat, entry.lng]}
      icon={icon}
      opacity={dimmed ? 0.2 : 1}
      eventHandlers={{ click: () => onClick(entry) }}
    />
  )
}
