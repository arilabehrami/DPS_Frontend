import { useTranslation } from '../hooks/useTranslation'

function getRoleLabel(role, roleId, t) {
  if (Number(roleId) === 2) return 'Administrator'
  if (Number(roleId) === 1) return 'Employee'
  if (Number(roleId) === 3) return 'Client'
  return t(`roles.${role}`) || role
}

export function RoleBadge({ role, roleId, className = '' }) {
  const { t } = useTranslation()
  const label = getRoleLabel(role, roleId, t)

  return (
    <span className={`role-badge role-badge--${role} ${className}`}>
      {label}
    </span>
  )
}
