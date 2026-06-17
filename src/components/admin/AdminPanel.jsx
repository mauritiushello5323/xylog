import { useState, useEffect } from 'react'
import EntryForm from './EntryForm'
import { getEntries, getDays, deleteEntry } from '../../lib/api'
import { getCategoryColor } from '../../utils/categoryColors'
import { isDemo } from '../../lib/supabase'

export default function AdminPanel({ onLogout }) {
  const [days, setDays] = useState([1])
  const [currentDay, setCurrentDay] = useState(1)
  const [entries, setEntries] = useState([])
  const [editing, setEditing] = useState(null) // null = list, false = new, entry = edit
  const [loading, setLoading] = useState(false)

  const loadDays = async () => {
    try {
      const d = await getDays()
      setDays(d.length > 0 ? d : [1])
    } catch {}
  }

  const loadEntries = async (day) => {
    setLoading(true)
    try {
      const data = await getEntries(day)
      setEntries(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDays()
  }, [])

  useEffect(() => {
    loadEntries(currentDay)
  }, [currentDay])

  const handleDelete = async (entry) => {
    if (!confirm(`确定删除"${entry.location_name}"？`)) return
    try {
      await deleteEntry(entry.id)
      setEntries(prev => prev.filter(e => e.id !== entry.id))
    } catch (err) {
      alert('删除失败：' + err.message)
    }
  }

  const handleSaved = () => {
    setEditing(null)
    loadDays()
    loadEntries(currentDay)
  }

  const panelStyle = {
    height: '100vh',
    background: '#f4f2ec',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '"IBM Plex Mono", monospace',
  }

  // ── Form view ──────────────────────────────────────────────
  if (editing !== null) {
    return (
      <div style={panelStyle}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e0ddd8', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.8)' }}>
          <button onClick={() => setEditing(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#7a7470', fontSize: 18 }}>←</button>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#1a1a1a' }}>xylog admin</span>
        </div>
        <div className="admin-scroll flex-1" style={{ padding: 24 }}>
          <EntryForm
            entry={editing === false ? null : editing}
            onSaved={handleSaved}
            onCancel={() => setEditing(null)}
          />
        </div>
      </div>
    )
  }

  // ── List view ──────────────────────────────────────────────
  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #e0ddd8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.8)' }}>
        <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '0.1em', color: '#1a1a1a' }}>xylog admin</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a href="#/" style={{ fontSize: 11, color: '#a0998f', textDecoration: 'none' }}>← 返回地图</a>
          <button
            onClick={() => { sessionStorage.removeItem('xylog-admin'); onLogout() }}
            style={{ fontSize: 11, color: '#FF6B7A', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            退出
          </button>
        </div>
      </div>

      {/* Demo warning */}
      {isDemo && (
        <div style={{ background: '#FFF5C0', borderBottom: '1px solid #FDCB1A', padding: '8px 20px', fontSize: 11, color: '#7A5F00' }}>
          ⚠ 演示模式：当前使用本地数据，添加/编辑功能需配置 Supabase 后才可用。
        </div>
      )}

      {/* Day tabs */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #e0ddd8', display: 'flex', gap: 8, flexWrap: 'wrap', background: '#faf9f6' }}>
        {days.map(d => (
          <button
            key={d}
            onClick={() => setCurrentDay(d)}
            style={{
              padding: '4px 14px',
              borderRadius: 999,
              border: `1.5px solid ${currentDay === d ? '#1a1a1a' : '#d8d5d0'}`,
              background: currentDay === d ? '#1a1a1a' : 'transparent',
              color: currentDay === d ? '#fff' : '#6b6560',
              fontSize: 11,
              fontFamily: '"IBM Plex Mono", monospace',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            DAY {d}
          </button>
        ))}
        {/* Add new day button */}
        <button
          onClick={() => {
            const maxDay = Math.max(...days, 0)
            setCurrentDay(maxDay + 1)
            setDays(d => [...new Set([...d, maxDay + 1])].sort((a,b)=>a-b))
          }}
          style={{
            padding: '4px 12px',
            borderRadius: 999,
            border: '1.5px dashed #d0cdc8',
            background: 'transparent',
            color: '#a0998f',
            fontSize: 11,
            fontFamily: '"IBM Plex Mono", monospace',
            cursor: 'pointer',
          }}
        >
          + Day
        </button>
      </div>

      {/* Add entry button */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #e0ddd8', background: '#faf9f6' }}>
        <button
          onClick={() => setEditing(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 16px',
            background: '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 12,
            fontFamily: '"IBM Plex Mono", monospace',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ＋ 新增地点
        </button>
      </div>

      {/* Entry list */}
      <div className="admin-scroll flex-1">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#a0998f', fontSize: 12 }}>loading...</div>
        ) : entries.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#a0998f', fontSize: 12 }}>
            暂无内容 · 点击「新增地点」添加第一个
          </div>
        ) : (
          entries.map(entry => {
            const color = getCategoryColor(entry.category)
            return (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 20px',
                  borderBottom: '1px solid #eae7e2',
                  background: '#faf9f6',
                }}
              >
                {/* Thumb */}
                <div style={{
                  width: 48, height: 48, borderRadius: 6, flexShrink: 0,
                  border: `2px solid ${color.border}`,
                  overflow: 'hidden', background: color.bg
                }}>
                  {entry.images?.[0] && (
                    <img src={entry.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 12, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {entry.location_name}
                  </div>
                  <div style={{ fontSize: 10, color: '#a0998f', marginTop: 2 }}>
                    <span style={{ color: color.text }}>{entry.category}</span>
                    {' · '}x={entry.x.toFixed(0)} y={entry.y.toFixed(0)}
                    {' · '}{entry.images?.length ?? 0} 张图
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => setEditing(entry)}
                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #d8d5d0', background: '#fff', cursor: 'pointer', color: '#3a3730' }}
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(entry)}
                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid #ffc0c6', background: '#fff8f8', cursor: 'pointer', color: '#c0001a' }}
                  >
                    删除
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
