import { useEffect, useState } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import AdminIconButton from './AdminIconButton'
import AdminIcon from './AdminIcons'
import './AdminSections.css'

const BASE = (import.meta.env.VITE_API_BASE_URL || '/api') + '/content'

async function saveContent(section, initial, payload) {
  const res = await fetch(`${BASE}/${section}${initial ? `/${initial.id}` : ''}`, {
    method:initial ? 'PUT' : 'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(payload),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `HTTP ${res.status}`)
  }
}

function Label({ children }) {
  return <span className="ad-label">{children}</span>
}

function Field({ label, children }) {
  return <div className="ad-field"><Label>{label}</Label>{children}</div>
}

function GradBtn({ children, onClick, color='purple', style={}, type='button', disabled=false }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`ad-btn ${color === 'red' ? 'ad-btn--danger' : 'ad-btn--primary'}`} style={style}>{children}</button>
  )
}

function CancelBtn({ onClose }) {
  return <button type="button" className="ad-btn" onClick={onClose}>Huỷ</button>
}

function SaveLabel({ saving }) {
  return saving ? <><AdminIcon name="loader" size={15} className="ad-spin" /> Đang lưu...</> : <><AdminIcon name="save" size={15} /> Lưu</>
}

function Modal({ title, onClose, children }) {
  return (
    <div className="ad-modal-backdrop" style={{ zIndex:300 }} onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="ad-modal ad-modal--lg" role="dialog" aria-modal="true" aria-label={title} onMouseDown={e => e.stopPropagation()}>
        <div className="ad-modal__head">
          <h3>{title}</h3>
          <button type="button" className="ad-modal__close" onClick={onClose} aria-label="Đóng"><AdminIcon name="close" size={18} /></button>
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
  const [error, setError] = useState('')

  const handle = async e => {
    e.preventDefault(); setSaving(true); setError('')
    const payload = { ...form, bullets: form.bullets.split('\n').map(b => b.trim()).filter(Boolean) }
    try {
      await saveContent('experience', initial, payload)
      onSave()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handle} className="ad-form">
      <div className="ad-grid-2">
        <Field label="Công ty"><input className="ad-input" value={form.company} required onChange={e => setForm(f=>({...f,company:e.target.value}))} /></Field>
        <Field label="Chức vụ"><input className="ad-input" value={form.role} required onChange={e => setForm(f=>({...f,role:e.target.value}))} /></Field>
        <Field label="Thời gian (vd: Jan 2026 – Present)"><input className="ad-input" value={form.period} onChange={e => setForm(f=>({...f,period:e.target.value}))} /></Field>
        <Field label="Địa điểm"><input className="ad-input" value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))} /></Field>
      </div>
      <label className="ad-check">
        <input type="checkbox" checked={form.current} onChange={e => setForm(f=>({...f,current:e.target.checked}))} />
        Đang làm hiện tại
      </label>
      <Field label="Bullets (mỗi dòng 1 mục, HTML được phép: <strong>text</strong>)">
        <textarea className="ad-input" value={form.bullets} onChange={e => setForm(f=>({...f,bullets:e.target.value}))} placeholder="Mô tả công việc 1&#10;Mô tả công việc 2" />
      </Field>
      {error && <div role="alert" className="ad-alert">Không thể lưu: {error}</div>}
      <div className="ad-actions">
        <GradBtn type="submit" disabled={saving} style={{ flex:1 }}><SaveLabel saving={saving} /></GradBtn>
        <CancelBtn onClose={onClose} />
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
  const [error, setError] = useState('')

  const handle = async e => {
    e.preventDefault(); setSaving(true); setError('')
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }
    try {
      await saveContent('projects', initial, payload)
      onSave()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handle} className="ad-form">
      <div className="ad-grid-2">
        <Field label="Tên dự án"><input className="ad-input" value={form.title} required onChange={e => setForm(f=>({...f,title:e.target.value}))} /></Field>
        <div className="ad-field">
          <Label>Icon (emoji)</Label>
          <input className="ad-input" value={form.icon} onChange={e => setForm(f=>({...f,icon:e.target.value}))} maxLength={4} />
        </div>
        <Field label="Subtitle (VI)"><input className="ad-input" value={form.subtitleVi} onChange={e => setForm(f=>({...f,subtitleVi:e.target.value}))} /></Field>
        <Field label="Subtitle (EN)"><input className="ad-input" value={form.subtitleEn} onChange={e => setForm(f=>({...f,subtitleEn:e.target.value}))} /></Field>
      </div>
      <Field label="Mô tả (VI)"><textarea className="ad-input" value={form.descVi} onChange={e => setForm(f=>({...f,descVi:e.target.value}))} /></Field>
      <Field label="Mô tả (EN)"><textarea className="ad-input" value={form.descEn} onChange={e => setForm(f=>({...f,descEn:e.target.value}))} /></Field>
      <Field label="Tags (phân cách bằng dấu phẩy)"><input className="ad-input" value={form.tags} onChange={e => setForm(f=>({...f,tags:e.target.value}))} placeholder="React, FastAPI, Docker" /></Field>
      <div className="ad-grid-3">
        <div>
          <Label>Màu</Label>
          <div className="ad-swatches">
            {COLOR_PRESETS.map(c => (
              <button key={c} type="button" className="ad-swatch" style={{ '--swatch':c }} aria-pressed={form.color===c} aria-label={`Màu ${c}`} onClick={() => setForm(f=>({...f,color:c}))} />
            ))}
          </div>
        </div>
        <Field label="Status">
          <select className="ad-input" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Năm"><input className="ad-input" value={form.year} onChange={e => setForm(f=>({...f,year:e.target.value}))} maxLength={4} /></Field>
      </div>
      <div className="ad-grid-2">
        <Field label="GitHub URL"><input className="ad-input" value={form.githubUrl} onChange={e => setForm(f=>({...f,githubUrl:e.target.value}))} placeholder="https://github.com/..." /></Field>
        <Field label="Live URL"><input className="ad-input" value={form.liveUrl} onChange={e => setForm(f=>({...f,liveUrl:e.target.value}))} placeholder="https://..." /></Field>
      </div>
      {error && <div role="alert" className="ad-alert">Không thể lưu: {error}</div>}
      <div className="ad-actions">
        <GradBtn type="submit" disabled={saving} style={{ flex:1 }}><SaveLabel saving={saving} /></GradBtn>
        <CancelBtn onClose={onClose} />
      </div>
    </form>
  )
}

