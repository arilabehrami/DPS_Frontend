import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { authApi } from '../api/authApi'
import { getErrorMessage, TOKEN_KEY, USER_KEY } from '../api/axios'
import { ROLES } from '../utils/constants'
import { storePendingCredentials } from '../utils/credentials'
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

function normalizeRole(user) {
  const role = user?.role?.toLowerCase?.() || ROLES.GUEST
  if (Object.values(ROLES).includes(role)) return role
  return ROLES.GUEST
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(
    () => !!localStorage.getItem(TOKEN_KEY)
  )

  const role = useMemo(() => normalizeRole(user), [user])

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
    localStorage.removeItem('dps_tenant_id')
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
        storePendingCredentials(email, password)
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
        storePendingCredentials(payload.email, payload.password)
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
      localStorage.setItem(USER_KEY, JSON.stringify(data))
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
      role,
      loading,
      initializing,
      isAuthenticated: Boolean(token && user),
      isAdmin: role === ROLES.ADMIN,
      isEmployee: role === ROLES.EMPLOYEE,
      isGuest: role === ROLES.GUEST,
      canEdit: role === ROLES.ADMIN || role === ROLES.EMPLOYEE,
      canManageUsers: role === ROLES.ADMIN,
      login,
      register,
      logout,
    }),
    [user, token, role, loading, initializing, login, register, logout]
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}
