import { ROLES } from './constants'

export function hasRole(userRole, allowedRoles) {
  if (!allowedRoles?.length) return true
  const role = userRole === 'user' ? ROLES.EMPLOYEE : userRole
  return allowedRoles.includes(role)
}

export function filterNavByRole(items, role) {
  const normalizedRole = role === 'user' ? ROLES.EMPLOYEE : role
  return items.filter((item) => {
    if (item.roles && !item.roles.includes(normalizedRole)) return false
    return true
  })
}

/** Frontend role capabilities (assigned by backend via user.role) */
export function getRoleAccess(role) {
  const normalizedRole = role === 'user' ? ROLES.EMPLOYEE : role
  return {
    canViewRegistry: true,
    canEditRegistry: normalizedRole === ROLES.ADMIN || normalizedRole === ROLES.EMPLOYEE,
    canManageUsers: normalizedRole === ROLES.ADMIN,
    canAccessSettings: normalizedRole === ROLES.ADMIN || normalizedRole === ROLES.EMPLOYEE,
    isReadOnly: normalizedRole === ROLES.GUEST,
  }
}
