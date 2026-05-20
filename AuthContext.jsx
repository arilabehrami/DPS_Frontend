import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { authApi } from '../api/authApi'
import { getErrorMessage, TOKEN_KEY, USER_KEY } from '../api/axios'
import { toastService } from '../services/toastService'

export const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(
    () => !!localStorage.getItem(TOKEN_KEY)
  )

  const applySession = useCallback((jwt, userData) => {
    localStorage.setItem(TOKEN_KEY, jwt)
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
    }
    setToken(jwt)
    setUser(userData)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const login = useCallback(
    async (email, password) => {
      setLoading(true)
      try {
        const { data } = await authApi.login(email, password)
        const jwt = data.token || data.access_token
        const userData = data.user || data
        applySession(jwt, userData)
        toastService.success('Welcome to DPS!')
        return { success: true }
      } catch (err) {
        const msg = getErrorMessage(err, 'Invalid email or password')
        return { success: false, error: msg }
      } finally {
        setLoading(false)
      }
    },
    [applySession]
  )

  const register = useCallback(
    async (payload) => {
      setLoading(true)
      try {
        const { data } = await authApi.register(payload)
        const jwt = data.token || data.access_token
        const userData = data.user || data
        applySession(jwt, userData)
        toastService.success('Account created!')
        return { success: true }
      } catch (err) {
        const msg = getErrorMessage(err, 'Registration failed')
        return { success: false, error: msg }
      } finally {
        setLoading(false)
      }
    },
    [applySession]
  )

  const logout = useCallback(() => {
    clearSession()
    toastService.success('Logged out')
  }, [clearSession])

  const loadProfile = useCallback(async () => {
    if (!token) {
      setInitializing(false)
      return
    }
    try {
      const { data } = await authApi.getProfile()
      setUser(data)
    } catch {
      clearSession()
    } finally {
      setInitializing(false)
    }
  }, [token, clearSession])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      initializing,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [user, token, loading, initializing, login, register, logout]
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}