// ── CERTIFICATES ──────────────────────────────────────────────────────────────

const UPLOAD_BASE = (import.meta.env.VITE_API_BASE_URL || '/api')

function SingleUpload({ label, value, onChange, accept, kind }) {
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch(`${UPLOAD_BASE}/upload`, { method:'POST', body: fd })
      const data = await res.json()
      if (data.url) onChange({ url: data.url, filename: data.filename, name: file.name })
      else alert(data.error || 'Tải file thất bại')
    } catch {
      alert('Tải file thất bại')
    } finally { setUploading(false) }
  }

  const remove = () => {
    if (value?.filename) fetch(`${UPLOAD_BASE}/upload/${value.filename}`, { method:'DELETE' }).catch(() => {})
    onChange(null)
  }

  return (
    <div className="ad-field">
      <Label>{label}</Label>
      {value ? (
        <div className="ad-upload-row">
          {kind === 'image' ? (
            <img className="ad-upload-row__img" src={value.url} alt="" />
          ) : (
            <a className="ad-upload-row__file" href={value.url} target="_blank" rel="noreferrer"><AdminIcon name="file" size={15} /> {value.name || 'Xem file'}</a>
          )}
          <button type="button" className="ad-btn ad-btn--danger ad-btn--sm" onClick={remove}>Xóa</button>
        </div>
      ) : (
        <label className={`ad-upload-btn ${uploading ? 'is-busy' : ''}`}>
          {uploading ? <><AdminIcon name="loader" size={15} className="ad-spin" /> Đang tải...</> : <><AdminIcon name="upload" size={15} /> {kind === 'image' ? 'Tải ảnh' : 'Tải PDF'}</>}
          <input type="file" accept={accept} hidden onChange={e => handleFile(e.target.files[0])} />
        </label>
      )}
    </div>
  )
}

function CertForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { image:null, file:null, ...initial } : { name:'', issuer:'', icon:'🏅', color:'#8B5CF6', image:null, file:null })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handle = async e => {
    e.preventDefault(); setSaving(true); setError('')
    try {
      await saveContent('certificates', initial, form)
      onSave()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handle} className="ad-form">
      <div className="ad-grid-2">
        <Field label="Tên chứng chỉ"><input className="ad-input" value={form.name} required onChange={e => setForm(f=>({...f,name:e.target.value}))} /></Field>
        <Field label="Tổ chức cấp"><input className="ad-input" value={form.issuer} onChange={e => setForm(f=>({...f,issuer:e.target.value}))} /></Field>
        <Field label="Icon (emoji)"><input className="ad-input" value={form.icon} onChange={e => setForm(f=>({...f,icon:e.target.value}))} maxLength={4} /></Field>
        <div>
          <Label>Màu accent</Label>
          <div className="ad-swatches">
            {COLOR_PRESETS.map(c => (
              <button key={c} type="button" className="ad-swatch" style={{ '--swatch':c }} aria-pressed={form.color===c} aria-label={`Màu ${c}`} onClick={() => setForm(f=>({...f,color:c}))} />
            ))}
          </div>
        </div>
      </div>
      <div className="ad-grid-2">
        <SingleUpload label="Ảnh chứng chỉ (hiện cạnh tên)" kind="image" accept="image/*" value={form.image} onChange={image => setForm(f => ({ ...f, image }))} />
        <SingleUpload label="File PDF chứng chỉ" kind="pdf" accept="application/pdf" value={form.file} onChange={file => setForm(f => ({ ...f, file }))} />
      </div>
      {error && <div role="alert" className="ad-alert">Không thể lưu: {error}</div>}
      <div className="ad-actions">
        <GradBtn type="submit" disabled={saving} style={{ flex:1 }}><SaveLabel saving={saving} /></GradBtn>
        <CancelBtn onClose={onClose} />
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
  const [error, setError] = useState('')
  const { isMobile } = useBreakpoint()

  const handle = async e => {
    e.preventDefault(); setSaving(true); setError('')
    const { authorsRaw, ...rest } = form
    const payload = { ...rest, authors: fromRaw(authorsRaw) }
    try {
      await saveContent('publications', initial, payload)
      onSave()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handle} className="ad-form">
      <Field label="Tên bài báo / paper"><textarea className="ad-input" style={{ minHeight:60 }} value={form.title} required onChange={e => setForm(f=>({...f,title:e.target.value}))} /></Field>
      <Field label="Tác giả (mỗi dòng 1 người, *Tên = highlight)">
        <textarea className="ad-input" value={form.authorsRaw} onChange={e => setForm(f=>({...f,authorsRaw:e.target.value}))} placeholder="Tran Van A&#10;*Nguyen Van B (tác giả chính)&#10;Le Van C" />
      </Field>
      <div className="ad-grid-2" style={!isMobile ? { gridTemplateColumns:'1fr 3fr' } : undefined}>
        <Field label="Năm"><input className="ad-input" value={form.year} onChange={e => setForm(f=>({...f,year:e.target.value}))} maxLength={4} /></Field>
        <Field label="Hội nghị / Journal"><input className="ad-input" value={form.conference} onChange={e => setForm(f=>({...f,conference:e.target.value}))} /></Field>
      </div>
      <Field label="Link (tùy chọn)"><input className="ad-input" value={form.link} onChange={e => setForm(f=>({...f,link:e.target.value}))} placeholder="https://..." /></Field>
      {error && <div role="alert" className="ad-alert">Không thể lưu: {error}</div>}
      <div className="ad-actions">
        <GradBtn type="submit" disabled={saving} style={{ flex:1 }}><SaveLabel saving={saving} /></GradBtn>
        <CancelBtn onClose={onClose} />
      </div>
    </form>
  )
}

// ── GENERIC LIST ──────────────────────────────────────────────────────────────

function ItemRow({ label, sub, onEdit, onDelete }) {
  return (
    <article className="admin-content__item">
      <div className="admin-content__item-text">
        <h3>{label}</h3>
        {sub && <p>{sub}</p>}
      </div>
      <div className="admin-content__actions"><AdminIconButton action="edit" label={`Sửa ${label}`} onClick={onEdit} /><AdminIconButton action="delete" label={`Xóa ${label}`} onClick={onDelete} /></div>
    </article>
  )
}

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────

