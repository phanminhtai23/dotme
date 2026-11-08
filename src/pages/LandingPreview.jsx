import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { isAuthenticated, isAdmin } from '../auth'
import LandingView from '../landing/LandingView'
import { LANDING_VERSIONS, isLandingVersion } from '../landing/versions'

/** Admin-only preview of a landing version. `?embed=1` hides the top bar (used by the admin thumbnails). */
export default function LandingPreview() {
  const { version } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const allowed = isAuthenticated() && isAdmin()

  useEffect(() => { if (!allowed) navigate('/login') }, [allowed, navigate])
  if (!allowed) return null
  if (!isLandingVersion(version)) return <p style={{ padding: 24, fontFamily: 'system-ui' }}>Không có phiên bản "{version}".</p>

  const name = LANDING_VERSIONS.find(item => item.id === version).name
  return (
    <>
      {!params.get('embed') && (
        <div style={{ position: 'fixed', zIndex: 10000, right: 16, bottom: 16, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 999, background: '#111827', color: '#f9fafb', font: '500 13px system-ui, sans-serif', boxShadow: '0 8px 24px rgba(0,0,0,.35)' }}>
          <span>Xem trước: {name}</span>
          <a href="/admin" style={{ color: '#93c5fd' }}>Quay lại admin</a>
        </div>
      )}
      <LandingView version={version} track={false} />
    </>
  )
}
