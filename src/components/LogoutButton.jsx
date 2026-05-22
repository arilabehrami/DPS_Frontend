import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { clearPendingCredentials } from '../utils/credentials'
import { Modal } from './Modal'

export function LogoutButton({ className = 'btn-secondary py-1.5 text-xs sm:text-sm' }) {
  const [open, setOpen] = useState(false)
  const { logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleConfirm = () => {
    clearPendingCredentials()
    logout()
    setOpen(false)
    navigate('/login')
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
            <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
              {t('common.cancel')}
            </button>
            <button type="button" onClick={handleConfirm} className="btn-primary">
              {t('logout.confirm')}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">{t('logout.message')}</p>
      </Modal>
    </>
  )
}
