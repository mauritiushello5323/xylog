import { useState, useRef } from 'react'
import { createEntry, uploadFile } from '../lib/api'
import { isDemo } from '../lib/supabase'
import { CATEGORIES } from '../utils/categoryColors'

const CATEGORY_OPTIONS = Object.entries(CATEGORIES).filter(([k]) => k !== 'all')

export default function QuickAddDrawer({ currentDay, getMapCenter, onClose, onSuccess }) {
  const [form, setForm] = useState({
    day:           currentDay,
    location_name: '',
    category:      'other',
    description:   '',
    lat:           null,
    lng:           null,
  })
  const [files,    setFiles]    = useState([])
  const [previews, setPreviews] = useState([])
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState(null)
  const [done,     setDone]     = useState(false)
  const fileRef = useRef()

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  function handleFiles(e) {
    const selected = Array.from(e.target.files)
    setFiles(selected)
    setPreviews(selected.map(f => URL.createObjectURL(f)))
  }

  function removeFile(i) {
    setFiles(fs => fs.filter((_, j) => j !== i))
    setPreviews(ps => ps.filter((_, j) => j !== i))
  }

  function grabCenter() {
    const c = getMapCenter()
    if (c) {
      set('lat', parseFloat(c.lat.toFixed(6)))
      set('lng', parseFloat(c.lng.toFixed(6)))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.location_name.trim()) { setError('请填写地点名称'); return }
    if (isDemo) { setError('演示模式不支持保存，请先配置 Supabase'); return }

    setSaving(true)
    setError(null)
    try {
      const imageUrls = []
      for (const file of files) {
        const path = `${Date.now()}_${Math.random().toString(36).slice(2)}_${file.name}`
        const url = await uploadFile('images', file, path)
        imageUrls.push(url)
      }
      await createEntry({
        day:           Number(form.day),
        location_name: form.location_name.trim(),
        category:      form.category,
        description:   form.description,
        lat:           form.lat,
        lng:           form.lng,
        images:        imageUrls,
      })
      setDone(true)
      setTimeout(() => { onSuccess(); onClose() }, 1000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1080,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(20,18,16,0.35)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(252,251,249,0.98)',
        borderRadius: '18px 18px 0 0',
        maxHeight: '82vh',
        display: 'flex', flexDirection: 'column',
        paddingBottom: 56,   // tab bar clearance
        boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#d8d4ce' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 20px 12px',
          borderBottom: '1px solid #f0ede8',
        }}>
          <span style={{ fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: '#1a1a1a' }}>
            新增地点
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#a0998f', lineHeight: 1, padding: '0 2px' }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="admin-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '40px 0', fontFamily: '"IBM Plex Mono",monospace', fontSize: 12, color: '#4DC594' }}>
              ✓ 已保存
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Location name */}
              <Field label="地点名称 *">
                <input
                  type="text"
                  placeholder="VINYL RECORD STORE"
                  value={form.location_name}
                  onChange={e => set('location_name', e.target.value)}
                  style={inputStyle}
                />
              </Field>

              {/* Day + Category row */}
              <div style={{ display: 'flex', gap: 12 }}>
                <Field label="Day" style={{ flex: '0 0 70px' }}>
                  <input
                    type="number"
                    min={1}
                    value={form.day}
                    onChange={e => set('day', e.target.value)}
                    style={{ ...inputStyle, textAlign: 'center' }}
                  />
                </Field>
                <Field label="分类" style={{ flex: 1 }}>
                  <select
                    value={form.category}
                    onChange={e => set('category', e.target.value)}
                    style={{ ...inputStyle, appearance: 'none' }}
                  >
                    {CATEGORY_OPTIONS.map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Description */}
              <Field label="描述">
                <textarea
                  placeholder="写下这个地方的故事…"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 72, lineHeight: 1.7 }}
                />
              </Field>

              {/* Images */}
              <Field label="图片">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFiles}
                  style={{ display: 'none' }}
                />
                {previews.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => fileRef.current.click()}
                    style={{
                      width: '100%', padding: '20px 0', borderRadius: 8,
                      border: '1.5px dashed #d0cdc8', background: 'transparent',
                      cursor: 'pointer', fontFamily: '"IBM Plex Mono",monospace',
                      fontSize: 11, color: '#a0998f', letterSpacing: '0.06em',
                    }}
                  >
                    + 点击上传图片
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {previews.map((url, i) => (
                      <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
                        <img src={url} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1.5px solid #e0ddd8' }} />
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          style={{
                            position: 'absolute', top: -6, right: -6,
                            width: 18, height: 18, borderRadius: '50%',
                            background: '#1a1a1a', border: 'none', color: '#fff',
                            fontSize: 11, cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileRef.current.click()}
                      style={{
                        width: 72, height: 72, borderRadius: 6,
                        border: '1.5px dashed #d0cdc8', background: 'transparent',
                        cursor: 'pointer', fontSize: 20, color: '#c0bab4',
                      }}
                    >
                      +
                    </button>
                  </div>
                )}
              </Field>

              {/* Map position */}
              <Field label="地图位置">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={grabCenter}
                    style={{
                      padding: '7px 14px', borderRadius: 8,
                      border: '1.5px solid #d0cdc8', background: 'transparent',
                      cursor: 'pointer', fontFamily: '"IBM Plex Mono",monospace',
                      fontSize: 10, color: '#6b6560', letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    📍 使用地图中心
                  </button>
                  {form.lat && form.lng && (
                    <span style={{ fontSize: 10, fontFamily: '"IBM Plex Mono",monospace', color: '#a0998f' }}>
                      {form.lat.toFixed(4)}, {form.lng.toFixed(4)}
                    </span>
                  )}
                </div>
                <p style={{ marginTop: 5, fontSize: 10, color: '#c0bab4', fontFamily: '"IBM Plex Mono",monospace' }}>
                  关闭抽屉后移动地图，再重新打开点击此按钮
                </p>
              </Field>

              {/* Error */}
              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: '#fff0f0', border: '1px solid #ffd0d0',
                  fontSize: 11, fontFamily: '"IBM Plex Mono",monospace', color: '#c04040',
                }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '13px', borderRadius: 10,
                  background: saving ? '#d0cdc8' : '#1a1a1a',
                  border: 'none', color: '#fff', cursor: saving ? 'default' : 'pointer',
                  fontFamily: '"IBM Plex Mono",monospace', fontSize: 12,
                  fontWeight: 600, letterSpacing: '0.1em',
                  transition: 'background 0.15s',
                }}
              >
                {saving ? '保存中…' : '保存'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────

function Field({ label, children, style }) {
  return (
    <div style={style}>
      <label style={{
        display: 'block', marginBottom: 6,
        fontSize: 10, fontFamily: '"IBM Plex Mono",monospace',
        letterSpacing: '0.08em', color: '#8a8480', fontWeight: 600,
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: 8,
  border: '1.5px solid #e0ddd8',
  background: '#faf9f6',
  fontFamily: '"IBM Plex Mono",monospace',
  fontSize: 12,
  color: '#1a1a1a',
  outline: 'none',
  boxSizing: 'border-box',
}