export default function AdminContent() {
  const [sub, setSub] = useState('experience')
  const [data, setData] = useState({ experience:[], projects:[], certificates:[], publications:[] })
  const [modal, setModal] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [notice, setNotice] = useState(null)
  const [loading, setLoading] = useState({ experience:true, projects:true, certificates:true, publications:true })

  const load = async (section) => {
    try {
      const res = await fetch(`${BASE}/${section}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const items = await res.json()
      setData(d => ({ ...d, [section]: Array.isArray(items) ? items : [] }))
      return true
    } catch (error) {
      setNotice({ type:'error', text:`Không tải được nội dung: ${error.message}` })
      return false
    } finally {
      setLoading(current => ({ ...current, [section]:false }))
    }
  }

  useEffect(() => { ['experience','projects','certificates','publications'].forEach(load) }, [])

  const handleDelete = async (section, id) => {
    if (!window.confirm('Xóa mục này?')) return
    setNotice(null)
    try {
      const res = await fetch(`${BASE}/${section}/${id}`, { method:'DELETE' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      if (await load(section)) setNotice({ type:'success', text:'Đã xóa nội dung.' })
    } catch (error) {
      setNotice({ type:'error', text:`Xóa nội dung thất bại: ${error.message}` })
    }
  }

  const handleSave = (section) => {
    setModal(null); setEditItem(null); setNotice({ type:'success', text:'Đã lưu nội dung.' }); load(section)
  }

  const SUBS = [
    { id:'experience',   label:'Kinh nghiệm', icon:'briefcase' },
    { id:'projects',     label:'Dự án', icon:'rocket' },
    { id:'certificates', label:'Chứng chỉ', icon:'award' },
    { id:'publications', label:'Publications', icon:'file' },
  ]

  const FormMap = { experience: ExperienceForm, projects: ProjectForm, certificates: CertForm, publications: PubForm }
  const FormComp = FormMap[modal]

  return (
    <section className="admin-section admin-content" aria-label="Quản lý nội dung">
      {/* Sub-tabs */}
      <div className="admin-content__tabs" role="group" aria-label="Loại nội dung">
        {SUBS.map(s => (
          <button key={s.id} type="button" aria-pressed={sub === s.id} onClick={() => { setSub(s.id); setNotice(null) }}><AdminIcon name={s.icon} size={16} />{s.label}<span>{data[s.id].length}</span></button>
        ))}
      </div>

      {/* List */}
      <div className="admin-section__toolbar">
        <span className="admin-section__total">{loading[sub] ? 'Đang tải...' : `${data[sub].length} mục`}</span>
        <button type="button" className="admin-section__primary" onClick={() => { setEditItem(null); setModal(sub) }}><AdminIcon name="plus" size={16} /> Thêm mới</button>
      </div>
      {notice && <div role={notice.type === 'error' ? 'alert' : 'status'} className={`admin-section__notice ${notice.type === 'error' ? 'is-error' : ''}`}>{notice.text}</div>}

      {loading[sub] ? <div className="admin-section__empty is-compact">Đang tải nội dung...</div> : data[sub].length === 0 ? (
        <div className="admin-section__empty"><strong>Chưa có nội dung</strong><p>Chọn “Thêm mới” để tạo mục đầu tiên.</p></div>
      ) : <div className="admin-content__list">{sub === 'experience' ? (
        data.experience.map(job => (
          <ItemRow key={job.id} label={`${job.company} — ${job.role}`} sub={`${job.period} — ${job.location}${job.current ? ' (Hiện tại)' : ''}`}
            onEdit={() => { setEditItem(job); setModal('experience') }}
            onDelete={() => handleDelete('experience', job.id)} />
        ))
      ) : sub === 'projects' ? (
        data.projects.map(p => (
          <ItemRow key={p.id} label={`${p.icon} ${p.title}`} sub={`${p.status}, ${p.year}, ${(Array.isArray(p.tags)?p.tags:p.tags?.split(',')||[]).slice(0,3).join(', ')}`}
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
          <ItemRow key={p.id} label={p.title} sub={`${p.year}, ${p.conference}`}
            onEdit={() => { setEditItem(p); setModal('publications') }}
            onDelete={() => handleDelete('publications', p.id)} />
        ))
      )}</div>}

      {/* Modal */}
      {modal && FormComp && (
        <Modal
          title={editItem ? `Sửa ${SUBS.find(s=>s.id===modal)?.label}` : `Thêm ${SUBS.find(s=>s.id===modal)?.label}`}
          onClose={() => { setModal(null); setEditItem(null) }}
        >
          <FormComp initial={editItem} onSave={() => handleSave(modal)} onClose={() => { setModal(null); setEditItem(null) }} />
        </Modal>
      )}
    </section>
  )
}
