import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated, isAdmin, logout, getSession } from '../auth'
import { PAGE_TYPES } from '../store'
import { DIFFICULTY } from '../games/difficulty'
import { DEFAULT_GAME_BY_TYPE, GAME_OPTIONS } from '../games/catalog'
import { getAnalytics, trackVisit } from '../analytics'
import { api } from '../api'
import ImageUploader from '../components/ImageUploader'
import AdminContent from '../components/AdminContent'
import AdminLinks from '../components/AdminLinks'
import AdminAccounts from '../components/AdminAccounts'
import AdminAnalytics from '../components/AdminAnalytics'
import AdminMessages from '../components/AdminMessages'
import AdminDashboard from '../components/AdminDashboard'
import { LangProvider, useLang } from '../LangContext'
import { t } from '../i18n'
import { useBreakpoint } from '../hooks/useBreakpoint'

const DEFAULT_MAX_PLAYS = 3
const MAX_EXTRA_PLAYS = 1000

function getExtraPlays(value) {
  return Number.isSafeInteger(value)
    ? Math.min(MAX_EXTRA_PLAYS, Math.max(0, value))
    : 0
}

function LangToggleAdmin() {
  const { lang, setLang } = useLang()
  return (
    <button
      onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
      style={{
        display:'flex', alignItems:'center', gap:5,
        background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.2)',
        borderRadius:8, padding:'8px 12px', color:'#a78bfa',
        fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.2s',
        fontFamily:'Inter, sans-serif',
      }}
      onMouseEnter={e => e.currentTarget.style.background='rgba(139,92,246,0.16)'}
      onMouseLeave={e => e.currentTarget.style.background='rgba(139,92,246,0.08)'}
    >
      {lang === 'vi' ? '🇻🇳 VI' : '🇺🇸 EN'}
    </button>
  )
}

// ─── helpers ───────────────────────────────────────────────────────────────

const INPUT = {
  width:'100%', boxSizing:'border-box',
  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
  borderRadius:10, padding:'11px 16px', color:'#f0f0ff',
  fontSize:14, fontFamily:'Inter, sans-serif', outline:'none', transition:'border-color 0.2s',
}
const focus = (e) => { e.target.style.borderColor = 'rgba(139,92,246,0.6)' }
const blur  = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }

function GradBtn({ children, onClick, color = 'purple', disabled = false, style = {} }) {
  const bg = color === 'green' ? 'linear-gradient(135deg,#10b981,#22d3ee)'
           : color === 'red'   ? 'linear-gradient(135deg,#ef4444,#dc2626)'
           : 'linear-gradient(135deg,#8B5CF6,#ec4899)'
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: bg, color:'#fff', border:'none', borderRadius:10,
      padding:'10px 20px', fontSize:14, fontWeight:700, fontFamily:'Inter, sans-serif',
      cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.6 : 1,
      transition:'all 0.2s', ...style,
    }}
    onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform='translateY(-2px)' }}
    onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)' }}
    >
      {children}
    </button>
  )
}

// ─── Account Modal ──────────────────────────────────────────────────────────

