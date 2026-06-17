import { useState } from 'react'
import AdminLogin from './AdminLogin'
import AdminPanel from './AdminPanel'

export default function AdminPage() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem('xylog-admin') === '1'
  )

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />
  }

  return <AdminPanel onLogout={() => setAuthed(false)} />
}
