export function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`search-bar ${className}`}>
      <svg
        className="search-bar-icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="search-bar-input"
        aria-label="Search"
      />
    </div>
  )
}