function AccountModal({ mode, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { ...initial, password:'' } : { username:'', password:'', displayName:'', role:'user', expiresAt:'' })
  const [err, setErr] = useState('')
  const { isMobile } = useBreakpoint()

  const handle = async (e) => {
    e.preventDefault(); setErr('')
    try {
      if (mode === 'add') {
        await api.addAccount(form)
      } else {
        const updates = { displayName:form.displayName, role:form.role, expiresAt:form.expiresAt || null }
        if (form.password) updates.password = form.password
        await api.updateAccount(initial.username, updates)
      }
      onSave()
    } catch (err) { setErr(err.message) }
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding: isMobile ? 12 : 24,
    }}
    onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:20, padding: isMobile ? 22 : 36, width:'100%', maxWidth:440,
        maxHeight:'90vh', overflowY:'auto',
        fontFamily:'Inter, sans-serif',
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontWeight:800, fontSize:20, color:'#f0f0ff', marginBottom:24 }}>
          {mode === 'add' ? '+ Thêm tài khoản' : '✏️ Chỉnh sửa tài khoản'}
        </h3>
        <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {mode === 'add' && (
            <input type="text" placeholder="Username *" required value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              style={INPUT} onFocus={focus} onBlur={blur} />
          )}
          <input type="text" placeholder="Tên hiển thị" value={form.displayName}
            onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
            style={INPUT} onFocus={focus} onBlur={blur} />
          <input type="password" placeholder={mode === 'edit' ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}
            required={mode === 'add'} value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            style={INPUT} onFocus={focus} onBlur={blur} />
          <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            style={{ ...INPUT, background:'#1a1a2e', color:'#f0f0ff', colorScheme:'dark' }}>
            <option value="user"    style={{ background:'#1a1a2e', color:'#f0f0ff' }}>User</option>
            <option value="admin"   style={{ background:'#1a1a2e', color:'#f0f0ff' }}>Admin</option>
            <option value="superadmin" style={{ background:'#1a1a2e', color:'#f0f0ff' }}>Super Admin</option>
          </select>
          <div>
            <label style={{ fontSize:12, color:'#8888aa', display:'block', marginBottom:6, letterSpacing:'0.05em' }}>
              HẾT HẠN (để trống = không giới hạn)
            </label>
            <input type="date" value={form.expiresAt || ''}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              style={{ ...INPUT, colorScheme:'dark' }} onFocus={focus} onBlur={blur} />
          </div>
          {err && <div style={{ fontSize:13, color:'#fca5a5', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'10px 14px' }}>⚠️ {err}</div>}
          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <GradBtn style={{ flex:1 }}>{mode === 'add' ? 'Thêm' : 'Lưu'}</GradBtn>
            <button type="button" onClick={onClose} style={{
              flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:10, color:'#8888aa', fontSize:14, fontWeight:600,
              fontFamily:'Inter, sans-serif', cursor:'pointer', padding:'10px',
            }}>Huỷ</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Link Modal (assign permission) ─────────────────────────────────────────

