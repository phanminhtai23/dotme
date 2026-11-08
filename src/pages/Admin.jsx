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
import AdminLanding from '../components/AdminLanding'
import AdminIcon from '../components/AdminIcons'
import { LangProvider, useLang } from '../LangContext'
import { t } from '../i18n'
import { useBreakpoint } from '../hooks/useBreakpoint'
import '../admin-theme.css'

const DEFAULT_MAX_PLAYS = 3
const MAX_EXTRA_PLAYS = 1000
const THEME_KEY = 'dotme_admin_theme'

function getExtraPlays(value) {
  return Number.isSafeInteger(value)
    ? Math.min(MAX_EXTRA_PLAYS, Math.max(0, value))
    : 0
}

// Stored choice wins; otherwise follow the OS; dark when neither is available.
function initialTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch { /* storage blocked */ }
  try {
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  } catch { /* no matchMedia */ }
  return 'dark'
}

// i18n labels carry decorative leading emoji/arrows; the sidebar uses SVG icons instead.
const plainLabel = (text) => String(text).replace(/^[^\p{L}\p{N}]+/u, '')

function LangToggleAdmin() {
  const { lang, setLang } = useLang()
  return (
    <button
      type="button"
      className="ad-foot-link"
      onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
      title={lang === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
    >
      <AdminIcon name="message" size={17} />
      {lang === 'vi' ? 'Ngôn ngữ' : 'Language'}
      <span className="ad-foot-link__value">{lang === 'vi' ? 'VI' : 'EN'}</span>
    </button>
  )
}

function ThemeToggle({ theme, onToggle }) {
  const dark = theme === 'dark'
  return (
    <button type="button" className="ad-foot-link" onClick={onToggle} aria-label={dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}>
      <AdminIcon name={dark ? 'sun' : 'moon'} size={17} />
      Giao diện
      <span className="ad-foot-link__value">{dark ? 'Tối' : 'Sáng'}</span>
    </button>
  )
}

// ─── Account Modal ──────────────────────────────────────────────────────────

function AccountModal({ mode, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { ...initial, password:'' } : { username:'', password:'', displayName:'', role:'user', expiresAt:'' })
  const [err, setErr] = useState('')

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
    <div className="ad-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="ad-modal" role="dialog" aria-modal="true" aria-label={mode === 'add' ? 'Thêm tài khoản' : 'Chỉnh sửa tài khoản'}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal__head">
          <h3>{mode === 'add' ? 'Thêm tài khoản' : 'Chỉnh sửa tài khoản'}</h3>
          <button type="button" className="ad-modal__close" onClick={onClose} aria-label="Đóng"><AdminIcon name="close" size={18} /></button>
        </div>
        <form onSubmit={handle} className="ad-form">
          {mode === 'add' && (
            <div className="ad-field">
              <label className="ad-label" htmlFor="acc-username">Tên đăng nhập</label>
              <input id="acc-username" className="ad-input" type="text" placeholder="Username *" required value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
            </div>
          )}
          <div className="ad-field">
            <label className="ad-label" htmlFor="acc-display">Tên hiển thị</label>
            <input id="acc-display" className="ad-input" type="text" placeholder="Tên hiển thị" value={form.displayName}
              onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} />
          </div>
          <div className="ad-field">
            <label className="ad-label" htmlFor="acc-password">Mật khẩu</label>
            <input id="acc-password" className="ad-input" type="password" placeholder={mode === 'edit' ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}
              required={mode === 'add'} value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="ad-field">
            <label className="ad-label" htmlFor="acc-role">Vai trò</label>
            <select id="acc-role" className="ad-input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>
          <div className="ad-field">
            <label className="ad-label" htmlFor="acc-expires">Hết hạn <span className="ad-hint">(để trống = không giới hạn)</span></label>
            <input id="acc-expires" className="ad-input" type="date" value={form.expiresAt || ''}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
          </div>
          {err && <div role="alert" className="ad-alert">{err}</div>}
          <div className="ad-actions">
            <button className="ad-btn ad-btn--primary">{mode === 'add' ? 'Thêm' : 'Lưu'}</button>
            <button type="button" className="ad-btn" onClick={onClose}>Huỷ</button>
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
    <div className="ad-modal-backdrop" onMouseDown={(e) => { if (!created && e.target === e.currentTarget) onClose() }}>
      <div className="ad-modal ad-modal--md" role="dialog" aria-modal="true" aria-label="Gán quyền truy cập"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}>
        {created ? (
          <>
            <div className="ad-created">
              <div className="ad-created__emoji" aria-hidden="true">{PAGE_TYPES[created.type].emoji}</div>
              <h3>Đã tạo link thành công</h3>
              <p>Chia sẻ link này cho <strong>{created.ownerUsername}</strong></p>
            </div>
            <div className="ad-linkbox">
              <code>{origin}{created.path}</code>
              <button type="button" onClick={copyLink} className={`ad-btn ad-btn--sm ${copied ? 'is-done' : ''}`}>
                <AdminIcon name={copied ? 'check' : 'copy'} size={14} />{copied ? 'Đã copy' : 'Copy'}
              </button>
            </div>
            <dl className="ad-facts">
              <div><dt>Chủ</dt><dd>{created.ownerUsername}</dd></div>
              <div><dt>Loại</dt><dd>{PAGE_TYPES[created.type].emoji} {PAGE_TYPES[created.type].label}</dd></div>
              <div><dt>Trò chơi</dt><dd>{selectedGame.emoji} {selectedGame.name}</dd></div>
              <div><dt>Tên</dt><dd>{created.name}</dd></div>
              <div><dt>Hết hạn</dt><dd>{created.expiresAt || 'Không giới hạn'}</dd></div>
            </dl>
            <button type="button" className="ad-btn ad-btn--primary ad-btn--block" onClick={onClose}>Xong</button>
          </>
        ) : (
          <>
            <div className="ad-modal__head">
              <h3>Gán quyền truy cập</h3>
              <button type="button" className="ad-modal__close" onClick={onClose} aria-label="Đóng"><AdminIcon name="close" size={18} /></button>
            </div>
            <form onSubmit={handle} className="ad-form">
              <div className="ad-field">
                <label className="ad-label" htmlFor="lnk-owner">Tài khoản</label>
                <select id="lnk-owner" className="ad-input" value={form.ownerUsername} onChange={e => setForm(f => ({ ...f, ownerUsername:e.target.value }))}>
                  {accounts.map(a => (
                    <option key={a.username} value={a.username}>
                      {a.displayName || a.username} (@{a.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="ad-field">
                <span className="ad-label">Loại trang</span>
                <div className="ad-choices">
                  {Object.entries(PAGE_TYPES).map(([key, meta]) => (
                    <button key={key} type="button" className="ad-choice" aria-pressed={form.type === key} style={{ '--choice-accent':meta.color }}
                      onClick={() => setForm(f => ({ ...f, type:key, gameId:DEFAULT_GAME_BY_TYPE[key], difficulty:'medium' }))}>
                      <span className="ad-choice__icon" aria-hidden="true">{meta.emoji}</span>
                      <strong>{meta.label}</strong>
                    </button>
                  ))}
                </div>
              </div>

              <div className="ad-field">
                <span className="ad-label">Trò chơi cho link này</span>
                <div className="ad-choices ad-choices--wide">
                  {GAME_OPTIONS.map(game => (
                    <button key={game.id} type="button" className="ad-choice ad-choice--row" aria-pressed={form.gameId === game.id}
                      onClick={() => setForm(f => ({ ...f, gameId:game.id, difficulty:'medium' }))}>
                      <span className="ad-choice__icon" aria-hidden="true">{game.emoji}</span>
                      <span>
                        <strong>{game.name}</strong>
                        <small>{game.description}</small>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="ad-field">
                <span className="ad-label">Độ khó trò chơi</span>
                <div className="ad-choices">
                  {Object.entries(DIFFICULTY[form.gameId] || DIFFICULTY['balloon-pop']).map(([key, meta]) => (
                    <button key={key} type="button" className="ad-choice" aria-pressed={form.difficulty === key} style={{ '--choice-accent':meta.color }}
                      onClick={() => setForm(f => ({ ...f, difficulty:key }))}>
                      <span className="ad-choice__icon" aria-hidden="true">{meta.icon}</span>
                      <strong>{meta.label}</strong>
                      <small>{meta.desc}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="ad-field">
                <label className="ad-label" htmlFor="lnk-name">Tên người nhận <span className="ad-hint">(hiển thị trên trang)</span></label>
                <input id="lnk-name" className="ad-input" type="text" placeholder="Vd: Nguyễn Văn A, em Lan..." required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name:e.target.value }))} />
              </div>

              <div className="ad-field">
                <label className="ad-label" htmlFor="lnk-message">Lời nhắn riêng <span className="ad-hint">(không bắt buộc)</span></label>
                <textarea id="lnk-message" className="ad-input"
                  placeholder="Viết vài dòng dành riêng cho người nhận..."
                  value={form.message}
                  maxLength={500}
                  rows={4}
                  onChange={e => setForm(f => ({ ...f, message:e.target.value }))}
                />
                <div className="ad-counter">{form.message.length}/500</div>
              </div>

              <div className="ad-field">
                <label className="ad-label" htmlFor="lnk-expires">Hết hạn <span className="ad-hint">(để trống = không giới hạn)</span></label>
                <input id="lnk-expires" className="ad-input" type="date" value={form.expiresAt}
                  onChange={e => setForm(f => ({ ...f, expiresAt:e.target.value }))} />
              </div>

              <div className="ad-divider">
                <ImageUploader images={images} onChange={setImages} label="Album ảnh cho trang này" />
              </div>

              {err && <div role="alert" className="ad-alert">{err}</div>}
              <div className="ad-actions">
                <button className="ad-btn ad-btn--primary" disabled={saving}><AdminIcon name="link" size={15} />{saving ? 'Đang tạo...' : 'Tạo link'}</button>
                <button type="button" className="ad-btn" onClick={onClose}>Huỷ</button>
              </div>
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
  const [theme, setTheme] = useState(initialTheme)
  const session = getSession()
  const { isMobile } = useBreakpoint()
  const { lang } = useLang()
  const tr = t[lang].admin
  const TABS = [
    { id:'dashboard', label:tr.tabs.dashboard, icon:'dashboard' },
    { id:'analytics', label:tr.tabs.analytics, icon:'analytics' },
    { id:'accounts',  label:tr.tabs.accounts,  icon:'users' },
    { id:'links',     label:tr.tabs.links,     icon:'key' },
    { id:'messages',  label:tr.tabs.messages,  icon:'message' },
    { id:'content',   label:tr.tabs.content,   icon:'edit' },
    { id:'landing',   label:tr.tabs.landing,   icon:'eye' },
  ]
  const toggleTheme = () => setTheme(current => {
    const next = current === 'dark' ? 'light' : 'dark'
    try { localStorage.setItem(THEME_KEY, next) } catch { /* storage blocked */ }
    return next
  })

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

  const uniqueViewers = new Set(
    analytics.history.map(item => item.visitorId || item.ip || `anon-${item.createdAt || ''}`)
  ).size
  const activeTab = TABS.find(item => item.id === tab)
  const displayName = session?.displayName || session?.username || ''
  const statusClass = serverOnline === null ? '' : serverOnline ? 'is-online' : 'is-offline'

  return (
    <div className="admin-root" data-theme={theme}>
      {/* Mobile top bar */}
      {isMobile && (
        <div className="ad-topbar">
          <button type="button" className="ad-topbar__btn" onClick={() => setMobileMenuOpen(true)} aria-label="Mở menu">
            <AdminIcon name="menu" size={18} />
          </button>
          <div className="ad-topbar__title">{activeTab?.label}</div>
        </div>
      )}

      {/* Drawer backdrop */}
      {isMobile && mobileMenuOpen && (
        <div className="ad-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`ad-sidebar ${isMobile && mobileMenuOpen ? 'is-open' : ''}`} aria-label="Điều hướng quản trị">
        <div className="ad-brand">
          <div className="ad-brand__mark"><span>.</span>me</div>
          <div className="ad-brand__role">Admin panel</div>
        </div>
        <div className="ad-user">
          <div className="ad-user__avatar" aria-hidden="true">{displayName.trim().charAt(0).toLocaleUpperCase('vi') || '?'}</div>
          <div style={{ minWidth: 0 }}>
            <div className="ad-user__name">{displayName}</div>
            <div className={`ad-user__status ${statusClass}`} role="status">
              <i aria-hidden="true" />
              {serverOnline === null ? 'Đang kiểm tra...' : serverOnline ? 'Server online' : 'Server offline'}
            </div>
          </div>
        </div>

        {/* Offline warning banner */}
        {serverOnline === false && (
          <div className="ad-offline">
            <strong>Server chưa chạy.</strong><br/>
            Mở terminal, chạy: <code>npm run dev</code>
          </div>
        )}

        <nav className="ad-nav" aria-label="Các mục quản trị">
          {TABS.map(item => (
            <button key={item.id} type="button" className="ad-nav__item" aria-current={tab === item.id ? 'page' : undefined}
              onClick={() => { setTab(item.id); setMobileMenuOpen(false) }}>
              <AdminIcon name={item.icon} />{item.label}
              {item.id === 'messages' && messages.length > 0 && (
                <span className="ad-nav__badge">{messages.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar__foot">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          <LangToggleAdmin />
          <a href="/" className="ad-foot-link"><AdminIcon name="home" size={17} />{plainLabel(tr.home)}</a>
          <button type="button" className="ad-foot-link is-danger" onClick={() => { logout(); navigate('/login') }}>
            <AdminIcon name="logout" size={17} />{plainLabel(tr.logout)}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ad-main">
        <header className="ad-page-head">
          <h1>{activeTab?.label}</h1>
          <p>{new Date().toLocaleDateString('vi-VN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
        </header>

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

        {tab === 'landing' && <AdminLanding />}

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
    </div>
  )
}

export default function Admin() {
  return <LangProvider><AdminInner /></LangProvider>
}
