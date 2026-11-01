import { useState } from 'react'
import './AdminSections.css'

export function VisitsChart({ days }) {
  const [range, setRange] = useState('all')
  const [selected, setSelected] = useState(null)
  const series = range === '7d' ? days.slice(-7) : range === '30d' ? days.slice(-30) : days
  const total = series.reduce((sum, day) => sum + day.visits, 0)
  const peak = Math.max(0, ...series.map(day => day.visits))
  const latest = series.at(-1)
  const width = Math.max(720, series.length * 35)
  const height = 220
  const points = series.map((day, index) => ({ ...day, x:series.length === 1 ? width / 2 : 30 + index * (width - 60) / (series.length - 1), y:height - 34 - (day.visits / Math.max(peak, 1)) * (height - 66) }))
  const line = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
  const area = points.length ? `${line} L ${points.at(-1).x} ${height - 34} L ${points[0].x} ${height - 34} Z` : ''
  const step = Math.max(1, Math.ceil(points.length / 7))

  return (
    <div className="admin-chart">
      <div className="admin-section__panel-head"><div><h3>Lượt xem theo ngày</h3><p>Theo dõi lượng truy cập theo khoảng thời gian.</p></div><div className="admin-chart__ranges" aria-label="Khoảng thời gian">{[['7d','7 ngày'],['30d','30 ngày'],['all','Tất cả']].map(([value,label]) => <button key={value} type="button" aria-pressed={range === value} onClick={() => { setRange(value); setSelected(null) }}>{label}</button>)}</div></div>
      {series.length ? <>
        <div className="admin-chart__summary"><div><span>Trong kỳ</span><strong>{total.toLocaleString('vi-VN')}</strong></div><div><span>Trung bình / ngày</span><strong>{(total / series.length).toFixed(1)}</strong></div><div><span>Cao nhất</span><strong>{peak.toLocaleString('vi-VN')}</strong></div><div><span>Ngày gần nhất</span><strong>{latest.visits.toLocaleString('vi-VN')}</strong></div></div>
        <div className="admin-chart__scroll"><svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="group" aria-label={`Biểu đồ ${series.length} ngày, tổng ${total} lượt xem`}>
          <defs><linearGradient id="adminChartArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#a38bff" stopOpacity=".26"/><stop offset="100%" stopColor="#a38bff" stopOpacity="0"/></linearGradient></defs>
          {[0,1,2,3].map(i => <line key={i} x1="30" x2={width - 30} y1={30 + i * 52} y2={30 + i * 52} stroke="#2a293d" strokeDasharray="4 6" />)}
          <path d={area} fill="url(#adminChartArea)"/><path d={line} fill="none" stroke="#a38bff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          {points.map((point,index) => <g key={point.date}><circle cx={point.x} cy={point.y} r="5" fill="#bcaaff" stroke="#10101d" strokeWidth="2" tabIndex="0" role="button" aria-label={`${point.label}: ${point.visits} lượt xem`} onMouseEnter={() => setSelected(point)} onMouseLeave={() => setSelected(null)} onFocus={() => setSelected(point)} onBlur={() => setSelected(null)} /><title>{point.label}: {point.visits} lượt xem</title>{(index % step === 0 || index === points.length - 1) && <text x={point.x} y={height - 5} textAnchor="middle" fill="#9290aa" fontSize="11">{point.label}</text>}</g>)}
        </svg></div>
        <div className="admin-chart__caption" aria-live="polite">{selected ? `${selected.label}: ${selected.visits} lượt xem` : 'Chọn một điểm để xem chi tiết; cuộn ngang để xem thêm.'}</div>
      </> : <div className="admin-section__empty is-compact"><strong>Chưa có dữ liệu truy cập</strong><p>Biểu đồ sẽ xuất hiện khi có lượt xem.</p></div>}
    </div>
  )
}

export default function AdminAnalytics({ analytics, uniqueViewers }) {
  const stats = [
    { label:'Tổng lượt xem', value:analytics.total.toLocaleString('vi-VN'), icon:'◉', color:'purple' },
    { label:'Người xem', value:uniqueViewers.toLocaleString('vi-VN'), icon:'◎', color:'blue' },
    { label:'Lần đầu ghé', value:analytics.firstVisit ? new Date(analytics.firstVisit).toLocaleDateString('vi-VN') : '—', icon:'↗', color:'green' },
    { label:'Lần ghé cuối', value:analytics.lastVisit ? new Date(analytics.lastVisit).toLocaleDateString('vi-VN') : '—', icon:'◷', color:'pink' },
  ]
  const pageEntries = Object.entries(analytics.pages).sort((a,b) => b[1] - a[1])
  return (
    <section className="admin-section" aria-label="Phân tích truy cập">
      <div className="admin-analytics__stats">{stats.map(stat => <div className="admin-analytics__stat" key={stat.label}><div className={`admin-analytics__stat-icon is-${stat.color}`} aria-hidden="true">{stat.icon}</div><div><span>{stat.label}</span><strong>{stat.value}</strong></div></div>)}</div>
      <div className="admin-section__panel"><VisitsChart days={analytics.days} /></div>
      <div className="admin-analytics__columns">
        <div className="admin-section__panel"><div className="admin-section__panel-head"><div><h3>Chi tiết theo ngày</h3><p>Số lượt xem được ghi nhận mỗi ngày.</p></div><span className="admin-section__count">{analytics.days.length}</span></div>{analytics.days.length ? <div className="admin-analytics__compact-list">{[...analytics.days].reverse().map(day => <div className="admin-analytics__compact-row" key={day.date}><span>{day.date}</span><strong>{day.visits.toLocaleString('vi-VN')} <small>lượt</small></strong></div>)}</div> : <div className="admin-section__empty is-compact">Chưa có dữ liệu theo ngày.</div>}</div>
        <div className="admin-section__panel"><div className="admin-section__panel-head"><div><h3>Trang được xem</h3><p>Các trang có lượt truy cập.</p></div><span className="admin-section__count">{pageEntries.length}</span></div>{pageEntries.length ? <div className="admin-analytics__compact-list">{pageEntries.map(([page,count]) => <div className="admin-analytics__compact-row" key={page}><code>{page || '/'}</code><strong>{count.toLocaleString('vi-VN')} <small>lượt</small></strong></div>)}</div> : <div className="admin-section__empty is-compact">Chưa có trang được xem.</div>}</div>
      </div>
      <div className="admin-section__panel"><div className="admin-section__panel-head"><div><h3>Lịch sử truy cập</h3><p>Các lượt truy cập gần đây nhất.</p></div><span className="admin-section__count">{analytics.history.length}</span></div>{analytics.history.length ? <div className="admin-analytics__history">{analytics.history.map((item,index) => <div className="admin-analytics__history-row" key={`${item.createdAt}-${index}`}><div><span>Thời gian</span><strong>{new Date(item.createdAt).toLocaleString('vi-VN')}</strong></div><div><span>Trang</span><code>{item.page || '/'}</code></div><div><span>Người xem</span><strong>{item.visitorId ? item.visitorId.slice(0,8) : 'anon'}</strong></div><div><span>Nguồn</span><strong title={item.referrer || item.userAgent || item.ip || '—'}>{item.referrer || item.userAgent || item.ip || '—'}</strong></div></div>)}</div> : <div className="admin-section__empty is-compact">Chưa có lượt truy cập nào.</div>}</div>
    </section>
  )
}
