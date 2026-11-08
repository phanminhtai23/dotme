import { useEffect, useId, useRef, useState } from 'react'
import AdminIcon from './AdminIcons'
import './AdminSections.css'

const HEIGHT = 240
const PAD = { top: 14, right: 20, bottom: 30, left: 40 }

function niceStep(raw) {
  const pow = 10 ** Math.floor(Math.log10(raw))
  const n = raw / pow
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow
}

const fullDate = date => new Date(`${date}T00:00:00Z`).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'UTC' })

export function VisitsChart({ days }) {
  const gradientId = useId()
  const plotRef = useRef(null)
  const [range, setRange] = useState('all')
  const [active, setActive] = useState(null)
  const [width, setWidth] = useState(640)

  useEffect(() => {
    const node = plotRef.current
    if (!node || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))))
    observer.observe(node)
    return () => observer.disconnect()
  }, [days.length])

  const series = range === '7d' ? days.slice(-7) : range === '30d' ? days.slice(-30) : days
  const total = series.reduce((sum, day) => sum + day.visits, 0)
  const peak = Math.max(0, ...series.map(day => day.visits))
  const latest = series.at(-1)
  const step = Math.max(1, niceStep(peak / 2))
  const top = step * 2
  const plotW = width - PAD.left - PAD.right
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const xAt = index => PAD.left + (series.length === 1 ? plotW / 2 : index * plotW / (series.length - 1))
  const yAt = value => PAD.top + plotH - (value / top) * plotH
  const points = series.map((day, index) => ({ ...day, x: xAt(index), y: yAt(day.visits) }))
  const line = points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')
  const baseline = PAD.top + plotH
  const area = points.length ? `${line} L${points.at(-1).x.toFixed(1)} ${baseline} L${points[0].x.toFixed(1)} ${baseline} Z` : ''
  const labelCount = Math.min(points.length, width < 420 ? 4 : 6)
  const labelIndexes = labelCount <= 1 ? [0] : [...new Set(Array.from({ length: labelCount }, (_, k) => Math.round(k * (points.length - 1) / (labelCount - 1))))]
  const current = active !== null ? points[Math.min(active, points.length - 1)] : null

  const move = event => {
    if (points.length < 2) { setActive(0); return }
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientX - rect.left - PAD.left) / plotW
    setActive(Math.min(points.length - 1, Math.max(0, Math.round(ratio * (points.length - 1)))))
  }
  const onKeyDown = event => {
    const last = points.length - 1
    const at = active ?? last
    const next = { ArrowLeft: at - 1, ArrowRight: at + 1, Home: 0, End: last }[event.key]
    if (next === undefined) return
    event.preventDefault()
    setActive(Math.min(last, Math.max(0, next)))
  }
  const tooltipBelow = current && current.y < 64

  return (
    <div className="admin-chart">
      <div className="admin-section__panel-head">
        <div><h3>Lượt xem theo ngày</h3><p>Theo dõi lượng truy cập theo khoảng thời gian.</p></div>
        <div className="admin-chart__ranges" role="group" aria-label="Khoảng thời gian">{[['7d', '7 ngày'], ['30d', '30 ngày'], ['all', 'Tất cả']].map(([value, label]) => <button key={value} type="button" aria-pressed={range === value} onClick={() => { setRange(value); setActive(null) }}>{label}</button>)}</div>
      </div>
      {series.length ? <>
        <div className="admin-chart__summary">
          <div><span>Trong kỳ</span><strong>{total.toLocaleString('vi-VN')}</strong></div>
          <div><span>Trung bình / ngày</span><strong>{(total / series.length).toFixed(1)}</strong></div>
          <div><span>Cao nhất</span><strong>{peak.toLocaleString('vi-VN')}</strong></div>
          <div><span>Ngày gần nhất</span><strong>{latest.visits.toLocaleString('vi-VN')}</strong></div>
        </div>
        <div
          ref={plotRef}
          className="admin-chart__plot"
          tabIndex={0}
          role="group"
          aria-label={`Biểu đồ ${series.length} ngày, tổng ${total} lượt xem. Dùng phím mũi tên trái phải để xem từng ngày.`}
          onPointerMove={move}
          onPointerLeave={event => { if (!event.currentTarget.matches(':focus-visible')) setActive(null) }}
          onFocus={() => setActive(current => current ?? points.length - 1)}
          onBlur={() => setActive(null)}
          onKeyDown={onKeyDown}
        >
          <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} aria-hidden="true">
            <defs>
              <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--ad-chart-area)" stopOpacity=".26" />
                <stop offset="100%" stopColor="var(--ad-chart-area)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2].map(i => {
              const value = i * step
              const y = yAt(value)
              return <g key={i}><line className="admin-chart__grid" x1={PAD.left} x2={width - PAD.right} y1={y} y2={y} /><text className="admin-chart__axis" x={PAD.left - 10} y={y + 4} textAnchor="end">{value.toLocaleString('vi-VN')}</text></g>
            })}
            {points.length > 1 && <path d={area} fill={`url(#${gradientId})`} />}
            <path className="admin-chart__line" d={line} />
            {points.length > 1 && points.length <= 31 && points.map(point => <circle key={point.date} cx={point.x} cy={point.y} r="2.5" className="admin-chart__dot-faint" fill="var(--ad-chart-line)" opacity=".5" />)}
            {labelIndexes.map(index => <text key={points[index].date} className="admin-chart__axis" x={points[index].x} y={HEIGHT - 8} textAnchor="middle">{points[index].label}</text>)}
            {current && <>
              <line className="admin-chart__crosshair" x1={current.x} x2={current.x} y1={PAD.top} y2={baseline} />
              <circle className="admin-chart__halo" cx={current.x} cy={current.y} r="10" />
              <circle className="admin-chart__dot" cx={current.x} cy={current.y} r="5" />
            </>}
            {points.length === 1 && !current && <circle className="admin-chart__dot" cx={points[0].x} cy={points[0].y} r="5" />}
          </svg>
          {current && <div className="admin-chart__tooltip" style={{ left: Math.min(Math.max(current.x, 64), width - 64), top: tooltipBelow ? current.y + 16 : current.y - 14, transform: tooltipBelow ? 'translateX(-50%)' : 'translate(-50%, -100%)' }}>
            <span>{fullDate(current.date)}</span>
            <strong>{current.visits.toLocaleString('vi-VN')} lượt xem</strong>
          </div>}
        </div>
        <div className="admin-chart__hint">Di chuột vào biểu đồ hoặc dùng phím ← → để xem số liệu từng ngày.</div>
        <div className="admin-sr-only" aria-live="polite">{current ? `${fullDate(current.date)}: ${current.visits} lượt xem` : ''}</div>
      </> : <div className="admin-section__empty is-compact"><strong>Chưa có dữ liệu truy cập</strong><p>Biểu đồ sẽ xuất hiện khi có lượt xem.</p></div>}
    </div>
  )
}

