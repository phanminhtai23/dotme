import { useEffect, useState } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint'

const BASE = (import.meta.env.VITE_API_BASE_URL || '/api') + '/content'

const INPUT = {
  width:'100%', boxSizing:'border-box',
  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
  borderRadius:10, padding:'11px 16px', color:'#f0f0ff',
  fontSize:13, fontFamily:'Inter, sans-serif', outline:'none', transition:'border-color 0.2s',
}
const TEXTAREA = { ...INPUT, resize:'vertical', minHeight:90, lineHeight:1.6 }
const focus = e => { e.target.style.borderColor = 'rgba(139,92,246,0.6)' }
const blur  = e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }

function Label({ children }) {
  return <label style={{ fontSize:11, color:'#8888aa', display:'block', marginBottom:5, letterSpacing:'0.06em', textTransform:'uppercase', fontWeight:600 }}>{children}</label>
}

function Field({ label, children }) {
  return <div style={{ display:'flex', flexDirection:'column', gap:4 }}><Label>{label}</Label>{children}</div>
}

function GradBtn({ children, onClick, color='purple', style={}, type='button' }) {
  const bg = color==='red' ? 'linear-gradient(135deg,#ef4444,#dc2626)'
           : color==='green' ? 'linear-gradient(135deg,#10b981,#22d3ee)'
           : 'linear-gradient(135deg,#8B5CF6,#ec4899)'
  return (
    <button type={type} onClick={onClick} style={{ background:bg, color:'#fff', border:'none', borderRadius:10, padding:'9px 18px', fontSize:13, fontWeight:700, fontFamily:'Inter, sans-serif', cursor:'pointer', transition:'all 0.2s', ...style }}
      onMouseEnter={e => e.currentTarget.style.transform='translateY(-1px)'}
      onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
    >{children}</button>
  )
}

