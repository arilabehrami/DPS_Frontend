import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ratingsApi } from '../api/ratingsApi'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { clearPendingCredentials } from '../utils/credentials'
import { Modal } from './Modal'

function StarRating({ value, disabled, onRate }) {
  const score = Number(value) || 0
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`text-2xl leading-none transition ${
            star <= score ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300 dark:text-slate-600'
          }`}
          onClick={() => onRate(star)}
          disabled={disabled}
          aria-label={`Rate ${star} stars`}
        >
          {'\u2605'}
        </button>
      ))}
    </div>
  )
}

export function LogoutButton({ className = 'btn-secondary py-1.5 text-xs sm:text-sm' }) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [saving, setSaving] = useState(false)
  const { logout, user } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleConfirm = async () => {
    setSaving(true)
    try {
      const userId = user?.id || user?.user_id
      if (rating && userId) {
        await ratingsApi.createUserRating({
          userId,
          workspaceId: user?.workspace_id || user?.workspace?.id || 1,
          score: rating,
        })
      }
    } catch {
      // Rating is optional; backend permission issues should not block logout.
    } finally {
      clearPendingCredentials()
      logout()
      setOpen(false)
      setRating(0)
      setSaving(false)
      navigate('/login')
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {t('nav.logout')}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('logout.title')}
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary" disabled={saving}>
              {t('common.cancel')}
            </button>
            <button type="button" onClick={handleConfirm} className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : t('logout.confirm')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('logout.message')}</p>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Rate your experience before logout
            </p>
            <StarRating value={rating} disabled={saving} onRate={setRating} />
            <p className="mt-2 text-xs text-slate-500">
              Rating is optional. You can log out without rating.
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}
