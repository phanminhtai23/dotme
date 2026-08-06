import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated, isAdmin, logout, getSession } from '../auth'
import { PAGE_TYPES } from '../store'
import { DIFFICULTY } from '../games/difficulty'
import { getAnalytics, trackVisit } from '../analytics'
import { api } from '../api'
import ImageUploader from '../components/ImageUploader'
import AdminContent from '../components/AdminContent'
import { LangProvider, useLang } from '../LangContext'
import { t } from '../i18n'

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

const ROLE_META = {
  superadmin: { label:'Super Admin', color:'#a78bfa', bg:'rgba(139,92,246,0.15)', border:'rgba(139,92,246,0.35)' },
  admin:       { label:'Admin',       color:'#22d3ee', bg:'rgba(34,211,238,0.1)',  border:'rgba(34,211,238,0.3)'  },
  user:        { label:'User',        color:'#8888aa', bg:'rgba(136,136,170,0.1)', border:'rgba(136,136,170,0.25)'},
}

const STATUS_META = {
  active:   { label:'Hoạt động', color:'#10b981', bg:'rgba(16,185,129,0.1)', border:'rgba(16,185,129,0.3)' },
  expired:  { label:'Hết hạn',   color:'#ef4444', bg:'rgba(239,68,68,0.1)', border:'rgba(239,68,68,0.3)' },
}

function isExpired(expiresAt) {
  return expiresAt ? new Date(expiresAt) < new Date() : false
}

function Badge({ meta }) {
  return (
    <span style={{
      fontSize:11, fontWeight:700, color:meta.color, background:meta.bg,
      border:`1px solid ${meta.border}`, borderRadius:99, padding:'3px 10px', letterSpacing:'0.04em',
    }}>{meta.label}</span>
  )
}

const INPUT = {
  width:'100%', boxSizing:'border-box',
  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
  borderRadius:10, padding:'11px 16px', color:'#f0f0ff',
  fontSize:14, fontFamily:'Inter, sans-serif', outline:'none', transition:'border-color 0.2s',
}
const focus = (e) => { e.target.style.borderColor = 'rgba(139,92,246,0.6)' }
const blur  = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }

function Card({ children, style = {} }) {
  return (
    <div style={{
      background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
      borderRadius:16, padding:24, ...style,
    }}>
      {children}
    </div>
  )
}

function SectionTitle({ children }) {
  return <h3 style={{ fontWeight:700, fontSize:16, marginBottom:20, color:'#f0f0ff' }}>{children}</h3>
}

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

// ─── Timeline Chart ─────────────────────────────────────────────────────────

