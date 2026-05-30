import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { AuthBackground } from '../components/AuthBackground'
import { APP_SHORT, PERSONALITY_NAME } from '../utils/constants'
import { clearPendingCredentials } from '../utils/credentials'

export function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const { login, loading, isAuthenticated, initializing } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.notice) {
      setInfo(location.state.notice)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

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

    if (!identifier.trim() || !password.trim()) {
      setError(t('auth.emailRequired'))
      return
    }

    const result = await login(identifier.trim(), password)
    if (result.success) {
      navigate('/dashboard', { replace: true })
    } else {
      setError(result.error)
    }
  }

  return (
    <section className="auth-layout">
      <aside className="auth-aside">
        <AuthBackground />
        <div className="auth-aside-content">
          <header>
            <p className="auth-tag">{t('auth.appName')}</p>
            <h1 className="auth-title">{t('auth.tagline')}</h1>
            <p className="auth-description">
              {t('auth.description', { name: PERSONALITY_NAME })}
            </p>
          </header>
          <p className="auth-companion">
            {t('auth.companion', { name: PERSONALITY_NAME })}
          </p>
        </div>
      </aside>

      <section className="auth-form-section">
        <div className="auth-form-card">
          <form
            onSubmit={handleSubmit}
            className="auth-form"
            noValidate
            autoComplete="off"
            data-form-type="login"
          >
            <header className="auth-form-header">
              <p className="auth-tag auth-tag--mobile">{APP_SHORT}</p>
              <h2 className="auth-form-title">{t('auth.signIn')}</h2>
              <p className="auth-form-subtitle">{t('auth.signInSubtitle')}</p>
            </header>

            {error && (
              <p className="alert alert--error" role="alert">
                {error}
              </p>
            )}
            {info && (
              <p className="alert alert--info" role="status">
                {info}
              </p>
            )}

            <label className="form-label">
              Email
              <input
                type="text"
                name="dps-login-identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="input-field auth-input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                placeholder="you@example.com or username"
                required
              />
            </label>

            <label className="form-label">
              {t('auth.password')}
              <input
                type="password"
                name="dps-login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field auth-input"
                autoComplete="off"
                data-lpignore="true"
                data-1p-ignore="true"
                placeholder="********"
                required
              />
            </label>
            <p className="auth-footer-link text-right">
              <Link to="/forgot-password">Forgot password?</Link>
            </p>

            <button type="submit" disabled={loading} className="btn-primary auth-submit w-full">
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </button>

            <p className="auth-footer-link">
              {t('auth.noAccount')}{' '}
              <Link to="/register">{t('auth.createOne')}</Link>
            </p>
          </form>
        </div>
      </section>
    </section>
  )
}

