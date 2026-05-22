import { useTranslation } from '../hooks/useTranslation'

export function RoleBadge({ role, className = '' }) {
  const { t } = useTranslation()
  const label = t(`roles.${role}`) || role

  return (
    <span className={`role-badge role-badge--${role} ${className}`}>
      {label}
    </span>
  )
}
