import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { getErrorMessage } from '../api/axios'
import { useAuth } from '../hooks/useAuth'
import { APP_SHORT } from '../utils/constants'

export function ForgotPasswordRequest() {
  const navigate = useNavigate()
  const { isAuthenticated, initializing } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  if (initializing) return <section className="auth-loading"><p>Loading...</p></section>
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    setLoading(true)
    try {
      await authApi.requestForgotPasswordOtp(email.trim())
      sessionStorage.setItem('dps_pending_password_reset_email', email.trim())
      setInfo('Verification code sent. Check your email.')
      navigate('/forgot-password/verify', { replace: true, state: { email: email.trim() } })
    } catch (err) {
      const status = err?.response?.status
      const msg = String(getErrorMessage(err, 'Request failed') || '')
      if (status === 429) {
        setError('Please wait before requesting a new code.')
      } else if (status === 404) {
        setError('User not found.')
      } else {
        setError(msg)
      }
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
              <h2 className="auth-form-title">Forgot password</h2>
              <p className="auth-form-subtitle">Request a verification code to reset your password.</p>
            </header>
            {error && <p className="alert alert--error">{error}</p>}
            {info && <p className="alert alert--info">{info}</p>}
            <label className="form-label">
              Email
              <input
                type="email"
                className="input-field auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn-primary auth-submit w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
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

