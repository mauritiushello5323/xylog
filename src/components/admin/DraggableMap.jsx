import { useEffect, useRef } from 'react'
import { MAP_CENTER, MAP_ZOOM, MAP_STYLE } from '../../config'

const AMAP_KEY = import.meta.env.VITE_AMAP_KEY

// AMap should already be loaded by MapView when admin panel is open,
// but we guard with the same loadAMap helper just in case.
function loadAMap(key) {
  return new Promise((resolve, reject) => {
    if (window.AMap) { resolve(window.AMap); return }
    const s = document.createElement('script')
    s.src = `https://webapi.amap.com/maps?v=1.4.15&key=${key}`
    s.onload  = () => resolve(window.AMap)
    s.onerror = () => reject(new Error('AMap 加载失败'))
    document.head.appendChild(s)
  })
}

// Small red dot HTML for the selected position marker
const RED_DOT = `
  <div style="
    width:14px;height:14px;
    border-radius:50%;
    background:#FF6B7A;
    border:2.5px solid #fff;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
    margin:-7px 0 0 -7px;
  "></div>
`

export default function DraggableMap({ lat, lng, onChange }) {
  const containerRef = useRef(null)
  const mapRef       = useRef(null)
  const markerRef    = useRef(null)

  // Init map once
  useEffect(() => {
    if (!AMAP_KEY || !containerRef.current) return

    loadAMap(AMAP_KEY).then(AMap => {
      if (mapRef.current) return

      const center = lat && lng
        ? [lng, lat]                          // [lng, lat] for AMap
        : [MAP_CENTER[1], MAP_CENTER[0]]

      const map = new AMap.Map(containerRef.current, {
        zoom:      MAP_ZOOM,
        center,
        mapStyle:  MAP_STYLE,
        resizeEnable: true,
        rotateEnable: false,
      })

      // Click to pick position
      map.on('click', e => {
        const newLat = parseFloat(e.lnglat.getLat().toFixed(6))
        const newLng = parseFloat(e.lnglat.getLng().toFixed(6))
        onChange(newLat, newLng)
      })

      mapRef.current = map

      // Render initial dot if position already set
      if (lat && lng) {
        const dot = new AMap.Marker({
          map,
          position: new AMap.LngLat(lng, lat),
          content:  RED_DOT,
          offset:   new AMap.Pixel(0, 0),
        })
        markerRef.current = dot
      }
    }).catch(console.error)

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [])  // run once; lat/lng handled by the effect below

  // Move the red dot when lat/lng changes (e.g. from manual input or click)
  useEffect(() => {
    if (!mapRef.current || !window.AMap) return
    const AMap = window.AMap
    const map  = mapRef.current

    if (!lat || !lng) {
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
      return
    }

    if (markerRef.current) {
      markerRef.current.setPosition(new AMap.LngLat(lng, lat))
    } else {
      const dot = new AMap.Marker({
        map,
        position: new AMap.LngLat(lng, lat),
        content:  RED_DOT,
        offset:   new AMap.Pixel(0, 0),
      })
      markerRef.current = dot
    }
    map.setCenter([lng, lat])
  }, [lat, lng])

  // ── No key: show text fallback ──────────────────────────────────
  if (!AMAP_KEY) {
    return (
      <div>
        <div style={{
          height: 220, borderRadius: 10, border: '1.5px solid #e0ddd8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#faf9f6', flexDirection: 'column', gap: 6,
        }}>
          <span style={{ fontSize: 22 }}>🗺️</span>
          <p style={{ fontSize: 10, color: '#a0998f', textAlign: 'center', fontFamily: '"IBM Plex Mono",monospace', lineHeight: 1.8 }}>
            配置 VITE_AMAP_KEY 后<br/>地图选点功能可用
          </p>
        </div>
        <ManualInputs lat={lat} lng={lng} onChange={onChange} />
      </div>
    )
  }

  return (
    <div>
      <div
        ref={containerRef}
        style={{ height: 220, borderRadius: 10, overflow: 'hidden', border: '1.5px solid #e0ddd8' }}
      />
      <ManualInputs lat={lat} lng={lng} onChange={onChange} />
    </div>
  )
}

// Shared manual lat/lng number inputs
function ManualInputs({ lat, lng, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        {[['lat', '纬度 (Lat)', lat], ['lng', '经度 (Lng)', lng]].map(([key, label, val]) => (
          <label
            key={key}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 11, color: '#6b6560', fontFamily: '"IBM Plex Mono",monospace', flex: 1,
            }}
          >
            {label}
            <input
              type="number"
              step="0.0001"
              value={val ?? ''}
              onChange={e => {
                const v = parseFloat(e.target.value)
                if (!isNaN(v)) key === 'lat' ? onChange(v, lng) : onChange(lat, v)
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
        点击地图选点 · 或手动输入坐标（高德坐标 GCJ-02）
      </p>
    </div>
  )
}
