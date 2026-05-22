const PENDING_KEY = 'dps_pending_credentials'

export function storePendingCredentials(email, password) {
  sessionStorage.setItem(
    PENDING_KEY,
    JSON.stringify({ email, password, ts: Date.now() })
  )
}

export function consumePendingCredentials() {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    if (!raw) return null
    sessionStorage.removeItem(PENDING_KEY)
    const data = JSON.parse(raw)
    if (Date.now() - data.ts > 60000) return null
    return { email: data.email, password: data.password }
  } catch {
    sessionStorage.removeItem(PENDING_KEY)
    return null
  }
}

export function clearPendingCredentials() {
  sessionStorage.removeItem(PENDING_KEY)
}
