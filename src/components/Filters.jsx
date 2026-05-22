export function Filters({ filters, onChange, onReset }) {
  return (
    <section className="filters-panel">
      <div className="filters-grid">
        {filters.map((filter) => (
          <label key={filter.name} className="filter-field">
            <span className="filter-label">{filter.label}</span>
            {filter.type === 'select' ? (
              <select
                value={filter.value}
                onChange={(e) => onChange(filter.name, e.target.value)}
                className="input-field"
              >
                <option value="">All</option>
                {filter.options.map((opt) => (
                  <option key={opt.value ?? opt} value={opt.value ?? opt}>
                    {opt.label ?? opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={filter.type || 'text'}
                value={filter.value}
                onChange={(e) => onChange(filter.name, e.target.value)}
                className="input-field"
              />
            )}
          </label>
        ))}
      </div>
      {onReset && (
        <button type="button" onClick={onReset} className="btn-secondary text-xs">
          Reset filters
        </button>
      )}
    </section>
  )
}
