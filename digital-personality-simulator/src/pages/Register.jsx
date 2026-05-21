import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../style.css'

export const Register = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const { register, loading, error } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!username.trim()) {
      setLocalError('Username is required')
      return
    }
    if (!email.trim()) {
      setLocalError('Email is required')
      return
    }
    if (!password.trim()) {
      setLocalError('Password is required')
      return
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    const result = await register(email, password, username)
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
        <h1>Register</h1>
        <p className="auth-subtitle">Create your account to get started</p>

        {displayError && <div className="error-message">{displayError}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account?{' '}
          <Link to="/">Login here</Link>
        </p>
      </div>
    </div>
  )
}
