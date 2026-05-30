import { useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { getErrorMessage } from '../api/axios'
import { useAuth } from '../hooks/useAuth'
import { APP_SHORT } from '../utils/constants'

const RESET_TOKEN_KEY = 'dps_pending_password_reset_token'
const RESET_EMAIL_KEY = 'dps_pending_password_reset_email'

export function ResetPassword() {
  const { isAuthenticated, initializing } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const tokenFromStorage = useMemo(() => sessionStorage.getItem(RESET_TOKEN_KEY) || '', [])
  const [resetToken] = useState(location.state?.resetToken || tokenFromStorage)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  if (initializing) return <section className="auth-loading"><p>Loading...</p></section>
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    if (!resetToken) {
      setError('Reset token is missing. Verify OTP again.')
      return
    }
    if (!newPassword.trim() || newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await authApi.resetForgotPassword(resetToken, newPassword)
      sessionStorage.removeItem(RESET_TOKEN_KEY)
      sessionStorage.removeItem(RESET_EMAIL_KEY)
      setInfo('Password reset successful. Redirecting to login...')
      navigate('/login', { replace: true, state: { notice: 'Password reset successful. Please sign in.' } })
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) setError('Invalid or expired reset token.')
      else setError(getErrorMessage(err, 'Password reset failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-layout">
      <section className="auth-form-section">
        <div className="auth-form-card">
          <form onSubmit={handleSubmit} className="auth-form" noValidate autoComplete="off">
            <header className="auth-form-header">
              <p className="auth-tag auth-tag--mobile">{APP_SHORT}</p>
              <h2 className="auth-form-title">Reset password</h2>
              <p className="auth-form-subtitle">Set your new password.</p>
            </header>
            {error && <p className="alert alert--error">{error}</p>}
            {info && <p className="alert alert--info">{info}</p>}
            <label className="form-label">
              New password
              <input
                type="password"
                className="input-field auth-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>
            <label className="form-label">
              Confirm password
              <input
                type="password"
                className="input-field auth-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn-primary auth-submit w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
            <p className="auth-footer-link">
              <Link to="/login">Back to login</Link>
            </p>
          </form>
        </div>
      </section>
    </section>
  )
}

