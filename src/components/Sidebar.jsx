import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { RoleBadge } from './RoleBadge'
import { APP_SHORT, ROLES } from '../utils/constants'
import { filterNavByRole } from '../utils/permissions'

const linkClass = ({ isActive }) =>
  `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`

const NAV_ITEMS = [
  { to: '/clients', key: 'nav.clients', icon: '◎', roles: [ROLES.ADMIN, ROLES.EMPLOYEE] },
  { to: '/dashboard', key: 'nav.dashboard', icon: '◎' },
  { to: '/employees', key: 'nav.personas', icon: '👤', roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.CLIENT, ROLES.GUEST] },
  { to: '/ai-chat', key: 'nav.aiChat', icon: '✦' },
  { to: '/history', key: 'nav.history', icon: '☰' },
  { to: '/messages', key: 'nav.messages', icon: '@', roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.CLIENT] },
  { to: '/profile', key: 'nav.profile', icon: '◎' },
  { to: '/settings', key: 'nav.settings', icon: '⚙️', roles: [ROLES.ADMIN, ROLES.EMPLOYEE, ROLES.CLIENT] },
]

export function Sidebar({ open, onClose }) {
  const { user, role } = useAuth()
  const { t } = useTranslation()
  const navItems = filterNavByRole(NAV_ITEMS, role)

  return (
    <>
      {open && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={onClose}
          aria-label={t('nav.openMenu')}
        />
      )}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <header className="sidebar-brand">
          <span className="sidebar-brand-icon">🧠</span>
          <span className="sidebar-brand-text">{APP_SHORT}</span>
        </header>

        <section className="sidebar-user">
          <p className="sidebar-user-name">{user?.name || 'User'}</p>
          <p className="sidebar-user-email">{user?.email}</p>
          <RoleBadge role={role} roleId={user?.role_id} />
        </section>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} onClick={onClose}>
              <span aria-hidden className="sidebar-link-icon">
                {item.icon}
              </span>
              {t(item.key)}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}






