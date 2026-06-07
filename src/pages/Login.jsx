import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../auth'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    const result = await login(form.username, form.password)
    if (result.ok) {
      navigate('/admin')
    } else {
      setError(result.error || 'Đăng nhập thất bại')
    }
    setLoading(false)
  }

  const inputStyle = {
    width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:12, padding:'13px 18px', color:'#f0f0ff', fontSize:15,
    fontFamily:'Inter, sans-serif', outline:'none', boxSizing:'border-box', transition:'all 0.2s ease',
  }

  return (
    <div style={{
      minHeight:'100vh', background:'#06060f', display:'flex', alignItems:'center',
      justifyContent:'center', fontFamily:'Inter, sans-serif', padding:24, position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'fixed', top:'20%', left:'10%', width:400, height:400, background:'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(40px)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'20%', right:'10%', width:300, height:300, background:'radial-gradient(circle, rgba(34,211,238,0.1) 0%, transparent 70%)', borderRadius:'50%', filter:'blur(40px)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:400, position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <a href="/" style={{ textDecoration:'none' }}>
            <span style={{
              fontFamily:'Syne, sans-serif', fontSize:30, fontWeight:800,
              background:'linear-gradient(135deg,#8B5CF6,#22D3EE)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            }}>
              .me
            </span>
          </a>
          <p style={{ color:'#555577', fontSize:13, marginTop:6 }}>Admin Panel</p>
        </div>

        <div style={{
          background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:24, padding:36, backdropFilter:'blur(20px)',
        }}>
          <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:22, fontWeight:800, color:'#f0f0ff', marginBottom:6 }}>Đăng nhập</h1>
          <p style={{ color:'#8888aa', fontSize:13, marginBottom:28 }}>Chỉ dành cho quản trị viên</p>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <input type="text" placeholder="Tên đăng nhập" value={form.username}
              onChange={e => setForm(f => ({ ...f, username:e.target.value }))}
              required autoComplete="username" style={inputStyle}
              onFocus={e => { e.target.style.borderColor='rgba(139,92,246,0.5)'; e.target.style.boxShadow='0 0 0 3px rgba(139,92,246,0.1)' }}
              onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.1)'; e.target.style.boxShadow='none' }}
            />

            <div style={{ position:'relative' }}>
              <input type={showPass ? 'text' : 'password'} placeholder="Mật khẩu" value={form.password}
                onChange={e => setForm(f => ({ ...f, password:e.target.value }))}
                required autoComplete="current-password" style={{ ...inputStyle, paddingRight:50 }}
                onFocus={e => { e.target.style.borderColor='rgba(139,92,246,0.5)'; e.target.style.boxShadow='0 0 0 3px rgba(139,92,246,0.1)' }}
                onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.1)'; e.target.style.boxShadow='none' }}
              />
              <button type="button" onClick={() => setShowPass(p => !p)} style={{
                position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer', color:'#555577', padding:4,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {showPass
                    ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                    : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                </svg>
              </button>
            </div>

            {error && (
              <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, padding:'11px 15px', fontSize:13, color:'#fca5a5' }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background:'linear-gradient(135deg,#8B5CF6,#22D3EE)', color:'#fff', border:'none',
              borderRadius:12, padding:'14px', fontSize:15, fontWeight:700,
              fontFamily:'Inter, sans-serif', cursor: loading ? 'default' : 'pointer',
              marginTop:6, transition:'all 0.3s ease', boxShadow:'0 0 30px rgba(139,92,246,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:10,
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 0 50px rgba(139,92,246,0.5)' } }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 0 30px rgba(139,92,246,0.3)' }}
            >
              {loading ? '⏳ Đang đăng nhập...' : 'Đăng nhập →'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:20 }}>
            <a href="/" style={{ fontSize:13, color:'#555577', textDecoration:'none', transition:'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color='#8888aa'}
            onMouseLeave={e => e.currentTarget.style.color='#555577'}
            >← Về trang chủ</a>
          </div>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Inter:wght@400;600;700&display=swap');`}</style>
    </div>
  )
}
