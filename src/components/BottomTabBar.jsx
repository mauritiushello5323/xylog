// 底部三栏导航：地图 | 新增 | 后台
export default function BottomTabBar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'map', icon: MapIcon, label: '地图' },
    { id: 'add', icon: AddIcon, label: '新增' },
    { id: 'admin', icon: AdminIcon, label: '后台', href: '#/admin' },
  ]

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100,
      height: 56,
      display: 'flex', alignItems: 'stretch',
      background: 'rgba(255,255,255,0.94)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderTop: '1px solid rgba(0,0,0,0.07)',
      boxShadow: '0 -2px 12px rgba(0,0,0,0.05)',
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id
        const Tag = tab.href ? 'a' : 'button'
        return (
          <Tag
            key={tab.id}
            href={tab.href}
            onClick={() => !tab.href && onTabChange(tab.id)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              border: 'none', background: 'transparent', cursor: 'pointer',
              textDecoration: 'none', position: 'relative',
              color: isActive ? '#1a1a1a' : '#b0a8a0',
              transition: 'color 0.15s',
            }}
          >
            <tab.icon active={isActive} />
            <span style={{
              fontSize: 9, fontFamily: '"IBM Plex Mono",monospace',
              letterSpacing: '0.08em',
              fontWeight: isActive ? 700 : 400,
            }}>
              {tab.label}
            </span>
            {isActive && (
              <div style={{
                position: 'absolute', top: 0, left: '25%', right: '25%',
                height: 2, background: '#1a1a1a', borderRadius: '0 0 2px 2px',
              }} />
            )}
          </Tag>
        )
      })}
    </div>
  )
}

// ── SVG icons ──────────────────────────────────────────────────────

function MapIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
}

function AddIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

function AdminIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}