function TimelineChart({ data }) {
  const [hovered, setHovered] = useState(null)
  const [range, setRange] = useState('all')

  if (!data.length) {
    return <div style={{ color:'#555577', fontSize:13 }}>Chưa có dữ liệu truy cập.</div>
  }

  const series = range === '7d' ? data.slice(-7) : range === '30d' ? data.slice(-30) : data
  const rangeLabel = range === '7d' ? '7 ngày gần nhất' : range === '30d' ? '30 ngày gần nhất' : 'Toàn bộ lịch sử'

  const widthPerPoint = 52
  const chartHeight = 220
  const chartWidth = Math.max(series.length * widthPerPoint, 720)
  const max = Math.max(...series.map(d => d.visits), 1)
  const total = series.reduce((sum, d) => sum + d.visits, 0)
  const totalAll = data.reduce((sum, d) => sum + d.visits, 0)
  const average = total / series.length
  const peak = series.reduce((best, item) => (item.visits > best.visits ? item : best), series[0])
  const latest = series[series.length - 1]

  const points = series.map((d, i) => {
    const x = series.length === 1 ? chartWidth / 2 : (i / (series.length - 1)) * (chartWidth - 24) + 12
    const y = chartHeight - 24 - ((d.visits / max) * (chartHeight - 64))
    return { ...d, x, y }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points.at(-1).x} ${chartHeight - 20} L ${points[0].x} ${chartHeight - 20} Z`
  const labelStep = series.length > 14 ? Math.ceil(series.length / 7) : Math.max(1, Math.ceil(series.length / 4))

  const metricCards = [
    { label:'Tổng kỳ chọn', value:total, color:'#8B5CF6' },
    { label:'Tổng all', value:totalAll, color:'#7c3aed' },
    { label:'Trung bình/ngày', value:average.toFixed(1), color:'#22D3EE' },
    { label:'Cao nhất', value:peak.visits, color:'#10B981' },
    { label:'Hôm gần nhất', value:latest.visits, color:'#EC4899' },
  ]

  const RANGE_OPTIONS = [
    { id:'7d', label:'7D' },
    { id:'30d', label:'30D' },
    { id:'all', label:'ALL' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:10 }}>
        {metricCards.map(card => (
          <div key={card.label} style={{
            background:'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
            border:`1px solid ${card.color}22`, borderRadius:14, padding:'12px 14px',
          }}>
            <div style={{ fontSize:11, color:'#8888aa', marginBottom:6 }}>{card.label}</div>
            <div style={{ fontSize:24, lineHeight:1, fontWeight:800, color:card.color, fontFamily:'Syne, sans-serif' }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{
        background:'linear-gradient(180deg, rgba(139,92,246,0.12), rgba(255,255,255,0.03))',
        border:'1px solid rgba(139,92,246,0.18)', borderRadius:18, padding:16,
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, gap:12, flexWrap:'wrap' }}>
          <div>
            <div style={{ fontSize:13, color:'#f0f0ff', fontWeight:700 }}>Biểu đồ lượt xem theo ngày</div>
            <div style={{ fontSize:12, color:'#8888aa', marginTop:4 }}>{rangeLabel} • cuộn ngang nếu dữ liệu dài.</div>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', fontSize:12, color:'#8888aa', alignItems:'center' }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><i style={{ width:10, height:10, borderRadius:'50%', background:'#22D3EE', display:'inline-block' }} /> Hôm nay</span>
            <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><i style={{ width:10, height:10, borderRadius:'50%', background:'#8B5CF6', display:'inline-block' }} /> Xu hướng</span>
            <div style={{ display:'inline-flex', gap:6, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:99, padding:4 }}>
              {RANGE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => { setRange(opt.id); setHovered(null) }}
                  style={{
                    border:'none', borderRadius:99, padding:'5px 10px', cursor:'pointer',
                    fontSize:11, fontWeight:700, fontFamily:'Inter, sans-serif', letterSpacing:'0.04em',
                    background: range === opt.id ? 'linear-gradient(135deg,#8B5CF6,#22D3EE)' : 'transparent',
                    color: range === opt.id ? '#fff' : '#8888aa', transition:'all 0.2s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ overflowX:'auto', paddingBottom:8 }}>
          <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ display:'block' }}>
            <defs>
              <linearGradient id="timelineArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.38" />
                <stop offset="55%" stopColor="#22D3EE" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="timelineLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#22D3EE" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
              <filter id="timelineGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.55 0 1 0 0 0.35 0 0 1 0 0.98 0 0 0 0.4 0" />
              </filter>
            </defs>

            {[0.25, 0.5, 0.75].map((ratio, i) => {
              const y = 20 + ratio * (chartHeight - 50)
              return <line key={i} x1={12} y1={y} x2={chartWidth - 12} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="6 8" />
            })}

            <path d={areaPath} fill="url(#timelineArea)" />
            <path d={linePath} fill="none" stroke="url(#timelineLine)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#timelineGlow)" />

            {hovered && (
              <g pointerEvents="none">
                <line x1={hovered.x} y1={20} x2={hovered.x} y2={chartHeight - 20} stroke="rgba(34,211,238,0.5)" strokeDasharray="4 6" />
                <rect
                  x={Math.max(10, Math.min(hovered.x - 62, chartWidth - 130))}
                  y={Math.max(8, hovered.y - 58)}
                  width={124}
                  height={42}
                  rx={10}
                  fill="rgba(9,9,22,0.92)"
                  stroke="rgba(34,211,238,0.45)"
                />
                <text x={Math.max(22, Math.min(hovered.x - 50, chartWidth - 118))} y={Math.max(25, hovered.y - 38)} fill="#a78bfa" fontSize="10" fontWeight="700" fontFamily="Inter, sans-serif">
                  {hovered.label}
                </text>
                <text x={Math.max(22, Math.min(hovered.x - 50, chartWidth - 118))} y={Math.max(42, hovered.y - 21)} fill="#22D3EE" fontSize="13" fontWeight="800" fontFamily="Syne, sans-serif">
                  {hovered.visits} views
                </text>
              </g>
            )}

            {points.map((point, i) => {
              const showLabel = i === 0 || i === points.length - 1 || i % labelStep === 0
              const isPeak = point.visits === peak.visits && peak.visits > 0
              const isLatest = i === points.length - 1
              return (
                <g key={point.date}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isPeak || isLatest ? 7 : 5}
                    fill={isLatest ? '#22D3EE' : '#8B5CF6'}
                    stroke="rgba(6,6,15,0.95)"
                    strokeWidth="2"
                    style={{ cursor:'pointer' }}
                    onMouseEnter={() => setHovered(point)}
                    onMouseLeave={() => setHovered(curr => (curr?.date === point.date ? null : curr))}
                    onClick={() => setHovered(point)}
                  />
                  {isPeak && <circle cx={point.x} cy={point.y} r={12} fill="#8B5CF6" opacity="0.14" />}
                  {showLabel && (
                    <text x={point.x} y={chartHeight - 4} textAnchor="middle" fill="#555577" fontSize="10" fontFamily="Inter, sans-serif">
                      {point.label}
                    </text>
                  )}
                  {point.visits > 0 && (isPeak || isLatest || i % labelStep === 0) && (
                    <text x={point.x} y={point.y - 12} textAnchor="middle" fill={isLatest ? '#22D3EE' : '#a78bfa'} fontSize="11" fontWeight="700" fontFamily="Inter, sans-serif">
                      {point.visits}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
      </div>
    </div>
  )
}

// ─── Account Modal ──────────────────────────────────────────────────────────

function AccountModal({ mode, initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { username:'', password:'', displayName:'', role:'user', expiresAt:'' })
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
    <div style={{
      position:'fixed', inset:0, zIndex:200,
      background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
    }}
    onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:20, padding:36, width:'100%', maxWidth:440,
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
  const [form, setForm] = useState({ ownerUsername: accounts[0]?.username || '', type:'birthday', name:'', expiresAt:'', difficulty:'medium' })
  const [images, setImages] = useState([])
  const [created, setCreated] = useState(null)
  const [copied, setCopied] = useState(false)

  const handle = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    try {
      const link = await api.addLink({ ownerUsername:form.ownerUsername, type:form.type, name:form.name.trim(), expiresAt:form.expiresAt || null, images, difficulty:form.difficulty })
      setCreated(link)
      onSave()
    } catch (err) { console.error(err) }
  }

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
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
    }}
    onMouseDown={(e) => { if (!created && e.target === e.currentTarget) onClose() }}>
      <div style={{
        background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:20, padding:36, width:'100%', maxWidth:500,
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
                <div style={{ display:'flex', gap:10 }}>
                  {Object.entries(PAGE_TYPES).map(([key, meta]) => (
                    <button key={key} type="button" onClick={() => setForm(f => ({ ...f, type:key }))} style={{
                      flex:1, background: form.type === key ? `${meta.color}18` : 'rgba(255,255,255,0.04)',
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

              {/* Difficulty picker */}
              <div>
                <label style={{ fontSize:12, color:'#8888aa', display:'block', marginBottom:10, letterSpacing:'0.05em' }}>ĐỘ KHÓ TRÒ CHƠI</label>
                <div style={{ display:'flex', gap:8 }}>
                  {Object.entries(DIFFICULTY[form.type] || DIFFICULTY.birthday).map(([key, meta]) => (
                    <button key={key} type="button" onClick={() => setForm(f => ({ ...f, difficulty:key }))} style={{
                      flex:1, background: form.difficulty === key ? `${meta.color}20` : 'rgba(255,255,255,0.04)',
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
                <GradBtn style={{ flex:1 }}>🔗 Tạo link</GradBtn>
                <button type="button" onClick={onClose} style={{
                  flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:10, color:'#8888aa', fontSize:14, fontWeight:600,
                  fontFamily:'Inter, sans-serif', cursor:'pointer', padding:'10px',
                }}>Huỷ</button>
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
  const [links, setLinks]       = useState([])
  const [messages, setMessages] = useState([])
  const [modal, setModal]       = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [serverOnline, setServerOnline] = useState(null)
  const [storage, setStorage] = useState(null)
  const session = getSession()
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
    fetch('/api/health').then(r => r.ok ? setServerOnline(true) : setServerOnline(false)).catch(() => setServerOnline(false))
    fetch('/api/storage').then(r => r.json()).then(setStorage).catch(() => {})
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

  const copyLink = (link) => {
    navigator.clipboard.writeText(window.location.origin + link.path)
    setCopiedId(link.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDeleteAcc = async (username) => {
    if (!window.confirm(`Xóa tài khoản "${username}"?`)) return
    await api.deleteAccount(username).catch(() => {}); refresh()
  }

  const handleDeleteLink = async (id) => {
    if (!window.confirm('Xóa quyền truy cập này?')) return
    await api.deleteLink(id).catch(() => {}); refresh()
  }

  const handleDeleteMsg = async (idx) => {
    const serverIdx = messages.length - 1 - idx
    await api.deleteMessage(serverIdx).catch(() => {
      const msgs = [...messages]; msgs.splice(idx, 1)
      localStorage.setItem('dotme_messages', JSON.stringify(msgs))
    })
    refresh()
  }

  if (!analytics) return null

  const origin = window.location.origin
  const uniqueViewers = new Set(
    analytics.history.map(item => item.visitorId || item.ip || `anon-${item.createdAt || ''}`)
  ).size

  return (
    <div style={{ minHeight:'100vh', background:'#06060f', display:'flex', fontFamily:'Inter, sans-serif', color:'#f0f0ff' }}>
      {/* Sidebar */}
      <aside style={{
        width:240, flexShrink:0, background:'rgba(255,255,255,0.02)',
        borderRight:'1px solid rgba(255,255,255,0.07)',
        display:'flex', flexDirection:'column', padding:'28px 14px 20px', gap:4,
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
          <button key={t.id} onClick={() => setTab(t.id)} style={{
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
      <main style={{ flex:1, padding:36, overflowY:'auto' }}>
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:26, fontWeight:800, marginBottom:4 }}>
            {TABS.find(t => t.id === tab)?.icon} {TABS.find(t => t.id === tab)?.label}
          </h1>
          <p style={{ color:'#555577', fontSize:13 }}>
            {new Date().toLocaleDateString('vi-VN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
              {[
                { label:tr.stats.views,    value:analytics.total,    color:'#8B5CF6', icon:'👁' },
                { label:tr.stats.today,    value:analytics.today,    color:'#22d3ee', icon:'📅' },
                { label:tr.stats.accounts, value:accounts.length,    color:'#10b981', icon:'👥' },
                { label:tr.stats.messages, value:messages.length,    color:'#ec4899', icon:'💬' },
              ].map((k, i) => (
                <Card key={i} style={{ position:'relative', overflow:'hidden', border:`1px solid ${k.color}20` }}>
                  <div style={{ position:'absolute', top:0, right:0, width:100, height:100, background:`radial-gradient(circle at top right, ${k.color}12, transparent 70%)` }} />
                  <div style={{ fontSize:22, marginBottom:10 }}>{k.icon}</div>
                  <div style={{ fontFamily:'Syne, sans-serif', fontSize:36, fontWeight:800, color:k.color, lineHeight:1, marginBottom:4 }}>{k.value}</div>
                  <div style={{ fontSize:13, color:'#8888aa' }}>{k.label}</div>
                </Card>
              ))}
            </div>
            {storage && (
              <Card style={{ border:'1px solid rgba(139,92,246,0.2)' }}>
                <SectionTitle>💾 {tr.storage}</SectionTitle>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                  {[
                    { label:tr.storageLabels.total,   value: storage.total.size, color:'#8B5CF6' },
                    { label:tr.storageLabels.uploads,  value: `${storage.uploads.size} (${storage.uploads.count})`, color:'#22d3ee' },
                    { label:tr.storageLabels.json,     value: storage.json.size, color:'#10b981' },
                    { label:tr.storageLabels.counts,   value: `${storage.links} / ${storage.accounts} / ${storage.messages}`, color:'#f59e0b' },
                  ].map((s, i) => (
                    <div key={i} style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${s.color}20`, borderRadius:12, padding:'14px 16px' }}>
                      <div style={{ fontSize:13, color:'#8888aa', marginBottom:6 }}>{s.label}</div>
                      <div style={{ fontSize:15, fontWeight:700, color:s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            <Card>
              <SectionTitle>{tr.chart}</SectionTitle>
              <TimelineChart data={analytics.days} />
            </Card>
            {links.length > 0 && (
              <Card>
                <SectionTitle>{tr.recentLinks}</SectionTitle>
                {links.slice(-4).reverse().map(link => (
                  <div key={link.id} style={{
                    display:'flex', alignItems:'center', gap:12, padding:'10px 0',
                    borderBottom:'1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span style={{ fontSize:24 }}>{PAGE_TYPES[link.type]?.emoji}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:600 }}>{link.name}</div>
                      <div style={{ fontSize:12, color:'#8888aa' }}>@{link.ownerUsername} · {link.created}</div>
                    </div>
                    <button onClick={() => copyLink(link)} style={{
                      background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.25)', borderRadius:8,
                      padding:'6px 12px', color:'#a78bfa', fontSize:12, fontFamily:'Inter, sans-serif', cursor:'pointer',
                    }}>
                      {copiedId === link.id ? '✓' : '📋'}
                    </button>
                  </div>
                ))}
              </Card>
            )}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === 'analytics' && (
          <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:980 }}>
            <div style={{
              background:'linear-gradient(160deg, rgba(139,92,246,0.12), rgba(34,211,238,0.05), rgba(236,72,153,0.06))',
              border:'1px solid rgba(139,92,246,0.22)', borderRadius:18, padding:16,
            }}>
              <div style={{ fontSize:12, color:'#a78bfa', letterSpacing:'0.08em', marginBottom:10 }}>ANALYTICS SNAPSHOT</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(170px, 1fr))', gap:12 }}>
              {[
                { label:'Tổng lượt xem', value:analytics.total, color:'#8B5CF6', icon:'👁' },
                { label:'Lần đầu ghé', value:analytics.firstVisit ? new Date(analytics.firstVisit).toLocaleDateString('vi-VN') : '—', color:'#10b981', icon:'📅' },
                { label:'Lần ghé cuối', value:analytics.lastVisit ? new Date(analytics.lastVisit).toLocaleDateString('vi-VN') : '—', color:'#ec4899', icon:'🕒' },
                { label:'Viewer unique', value:uniqueViewers, color:'#22d3ee', icon:'🧑‍🤝‍🧑' },
              ].map((k, i) => (
                <Card key={i} style={{ position:'relative', overflow:'hidden', border:`1px solid ${k.color}20`, background:'rgba(10,10,24,0.55)', padding:18 }}>
                  <div style={{ position:'absolute', top:0, right:0, width:100, height:100, background:`radial-gradient(circle at top right, ${k.color}12, transparent 70%)` }} />
                  <div style={{ fontSize:22, marginBottom:10 }}>{k.icon}</div>
                  <div style={{ fontFamily:'Syne, sans-serif', fontSize:30, fontWeight:800, color:k.color, lineHeight:1, marginBottom:6, wordBreak:'break-word' }}>{k.value}</div>
                  <div style={{ fontSize:12, color:'#8888aa', letterSpacing:'0.03em' }}>{k.label}</div>
                </Card>
              ))}
              </div>
            </div>

            <Card>
              <SectionTitle>{tr.chart}</SectionTitle>
              <TimelineChart data={analytics.days} />
            </Card>
            <Card style={{ border:'1px solid rgba(139,92,246,0.16)', background:'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))' }}>
              <SectionTitle>Chi tiết theo ngày</SectionTitle>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(170px, 1fr))', gap:8 }}>
                {analytics.days.map((d, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:10, fontSize:13 }}>
                    <span style={{ color:'#8888aa' }}>{d.label}</span>
                    <span style={{ color: d.visits > 0 ? '#a78bfa' : '#555577', fontWeight:700 }}>{d.visits}</span>
                  </div>
                ))}
              </div>
            </Card>
            {Object.keys(analytics.pages).length > 0 && (
              <Card style={{ border:'1px solid rgba(34,211,238,0.18)' }}>
                <SectionTitle>Trang được xem</SectionTitle>
                {Object.entries(analytics.pages).map(([page, count]) => (
                  <div key={page} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'rgba(34,211,238,0.04)', border:'1px solid rgba(34,211,238,0.16)', borderRadius:10, marginBottom:8, fontSize:14 }}>
                    <span style={{ color:'#9ca3af', fontFamily:'monospace' }}>{page || '/'}</span>
                    <span style={{ color:'#22d3ee', fontWeight:700 }}>{count}</span>
                  </div>
                ))}
              </Card>
            )}

            <Card style={{ border:'1px solid rgba(236,72,153,0.16)' }}>
              <SectionTitle>Toàn bộ lịch sử truy cập</SectionTitle>
              {analytics.history.length === 0 ? (
                <div style={{ color:'#555577', fontSize:13 }}>Chưa có lượt truy cập nào.</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:420, overflowY:'auto', overflowX:'auto', paddingRight:4 }}>
                  {analytics.history.map((item, index) => (
                    <div key={`${item.createdAt}-${index}`} style={{ display:'grid', gridTemplateColumns:'minmax(180px,1.2fr) minmax(90px,1fr) minmax(90px,0.8fr) minmax(140px,1.4fr)', gap:12, alignItems:'center', padding:'10px 14px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:10, fontSize:13, minWidth:680 }}>
                      <span style={{ color:'#8888aa', whiteSpace:'nowrap' }}>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                      <span style={{ color:'#f0f0ff', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis' }}>{item.page}</span>
                      <span style={{ color:'#22d3ee', fontWeight:700 }}>{item.visitorId ? item.visitorId.slice(0, 8) : 'anon'}</span>
                      <span style={{ color:'#555577', overflow:'hidden', textOverflow:'ellipsis' }}>{item.referrer || item.userAgent || item.ip || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ── ACCOUNTS ── */}
        {tab === 'accounts' && (
          <div style={{ maxWidth:900 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <p style={{ color:'#8888aa', fontSize:14 }}>{accounts.length} tài khoản</p>
              <GradBtn onClick={() => setModal('add-account')}>+ Thêm tài khoản</GradBtn>
            </div>
            <Card style={{ padding:0, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                    {['Tài khoản','Vai trò','Trạng thái','Tạo ngày','Hết hạn',''].map(h => (
                      <th key={h} style={{ padding:'14px 20px', textAlign:'left', fontSize:12, fontWeight:600, color:'#555577', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {accounts.map(acc => {
                    const exp = isExpired(acc.expiresAt)
                    return (
                      <tr key={acc.username} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}
                      >
                        <td style={{ padding:'14px 20px' }}>
                          <div style={{ fontWeight:600 }}>{acc.displayName || acc.username}</div>
                          <div style={{ fontSize:12, color:'#555577' }}>@{acc.username}</div>
                        </td>
                        <td style={{ padding:'14px 20px' }}><Badge meta={ROLE_META[acc.role] || ROLE_META.user} /></td>
                        <td style={{ padding:'14px 20px' }}><Badge meta={exp ? STATUS_META.expired : STATUS_META.active} /></td>
                        <td style={{ padding:'14px 20px', color:'#8888aa', fontSize:13 }}>{acc.created}</td>
                        <td style={{ padding:'14px 20px', color:'#8888aa', fontSize:13 }}>{acc.expiresAt || '—'}</td>
                        <td style={{ padding:'14px 20px' }}>
                          <div style={{ display:'flex', gap:8 }}>
                            <button onClick={() => { setEditTarget(acc); setModal('edit-account') }} style={{
                              background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.25)',
                              borderRadius:8, padding:'6px 12px', color:'#a78bfa', fontSize:12,
                              fontFamily:'Inter, sans-serif', cursor:'pointer',
                            }}>Sửa</button>
                            {acc.username !== 'admin' && (
                              <button onClick={() => handleDeleteAcc(acc.username)} style={{
                                background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
                                borderRadius:8, padding:'6px 12px', color:'#fca5a5', fontSize:12,
                                fontFamily:'Inter, sans-serif', cursor:'pointer',
                              }}>Xóa</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* ── LINKS / PERMISSIONS ── */}
        {tab === 'links' && (
          <div style={{ maxWidth:1000 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <p style={{ color:'#8888aa', fontSize:14 }}>{links.length} link đã tạo</p>
              <GradBtn onClick={() => setModal('add-link')}>🔑 Gán quyền mới</GradBtn>
            </div>
            {links.length === 0 ? (
              <Card style={{ textAlign:'center', padding:60 }}>
                <div style={{ fontSize:56, marginBottom:16 }}>🔑</div>
                <p style={{ color:'#8888aa' }}>Chưa có quyền nào được gán.<br/>Nhấn "Gán quyền mới" để bắt đầu.</p>
              </Card>
            ) : (
              <Card style={{ padding:0, overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
                      {['Loại','Tên','Tài khoản','Hết hạn','Link',''].map(h => (
                        <th key={h} style={{ padding:'14px 20px', textAlign:'left', fontSize:12, fontWeight:600, color:'#555577', letterSpacing:'0.05em', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {links.map(link => {
                      const meta = PAGE_TYPES[link.type] || {}
                      const exp = isExpired(link.expiresAt)
                      return (
                        <tr key={link.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', transition:'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}
                        >
                          <td style={{ padding:'14px 20px' }}>
                            <span style={{ fontSize:22 }}>{meta.emoji}</span>
                            <span style={{ marginLeft:8, fontSize:12, color:meta.color, fontWeight:600 }}>{meta.label}</span>
                          </td>
                          <td style={{ padding:'14px 20px', fontWeight:600 }}>{link.name}</td>
                          <td style={{ padding:'14px 20px', color:'#8888aa', fontSize:13 }}>@{link.ownerUsername}</td>
                          <td style={{ padding:'14px 20px' }}>
                            <Badge meta={exp ? STATUS_META.expired : STATUS_META.active} />
                            {link.expiresAt && <div style={{ fontSize:11, color:'#555577', marginTop:2 }}>{link.expiresAt}</div>}
                          </td>
                          <td style={{ padding:'14px 20px' }}>
                            <button onClick={() => copyLink(link)} style={{
                              background: copiedId === link.id ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.1)',
                              border:`1px solid ${copiedId === link.id ? 'rgba(16,185,129,0.4)' : 'rgba(139,92,246,0.25)'}`,
                              borderRadius:8, padding:'6px 14px',
                              color: copiedId === link.id ? '#6ee7b7' : '#a78bfa',
                              fontSize:12, fontFamily:'Inter, sans-serif', cursor:'pointer', transition:'all 0.2s',
                              display:'flex', alignItems:'center', gap:6,
                            }}>
                              {copiedId === link.id ? '✓ Đã copy' : '📋 Copy link'}
                            </button>
                          </td>
                          <td style={{ padding:'14px 20px' }}>
                            <button onClick={() => handleDeleteLink(link.id)} style={{
                              background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
                              borderRadius:8, padding:'6px 12px', color:'#fca5a5', fontSize:12,
                              fontFamily:'Inter, sans-serif', cursor:'pointer',
                            }}>Xóa</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        )}

        {/* ── CONTENT ── */}
        {tab === 'content' && <AdminContent />}

        {/* ── MESSAGES ── */}
        {tab === 'messages' && (
          <div style={{ maxWidth:800 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <p style={{ color:'#8888aa', fontSize:14 }}>{messages.length} tin nhắn</p>
              {messages.length > 0 && (
                <button onClick={async () => {
                  if (window.confirm('Xóa tất cả tin nhắn?')) {
                    await api.deleteAllMessages().catch(() => { localStorage.setItem('dotme_messages','[]') })
                    setMessages([])
                  }
                }} style={{
                  background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
                  borderRadius:8, padding:'8px 16px', color:'#fca5a5', fontSize:13,
                  fontFamily:'Inter, sans-serif', cursor:'pointer',
                }}>Xóa tất cả</button>
              )}
            </div>
            {messages.length === 0 ? (
              <Card style={{ textAlign:'center', padding:60 }}>
                <div style={{ fontSize:56, marginBottom:16 }}>💬</div>
                <p style={{ color:'#8888aa' }}>Chưa có tin nhắn nào từ khách thăm.</p>
              </Card>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[...messages].reverse().map((msg, i) => (
                  <Card key={i} style={{ position:'relative' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:40, height:40, borderRadius:12, background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                          😊
                        </div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:15 }}>{msg.name || 'Ẩn danh'}</div>
                          <div style={{ fontSize:12, color:'#555577', marginTop:2 }}>
                            {msg.ip && <span>📍 {msg.ip} · </span>}
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleString('vi-VN') : ''}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteMsg(messages.length - 1 - i)} style={{
                        background:'none', border:'none', cursor:'pointer', color:'#555577', padding:4,
                        fontSize:16, transition:'color 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color='#fca5a5'}
                      onMouseLeave={e => e.currentTarget.style.color='#555577'}
                      >✕</button>
                    </div>
                    <p style={{ fontSize:15, color:'rgba(255,255,255,0.8)', lineHeight:1.7, whiteSpace:'pre-wrap' }}>
                      {msg.message}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {modal === 'add-account' && (
        <AccountModal mode="add" onSave={() => { refresh(); setModal(null) }} onClose={() => setModal(null)} />
      )}
      {modal === 'edit-account' && editTarget && (
        <AccountModal mode="edit" initial={editTarget} onSave={() => { refresh(); setModal(null) }} onClose={() => setModal(null)} />
      )}
      {modal === 'add-link' && (
        <LinkModal accounts={accounts} onSave={refresh} onClose={() => setModal(null)} />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Inter:wght@400;600;700;800&display=swap');
        * { scrollbar-width: thin; scrollbar-color: #8B5CF6 transparent; }
      `}</style>
    </div>
  )
}

export default function Admin() {
  return <LangProvider><AdminInner /></LangProvider>
}
