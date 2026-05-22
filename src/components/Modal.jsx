export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button
        type="button"
        className="modal-backdrop"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <article className="modal-panel">
        <header className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="modal-close" aria-label="Close">
            ×
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </article>
    </div>
  )
}