function LinkModal({ accounts, onSave, onClose }) {
  const [form, setForm] = useState({ ownerUsername: accounts[0]?.username || '', type:'birthday', gameId:DEFAULT_GAME_BY_TYPE.birthday, name:'', message:'', expiresAt:'', difficulty:'medium' })
  const [images, setImages] = useState([])
  const [created, setCreated] = useState(null)
  const [copied, setCopied] = useState(false)
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)
  const { isMobile } = useBreakpoint()

  const handle = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (saving) return
    setSaving(true)
    setErr('')
    try {
      const link = await api.addLink({ ownerUsername:form.ownerUsername, type:form.type, gameId:form.gameId, name:form.name.trim(), message:form.message.trim(), expiresAt:form.expiresAt || null, images, difficulty:form.difficulty })
      setCreated(link)
      onSave()
    } catch (error) {
      console.error(error)
      setErr(error.message || 'Không thể tạo link')
    } finally {
      setSaving(false)
    }
  }

  const selectedGame = GAME_OPTIONS.find((game) => game.id === (created?.gameId || form.gameId)) || GAME_OPTIONS[0]
  const origin = window.location.origin
  const copyLink = () => {
    navigator.clipboard.writeText(origin + created.path)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding: isMobile ? 12 : 24,
    }}
    onMouseDown={(e) => { if (!created && e.target === e.currentTarget) onClose() }}>
      <div style={{
        background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:20, padding: isMobile ? 20 : 36, width:'100%', maxWidth:500,
        fontFamily:'Inter, sans-serif', maxHeight:'90vh', overflowY:'auto',
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}>
        {created ? (
          <>
            <div style={{ textAlign:'center', marginBottom:24 }}>
              <div style={{ fontSize:52, marginBottom:12 }}>{PAGE_TYPES[created.type].emoji}</div>
              <h3 style={{ fontWeight:800, fontSize:20, color:'#f0f0ff', marginBottom:8 }}>Đã tạo link thành công! 🎉</h3>
              <p style={{ color:'#8888aa', fontSize:14 }}>Chia sẻ link này cho <strong style={{ color:'#f0f0ff' }}>{created.ownerUsername}</strong></p>
            </div>
            <div style={{
              background:'rgba(255,255,255,0.04)', border:'1px solid rgba(139,92,246,0.3)',
              borderRadius:12, padding:'14px 18px', marginBottom:16,
              display:'flex', alignItems:'center', gap:12,
            }}>
              <span style={{ fontSize:13, color:'#a78bfa', fontFamily:'monospace', flex:1, wordBreak:'break-all' }}>
                {origin}{created.path}
              </span>
              <button onClick={copyLink} style={{
                background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(139,92,246,0.2)',
                border:`1px solid ${copied ? 'rgba(16,185,129,0.4)' : 'rgba(139,92,246,0.4)'}`,
                borderRadius:8, padding:'8px 14px', color: copied ? '#6ee7b7' : '#a78bfa',
                fontSize:12, fontWeight:700, fontFamily:'Inter, sans-serif', cursor:'pointer', flexShrink:0,
              }}>
                {copied ? '✓ Đã copy' : '📋 Copy'}
              </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:13, color:'#8888aa', marginBottom:24 }}>
              <span>👤 Chủ: <strong style={{ color:'#f0f0ff' }}>{created.ownerUsername}</strong></span>
              <span>📌 Loại: <strong style={{ color:PAGE_TYPES[created.type].color }}>{PAGE_TYPES[created.type].emoji} {PAGE_TYPES[created.type].label}</strong></span>
              <span>🎮 Trò chơi: <strong style={{ color:'#a7f3d0' }}>{selectedGame.emoji} {selectedGame.name}</strong></span>
              <span>👑 Tên: <strong style={{ color:'#f0f0ff' }}>{created.name}</strong></span>
              <span>⏰ Hết hạn: <strong style={{ color:'#f0f0ff' }}>{created.expiresAt || 'Không giới hạn'}</strong></span>
            </div>
            <button onClick={onClose} style={{
              width:'100%', background:'linear-gradient(135deg,#8B5CF6,#22d3ee)',
              border:'none', borderRadius:10, padding:'13px',
              color:'#fff', fontSize:15, fontWeight:700, fontFamily:'Inter, sans-serif', cursor:'pointer',
            }}>Xong ✓</button>
          </>
        ) : (
          <>
            <h3 style={{ fontWeight:800, fontSize:20, color:'#f0f0ff', marginBottom:24 }}>🔑 Gán quyền truy cập</h3>
            <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ fontSize:12, color:'#8888aa', display:'block', marginBottom:6, letterSpacing:'0.05em' }}>TÀI KHOẢN</label>
                <select value={form.ownerUsername} onChange={e => setForm(f => ({ ...f, ownerUsername:e.target.value }))}
                  style={{ ...INPUT, background:'#1a1a2e', color:'#f0f0ff', colorScheme:'dark' }}>
                  {accounts.map(a => (
                    <option key={a.username} value={a.username} style={{ background:'#1a1a2e', color:'#f0f0ff' }}>
                      {a.displayName || a.username} (@{a.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize:12, color:'#8888aa', display:'block', marginBottom:10, letterSpacing:'0.05em' }}>LOẠI TRANG</label>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {Object.entries(PAGE_TYPES).map(([key, meta]) => (
                    <button key={key} type="button" onClick={() => setForm(f => ({ ...f, type:key, gameId:DEFAULT_GAME_BY_TYPE[key], difficulty:'medium' }))} style={{
                      flex: isMobile ? '1 1 30%' : 1, background: form.type === key ? `${meta.color}18` : 'rgba(255,255,255,0.04)',
                      border:`1px solid ${form.type === key ? meta.color + '55' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius:12, padding:'12px 8px', cursor:'pointer',
                      color: form.type === key ? meta.color : '#8888aa', fontFamily:'Inter, sans-serif',
                      transition:'all 0.2s', display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                    }}>
                      <span style={{ fontSize:24 }}>{meta.emoji}</span>
                      <span style={{ fontSize:11, fontWeight:600, lineHeight:1.3, textAlign:'center' }}>{meta.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize:12, color:'#8888aa', display:'block', marginBottom:10, letterSpacing:'0.05em' }}>TRÒ CHƠI CHO LINK NÀY</label>
                <div style={{ display:'grid', gridTemplateColumns:isMobile ? '1fr' : '1fr 1fr', gap:8 }}>
                  {GAME_OPTIONS.map(game => (
                    <button key={game.id} type="button" onClick={() => setForm(f => ({ ...f, gameId:game.id, difficulty:'medium' }))} style={{
                      display:'flex', alignItems:'center', gap:10, padding:'12px 10px', textAlign:'left',
                      background:form.gameId === game.id ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)',
                      border:`1px solid ${form.gameId === game.id ? 'rgba(52,211,153,0.55)' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius:10, color:form.gameId === game.id ? '#a7f3d0' : '#8888aa',
                      fontFamily:'Inter, sans-serif', cursor:'pointer',
                    }}>
                      <span style={{ fontSize:23 }}>{game.emoji}</span>
                      <span>
                        <strong style={{ display:'block', fontSize:12 }}>{game.name}</strong>
                        <small style={{ display:'block', marginTop:3, fontSize:10, lineHeight:1.4, opacity:0.75 }}>{game.description}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty picker */}
              <div>
                <label style={{ fontSize:12, color:'#8888aa', display:'block', marginBottom:10, letterSpacing:'0.05em' }}>ĐỘ KHÓ TRÒ CHƠI</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {Object.entries(DIFFICULTY[form.gameId] || DIFFICULTY['balloon-pop']).map(([key, meta]) => (
                    <button key={key} type="button" onClick={() => setForm(f => ({ ...f, difficulty:key }))} style={{
                      flex: isMobile ? '1 1 30%' : 1, background: form.difficulty === key ? `${meta.color}20` : 'rgba(255,255,255,0.04)',
                      border:`1px solid ${form.difficulty === key ? meta.color+'66' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius:10, padding:'10px 6px', cursor:'pointer',
                      color: form.difficulty === key ? meta.color : '#8888aa', fontFamily:'Inter, sans-serif',
                      transition:'all 0.2s', display:'flex', flexDirection:'column', alignItems:'center', gap:3,
                    }}>
                      <span style={{ fontSize:18 }}>{meta.icon}</span>
                      <span style={{ fontSize:11, fontWeight:700 }}>{meta.label}</span>
                      <span style={{ fontSize:9, opacity:0.7, textAlign:'center', lineHeight:1.3 }}>{meta.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize:12, color:'#8888aa', display:'block', marginBottom:6, letterSpacing:'0.05em' }}>
                  TÊN NGƯỜI NHẬN (hiển thị trên trang)
                </label>
                <input type="text" placeholder="Vd: Nguyễn Văn A, em Lan..." required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name:e.target.value }))}
                  style={INPUT} onFocus={focus} onBlur={blur} />
              </div>

              <div>
                <label style={{ fontSize:12, color:'#8888aa', display:'block', marginBottom:6, letterSpacing:'0.05em' }}>
                  LỜI NHẮN RIÊNG (không bắt buộc)
                </label>
                <textarea
                  placeholder="Viết vài dòng dành riêng cho người nhận..."
                  value={form.message}
                  maxLength={500}
                  rows={4}
                  onChange={e => setForm(f => ({ ...f, message:e.target.value }))}
                  style={{ ...INPUT, resize:'vertical', lineHeight:1.6 }}
                  onFocus={focus}
                  onBlur={blur}
                />
                <div style={{ textAlign:'right', fontSize:11, color:'#666680', marginTop:4 }}>
                  {form.message.length}/500
                </div>
              </div>

              <div>
                <label style={{ fontSize:12, color:'#8888aa', display:'block', marginBottom:6, letterSpacing:'0.05em' }}>
                  HẾT HẠN (để trống = không giới hạn)
                </label>
                <input type="date" value={form.expiresAt}
                  onChange={e => setForm(f => ({ ...f, expiresAt:e.target.value }))}
                  style={{ ...INPUT, colorScheme:'dark' }} onFocus={focus} onBlur={blur} />
              </div>

              <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:16 }}>
                <ImageUploader images={images} onChange={setImages} label="Album ảnh cho trang này" />
              </div>

              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <GradBtn disabled={saving} style={{ flex:1, opacity:saving ? 0.65 : 1 }}>🔗 {saving ? 'Đang tạo...' : 'Tạo link'}</GradBtn>
                <button type="button" onClick={onClose} style={{
                  flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:10, color:'#8888aa', fontSize:14, fontWeight:600,
                  fontFamily:'Inter, sans-serif', cursor:'pointer', padding:'10px',
                }}>Huỷ</button>
              </div>
              {err && <div role="alert" style={{ fontSize:13, color:'#fca5a5', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'10px 14px' }}>⚠️ {err}</div>}
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Admin ─────────────────────────────────────────────────────────────

function AdminInner() {
  const navigate = useNavigate()
  const [tab, setTab]           = useState('dashboard')
  const [analytics, setAnalytics] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [accountNotice, setAccountNotice] = useState(null)
  const [links, setLinks]       = useState([])
  const [messages, setMessages] = useState([])
  const [messageNotice, setMessageNotice] = useState(null)
  const [modal, setModal]       = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [grantingPlaysId, setGrantingPlaysId] = useState(null)
  const [updatingLinkId, setUpdatingLinkId] = useState(null)
  const [linkNotice, setLinkNotice] = useState(null)
  const [serverOnline, setServerOnline] = useState(null)
  const [storage, setStorage] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const session = getSession()
  const { isMobile } = useBreakpoint()
  const { lang } = useLang()
  const tr = t[lang].admin
  const TABS = [
    { id:'dashboard', label:tr.tabs.dashboard, icon:'📊' },
    { id:'analytics', label:tr.tabs.analytics, icon:'📈' },
    { id:'accounts',  label:tr.tabs.accounts,  icon:'👥' },
    { id:'links',     label:tr.tabs.links,     icon:'🔑' },
    { id:'messages',  label:tr.tabs.messages,  icon:'💬' },
    { id:'content',   label:tr.tabs.content,   icon:'✏️' },
  ]

  const refresh = useCallback(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
    fetch(`${apiBase}/health`).then(r => r.ok ? setServerOnline(true) : setServerOnline(false)).catch(() => setServerOnline(false))
    fetch(`${apiBase}/storage`).then(r => r.json()).then(setStorage).catch(() => {})
    api.getAccounts().then(setAccounts).catch(() => {})
    api.getLinks().then(setLinks).catch(() => {})
    api.getMessages().then(setMessages).catch(() => {
      try { setMessages(JSON.parse(localStorage.getItem('dotme_messages') || '[]')) } catch { setMessages([]) }
    })
    getAnalytics().then(setAnalytics).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) { navigate('/login'); return }
    trackVisit()
    refresh()
    const iv = setInterval(refresh, 8000)
    return () => clearInterval(iv)
  }, [navigate, refresh])

  const copyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(window.location.origin + link.path)
      setCopiedId(link.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setLinkNotice({ type:'error', text:'Không thể sao chép link. Vui lòng kiểm tra quyền truy cập clipboard.' })
    }
  }

  const handleDeleteAcc = async (username) => {
    if (username === 'admin') return
    if (!window.confirm(`Xóa tài khoản "${username}"?`)) return
    try {
      await api.deleteAccount(username)
      setAccounts(current => current.filter(account => account.username !== username))
      setAccountNotice({ type:'success', text:`Đã xóa tài khoản "${username}".` })
      refresh()
    } catch (error) {
      setAccountNotice({ type:'error', text:`Xóa tài khoản thất bại: ${error.message}` })
    }
  }

  const handleDeleteLink = async (id) => {
    if (!window.confirm('Xóa quyền truy cập này?')) return
    try {
      await api.deleteLink(id)
      setLinks(current => current.filter(link => link.id !== id))
      setLinkNotice({ type:'success', text:'Đã xóa link.' })
    } catch (error) {
      setLinkNotice({ type:'error', text:`Xóa link thất bại: ${error.message}` })
    }
  }

  const handleGrantPlays = async (link) => {
    const extraPlays = getExtraPlays(link.extraPlays)
    const granted = Math.min(3, MAX_EXTRA_PLAYS - extraPlays)
    if (granted <= 0 || grantingPlaysId) return
    setGrantingPlaysId(link.id)
    setLinkNotice(null)
    try {
      const updatedLink = await api.updateLink(link.id, { extraPlays:extraPlays + granted })
      setLinks(current => current.map(item => item.id === link.id ? updatedLink : item))
      setLinkNotice({ type:'success', text:`Đã cấp thêm ${granted} lượt cho link "${link.name}".` })
    } catch (error) {
      setLinkNotice({ type:'error', text:`Cấp lượt chơi thất bại: ${error.message}` })
    } finally {
      setGrantingPlaysId(null)
    }
  }

  const handleChangeGame = async (link, gameId) => {
    if (updatingLinkId) return
    const game = GAME_OPTIONS.find((option) => option.id === gameId)
    if (!game) return
    setUpdatingLinkId(link.id)
    setLinkNotice(null)
    try {
      const updatedLink = await api.updateLink(link.id, { gameId })
      setLinks(current => current.map(item => item.id === link.id ? updatedLink : item))
      setLinkNotice({ type:'success', text:`Đã đổi trò chơi của link "${link.name}" thành ${game.name}.` })
    } catch (error) {
      setLinkNotice({ type:'error', text:`Đổi trò chơi thất bại: ${error.message}` })
    } finally {
      setUpdatingLinkId(null)
    }
  }

  const handleChangeDifficulty = async (link, difficulty) => {
    if (updatingLinkId || !['easy', 'medium', 'hard'].includes(difficulty)) return
    setUpdatingLinkId(link.id)
    setLinkNotice(null)
    try {
      const updatedLink = await api.updateLink(link.id, { difficulty })
      setLinks(current => current.map(item => item.id === link.id ? updatedLink : item))
      const label = { easy:'Dễ', medium:'Vừa', hard:'Khó' }[difficulty]
      setLinkNotice({ type:'success', text:`Đã đổi độ khó của link "${link.name}" thành ${label}.` })
    } catch (error) {
      setLinkNotice({ type:'error', text:`Đổi độ khó thất bại: ${error.message}` })
    } finally {
      setUpdatingLinkId(null)
    }
  }

  const handleDeleteMsg = async (id) => {
    setMessageNotice(null)
    try {
      await api.deleteMessage(id)
      setMessages(current => current.filter(message => message.id !== id))
      setMessageNotice({ type:'success', text:'Đã xóa tin nhắn.' })
    } catch (error) {
      setMessageNotice({ type:'error', text:`Xóa tin nhắn thất bại: ${error.message}` })
    }
  }

  const handleDeleteAllMessages = async () => {
    if (!window.confirm('Xóa tất cả tin nhắn?')) return
    setMessageNotice(null)
    try {
      await api.deleteAllMessages()
      setMessages([])
      setMessageNotice({ type:'success', text:'Đã xóa tất cả tin nhắn.' })
    } catch (error) {
      setMessageNotice({ type:'error', text:`Xóa tin nhắn thất bại: ${error.message}` })
    }
  }

  if (!analytics) return null

  const origin = window.location.origin
  const uniqueViewers = new Set(
    analytics.history.map(item => item.visitorId || item.ip || `anon-${item.createdAt || ''}`)
  ).size

  return (
    <div style={{ height: isMobile ? 'auto' : '100vh', minHeight:'100vh', background:'#06060f', display:'flex', flexDirection: isMobile ? 'column' : 'row', fontFamily:'Inter, sans-serif', color:'#f0f0ff' }}>
      {/* Mobile top bar */}
      {isMobile && (
        <div style={{
          position:'sticky', top:0, zIndex:120, display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'12px 16px', background:'rgba(6,6,15,0.95)', backdropFilter:'blur(10px)',
          borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0,
        }}>
          <button onClick={() => setMobileMenuOpen(true)} aria-label="Mở menu" style={{
            background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8,
            width:38, height:38, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#f0f0ff', cursor:'pointer',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
          <div style={{ fontFamily:'Syne, sans-serif', fontSize:15, fontWeight:800, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', padding:'0 10px' }}>
            {TABS.find(t => t.id === tab)?.icon} {TABS.find(t => t.id === tab)?.label}
          </div>
          <div style={{ width:38, flexShrink:0 }} />
        </div>
      )}

      {/* Drawer backdrop */}
      {isMobile && mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:130 }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width:240, flexShrink:0, background: isMobile ? '#0a0a16' : 'rgba(255,255,255,0.02)',
        borderRight:'1px solid rgba(255,255,255,0.07)',
        display:'flex', flexDirection:'column', padding:'28px 14px 20px', gap:4,
        ...(isMobile ? {
          position:'fixed', top:0, bottom:0, left: mobileMenuOpen ? 0 : -260, zIndex:140,
          transition:'left 0.25s ease', overflowY:'auto',
        } : {}),
      }}>
        <div style={{ paddingLeft:12, marginBottom:28 }}>
          <div style={{
            fontFamily:'Syne, sans-serif', fontSize:22, fontWeight:800,
            background:'linear-gradient(135deg,#8B5CF6,#22D3EE)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          }}>
            .me
          </div>
          <div style={{ fontSize:10, color:'#555577', marginTop:2, letterSpacing:'0.08em' }}>ADMIN PANEL</div>
          <div style={{ fontSize:12, color:'#8888aa', marginTop:6 }}>
            👤 {session?.displayName || session?.username}
          </div>
          {/* Server status */}
          <div style={{
            marginTop:10, display:'flex', alignItems:'center', gap:6,
            fontSize:11, fontWeight:600,
            color: serverOnline === null ? '#555577' : serverOnline ? '#10b981' : '#ef4444',
          }}>
            <div style={{
              width:6, height:6, borderRadius:'50%',
              background: serverOnline === null ? '#555577' : serverOnline ? '#10b981' : '#ef4444',
              animation: serverOnline === null ? 'none' : serverOnline ? 'pulse 2s infinite' : 'none',
            }} />
            {serverOnline === null ? 'Đang kiểm tra...' : serverOnline ? 'Server online' : '⚠ Server offline'}
          </div>
        </div>

        {/* Offline warning banner */}
        {serverOnline === false && (
          <div style={{
            background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)',
            borderRadius:10, padding:'10px 12px', marginBottom:4,
            fontSize:11, color:'#fca5a5', lineHeight:1.5,
          }}>
            <strong>Server chưa chạy!</strong><br/>
            Mở terminal, chạy:<br/>
            <code style={{ background:'rgba(0,0,0,0.3)', padding:'2px 6px', borderRadius:4, fontFamily:'monospace', fontSize:10 }}>
              npm run dev
            </code>
          </div>
        )}

        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setMobileMenuOpen(false) }} style={{
            background: tab === t.id ? 'rgba(139,92,246,0.15)' : 'transparent',
            border: tab === t.id ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
            borderRadius:10, padding:'11px 14px', color: tab === t.id ? '#a78bfa' : '#8888aa',
            fontSize:14, fontWeight: tab === t.id ? 600 : 400, fontFamily:'Inter, sans-serif',
            cursor:'pointer', display:'flex', alignItems:'center', gap:10, textAlign:'left', transition:'all 0.2s',
          }}
          onMouseEnter={e => { if (tab !== t.id) { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#f0f0ff' } }}
          onMouseLeave={e => { if (tab !== t.id) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#8888aa' } }}
          >
            <span>{t.icon}</span>{t.label}
            {t.id === 'messages' && messages.length > 0 && (
              <span style={{ marginLeft:'auto', background:'#ec4899', color:'#fff', borderRadius:99, fontSize:10, fontWeight:700, padding:'2px 7px' }}>
                {messages.length}
              </span>
            )}
          </button>
        ))}

        <div style={{ flex:1 }} />
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:14, display:'flex', flexDirection:'column', gap:6 }}>
          <LangToggleAdmin />
          <a href="/" style={{ display:'flex', alignItems:'center', gap:8, color:'#555577', fontSize:13, textDecoration:'none', padding:'8px 12px', borderRadius:8, transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color='#f0f0ff'; e.currentTarget.style.background='rgba(255,255,255,0.05)' }}
            onMouseLeave={e => { e.currentTarget.style.color='#555577'; e.currentTarget.style.background='transparent' }}
          >{tr.home}</a>
          <button onClick={() => { logout(); navigate('/login') }} style={{
            background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10,
            padding:'10px 14px', color:'#fca5a5', fontSize:13, fontFamily:'Inter, sans-serif', cursor:'pointer',
            display:'flex', alignItems:'center', gap:8, transition:'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.16)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.08)'}
          >{tr.logout}</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, minWidth:0, padding: isMobile ? '18px 14px 40px' : 36, overflowY:'auto', overflowX:'hidden' }}>
        <div style={{ marginBottom: isMobile ? 12 : 18 }}>
          {!isMobile && (
            <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:26, fontWeight:800, marginBottom:4 }}>
              {TABS.find(t => t.id === tab)?.icon} {TABS.find(t => t.id === tab)?.label}
            </h1>
          )}
          <p style={{ color:'#555577', fontSize:13 }}>
            {new Date().toLocaleDateString('vi-VN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <AdminDashboard analytics={analytics} accounts={accounts} messages={messages} storage={storage} links={links} copiedId={copiedId} onCopy={copyLink} tr={tr} />
        )}

        {/* Analytics */}
        {tab === 'analytics' && <AdminAnalytics analytics={analytics} uniqueViewers={uniqueViewers} />}

        {tab === 'accounts' && (
          <AdminAccounts
            accounts={accounts}
            notice={accountNotice}
            onAdd={() => { setAccountNotice(null); setModal('add-account') }}
            onEdit={account => { if (account.username === 'admin') return; setAccountNotice(null); setEditTarget(account); setModal('edit-account') }}
            onDelete={handleDeleteAcc}
          />
        )}

        {/* Links and permissions */}
        {tab === 'links' && (
          <AdminLinks
            links={links}
            notice={linkNotice}
            copiedId={copiedId}
            updatingLinkId={updatingLinkId}
            grantingPlaysId={grantingPlaysId}
            onAdd={() => setModal('add-link')}
            onCopy={copyLink}
            onDelete={handleDeleteLink}
            onGrant={handleGrantPlays}
            onGameChange={handleChangeGame}
            onDifficultyChange={handleChangeDifficulty}
            maxExtraPlays={MAX_EXTRA_PLAYS}
            defaultMaxPlays={DEFAULT_MAX_PLAYS}
            getExtraPlays={getExtraPlays}
          />
        )}

        {/* Content */}
        {tab === 'content' && <AdminContent />}

        {/* ── MESSAGES ── */}
        {tab === 'messages' && (
          <AdminMessages messages={messages} notice={messageNotice} onDelete={handleDeleteMsg} onDeleteAll={handleDeleteAllMessages} />
        )}
      </main>

      {/* Modals */}
      {modal === 'add-account' && (
        <AccountModal mode="add" onSave={() => { refresh(); setModal(null); setAccountNotice({ type:'success', text:'Đã thêm tài khoản.' }) }} onClose={() => setModal(null)} />
      )}
      {modal === 'edit-account' && editTarget && (
        <AccountModal mode="edit" initial={editTarget} onSave={() => { refresh(); setModal(null); setAccountNotice({ type:'success', text:'Đã cập nhật tài khoản.' }) }} onClose={() => setModal(null)} />
      )}
      {modal === 'add-link' && (
        <LinkModal accounts={accounts} onSave={refresh} onClose={() => setModal(null)} />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Inter:wght@400;600;700;800&display=swap');
        * { scrollbar-width: thin; scrollbar-color: #8B5CF6 transparent; box-sizing: border-box; }
        html, body { overflow-x: hidden; }
      `}</style>
    </div>
  )
}

export default function Admin() {
  return <LangProvider><AdminInner /></LangProvider>
}
