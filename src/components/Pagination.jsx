export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  )

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination-btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <ul className="pagination-pages">
        {visible.map((p, i) => {
          const prev = visible[i - 1]
          const showEllipsis = prev && p - prev > 1
          return (
            <li key={p} className="flex items-center gap-1">
              {showEllipsis && <span className="pagination-ellipsis">…</span>}
              <button
                type="button"
                className={`pagination-page ${p === page ? 'pagination-page--active' : ''}`}
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            </li>
          )
        })}
      </ul>
      <button
        type="button"
        className="pagination-btn"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </nav>
  )
}
