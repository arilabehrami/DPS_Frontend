import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../styles/sidebar.css'

export const Sidebar = () => {
  const location = useLocation()
  const { logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Create Personality', path: '/create-personality', icon: '✨' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ]

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🤖</span>
          {!isCollapsed && <span className="logo-text">Personality AI</span>}
        </div>
        <button
          className="collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            title={isCollapsed ? item.name : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-text">{item.name}</span>}
          </Link>
        ))}
      </nav>

      {/* Workspaces Section */}
      {!isCollapsed && (
        <div className="sidebar-section">
          <h3 className="section-title">Workspaces</h3>
          <div className="workspace-list">
            <div className="workspace-item active">
              <span className="workspace-dot">●</span>
              <span className="workspace-name">Personal</span>
            </div>
            <div className="workspace-item">
              <span className="workspace-dot">●</span>
              <span className="workspace-name">Team</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          className="logout-btn"
          onClick={logout}
          title={isCollapsed ? 'Logout' : ''}
        >
          <span className="logout-icon">🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
