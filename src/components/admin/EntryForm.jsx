import { useState, useEffect } from 'react'
import DraggableMap from './DraggableMap'
import ImageUploader from './ImageUploader'
import { CATEGORY_KEYS, CATEGORIES } from '../../utils/categoryColors'
import { createEntry, updateEntry, uploadFile } from '../../lib/api'
import { isDemo } from '../../lib/supabase'

const BLANK = {
  day: 1,
  location_name: '',
  category: 'other',
  x: 50,
  y: 50,
  description: '',
  images: [],
  music_url: '',
}

const inputStyle = {
  width: '100%',
  border: '1.5px solid #e0ddd8',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 13,
  background: '#faf9f6',
  outline: 'none',
  fontFamily: '"IBM Plex Mono", monospace',
  color: '#2a2724',
  boxSizing: 'border-box',
}

const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: '#7a7470',
  fontFamily: '"IBM Plex Mono", monospace',
  display: 'block',
  marginBottom: 4,
}

export default function EntryForm({ entry, onSaved, onCancel }) {
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [musicFile, setMusicFile] = useState(null)
  const isEdit = !!entry?.id

  useEffect(() => {
    setForm(entry ? { ...BLANK, ...entry } : BLANK)
    setMusicFile(null)
  }, [entry])

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isDemo) {
      alert('演示模式：请先在 .env 中配置 Supabase 密钥，然后重启项目。')
      return
    }
    if (!form.location_name.trim()) { alert('请填写地点名称'); return }
    setSaving(true)
    try {
      let music_url = form.music_url || null
      if (musicFile) {
        const path = `music/${Date.now()}-${musicFile.name}`
        music_url = await uploadFile('music', musicFile, path)
      }
      const payload = {
        day: Number(form.day),
        location_name: form.location_name.trim(),
        category: form.category,
        x: Number(form.x),
        y: Number(form.y),
        description: form.description || '',
        images: form.images || [],
        music_url,
      }
      if (isEdit) {
        await updateEntry(entry.id, payload)
      } else {
        await createEntry(payload)
      }
      onSaved()
    } catch (err) {
      alert('保存失败：' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <h2 style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>
        {isEdit ? '编辑条目' : '新增地点'}
      </h2>

      {/* Day + Category row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelStyle}>DAY</label>
          <input
            type="number"
            min={1}
            value={form.day}
            onChange={e => set('day', e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>CATEGORY</label>
          <select
            value={form.category}
            onChange={e => set('category', e.target.value)}
            style={inputStyle}
          >
            {CATEGORY_KEYS.filter(k => k !== 'all').map(k => (
              <option key={k} value={k}>{CATEGORIES[k].label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Location name */}
      <div>
        <label style={labelStyle}>地点名称</label>
        <input
          type="text"
          value={form.location_name}
          onChange={e => set('location_name', e.target.value)}
          placeholder="VINTAGE SHOP A"
          style={inputStyle}
        />
      </div>

      {/* Map position */}
      <div>
        <label style={labelStyle}>地图位置（点击或拖拽）</label>
        <DraggableMap
          x={form.x}
          y={form.y}
          onChange={(x, y) => setForm(f => ({ ...f, x, y }))}
        />
      </div>

      {/* Description */}
      <div>
        <label style={labelStyle}>文字内容</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={4}
          placeholder="写点什么..."
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
        />
      </div>

      {/* Images */}
      <div>
        <label style={labelStyle}>照片</label>
        <ImageUploader
          images={form.images}
          onChange={imgs => set('images', imgs)}
          entryId={entry?.id}
        />
      </div>

      {/* Music */}
      <div>
        <label style={labelStyle}>背景音乐（可选）</label>
        {form.music_url && (
          <div style={{ fontSize: 11, color: '#6FA8FF', marginBottom: 6, fontFamily: '"IBM Plex Mono", monospace', wordBreak: 'break-all' }}>
            当前: {form.music_url.split('/').pop()}
            <button
              type="button"
              onClick={() => set('music_url', '')}
              style={{ marginLeft: 8, color: '#FF6B7A', border: 'none', background: 'none', cursor: 'pointer', fontSize: 11 }}
            >
              删除
            </button>
          </div>
        )}
        <input
          type="file"
          accept="audio/*"
          onChange={e => setMusicFile(e.target.files[0] || null)}
          style={{ fontSize: 12, color: '#6b6560', fontFamily: '"IBM Plex Mono", monospace' }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            flex: 1,
            padding: '10px',
            background: saving ? '#a0998f' : '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontFamily: '"IBM Plex Mono", monospace',
            fontWeight: 600,
            cursor: saving ? 'default' : 'pointer',
          }}
        >
          {saving ? '保存中...' : (isEdit ? '保存修改' : '添加地点')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 16px',
            background: 'transparent',
            color: '#7a7470',
            border: '1.5px solid #e0ddd8',
            borderRadius: 8,
            fontSize: 13,
            fontFamily: '"IBM Plex Mono", monospace',
            cursor: 'pointer',
          }}
        >
          取消
        </button>
      </div>
    </form>
  )
}
