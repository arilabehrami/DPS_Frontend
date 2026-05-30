import { useCallback, useEffect, useMemo, useState } from 'react'
import { notificationsApi } from '../api/notificationsApi'
import { getErrorMessage } from '../api/axios'
import { Loader } from '../components/Loader'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'

function listFrom(data) {
  const list = data?.items || data?.results || data?.notifications || data?.data || data
  return Array.isArray(list) ? list : []
}

function mapNotification(item) {
  return {
    id: item.id,
    title: item.title || 'Notification',
    message: item.content || item.message || '',
    is_read: Boolean(item.is_read),
    created_at: item.created_at || item.updated_at || null,
  }
}

export function Notifications() {
  const { isGuest } = useAuth()
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [markingAll, setMarkingAll] = useState(false)

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await notificationsApi.getAll({ page: 1, pageSize: 20 })
      setNotifications(listFrom(data).map(mapNotification))
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load notifications'))
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  )

  const handleMarkAsRead = async (id) => {
    setBusyId(id)
    setError('')
    try {
      await notificationsApi.markAsRead(id)
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, is_read: true } : item))
      )
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to mark notification as read'))
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id) => {
    setBusyId(id)
    setError('')
    try {
      await notificationsApi.delete(id)
      setNotifications((current) => current.filter((item) => item.id !== id))
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete notification'))
    } finally {
      setBusyId(null)
    }
  }

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true)
    setError('')
    try {
      await notificationsApi.markAllAsRead()
      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true }))
      )
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to mark all notifications as read'))
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <section className="page max-w-2xl space-y-6">
      <header>
        <h1 className="page-title">{t('notifications.title')}</h1>
        <p className="page-subtitle">
          {isGuest ? t('common.readOnly') : `Unread: ${unreadCount}`}
        </p>
        {!isGuest && unreadCount > 0 && (
          <button
            type="button"
            className="btn-secondary mt-3 px-3 py-1.5 text-xs"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
          >
            {markingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </header>

      {error && <p className="alert alert--error">{error}</p>}

      {loading ? (
        <Loader label="Loading notifications..." />
      ) : notifications.length ? (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <article
                className={`notification-card ${
                  notification.is_read ? 'notification-card--read' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-medium text-slate-900 dark:text-white">
                      {notification.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.is_read && <span className="notification-dot" aria-label="Unread" />}
                </div>
                <div className="mt-3 flex gap-2">
                  {!notification.is_read && (
                    <button
                      type="button"
                      className="btn-secondary px-3 py-1.5 text-xs"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={busyId === notification.id}
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-secondary px-3 py-1.5 text-xs text-red-600"
                    onClick={() => handleDelete(notification.id)}
                    disabled={busyId === notification.id}
                  >
                    Delete
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No notifications.</p>
      )}
    </section>
  )
}
