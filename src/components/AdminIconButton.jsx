export default function AdminIconButton({ action, label, onClick, disabled = false, title }) {
  return (
    <button type="button" className={`admin-icon-button ${action === 'delete' ? 'is-danger' : ''}`} onClick={onClick} disabled={disabled} aria-label={label} title={title || label}>
      {action === 'edit' ? (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>
      ) : (
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/></svg>
      )}
    </button>
  )
}
