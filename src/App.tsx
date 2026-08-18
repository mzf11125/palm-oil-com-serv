import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from '@/pages/Landing'
import Workspace from '@/Workspace'

/**
 * Route table.
 *
 * `/` is the landing page and `/app` the analyst workspace. Deep links and
 * refreshes on `/app` depend on the SPA rewrite in vercel.json, since Vercel
 * otherwise serves a hard 404 for any path that is not a real file.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/app" element={<Workspace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
