import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import AdminIcon from './AdminIcons'
import { LANDING_VERSIONS } from '../landing/versions'
import './AdminSections.css'
import './AdminLanding.css'

const FRAME_W = 1440
const FRAME_H = 900
const CACHE_KEY = 'dotme_landing_version'

/** Scaled-down live render of a landing version, taken from the admin-only /preview route. */
function Thumb({ id, name }) {
  const box = useRef(null)
  const [scale, setScale] = useState(0.25)

  useEffect(() => {
    const el = box.current
    if (!el) return undefined
    const update = () => setScale(el.clientWidth / FRAME_W)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="dm-lp-thumb" ref={box} style={{ height: FRAME_H * scale }}>
      <iframe
        title={`Xem trước ${name}`}
        src={`/preview/${id}?embed=1`}
        loading="lazy"
        tabIndex={-1}
        aria-hidden="true"
        style={{ width: FRAME_W, height: FRAME_H, transform: `scale(${scale})` }}
      />
    </div>
  )
}

export default function AdminLanding() {
  const [current, setCurrent] = useState(null)
  const [saving, setSaving] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    api.getLandingVersion()
      .then(({ version }) => setCurrent(version))
      .catch(error => setNotice({ type: 'error', text: `Không tải được cấu hình: ${error.message}` }))
  }, [])

  const apply = async version => {
    if (saving || version.id === current) return
    setSaving(version.id)
    setNotice(null)
    try {
      await api.setLandingVersion(version.id)
      setCurrent(version.id)
      try { localStorage.setItem(CACHE_KEY, version.id) } catch { /* storage blocked */ }
      setNotice({ type: 'success', text: `Trang chủ đang dùng giao diện ${version.name}.` })
    } catch (error) {
      setNotice({ type: 'error', text: `Đổi giao diện thất bại: ${error.message}` })
    } finally {
      setSaving(null)
    }
  }

  return (
    <section className="admin-section" aria-label="Giao diện trang chủ">
      <p className="admin-section__total">Chọn giao diện hiển thị ở trang chủ. Mỗi bản dùng chung nội dung, chỉ khác cách trình bày.</p>
      {notice && <div role={notice.type === 'error' ? 'alert' : 'status'} className={`admin-section__notice ${notice.type === 'error' ? 'is-error' : ''}`}>{notice.text}</div>}
      <div className="dm-versions">
        {LANDING_VERSIONS.map(version => {
          const active = version.id === current
          return (
            <article key={version.id} className={`admin-section__panel dm-version ${active ? 'is-active' : ''}`}>
              <Thumb id={version.id} name={version.name} />
              <div className="dm-version__head">
                <h3>{version.name}</h3>
                {active && <span className="admin-section__badge is-green"><AdminIcon name="check" size={12} />Đang dùng</span>}
              </div>
              <p className="dm-version__desc">{version.description}</p>
              <div className="dm-version__actions">
                <a className="dm-btn dm-btn--sm" href={`/preview/${version.id}`} target="_blank" rel="noreferrer"><AdminIcon name="eye" size={15} />Xem trước</a>
                <button type="button" className="dm-btn dm-btn--sm dm-btn--primary" disabled={active || Boolean(saving)} onClick={() => apply(version)}>
                  {saving === version.id ? 'Đang áp dụng...' : active ? 'Đang áp dụng' : 'Áp dụng'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
