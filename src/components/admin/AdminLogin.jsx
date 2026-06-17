import { useState } from 'react'

const ADMIN_PW = import.meta.env.VITE_ADMIN_PASSWORD || 'admin'

export default function AdminLogin({ onSuccess }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (pw === ADMIN_PW) {
      sessionStorage.setItem('xylog-admin', '1')
      onSuccess()
    } else {
      setError(true)
      setPw('')
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#eeebe4]">
      <div
        className="glass rounded-2xl p-10 shadow-xl"
        style={{ width: 340 }}
      >
        <h1
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: '0.12em',
            marginBottom: 6,
            color: '#1a1a1a',
          }}
        >
          xylog
        </h1>
        <p style={{ fontSize: 12, color: '#a0998f', marginBottom: 28, fontFamily: '"IBM Plex Mono", monospace' }}>
          管理后台
        </p>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(false) }}
            placeholder="输入密码"
            autoFocus
            style={{
              border: error ? '1.5px solid #FF6B7A' : '1.5px solid #dedad4',
              borderRadius: 8,
              padding: '10px 12px',
              fontSize: 14,
              background: '#faf9f6',
              outline: 'none',
              fontFamily: '"IBM Plex Mono", monospace',
              letterSpacing: '0.1em',
            }}
          />
          {error && (
            <span style={{ fontSize: 11, color: '#FF6B7A', fontFamily: '"IBM Plex Mono", monospace' }}>
              密码错误
            </span>
          )}
          <button
            type="submit"
            style={{
              background: '#1a1a1a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px',
              fontSize: 13,
              fontFamily: '"IBM Plex Mono", monospace',
              fontWeight: 600,
              letterSpacing: '0.08em',
              cursor: 'pointer',
            }}
          >
            进入
          </button>
        </form>

        <a
          href="#/"
          style={{
            display: 'block',
            marginTop: 16,
            fontSize: 11,
            color: '#b0a8a0',
            textDecoration: 'none',
            fontFamily: '"IBM Plex Mono", monospace',
            textAlign: 'center',
          }}
        >
          ← 返回地图
        </a>
      </div>
    </div>
  )
}
