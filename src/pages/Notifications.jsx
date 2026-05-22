import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { PERSONALITY_NAME } from '../utils/constants'

export function Notifications() {
  const { role, isGuest } = useAuth()
  const { t } = useTranslation()

  const notifications = [
    {
      id: 1,
      title: t('notifications.item1Title'),
      message: t('notifications.item1Message', { name: PERSONALITY_NAME }),
      time: '2h',
      read: false,
    },
    {
      id: 2,
      title: t('notifications.item2Title'),
      message: t('notifications.item2Message'),
      time: '5h',
      read: false,
    },
    {
      id: 3,
      title: t('notifications.item3Title'),
      message: t('notifications.item3Message'),
      time: '1d',
      read: true,
    },
  ]

  return (
    <section className="page max-w-2xl space-y-6">
      <header>
        <h1 className="page-title">{t('notifications.title')}</h1>
        <p className="page-subtitle">
          {isGuest ? t('common.readOnly') : t('notifications.subtitle', { name: PERSONALITY_NAME })}
        </p>
      </header>

      <ul className="space-y-3">
        {notifications.map((n) => (
          <li key={n.id}>
            <article className={`notification-card ${n.read ? 'notification-card--read' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium text-slate-900 dark:text-white">{n.title}</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{n.message}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{n.time}</span>
              </div>
              {!n.read && <span className="notification-dot" aria-label="Unread" />}
            </article>
          </li>
        ))}
      </ul>

      <p className="text-xs text-slate-500">{t('notifications.syncHint')}</p>
    </section>
  )
}
