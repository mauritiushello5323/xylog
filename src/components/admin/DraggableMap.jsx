import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { MAP_CENTER, MAP_ZOOM } from '../../config'

const TILE_URL = 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
const TILE_SUB = ['1', '2', '3', '4']

// Red dot icon for the picked position
const redDot = L.divIcon({
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#FF6B7A;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

// Inner component: captures map clicks and updates position
function ClickPicker({ onChange }) {
  useMapEvents({
    click(e) {
      onChange(
        parseFloat(e.latlng.lat.toFixed(6)),
        parseFloat(e.latlng.lng.toFixed(6)),
      )
    },
  })
  return null
}

export default function DraggableMap({ lat, lng, onChange }) {
  const center = (lat && lng) ? [lat, lng] : MAP_CENTER

  return (
    <div>
      {/* Map */}
      <div style={{ height: 220, borderRadius: 10, overflow: 'hidden', border: '1.5px solid #e0ddd8' }}>
        <MapContainer
          center={center}
          zoom={MAP_ZOOM}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer url={TILE_URL} subdomains={TILE_SUB} />
          <ClickPicker onChange={onChange} />
          {lat && lng && (
            <Marker position={[lat, lng]} icon={redDot} />
          )}
        </MapContainer>
      </div>

      {/* Manual lat/lng input */}
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        {[['lat', '纬度 (Lat)', lat], ['lng', '经度 (Lng)', lng]].map(([key, label, val]) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6b6560', fontFamily: '"IBM Plex Mono",monospace', flex: 1 }}>
            {label}
            <input
              type="number"
              step="0.0001"
              value={val ?? ''}
              onChange={e => {
                const v = parseFloat(e.target.value)
                if (!isNaN(v)) {
                  key === 'lat' ? onChange(v, lng) : onChange(lat, v)
                }
              }}
              style={{
                flex: 1, border: '1.5px solid #e0ddd8', borderRadius: 6,
                padding: '4px 8px', fontSize: 11,
                fontFamily: '"IBM Plex Mono",monospace', background: '#faf9f6',
              }}
            />
          </label>
        ))}
      </div>

      <p style={{ fontSize: 10, color: '#b0a8a0', marginTop: 4, fontFamily: '"IBM Plex Mono",monospace' }}>
        点击地图选点 · 或直接输入坐标（Google Maps 右键→复制坐标）
      </p>
    </div>
  )
}
