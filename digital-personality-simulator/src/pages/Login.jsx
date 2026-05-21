import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../style.css'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!email.trim()) {
      setLocalError('Email is required')
      return
    }
    if (!password.trim()) {
      setLocalError('Password is required')
      return
    }

    const result = await login(email, password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setLocalError(result.error)
    }
  }

  const displayError = localError || error

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Login</h1>
        <p className="auth-subtitle">Welcome back to Digital Personality Simulator</p>

        {displayError && <div className="error-message">{displayError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account?{' '}
          <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  )
}
