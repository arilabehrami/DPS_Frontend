import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/authApi'
import { getErrorMessage, TOKEN_KEY, USER_KEY } from '../api/axios'
import { ROLES } from '../utils/constants'
import { storePendingCredentials } from '../utils/credentials'
import { toastService } from '../services/toastService'
import { AuthContext } from './AuthContextValue'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function normalizeRole(user) {
  if (user?.is_admin === true) return ROLES.ADMIN
  if (Number(user?.role_id) === 2) return ROLES.ADMIN
  if (Number(user?.role_id) === 1) return ROLES.EMPLOYEE
  if (Number(user?.role_id) === 3) return ROLES.CLIENT

  const rawRole = user?.role?.name || user?.role || user?.role_name
  const role = String(rawRole || '').toLowerCase().trim()
  if (role === 'user' || role === 'employ' || role === 'employee') return ROLES.EMPLOYEE
  if (role === 'client') return ROLES.CLIENT
  if (role === 'admin' || role === 'administrator') return ROLES.ADMIN
  if (role.includes('admin')) return ROLES.ADMIN
  if (role.includes('employ')) return ROLES.EMPLOYEE
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
    const previousUser = readStoredUser()
    const previousIdentity = previousUser?.email || previousUser?.id || previousUser?.username
    const nextIdentity = userData?.email || userData?.id || userData?.username

    if (previousIdentity && nextIdentity && previousIdentity !== nextIdentity) {
      localStorage.removeItem('dps_tenant_id')
    }

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
    localStorage.removeItem('access_token')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
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

  const requestRegisterOtp = useCallback(async (payload) => {
    setLoading(true)
    try {
      const { data } = await authApi.requestRegisterOtp(payload)
      return { success: true, data }
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to send verification code')
      return { success: false, error: msg, status: err?.response?.status }
    } finally {
      setLoading(false)
    }
  }, [])

  const verifyRegisterOtp = useCallback(
    async (email, code, passwordForStorage) => {
      setLoading(true)
      try {
        const { data } = await authApi.verifyRegisterOtp(email, code)
        const jwt = data.token || data.access_token
        const userData = data.user || data
        applySession(jwt, userData)
        if (passwordForStorage) {
          storePendingCredentials(email, passwordForStorage)
        }
        toastService.success('Account verified!')
        return { success: true }
      } catch (err) {
        const msg = getErrorMessage(err, 'Verification failed')
        return { success: false, error: msg, status: err?.response?.status }
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
      isClient: role === ROLES.CLIENT,
      isGuest: role === ROLES.GUEST,
      canEdit: role === ROLES.ADMIN || role === ROLES.EMPLOYEE || role === ROLES.CLIENT,
      canManageUsers: role === ROLES.ADMIN,
      login,
      register,
      requestRegisterOtp,
      verifyRegisterOtp,
      logout,
    }),
    [user, token, role, loading, initializing, login, register, requestRegisterOtp, verifyRegisterOtp, logout]
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}
