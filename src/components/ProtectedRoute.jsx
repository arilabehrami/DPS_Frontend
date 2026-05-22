import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Loader } from './Loader'

export function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, initializing, role } = useAuth()
  const location = useLocation()

  if (initializing) return <Loader fullScreen label="Checking session..." />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles?.length && !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
