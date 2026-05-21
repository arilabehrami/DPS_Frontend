import React, { useState } from 'react'
import '../styles/personalities-list.css'

export const PersonalitiesList = ({ personalities, onSelect, selectedId, onDelete, onCreateNew }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filteredPersonalities = personalities.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.profession.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="personalities-list-container">
      {/* Header */}
      <div className="list-header">
        <h2>Personalities</h2>
        <button className="btn-create" onClick={onCreateNew}>
          ✨ New Personality
        </button>
      </div>

      {/* Search & Filters */}
      <div className="list-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search personalities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            All ({personalities.length})
          </button>
          <button
            className={`filter-tab ${selectedFilter === 'favorite' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('favorite')}
          >
            ⭐ Favorites
          </button>
        </div>
      </div>

      {/* Personalities List */}
      <div className="personalities-scroll">
        {filteredPersonalities.length === 0 ? (
          <div className="empty-state">
            <p>📭 No personalities found</p>
            <button className="btn-create-small" onClick={onCreateNew}>
              Create your first personality
            </button>
          </div>
        ) : (
          <div className="personalities-items">
            {filteredPersonalities.map((personality) => (
              <div
                key={personality.id}
                className={`personality-card ${selectedId === personality.id ? 'selected' : ''}`}
                onClick={() => onSelect(personality)}
              >
                <div className="card-header">
                  <div className="card-title">
                    <span className="personality-avatar">🎭</span>
                    <div className="personality-info">
                      <h3>{personality.name}</h3>
                      <p className="profession">{personality.profession}</p>
                    </div>
                  </div>
                  <button
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (window.confirm(`Delete "${personality.name}"?`)) {
                        onDelete(personality.id)
                      }
                    }}
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
                <div className="card-meta">
                  <span className="style-badge">{personality.communication_style}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