function Modal({ title, onClose, children }) {
  const { isMobile } = useBreakpoint()
  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding: isMobile ? 12 : 20 }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding: isMobile ? 20 : 32, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto', fontFamily:'Inter, sans-serif' }}
        onMouseDown={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <h3 style={{ fontWeight:800, fontSize:18, color:'#f0f0ff' }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#8888aa', fontSize:20, cursor:'pointer', lineHeight:1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── EXPERIENCE ────────────────────────────────────────────────────────────────

function ExperienceForm({ initial, onSave, onClose }) {
  const blank = { company:'', role:'', period:'', location:'', current:false, bullets:'' }
  const [form, setForm] = useState(() => initial ? { ...initial, bullets: (initial.bullets||[]).join('\n') } : blank)
  const [saving, setSaving] = useState(false)
  const { isMobile } = useBreakpoint()

  const handle = async e => {
    e.preventDefault(); setSaving(true)
    const payload = { ...form, bullets: form.bullets.split('\n').map(b => b.trim()).filter(Boolean) }
    try {
      if (initial) {
        await fetch(`${BASE}/experience/${initial.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      } else {
        await fetch(`${BASE}/experience`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      }
      onSave()
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:12 }}>
        <Field label="Công ty"><input style={INPUT} value={form.company} required onChange={e => setForm(f=>({...f,company:e.target.value}))} onFocus={focus} onBlur={blur} /></Field>
        <Field label="Chức vụ"><input style={INPUT} value={form.role} required onChange={e => setForm(f=>({...f,role:e.target.value}))} onFocus={focus} onBlur={blur} /></Field>
        <Field label="Thời gian (vd: Jan 2026 – Present)"><input style={INPUT} value={form.period} onChange={e => setForm(f=>({...f,period:e.target.value}))} onFocus={focus} onBlur={blur} /></Field>
        <Field label="Địa điểm"><input style={INPUT} value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))} onFocus={focus} onBlur={blur} /></Field>
      </div>
      <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#a78bfa', cursor:'pointer' }}>
        <input type="checkbox" checked={form.current} onChange={e => setForm(f=>({...f,current:e.target.checked}))} />
        Đang làm hiện tại
      </label>
      <Field label="Bullets (mỗi dòng 1 mục, HTML được phép: <strong>text</strong>)">
        <textarea style={TEXTAREA} value={form.bullets} onChange={e => setForm(f=>({...f,bullets:e.target.value}))} onFocus={focus} onBlur={blur} placeholder="Mô tả công việc 1&#10;Mô tả công việc 2" />
      </Field>
      <div style={{ display:'flex', gap:10 }}>
        <GradBtn type="submit" style={{ flex:1 }} color={saving ? 'green' : 'purple'}>{saving ? '⏳ Đang lưu...' : '💾 Lưu'}</GradBtn>
        <button type="button" onClick={onClose} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#8888aa', fontSize:13, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>Huỷ</button>
      </div>
    </form>
  )
}

// ── PROJECTS ──────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ['Live', 'Open Source', 'Research', 'Beta', 'In Progress']
const COLOR_PRESETS = ['#8B5CF6','#22D3EE','#10B981','#F59E0B','#EC4899','#EF4444']

function ProjectForm({ initial, onSave, onClose }) {
  const blank = { title:'', subtitleVi:'', subtitleEn:'', descVi:'', descEn:'', tags:'', color:'#8B5CF6', icon:'📦', status:'In Progress', year:new Date().getFullYear().toString(), liveUrl:'', githubUrl:'' }
  const [form, setForm] = useState(() => initial ? { ...initial, tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : initial.tags || '' } : blank)
  const [saving, setSaving] = useState(false)
  const { isMobile } = useBreakpoint()

  const handle = async e => {
    e.preventDefault(); setSaving(true)
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }
    try {
      if (initial) {
        await fetch(`${BASE}/projects/${initial.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      } else {
        await fetch(`${BASE}/projects`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      }
      onSave()
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:12 }}>
        <Field label="Tên dự án"><input style={INPUT} value={form.title} required onChange={e => setForm(f=>({...f,title:e.target.value}))} onFocus={focus} onBlur={blur} /></Field>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          <Label>Icon (emoji)</Label>
          <input style={INPUT} value={form.icon} onChange={e => setForm(f=>({...f,icon:e.target.value}))} onFocus={focus} onBlur={blur} maxLength={4} />
        </div>
        <Field label="Subtitle (VI)"><input style={INPUT} value={form.subtitleVi} onChange={e => setForm(f=>({...f,subtitleVi:e.target.value}))} onFocus={focus} onBlur={blur} /></Field>
        <Field label="Subtitle (EN)"><input style={INPUT} value={form.subtitleEn} onChange={e => setForm(f=>({...f,subtitleEn:e.target.value}))} onFocus={focus} onBlur={blur} /></Field>
      </div>
      <Field label="Mô tả (VI)"><textarea style={TEXTAREA} value={form.descVi} onChange={e => setForm(f=>({...f,descVi:e.target.value}))} onFocus={focus} onBlur={blur} /></Field>
      <Field label="Mô tả (EN)"><textarea style={TEXTAREA} value={form.descEn} onChange={e => setForm(f=>({...f,descEn:e.target.value}))} onFocus={focus} onBlur={blur} /></Field>
      <Field label="Tags (phân cách bằng dấu phẩy)"><input style={INPUT} value={form.tags} onChange={e => setForm(f=>({...f,tags:e.target.value}))} onFocus={focus} onBlur={blur} placeholder="React, FastAPI, Docker" /></Field>
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap:12 }}>
        <div>
          <Label>Màu</Label>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {COLOR_PRESETS.map(c => (
              <button key={c} type="button" onClick={() => setForm(f=>({...f,color:c}))} style={{ width:28, height:28, borderRadius:8, background:c, border: form.color===c ? '3px solid white' : '2px solid transparent', cursor:'pointer', transition:'all 0.15s' }} />
            ))}
          </div>
        </div>
        <Field label="Status">
          <select style={{ ...INPUT, background:'#1a1a2e', colorScheme:'dark' }} value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s} style={{ background:'#1a1a2e' }}>{s}</option>)}
          </select>
        </Field>
        <Field label="Năm"><input style={INPUT} value={form.year} onChange={e => setForm(f=>({...f,year:e.target.value}))} onFocus={focus} onBlur={blur} maxLength={4} /></Field>
      </div>
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:12 }}>
        <Field label="GitHub URL"><input style={INPUT} value={form.githubUrl} onChange={e => setForm(f=>({...f,githubUrl:e.target.value}))} onFocus={focus} onBlur={blur} placeholder="https://github.com/..." /></Field>
        <Field label="Live URL"><input style={INPUT} value={form.liveUrl} onChange={e => setForm(f=>({...f,liveUrl:e.target.value}))} onFocus={focus} onBlur={blur} placeholder="https://..." /></Field>
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <GradBtn type="submit" style={{ flex:1 }}>{saving ? '⏳ Đang lưu...' : '💾 Lưu'}</GradBtn>
        <button type="button" onClick={onClose} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#8888aa', fontSize:13, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>Huỷ</button>
      </div>
    </form>
  )
}

// ── CERTIFICATES ──────────────────────────────────────────────────────────────

function CertForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || { name:'', issuer:'', icon:'🏅', color:'#8B5CF6' })
  const [saving, setSaving] = useState(false)
  const { isMobile } = useBreakpoint()

  const handle = async e => {
    e.preventDefault(); setSaving(true)
    try {
      if (initial) {
        await fetch(`${BASE}/certificates/${initial.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      } else {
        await fetch(`${BASE}/certificates`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
      }
      onSave()
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:12 }}>
        <Field label="Tên chứng chỉ"><input style={INPUT} value={form.name} required onChange={e => setForm(f=>({...f,name:e.target.value}))} onFocus={focus} onBlur={blur} /></Field>
        <Field label="Tổ chức cấp"><input style={INPUT} value={form.issuer} onChange={e => setForm(f=>({...f,issuer:e.target.value}))} onFocus={focus} onBlur={blur} /></Field>
        <Field label="Icon (emoji)"><input style={INPUT} value={form.icon} onChange={e => setForm(f=>({...f,icon:e.target.value}))} onFocus={focus} onBlur={blur} maxLength={4} /></Field>
        <div>
          <Label>Màu accent</Label>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>
            {COLOR_PRESETS.map(c => (
              <button key={c} type="button" onClick={() => setForm(f=>({...f,color:c}))} style={{ width:28, height:28, borderRadius:8, background:c, border: form.color===c ? '3px solid white' : '2px solid transparent', cursor:'pointer' }} />
            ))}
          </div>
        </div>
      </div>
      <div style={{ display:'flex', gap:10 }}>
        <GradBtn type="submit" style={{ flex:1 }}>{saving ? '⏳...' : '💾 Lưu'}</GradBtn>
        <button type="button" onClick={onClose} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#8888aa', fontSize:13, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>Huỷ</button>
      </div>
    </form>
  )
}

// ── PUBLICATIONS ──────────────────────────────────────────────────────────────

function PubForm({ initial, onSave, onClose }) {
  const blank = { title:'', authorsRaw:'', year:new Date().getFullYear().toString(), conference:'', link:'' }
  const toRaw = authors => (authors||[]).map(a => (a.highlight ? '*' : '') + a.name).join('\n')
  const fromRaw = raw => raw.split('\n').map(line => {
    const trimmed = line.trim()
    if (!trimmed) return null
    const highlight = trimmed.startsWith('*')
    return { name: highlight ? trimmed.slice(1).trim() : trimmed, highlight }
  }).filter(Boolean)

  const [form, setForm] = useState(initial ? { ...initial, authorsRaw: toRaw(initial.authors) } : blank)
  const [saving, setSaving] = useState(false)
  const { isMobile } = useBreakpoint()

  const handle = async e => {
    e.preventDefault(); setSaving(true)
    const { authorsRaw, ...rest } = form
    const payload = { ...rest, authors: fromRaw(authorsRaw) }
    try {
      if (initial) {
        await fetch(`${BASE}/publications/${initial.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      } else {
        await fetch(`${BASE}/publications`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
      }
      onSave()
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <Field label="Tên bài báo / paper"><textarea style={{ ...TEXTAREA, minHeight:60 }} value={form.title} required onChange={e => setForm(f=>({...f,title:e.target.value}))} onFocus={focus} onBlur={blur} /></Field>
      <Field label="Tác giả (mỗi dòng 1 người, *Tên = highlight)">
        <textarea style={TEXTAREA} value={form.authorsRaw} onChange={e => setForm(f=>({...f,authorsRaw:e.target.value}))} onFocus={focus} onBlur={blur} placeholder="Tran Van A&#10;*Nguyen Van B (tác giả chính)&#10;Le Van C" />
      </Field>
      <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 3fr', gap:12 }}>
        <Field label="Năm"><input style={INPUT} value={form.year} onChange={e => setForm(f=>({...f,year:e.target.value}))} onFocus={focus} onBlur={blur} maxLength={4} /></Field>
        <Field label="Hội nghị / Journal"><input style={INPUT} value={form.conference} onChange={e => setForm(f=>({...f,conference:e.target.value}))} onFocus={focus} onBlur={blur} /></Field>
      </div>
      <Field label="Link (tùy chọn)"><input style={INPUT} value={form.link} onChange={e => setForm(f=>({...f,link:e.target.value}))} onFocus={focus} onBlur={blur} placeholder="https://..." /></Field>
      <div style={{ display:'flex', gap:10 }}>
        <GradBtn type="submit" style={{ flex:1 }}>{saving ? '⏳...' : '💾 Lưu'}</GradBtn>
        <button type="button" onClick={onClose} style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#8888aa', fontSize:13, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>Huỷ</button>
      </div>
    </form>
  )
}

// ── GENERIC LIST ──────────────────────────────────────────────────────────────

function ItemRow({ label, sub, onEdit, onDelete }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'rgba(255,255,255,0.02)', borderRadius:12, marginBottom:8 }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:14, color:'#f0f0ff', marginBottom:2 }}>{label}</div>
        {sub && <div style={{ fontSize:12, color:'#8888aa' }}>{sub}</div>}
      </div>
      <button onClick={onEdit} style={{ background:'rgba(139,92,246,0.1)', border:'1px solid rgba(139,92,246,0.25)', borderRadius:8, padding:'6px 12px', color:'#a78bfa', fontSize:12, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>Sửa</button>
      <button onClick={onDelete} style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'6px 12px', color:'#fca5a5', fontSize:12, fontFamily:'Inter, sans-serif', cursor:'pointer' }}>Xóa</button>
    </div>
  )
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────

