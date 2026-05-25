import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useTranslation } from '../hooks/useTranslation'
import { getSelectedPersonaId, startNewChat } from '../services/chatService'
import { LogoutButton } from './LogoutButton'
import { RoleBadge } from './RoleBadge'
import { PERSONALITY_NAME } from '../utils/constants'

export function Navbar({ onMenuClick }) {
  const { user, role } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const handleNewChat = () => {
    startNewChat(getSelectedPersonaId())
    if (location.pathname !== '/ai-chat') {
      navigate('/ai-chat')
    }
  }

  return (
    <header className="navbar">
      <section className="navbar-left">
        <button
          type="button"
          onClick={onMenuClick}
          className="navbar-menu-btn"
          aria-label={t('nav.openMenu')}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <p className="navbar-context hidden sm:block">
          {t('nav.chattingWith')}{' '}
          <strong className="text-violet-600 dark:text-violet-400">{PERSONALITY_NAME}</strong>
        </p>
      </section>

      <section className="navbar-right">
        <RoleBadge role={role} className="hidden sm:inline-flex" />

        <button
          type="button"
          onClick={toggleTheme}
          className="navbar-icon-btn"
          aria-label={t('nav.toggleTheme')}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        <span className="navbar-user hidden sm:inline">
          {user?.name || user?.email}
        </span>

        <button
          type="button"
          onClick={handleNewChat}
          className="btn-primary hidden py-1.5 text-xs sm:inline-flex"
        >
          {t('nav.newChat')}
        </button>

        <LogoutButton />
      </section>
    </header>
  )
}
