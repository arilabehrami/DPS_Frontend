export function getPersonaList(data) {
  const list = data?.items || data?.results || data?.personas || data?.data || data
  return Array.isArray(list) ? list : []
}

export function getCurrentUserId(user) {
  return user?.id || user?.user_id || user?._id || null
}

export function isDeletedPersona(persona) {
  return Boolean(
    persona?.deleted ||
      persona?.is_deleted ||
      persona?.deleted_at ||
      persona?.archived ||
      persona?.is_archived
  )
}

export function isInactivePersona(persona) {
  const status = String(persona?.status || '').toLowerCase()
  return Boolean(
    persona?.active === false ||
      persona?.is_active === false ||
      ['inactive', 'deleted', 'archived', 'terminated'].includes(status)
  )
}

export function getVisiblePersonas(data, user) {
  const userId = getCurrentUserId(user)
  return getPersonaList(data).filter((persona) => {
    if (isDeletedPersona(persona)) return false
    if (isInactivePersona(persona)) return false
    if (userId == null) return false
    return String(persona.user_id) === String(userId)
  })
}
