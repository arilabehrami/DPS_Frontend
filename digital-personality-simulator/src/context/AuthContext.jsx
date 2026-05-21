import React, { createContext, useState, useCallback, useEffect } from 'react'
import { authAPI } from '../services/api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(!!token)

  // Initialize authentication state
  useEffect(() => {
    if (token) {
      setIsAuthenticated(true)
      // Optionally, fetch user profile from backend
      setUser({ token })
    }
  }, [token])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authAPI.login(email, password)
      const { token: newToken, user: userData } = response.data
      
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)
      setIsAuthenticated(true)
      
      return { success: true, user: userData }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (email, password, username) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authAPI.register(email, password, username)
      const { token: newToken, user: userData } = response.data
      
      localStorage.setItem('token', newToken)
      setToken(newToken)
      setUser(userData)
      setIsAuthenticated(true)
      
      return { success: true, user: userData }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    setError(null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
