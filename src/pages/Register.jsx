import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { AuthBackground } from '../components/AuthBackground'
import { APP_SHORT, PERSONALITY_NAME } from '../utils/constants'
import { clearPendingCredentials } from '../utils/credentials'

export function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const { register, loading, isAuthenticated, initializing } = useAuth()
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
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

    const result = await register({
      name: name.trim(),
      email: email.trim(),
      password,
    })
    if (result.success) navigate('/dashboard', { replace: true })
    else setError(result.error)
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
              {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
            </button>

            <p className="auth-footer-link">
              {t('auth.hasAccount')} <Link to="/login">{t('auth.signIn')}</Link>
            </p>
          </form>
        </div>
      </section>
    </section>
  )
}
