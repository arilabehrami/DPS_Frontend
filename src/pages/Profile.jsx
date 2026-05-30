import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { getErrorMessage } from '../api/axios'
import { Modal } from '../components/Modal'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useTranslation } from '../hooks/useTranslation'
import { LogoutButton } from '../components/LogoutButton'

export function Profile() {
  const { user, role, logout } = useAuth()
  const navigate = useNavigate()
  const { darkMode } = useTheme()
  const { t } = useTranslation()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [changeError, setChangeError] = useState('')
  const [changeInfo, setChangeInfo] = useState('')
  const [changeForm, setChangeForm] = useState({
    current_password: '',
    code: '',
    new_password: '',
    confirm_password: '',
  })
  const roleLabel = getRoleLabel(role, user?.role_id, t)

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError('')
    try {
      await authApi.deleteCurrentUser(user?.id)
      localStorage.removeItem('access_token')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('dps_token')
      localStorage.removeItem('dps_user')
      logout()
      navigate('/login', { replace: true })
    } catch (err) {
      setDeleteError(getErrorMessage(err, 'Failed to delete account'))
    } finally {
      setDeleting(false)
    }
  }

  const handleSendChangeOtp = async () => {
    setOtpSending(true)
    setChangeError('')
    setChangeInfo('')
    try {
      await authApi.requestChangePasswordOtp()
      setChangeInfo('OTP code sent to your email.')
    } catch (err) {
      const status = err?.response?.status
      if (status === 429) setChangeError('Too many requests. Please wait before retrying.')
      else setChangeError(getErrorMessage(err, 'Failed to send OTP'))
    } finally {
      setOtpSending(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setChangingPassword(true)
    setChangeError('')
    setChangeInfo('')

    if (changeForm.new_password !== changeForm.confirm_password) {
      setChangeError('New password and confirm password must match.')
      setChangingPassword(false)
      return
    }
    if (changeForm.new_password.length < 8) {
      setChangeError('New password must be at least 8 characters.')
      setChangingPassword(false)
      return
    }

    try {
      await authApi.confirmChangePassword({
        code: changeForm.code.trim(),
        current_password: changeForm.current_password,
        new_password: changeForm.new_password,
      })
      setChangeInfo('Password changed successfully.')
      localStorage.removeItem('access_token')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('dps_token')
      localStorage.removeItem('dps_user')
      logout()
      navigate('/login', { replace: true })
    } catch (err) {
      const status = err?.response?.status
      const detail = String(err?.response?.data?.detail || '').toLowerCase()
      if (status === 401) setChangeError('Current password is incorrect or session expired.')
      else if (status === 400 && detail.includes('expired')) setChangeError('OTP is expired.')
      else if (status === 400) setChangeError('Invalid OTP or weak password.')
      else if (status === 429) setChangeError('Too many attempts. Please try again later.')
      else if (status === 404) setChangeError('No pending OTP request found.')
      else setChangeError(getErrorMessage(err, 'Failed to change password'))
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <section className="page max-w-lg space-y-6">
      <header>
        <h1 className="page-title">{t('profile.title')}</h1>
      </header>

      <article className="card overflow-hidden">
        <div className="profile-banner">
          <span className="profile-avatar">
            {user?.avatar || user?.name?.charAt(0)?.toUpperCase() || '*'}
          </span>
        </div>
        <div className="p-6 space-y-4">
          <ProfileField label={t('profile.name')} value={user?.name} />
          <ProfileField label={t('profile.email')} value={user?.email} capitalize={false} />
          <ProfileField label={t('common.role')} value={roleLabel} />
          <ProfileField
            label={t('profile.theme')}
            value={darkMode ? t('profile.dark') : t('profile.light')}
          />
          <LogoutButton className="btn-primary w-full mt-2" />
          <button
            type="button"
            className="btn-secondary w-full mt-2 text-red-600"
            onClick={() => setDeleteOpen(true)}
          >
            Delete my account
          </button>
        </div>
      </article>

      <article className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Change password</h2>
        {changeError && <p className="alert alert--error">{changeError}</p>}
        {changeInfo && <p className="alert alert--info">{changeInfo}</p>}
        <button
          type="button"
          className="btn-secondary"
          disabled={otpSending || changingPassword}
          onClick={handleSendChangeOtp}
        >
          {otpSending ? 'Sending OTP...' : 'Send OTP'}
        </button>

        <form className="space-y-3" onSubmit={handleChangePassword}>
          <label className="form-label text-slate-700 dark:text-slate-300">
            Current password
            <input
              type="password"
              className="input-field mt-1.5"
              value={changeForm.current_password}
              onChange={(e) => setChangeForm((c) => ({ ...c, current_password: e.target.value }))}
              required
            />
          </label>
          <label className="form-label text-slate-700 dark:text-slate-300">
            OTP code
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="input-field mt-1.5"
              value={changeForm.code}
              onChange={(e) =>
                setChangeForm((c) => ({ ...c, code: e.target.value.replace(/\D/g, '').slice(0, 6) }))
              }
              required
            />
          </label>
          <label className="form-label text-slate-700 dark:text-slate-300">
            New password
            <input
              type="password"
              className="input-field mt-1.5"
              value={changeForm.new_password}
              onChange={(e) => setChangeForm((c) => ({ ...c, new_password: e.target.value }))}
              required
            />
          </label>
          <label className="form-label text-slate-700 dark:text-slate-300">
            Confirm new password
            <input
              type="password"
              className="input-field mt-1.5"
              value={changeForm.confirm_password}
              onChange={(e) => setChangeForm((c) => ({ ...c, confirm_password: e.target.value }))}
              required
            />
          </label>
          <button type="submit" className="btn-primary" disabled={changingPassword || otpSending}>
            {changingPassword ? 'Changing...' : 'Change password'}
          </button>
        </form>
      </article>

      <Modal
        open={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
        title="Delete account?"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary bg-red-600 hover:bg-red-500"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Yes, delete my account'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          {deleteError && <p className="alert alert--error">{deleteError}</p>}
          <p className="text-sm text-slate-600 dark:text-slate-300">
            This action is permanent and cannot be undone. Your account and related access will be removed.
          </p>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900/60">
            <p className="font-semibold text-slate-900 dark:text-white">{user?.name || 'User'}</p>
            <p className="mt-1 text-slate-500">{user?.email}</p>
          </div>
        </div>
      </Modal>
    </section>
  )
}

function getRoleLabel(role, roleId, t) {
  if (Number(roleId) === 2) return 'Administrator'
  if (Number(roleId) === 1) return 'Employee'
  if (Number(roleId) === 3) return 'Client'
  return t(`roles.${role}`) || role || '-'
}

function ProfileField({ label, value, capitalize = true }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-slate-800 dark:text-slate-100 ${capitalize ? 'capitalize' : ''}`}>
        {value || '-'}
      </p>
    </div>
  )
}
