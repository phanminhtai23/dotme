import { DIFFICULTY } from '../games/difficulty'
import { GAME_OPTIONS, resolveGameId } from '../games/catalog'
import { PAGE_TYPES } from '../store'
import AdminIcon from './AdminIcons'
import './AdminLinks.css'

function LinkCard({ link, copied, saving, busy, granting, grantBusy, maxExtraPlays, defaultMaxPlays, getExtraPlays, onCopy, onDelete, onGrant, onGameChange, onDifficultyChange }) {
  const type = PAGE_TYPES[link.type] || { emoji:'🔗', label:link.type, color:'#a78bfa' }
  const expired = link.expiresAt && new Date(link.expiresAt) < new Date()
  const gameId = resolveGameId(link.gameId, link.type)
  const levels = DIFFICULTY[gameId] || DIFFICULTY['balloon-pop']
  const level = levels[link.difficulty] ? link.difficulty : 'medium'
  const extraPlays = getExtraPlays(link.extraPlays)
  const maxPlays = defaultMaxPlays + extraPlays
  const used = Array.isArray(link.plays) ? link.plays.length : 0
  const remaining = Math.max(0, maxPlays - used)

  return (
    <article className="admin-link-card">
      <div className="admin-link-card__head">
        <div className="admin-link-card__identity">
          <div className="admin-link-card__icon" style={{ '--link-accent':type.color }}>{type.emoji}</div>
          <div className="admin-link-card__name">
            <h3>{link.name}</h3>
            <p><span>@{link.ownerUsername}</span> — <span>{type.label}</span></p>
          </div>
        </div>
        <div className={`admin-link-card__status ${expired ? 'is-expired' : ''}`}>
          <span aria-hidden="true" />{expired ? 'Hết hạn' : 'Hoạt động'}
        </div>
      </div>

      <div className="admin-link-card__settings">
        <label className="admin-link-card__field">
          <span>Trò chơi</span>
          <select aria-label={`Đổi trò chơi cho link ${link.name}`} value={gameId} disabled={busy} onChange={event => onGameChange(link, event.target.value)}>
            {GAME_OPTIONS.map(game => <option key={game.id} value={game.id}>{game.emoji} {game.name}</option>)}
          </select>
        </label>
        <label className="admin-link-card__field">
          <span>Độ khó</span>
          <select aria-label={`Đổi độ khó cho link ${link.name}`} value={level} disabled={busy} onChange={event => onDifficultyChange(link, event.target.value)}>
            {Object.entries(levels).map(([key, meta]) => <option key={key} value={key}>{meta.icon} {meta.label}</option>)}
          </select>
        </label>
        <div className="admin-link-card__plays">
          <span className="admin-link-card__label">Lượt chơi</span>
          <div className="admin-link-card__play-count"><strong>{used}</strong><span> / {maxPlays}</span><small>{remaining ? `Còn ${remaining} lượt` : 'Đã hết lượt'}</small></div>
          <div className="admin-link-card__progress" role="progressbar" aria-label={`Lượt chơi đã dùng của ${link.name}`} aria-valuemin={0} aria-valuemax={maxPlays} aria-valuenow={Math.min(used, maxPlays)}><span style={{ width:`${Math.min(100, used / maxPlays * 100)}%` }} /></div>
        </div>
      </div>

      <div className="admin-link-card__footer">
        <div className="admin-link-card__hint">{saving ? 'Đang lưu thay đổi...' : levels[level].desc}{link.expiresAt && <span> Hết hạn: {link.expiresAt}.</span>}</div>
        <div className="admin-link-card__actions">
          <button type="button" className="admin-link-action" onClick={() => onCopy(link)}><AdminIcon name={copied ? 'check' : 'copy'} size={14} />{copied ? 'Đã sao chép' : 'Sao chép link'}</button>
          <button type="button" className="admin-link-action admin-link-action--grant" onClick={() => onGrant(link)} disabled={grantBusy || extraPlays >= maxExtraPlays}>{granting ? 'Đang cấp...' : `+${Math.min(3, maxExtraPlays - extraPlays)} lượt`}</button>
          <button type="button" className="admin-link-action admin-link-action--delete" onClick={() => onDelete(link.id)} aria-label={`Xóa link ${link.name}`}>Xóa</button>
        </div>
      </div>
    </article>
  )
}

export default function AdminLinks({ links, notice, copiedId, updatingLinkId, grantingPlaysId, onAdd, onCopy, onDelete, onGrant, onGameChange, onDifficultyChange, maxExtraPlays, defaultMaxPlays, getExtraPlays }) {
  return (
    <section className="admin-links" aria-label="Quản lý link">
      <div className="admin-links__toolbar">
        <span className="admin-links__total">{links.length} link đã tạo</span>
        <button type="button" className="admin-links__create" onClick={onAdd}><AdminIcon name="plus" size={16} /> Gán quyền mới</button>
      </div>
      {notice && <div role={notice.type === 'error' ? 'alert' : 'status'} className={`admin-links__notice ${notice.type === 'error' ? 'is-error' : ''}`}>{notice.text}</div>}
      {links.length === 0 ? (
        <div className="admin-links__empty"><div className="admin-links__empty-icon"><AdminIcon name="link" size={22} /></div><h3>Chưa có link nào</h3><p>Tạo link đầu tiên để bắt đầu chia sẻ.</p><button type="button" onClick={onAdd}><AdminIcon name="plus" size={16} /> Gán quyền mới</button></div>
      ) : (
        <div className="admin-links__list">{links.map(link => <LinkCard key={link.id} link={link} copied={copiedId === link.id} saving={updatingLinkId === link.id} busy={updatingLinkId !== null} granting={grantingPlaysId === link.id} grantBusy={grantingPlaysId !== null} maxExtraPlays={maxExtraPlays} defaultMaxPlays={defaultMaxPlays} getExtraPlays={getExtraPlays} onCopy={onCopy} onDelete={onDelete} onGrant={onGrant} onGameChange={onGameChange} onDifficultyChange={onDifficultyChange} />)}</div>
      )}
    </section>
  )
}
