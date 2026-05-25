import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useTranslation } from '../hooks/useTranslation'
import { LogoutButton } from '../components/LogoutButton'
import { RoleBadge } from '../components/RoleBadge'
import { PERSONALITY_NAME } from '../utils/constants'

export function Profile() {
  const { user, role } = useAuth()
  const { darkMode } = useTheme()
  const { t } = useTranslation()

  return (
    <section className="page max-w-lg space-y-6">
      <header>
        <h1 className="page-title">{t('profile.title')}</h1>
        <p className="page-subtitle">{t('profile.subtitle')}</p>
      </header>

      <article className="card overflow-hidden">
        <div className="profile-banner">
          <span className="profile-avatar">
            {user?.avatar || user?.name?.charAt(0)?.toUpperCase() || '🧠'}
          </span>
        </div>
        <div className="p-6 space-y-4">
          <ProfileField label={t('profile.name')} value={user?.name} />
          <ProfileField label={t('profile.email')} value={user?.email} />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {t('common.role')}
            </p>
            <div className="mt-1">
              <RoleBadge role={role} />
            </div>
          </div>
          <ProfileField label={t('profile.aiCompanion')} value={PERSONALITY_NAME} />
          <ProfileField
            label={t('profile.theme')}
            value={darkMode ? t('profile.dark') : t('profile.light')}
          />
          <LogoutButton className="btn-primary w-full mt-2" />
        </div>
      </article>
    </section>
  )
}

function ProfileField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 capitalize text-slate-800 dark:text-slate-100">{value || '—'}</p>
    </div>
  )
}
