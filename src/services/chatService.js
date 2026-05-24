import { USER_KEY } from '../api/axios'

const SESSIONS_KEY = 'dps_chat_sessions'
const ACTIVE_KEY = 'dps_active_chat'
const CURRENT_SESSION_KEY = 'dps_current_session_id'

export const CHAT_UPDATED_EVENT = 'dps-chat-updated'
export const NEW_CHAT_EVENT = 'dps-new-chat'

function emit(eventName) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventName))
  }
}

function getStorageSuffix() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    const user = raw ? JSON.parse(raw) : null
    const identity = user?.id || user?._id || user?.email || user?.username
    return identity ? encodeURIComponent(String(identity).toLowerCase()) : 'guest'
  } catch {
    return 'guest'
  }
}

function storageKey(baseKey) {
  return `${baseKey}:${getStorageSuffix()}`
}

function dedupeSessions(sessions) {
  const seen = new Map()
  for (const session of sessions) {
    const key = `${session.preview}:${session.messageCount}`
    const existing = seen.get(key)
    if (!existing || session.updatedAt > existing.updatedAt) {
      seen.set(key, session)
    }
  }
  return [...seen.values()].sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getSessions() {
  try {
    const raw = localStorage.getItem(storageKey(SESSIONS_KEY))
    const sessions = raw ? JSON.parse(raw) : []
    return dedupeSessions(sessions)
  } catch {
    return []
  }
}

export function getCurrentSessionId() {
  const key = storageKey(CURRENT_SESSION_KEY)
  let id = localStorage.getItem(key)
  if (!id) {
    id = `session-${Date.now()}`
    localStorage.setItem(key, id)
  }
  return id
}

export function getActiveMessages() {
  try {
    const raw = localStorage.getItem(storageKey(ACTIVE_KEY))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveActiveMessages(messages) {
  localStorage.setItem(storageKey(ACTIVE_KEY), JSON.stringify(messages))
  if (!messages.length) return

  const sessionId = getCurrentSessionId()
  const sessions = getSessions()
  const preview =
    messages.find((m) => m.role === 'user')?.content?.slice(0, 60) || 'New chat'

  const entry = {
    id: sessionId,
    preview,
    messageCount: messages.length,
    messages,
    updatedAt: Date.now(),
  }

  const others = sessions.filter((s) => s.id !== sessionId)
  localStorage.setItem(storageKey(SESSIONS_KEY), JSON.stringify([entry, ...others].slice(0, 20)))
  emit(CHAT_UPDATED_EVENT)
}

export function clearActiveChat() {
  localStorage.removeItem(storageKey(ACTIVE_KEY))
  localStorage.removeItem(storageKey(CURRENT_SESSION_KEY))
}

/** Save current conversation to history, then start a blank chat */
export function startNewChat() {
  const messages = getActiveMessages()
  if (messages.length) {
    saveActiveMessages(messages)
  }
  localStorage.removeItem(storageKey(ACTIVE_KEY))
  localStorage.removeItem(storageKey(CURRENT_SESSION_KEY))
  emit(NEW_CHAT_EVENT)
  emit(CHAT_UPDATED_EVENT)
}

export function getConversationCount() {
  return getSessions().length
}

export function getRecentChats(limit = 5) {
  return getSessions().slice(0, limit)
}

export function loadSession(sessionId) {
  const sessions = getSessions()
  const session = sessions.find((s) => s.id === sessionId)
  if (!session?.messages?.length) return
  localStorage.setItem(storageKey(ACTIVE_KEY), JSON.stringify(session.messages))
  localStorage.setItem(storageKey(CURRENT_SESSION_KEY), sessionId)
  emit(CHAT_UPDATED_EVENT)
}

export function deleteSession(sessionId) {
  const sessions = getSessions().filter((s) => s.id !== sessionId)
  localStorage.setItem(storageKey(SESSIONS_KEY), JSON.stringify(sessions))
  const currentSessionKey = storageKey(CURRENT_SESSION_KEY)
  const currentId = localStorage.getItem(currentSessionKey)
  if (currentId === sessionId) {
    localStorage.removeItem(storageKey(ACTIVE_KEY))
    localStorage.removeItem(currentSessionKey)
  }
  emit(CHAT_UPDATED_EVENT)
}
