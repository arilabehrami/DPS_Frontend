import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { AuthBackground } from '../components/AuthBackground'
import { APP_SHORT, PERSONALITY_NAME } from '../utils/constants'
import { clearPendingCredentials } from '../utils/credentials'

const OTP_PENDING_KEY = 'dps_pending_registration'

export function Register() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const { requestRegisterOtp, loading, isAuthenticated, initializing } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  if (initializing) {
    return (
      <section className="auth-loading">
        <p>{t('common.loading')}</p>
      </section>
    )
  }
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const parseWaitSeconds = (text) => {
    const match = String(text || '').match(/(\d+)/)
    return match ? Number(match[1]) : 60
  }

  const mapRequestOtpError = (status, message) => {
    const normalized = String(message || '').toLowerCase()
    if (status === 400 && normalized.includes('already registered')) return 'Ky email ekziston.'
    if (status === 429) return `Prit pak para se të kërkosh kod të ri (${parseWaitSeconds(message)}s).`
    return message || 'Something went wrong'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    clearPendingCredentials()

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError(t('auth.allFieldsRequired'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('auth.passwordsMismatch'))
      return
    }
    if (password.length < 6) {
      setError(t('auth.passwordMinLength'))
      return
    }

    const payload = {
      full_name: name.trim(),
      username: username.trim() || name.trim(),
      email: email.trim(),
      password,
    }

    const result = await requestRegisterOtp(payload)
    if (!result.success) {
      setError(mapRequestOtpError(result.status, result.error))
      return
    }

    sessionStorage.setItem(OTP_PENDING_KEY, JSON.stringify(payload))
    setInfo('Check your email (and spam folder).')
    navigate('/verify-account', { replace: true, state: { email: payload.email } })
  }

  return (
    <section className="auth-layout">
      <aside className="auth-aside">
        <AuthBackground />
        <div className="auth-aside-content">
          <header>
            <p className="auth-tag">{t('auth.appName')}</p>
            <h1 className="auth-title">{t('auth.registerTitle')}</h1>
            <p className="auth-description">
              {t('auth.registerDescription', { app: APP_SHORT, name: PERSONALITY_NAME })}
            </p>
          </header>
        </div>
      </aside>

      <section className="auth-form-section">
        <div className="auth-form-card">
          <form onSubmit={handleSubmit} className="auth-form" noValidate autoComplete="off">
            <header className="auth-form-header">
              <p className="auth-tag auth-tag--mobile">{APP_SHORT}</p>
              <h2 className="auth-form-title">{t('auth.createAccount')}</h2>
              <p className="auth-form-subtitle">{t('auth.createAccountSubtitle')}</p>
            </header>

            {error && (
              <p className="alert alert--error" role="alert">
                {error}
              </p>
            )}
            {info && <p className="alert alert--info">{info}</p>}

            <label className="form-label">
              {t('auth.fullName')}
              <input
                type="text"
                name="dps-reg-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field auth-input"
                autoComplete="off"
                required
              />
            </label>

            <label className="form-label">
              Username (optional)
              <input
                type="text"
                name="dps-reg-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field auth-input"
                autoComplete="off"
              />
            </label>

            <label className="form-label">
              {t('auth.email')}
              <input
                type="email"
                name="dps-reg-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field auth-input"
                autoComplete="off"
                data-lpignore="true"
                required
              />
            </label>

            <label className="form-label">
              {t('auth.password')}
              <input
                type="password"
                name="dps-reg-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field auth-input"
                autoComplete="new-password"
                data-lpignore="true"
                required
              />
            </label>

            <label className="form-label">
              {t('auth.confirmPassword')}
              <input
                type="password"
                name="dps-reg-password-confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field auth-input"
                autoComplete="new-password"
                data-lpignore="true"
                required
              />
            </label>

            <button type="submit" disabled={loading} className="btn-primary auth-submit w-full">
              {loading ? 'Sending code...' : t('auth.createAccount')}
            </button>
            <p className="auth-footer-link">
              {t('auth.hasAccount')} <Link to="/login">{t('auth.signIn')}</Link>
            </p>
            <p className="auth-footer-link">
              Invited by admin? <Link to="/verify-account">Verify account</Link>
            </p>
          </form>
        </div>
      </section>
    </section>
  )
}
