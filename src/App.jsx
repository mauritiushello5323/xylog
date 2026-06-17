// HashRouter = works on GitHub Pages without server-side config
// URLs will be:  yourusername.github.io/xylog/#/
//                yourusername.github.io/xylog/#/admin
import { HashRouter, Routes, Route } from 'react-router-dom'
import MapView from './components/MapView'
import AdminPage from './components/admin/AdminPage'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MapView />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </HashRouter>
  )
}
