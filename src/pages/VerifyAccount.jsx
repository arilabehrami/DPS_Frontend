import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { APP_SHORT } from '../utils/constants'

const OTP_PENDING_KEY = 'dps_pending_registration'

function readPendingPayload() {
  try {
    const raw = sessionStorage.getItem(OTP_PENDING_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function VerifyAccount() {
  const { verifyRegisterOtp, requestRegisterOtp, loading, isAuthenticated, initializing } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const pendingPayload = useMemo(readPendingPayload, [])
  const [email, setEmail] = useState(location.state?.email || pendingPayload?.email || '')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [cooldown, setCooldown] = useState(0)

  if (initializing) return <section className="auth-loading"><p>{t('common.loading')}</p></section>
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = setTimeout(() => setCooldown((prev) => (prev > 0 ? prev - 1 : 0)), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const parseWaitSeconds = (text) => {
    const match = String(text || '').match(/(\d+)/)
    return match ? Number(match[1]) : 60
  }

  const mapVerifyError = (status, message) => {
    const normalized = String(message || '').toLowerCase()
    if (status === 400 && normalized.includes('invalid')) return 'Kodi nuk është i saktë.'
    if (status === 400 && normalized.includes('expired')) return 'Kodi ka skaduar.'
    if (status === 429 && normalized.includes('invalid attempts')) return 'Kërko kod të ri.'
    if (status === 404 && normalized.includes('pending')) return 'Nuk ka regjistrim në pritje për këtë email.'
    return message || 'Verification failed'
  }

  const mapResendError = (status, message) => {
    if (status === 429) {
      const wait = parseWaitSeconds(message)
      setCooldown(wait)
      return 'Prit pak para se të kërkosh kod të ri.'
    }
    return message || 'Failed to resend code'
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    if (!email.trim() || code.trim().length !== 6) {
      setError('Please provide email and 6-digit code.')
      return
    }
    const result = await verifyRegisterOtp(email.trim(), code.trim())
    if (result.success) {
      sessionStorage.removeItem(OTP_PENDING_KEY)
      navigate('/dashboard', { replace: true })
      return
    }
    setError(mapVerifyError(result.status, result.error))
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setError('')
    setInfo('')
    const payload = readPendingPayload()
    if (!payload || !payload.email || !payload.password || !payload.full_name) {
      setError('Nuk ka regjistrim në pritje për këtë email.')
      return
    }
    const result = await requestRegisterOtp(payload)
    if (!result.success) {
      setError(mapResendError(result.status, result.error))
      return
    }
    setCooldown(60)
    setInfo('Verification code sent again.')
  }

  return (
    <section className="auth-layout">
      <section className="auth-form-section">
        <div className="auth-form-card">
          <form onSubmit={handleVerify} className="auth-form" noValidate autoComplete="off">
            <header className="auth-form-header">
              <p className="auth-tag auth-tag--mobile">{APP_SHORT}</p>
              <h2 className="auth-form-title">Verify your email</h2>
              <p className="auth-form-subtitle">Ne të dërguam kod 6-shifror në {email || 'your email'}.</p>
            </header>
            {error && <p className="alert alert--error" role="alert">{error}</p>}
            {info && <p className="alert alert--info">{info}</p>}
            <label className="form-label">
              {t('auth.email')}
              <input
                type="email"
                className="input-field auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="form-label">
              Verification code
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
            <button type="submit" disabled={loading} className="btn-primary auth-submit w-full">
              {loading ? 'Verifying...' : 'Verify code'}
            </button>
            <button
              type="button"
              className="btn-secondary mt-3 w-full"
              onClick={handleResend}
              disabled={loading || cooldown > 0}
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
            </button>
            <p className="auth-footer-link">
              <Link to="/register">Edit email / Back to register</Link>
            </p>
          </form>
        </div>
      </section>
    </section>
  )
}

