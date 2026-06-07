import { useState, useEffect } from 'react'
import { login, getSession } from '../auth'
import { api } from '../api'

function ErrorScreen({ emoji, title, msg }) {
  return (
    <div style={{
      minHeight: '100vh', background: '#06060f',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily:"'Inter','Be Vietnam Pro',system-ui,sans-serif", color: '#f0f0ff', textAlign: 'center', padding: '40px',
    }}>
      <div style={{ fontSize: 80, marginBottom: 24 }}>{emoji}</div>
      <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>{title}</h2>
      <p style={{ color: '#8888aa', marginBottom: 32, fontSize: 16 }}>{msg}</p>
      <a href="/" style={{
        color: '#8B5CF6', textDecoration: 'none', fontWeight: 600, fontSize: 15,
        padding: '10px 24px', border: '1px solid rgba(139,92,246,0.4)',
        borderRadius: '99px', transition: 'all 0.2s',
      }}>← Về trang chủ</a>
    </div>
  )
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '12px', padding: '13px 18px', color: '#f0f0ff',
  fontSize: '15px', fontFamily:"'Inter','Be Vietnam Pro',system-ui,sans-serif", outline: 'none', transition: 'all 0.2s',
}

export default function ProtectedPage({ linkId, renderPage, accent = '#ff6b9d', bgEmoji = '🔒' }) {
  const [session, setSession] = useState(getSession())
  const [link, setLink] = useState(null)
  const [linkState, setLinkState] = useState('loading') // loading | ok | notfound | expired
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    api.getLink(linkId)
      .then(data => {
        setLink(data)
        if (data.expiresAt && new Date(data.expiresAt) < new Date()) setLinkState('expired')
        else setLinkState('ok')
      })
      .catch(() => setLinkState('notfound'))
  }, [linkId])

  if (linkState === 'loading') return null
  if (linkState === 'notfound') return <ErrorScreen emoji="😿" title="Không tìm thấy trang" msg="Trang này không tồn tại hoặc đã bị xóa." />
  if (linkState === 'expired') return <ErrorScreen emoji="⏰" title="Trang đã hết hạn" msg={`Trang này đã hết hiệu lực từ ${new Date(link.expiresAt).toLocaleDateString('vi-VN')}.`} />

  const checkAccess = (s) => {
    if (!s) return false
    if (s.role === 'superadmin' || s.role === 'admin') return true
    return link.ownerUsername === s.username
  }

  if (checkAccess(session)) return renderPage(link)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(form.username, form.password)
    if (result.ok) {
      if (!checkAccess(result.session)) {
        setError('Tài khoản này không có quyền xem trang này.')
        sessionStorage.removeItem('dotme_session')
      } else {
        setSession(result.session)
      }
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${accent}18 0%, #06060f 50%, ${accent}10 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily:"'Inter','Be Vietnam Pro',system-ui,sans-serif", padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Floating decorations */}
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{
          position: 'fixed',
          top: `${10 + i * 15}%`,
          left: i % 2 === 0 ? `${5 + i * 3}%` : undefined,
          right: i % 2 !== 0 ? `${5 + i * 3}%` : undefined,
          fontSize: `${40 + i * 8}px`,
          opacity: 0.12,
          animation: `floatDeco ${2 + i * 0.4}s ease-in-out infinite alternate`,
          animationDelay: `${i * 0.3}s`,
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          {bgEmoji}
        </div>
      ))}

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px', padding: '40px',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: 56, marginBottom: 12, animation: 'catBounce 2s ease-in-out infinite' }}>🐱</div>
            <h2 style={{ fontWeight: 800, fontSize: '22px', color: '#f0f0ff', marginBottom: 8 }}>
              Trang riêng tư
            </h2>
            <p style={{ color: '#8888aa', fontSize: '14px', lineHeight: 1.6 }}>
              Đăng nhập để xem nội dung được gửi tặng cho bạn.
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="text" placeholder="Tên đăng nhập" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required style={inputStyle}
              onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 0 0 3px ${accent}22` }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none' }}
            />
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} placeholder="Mật khẩu" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required style={{ ...inputStyle, paddingRight: '48px' }}
                onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = `0 0 0 3px ${accent}22` }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none' }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#555577', padding: 4,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPass
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                </svg>
              </button>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: '#fca5a5',
              }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: `linear-gradient(135deg, ${accent}, ${accent}bb)`,
              color: '#fff', border: 'none', borderRadius: '12px', padding: '14px',
              fontSize: '15px', fontWeight: 700, fontFamily:"'Inter','Be Vietnam Pro',system-ui,sans-serif",
              cursor: loading ? 'default' : 'pointer', transition: 'all 0.3s',
              boxShadow: `0 0 24px ${accent}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              {loading ? '⏳ Đang đăng nhập...' : '🔓 Xem nội dung'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <a href="/" style={{ fontSize: 13, color: '#555577', textDecoration: 'none' }}>← Về trang chủ</a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatDeco { 0%{transform:translateY(0) rotate(0deg)} 100%{transform:translateY(-20px) rotate(10deg)} }
        @keyframes catBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>
    </div>
  )
}
