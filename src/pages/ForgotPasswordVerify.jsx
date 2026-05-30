import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { getErrorMessage } from '../api/axios'
import { useAuth } from '../hooks/useAuth'
import { APP_SHORT } from '../utils/constants'

const RESET_EMAIL_KEY = 'dps_pending_password_reset_email'
const RESET_TOKEN_KEY = 'dps_pending_password_reset_token'

export function ForgotPasswordVerify() {
  const { isAuthenticated, initializing } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const storedEmail = useMemo(() => sessionStorage.getItem(RESET_EMAIL_KEY) || '', [])
  const [email, setEmail] = useState(location.state?.email || storedEmail)
  const [code, setCode] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  if (initializing) return <section className="auth-loading"><p>Loading...</p></section>
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const t = setTimeout(() => setCooldown((prev) => (prev > 0 ? prev - 1 : 0)), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    if (!email.trim() || code.trim().length !== 6) {
      setError('Please provide email and 6-digit code.')
      return
    }
    setLoading(true)
    try {
      const { data } = await authApi.verifyForgotPasswordOtp(email.trim(), code.trim())
      const resetToken = data?.reset_token || data?.token
      if (!resetToken) {
        setError('Reset token not returned by backend.')
        return
      }
      sessionStorage.setItem(RESET_EMAIL_KEY, email.trim())
      sessionStorage.setItem(RESET_TOKEN_KEY, resetToken)
      navigate('/forgot-password/reset', { replace: true, state: { resetToken } })
    } catch (err) {
      const status = err?.response?.status
      const msg = String(getErrorMessage(err, 'Verification failed') || '').toLowerCase()
      if (status === 400 && msg.includes('expired')) setError('Verification code expired.')
      else if (status === 400) setError('Invalid verification code.')
      else if (status === 404) setError('No pending reset or user not found.')
      else setError(getErrorMessage(err, 'Verification failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setError('')
    setInfo('')
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    setLoading(true)
    try {
      await authApi.requestForgotPasswordOtp(email.trim())
      sessionStorage.setItem(RESET_EMAIL_KEY, email.trim())
      setInfo('Verification code sent again.')
      setCooldown(60)
    } catch (err) {
      const status = err?.response?.status
      if (status === 429) {
        setCooldown(60)
        setError('Please wait before requesting a new code.')
      } else {
        setError(getErrorMessage(err, 'Resend failed'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-layout">
      <section className="auth-form-section">
        <div className="auth-form-card">
          <form onSubmit={handleVerify} className="auth-form" noValidate autoComplete="off">
            <header className="auth-form-header">
              <p className="auth-tag auth-tag--mobile">{APP_SHORT}</p>
              <h2 className="auth-form-title">Verify code</h2>
              <p className="auth-form-subtitle">Enter the 6-digit OTP sent to your email.</p>
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
            <label className="form-label">
              OTP code
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="input-field auth-input"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
            </label>
            <button type="submit" className="btn-primary auth-submit w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              className="btn-secondary mt-3 w-full"
              onClick={handleResend}
              disabled={loading || cooldown > 0}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
            <p className="auth-footer-link">
              <Link to="/forgot-password">Back</Link>
            </p>
          </form>
        </div>
      </section>
    </section>
  )
}

