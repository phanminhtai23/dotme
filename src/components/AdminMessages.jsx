import AdminIconButton from './AdminIconButton'
import './AdminSections.css'

export default function AdminMessages({ messages, notice, onDelete, onDeleteAll }) {
  return (
    <section className="admin-section" aria-label="Tin nhắn">
      <div className="admin-section__toolbar"><span className="admin-section__total">{messages.length} tin nhắn</span>{messages.length > 0 && <button type="button" className="admin-section__button is-danger-outline" onClick={onDeleteAll}>Xóa tất cả</button>}</div>
      {notice && <div role={notice.type === 'error' ? 'alert' : 'status'} className={`admin-section__notice ${notice.type === 'error' ? 'is-error' : ''}`}>{notice.text}</div>}
      {messages.length === 0 ? <div className="admin-section__empty"><strong>Chưa có tin nhắn</strong><p>Tin nhắn từ khách thăm sẽ xuất hiện ở đây.</p></div> : (
        <div className="admin-messages__list">{[...messages].reverse().map((message, index) => {
          const name = message.name || 'Ẩn danh'
          return <article className="admin-message" key={message.id || index}>
            <div className="admin-message__head"><div className="admin-message__identity"><div className="admin-message__avatar" aria-hidden="true">{name.trim().charAt(0).toLocaleUpperCase('vi') || '?'}</div><div><h3>{name}</h3><p>{message.createdAt ? new Date(message.createdAt).toLocaleString('vi-VN') : '—'}{message.ip && <span> · {message.ip}</span>}</p></div></div><AdminIconButton action="delete" label={`Xóa tin nhắn của ${name}`} onClick={() => onDelete(message.id)} /></div>
            <p className="admin-message__body">{message.message}</p>
          </article>
        })}</div>
      )}
    </section>
  )
}
