import { PAGE_TYPES } from '../store'
import { VisitsChart } from './AdminAnalytics'
import AdminIcon from './AdminIcons'
import './AdminSections.css'

export default function AdminDashboard({ analytics, accounts, messages, storage, links, copiedId, onCopy, tr }) {
  const stats = [
    { label:tr.stats.views, value:analytics.total, icon:'eye', color:'purple' },
    { label:tr.stats.today, value:analytics.today, icon:'clock', color:'blue' },
    { label:tr.stats.accounts, value:accounts.length, icon:'users', color:'green' },
    { label:tr.stats.messages, value:messages.length, icon:'message', color:'pink' },
  ]
  const storageItems = storage ? [
    { label:tr.storageLabels.total, value:storage.total.size },
    { label:tr.storageLabels.uploads, value:`${storage.uploads.size} (${storage.uploads.count})` },
    { label:tr.storageLabels.sqlite, value:storage.sqlite.size },
    { label:tr.storageLabels.counts, value:`${storage.links} / ${storage.accounts} / ${storage.messages}` },
  ] : []

  return (
    <section className="admin-section" aria-label="Dashboard">
      <div className="admin-analytics__stats">{stats.map(stat => <div className="admin-analytics__stat" key={stat.label}><div className={`admin-analytics__stat-icon is-${stat.color}`}><AdminIcon name={stat.icon} size={19} /></div><div><span>{stat.label}</span><strong>{stat.value.toLocaleString('vi-VN')}</strong></div></div>)}</div>
      <div className="admin-section__panel"><VisitsChart days={analytics.days} /></div>
      <div className="admin-dashboard__columns">
        {storage && <div className="admin-section__panel"><div className="admin-section__panel-head"><h3>{tr.storage}</h3></div><div className="admin-dashboard__storage">{storageItems.map(item => <div key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</div></div>}
        {links.length > 0 && <div className="admin-section__panel"><div className="admin-section__panel-head"><h3>{tr.recentLinks}</h3><span className="admin-section__count">{Math.min(links.length, 4)}</span></div><div className="admin-dashboard__recent">{links.slice(-4).reverse().map(link => <div className="admin-dashboard__link" key={link.id}><span className="admin-dashboard__link-icon" aria-hidden="true">{PAGE_TYPES[link.type]?.emoji || '🔗'}</span><div><strong>{link.name}</strong><span>@{link.ownerUsername}{link.created ? ` — ${link.created}` : ''}</span></div><button type="button" className="admin-section__button" aria-label={`Sao chép link ${link.name}`} onClick={() => onCopy(link)}><AdminIcon name={copiedId === link.id ? 'check' : 'copy'} size={15} /></button></div>)}</div></div>}
      </div>
    </section>
  )
}
