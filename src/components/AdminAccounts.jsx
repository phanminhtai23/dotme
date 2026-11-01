import { useState } from 'react'
import AdminIconButton from './AdminIconButton'
import './AdminSections.css'

const roles = {
  superadmin: { label:'Super Admin', className:'is-purple' },
  admin: { label:'Admin', className:'is-blue' },
  user: { label:'User', className:'is-neutral' },
}

export default function AdminAccounts({ accounts, notice, onAdd, onEdit, onDelete }) {
  const [query, setQuery] = useState('')
  const search = query.trim().toLocaleLowerCase('vi')
  const filtered = accounts.filter(account => `${account.displayName || ''} ${account.username}`.toLocaleLowerCase('vi').includes(search))

  return (
    <section className="admin-section" aria-label="Quản lý tài khoản">
      {notice && <div role={notice.type === 'error' ? 'alert' : 'status'} className={`admin-section__notice ${notice.type === 'error' ? 'is-error' : ''}`}>{notice.text}</div>}
      <div className="admin-accounts__toolbar">
        <span className="admin-section__total">{search ? `${filtered.length} kết quả` : `${accounts.length} tài khoản`}</span>
        <div className="admin-accounts__tools">
          <label className="admin-accounts__search"><span aria-hidden="true">⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm tên hoặc tài khoản..." aria-label="Tìm tài khoản" /></label>
          <button type="button" className="admin-section__primary" onClick={onAdd}><span aria-hidden="true">+</span> Thêm tài khoản</button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="admin-section__empty"><strong>{search ? 'Không tìm thấy tài khoản' : 'Chưa có tài khoản'}</strong><p>{search ? 'Thử tìm bằng tên hoặc tên đăng nhập khác.' : 'Thêm tài khoản để bắt đầu.'}</p></div>
      ) : (
        <div className="admin-accounts__list">
          {filtered.map(account => {
            const role = roles[account.role] || roles.user
            const expired = account.expiresAt && new Date(account.expiresAt) < new Date()
            const initial = (account.displayName || account.username || '?').trim().charAt(0).toLocaleUpperCase('vi')
            return (
              <article className="admin-account" key={account.username}>
                <div className="admin-account__identity"><div className="admin-account__avatar" aria-hidden="true">{initial}</div><div><h3>{account.displayName || account.username}</h3><p>@{account.username}</p></div></div>
                <div className="admin-account__details">
                  <div><span>Vai trò</span><strong className={`admin-section__badge ${role.className}`}>{role.label}</strong></div>
                  <div><span>Trạng thái</span><strong className={`admin-section__badge ${expired ? 'is-red' : 'is-green'}`}><i aria-hidden="true" />{expired ? 'Hết hạn' : 'Hoạt động'}</strong></div>
                  <div><span>Ngày tạo</span><strong>{account.created || '—'}</strong></div>
                  <div><span>Hết hạn</span><strong>{account.expiresAt || 'Không giới hạn'}</strong></div>
                </div>
                <div className="admin-account__actions">
                  <AdminIconButton action="edit" label={`Sửa tài khoản ${account.username}`} disabled={account.username === 'admin'} title={account.username === 'admin' ? 'Không thể sửa tài khoản admin gốc' : undefined} onClick={() => onEdit(account)} />
                  <AdminIconButton action="delete" label={`Xóa tài khoản ${account.username}`} disabled={account.username === 'admin'} title={account.username === 'admin' ? 'Không thể xóa tài khoản admin gốc' : undefined} onClick={() => onDelete(account.username)} />
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