export default function AdminAnalytics({ analytics, uniqueViewers }) {
  const stats = [
    { label: 'Tổng lượt xem', value: analytics.total.toLocaleString('vi-VN'), icon: 'eye', color: 'purple' },
    { label: 'Người xem', value: uniqueViewers.toLocaleString('vi-VN'), icon: 'users', color: 'blue' },
    { label: 'Lần đầu ghé', value: analytics.firstVisit ? new Date(analytics.firstVisit).toLocaleDateString('vi-VN') : '—', icon: 'calendar', color: 'green' },
    { label: 'Lần ghé cuối', value: analytics.lastVisit ? new Date(analytics.lastVisit).toLocaleDateString('vi-VN') : '—', icon: 'clock', color: 'pink' },
  ]
  const pageEntries = Object.entries(analytics.pages).sort((a, b) => b[1] - a[1])
  return (
    <section className="admin-section" aria-label="Phân tích truy cập">
      <div className="admin-analytics__stats">{stats.map(stat => <div className="admin-analytics__stat" key={stat.label}><div className={`admin-analytics__stat-icon is-${stat.color}`}><AdminIcon name={stat.icon} size={19} /></div><div><span>{stat.label}</span><strong>{stat.value}</strong></div></div>)}</div>
      <div className="admin-section__panel"><VisitsChart days={analytics.days} /></div>
      <div className="admin-analytics__columns">
        <div className="admin-section__panel"><div className="admin-section__panel-head"><div><h3>Chi tiết theo ngày</h3><p>Số lượt xem được ghi nhận mỗi ngày.</p></div><span className="admin-section__count">{analytics.days.length}</span></div>{analytics.days.length ? <div className="admin-analytics__compact-list">{[...analytics.days].reverse().map(day => <div className="admin-analytics__compact-row" key={day.date}><span>{day.date}</span><strong>{day.visits.toLocaleString('vi-VN')} <small>lượt</small></strong></div>)}</div> : <div className="admin-section__empty is-compact">Chưa có dữ liệu theo ngày.</div>}</div>
        <div className="admin-section__panel"><div className="admin-section__panel-head"><div><h3>Trang được xem</h3><p>Các trang có lượt truy cập.</p></div><span className="admin-section__count">{pageEntries.length}</span></div>{pageEntries.length ? <div className="admin-analytics__compact-list">{pageEntries.map(([page, count]) => <div className="admin-analytics__compact-row" key={page}><code>{page || '/'}</code><strong>{count.toLocaleString('vi-VN')} <small>lượt</small></strong></div>)}</div> : <div className="admin-section__empty is-compact">Chưa có trang được xem.</div>}</div>
      </div>
      <div className="admin-section__panel"><div className="admin-section__panel-head"><div><h3>Lịch sử truy cập</h3><p>Các lượt truy cập gần đây nhất.</p></div><span className="admin-section__count">{analytics.history.length}</span></div>{analytics.history.length ? <div className="admin-analytics__history">{analytics.history.map((item, index) => <div className="admin-analytics__history-row" key={`${item.createdAt}-${index}`}><div><span>Thời gian</span><strong>{new Date(item.createdAt).toLocaleString('vi-VN')}</strong></div><div><span>Trang</span><code>{item.page || '/'}</code></div><div><span>Người xem</span><strong>{item.visitorId ? item.visitorId.slice(0, 8) : 'anon'}</strong></div><div><span>Nguồn</span><strong title={item.referrer || item.userAgent || item.ip || '—'}>{item.referrer || item.userAgent || item.ip || '—'}</strong></div></div>)}</div> : <div className="admin-section__empty is-compact">Chưa có lượt truy cập nào.</div>}</div>
    </section>
  )
}
