import { ROLES } from './constants'

export function hasRole(userRole, allowedRoles) {
  if (!allowedRoles?.length) return true
  return allowedRoles.includes(userRole)
}

export function filterNavByRole(items, role) {
  return items.filter((item) => {
    if (item.roles && !item.roles.includes(role)) return false
    return true
  })
}

/** Frontend role capabilities (assigned by backend via user.role) */
export function getRoleAccess(role) {
  return {
    canViewRegistry: true,
    canEditRegistry: role === ROLES.ADMIN || role === ROLES.EMPLOYEE,
    canManageUsers: role === ROLES.ADMIN,
    canAccessSettings: role === ROLES.ADMIN || role === ROLES.EMPLOYEE,
    isReadOnly: role === ROLES.GUEST,
  }
}