export default function AdminContent() {
  const [sub, setSub] = useState('experience')
  const [data, setData] = useState({ experience:[], projects:[], certificates:[], publications:[] })
  const [modal, setModal] = useState(null)
  const [editItem, setEditItem] = useState(null)

  const load = async (section) => {
    const res = await fetch(`${BASE}/${section}`)
    const items = await res.json()
    setData(d => ({ ...d, [section]: items }))
  }

  useEffect(() => { ['experience','projects','certificates','publications'].forEach(load) }, [])

  const handleDelete = async (section, id) => {
    if (!window.confirm('Xóa mục này?')) return
    await fetch(`${BASE}/${section}/${id}`, { method:'DELETE' })
    load(section)
  }

  const handleSave = (section) => {
    setModal(null); setEditItem(null); load(section)
  }

  const SUBS = [
    { id:'experience',   label:'💼 Kinh nghiệm' },
    { id:'projects',     label:'🚀 Dự án' },
    { id:'certificates', label:'🏅 Chứng chỉ' },
    { id:'publications', label:'📄 Publications' },
  ]

  const FormMap = { experience: ExperienceForm, projects: ProjectForm, certificates: CertForm, publications: PubForm }
  const FormComp = FormMap[modal]

  return (
    <div style={{ maxWidth:900, fontFamily:'Inter, sans-serif' }}>
      {/* Sub-tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:28, flexWrap:'wrap' }}>
        {SUBS.map(s => (
          <button key={s.id} onClick={() => setSub(s.id)} style={{
            background: sub===s.id ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${sub===s.id ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius:10, padding:'9px 18px', color: sub===s.id ? '#a78bfa' : '#8888aa',
            fontSize:13, fontWeight: sub===s.id ? 700 : 400, fontFamily:'Inter, sans-serif', cursor:'pointer', transition:'all 0.2s',
          }}>{s.label}</button>
        ))}
      </div>

      {/* List */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <span style={{ color:'#8888aa', fontSize:13 }}>{data[sub].length} mục</span>
        <GradBtn onClick={() => { setEditItem(null); setModal(sub) }}>+ Thêm mới</GradBtn>
      </div>

      {data[sub].length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'#555577', fontSize:14 }}>Chưa có mục nào. Nhấn "+ Thêm mới" để bắt đầu.</div>
      ) : sub === 'experience' ? (
        data.experience.map(job => (
          <ItemRow key={job.id} label={`${job.company} — ${job.role}`} sub={`${job.period} · ${job.location}${job.current ? ' · ● Hiện tại' : ''}`}
            onEdit={() => { setEditItem(job); setModal('experience') }}
            onDelete={() => handleDelete('experience', job.id)} />
        ))
      ) : sub === 'projects' ? (
        data.projects.map(p => (
          <ItemRow key={p.id} label={`${p.icon} ${p.title}`} sub={`${p.status} · ${p.year} · ${(Array.isArray(p.tags)?p.tags:p.tags?.split(',')||[]).slice(0,3).join(', ')}`}
            onEdit={() => { setEditItem(p); setModal('projects') }}
            onDelete={() => handleDelete('projects', p.id)} />
        ))
      ) : sub === 'certificates' ? (
        data.certificates.map(c => (
          <ItemRow key={c.id} label={`${c.icon} ${c.name}`} sub={c.issuer}
            onEdit={() => { setEditItem(c); setModal('certificates') }}
            onDelete={() => handleDelete('certificates', c.id)} />
        ))
      ) : (
        data.publications.map(p => (
          <ItemRow key={p.id} label={p.title} sub={`${p.year} · ${p.conference}`}
            onEdit={() => { setEditItem(p); setModal('publications') }}
            onDelete={() => handleDelete('publications', p.id)} />
        ))
      )}

      {/* Modal */}
      {modal && FormComp && (
        <Modal
          title={editItem ? `Sửa ${SUBS.find(s=>s.id===modal)?.label}` : `Thêm ${SUBS.find(s=>s.id===modal)?.label}`}
          onClose={() => { setModal(null); setEditItem(null) }}
        >
          <FormComp initial={editItem} onSave={() => handleSave(modal)} onClose={() => { setModal(null); setEditItem(null) }} />
        </Modal>
      )}
    </div>
  )
}
