import { USER_KEY } from '../api/axios'

const SESSIONS_KEY = 'dps_chat_sessions'
const ACTIVE_KEY = 'dps_active_chat'
const CURRENT_SESSION_KEY = 'dps_current_session_id'
const SELECTED_PERSONA_KEY = 'dps_selected_persona_id'

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

function personaStorageKey(baseKey, personaId) {
  const base = storageKey(baseKey)
  return personaId ? `${base}:persona:${encodeURIComponent(String(personaId))}` : base
}

export function setSelectedPersonaId(personaId) {
  const key = storageKey(SELECTED_PERSONA_KEY)
  if (personaId) {
    localStorage.setItem(key, String(personaId))
  } else {
    localStorage.removeItem(key)
  }
}

export function getSelectedPersonaId() {
  return localStorage.getItem(storageKey(SELECTED_PERSONA_KEY)) || ''
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

export function getSessions(personaId) {
  try {
    const raw = localStorage.getItem(personaStorageKey(SESSIONS_KEY, personaId))
    const sessions = raw ? JSON.parse(raw) : []
    return dedupeSessions(sessions)
  } catch {
    return []
  }
}

export function getCurrentSessionId(personaId) {
  const key = personaStorageKey(CURRENT_SESSION_KEY, personaId)
  let id = localStorage.getItem(key)
  if (!id) {
    id = `session-${personaId || 'global'}-${Date.now()}`
    localStorage.setItem(key, id)
  }
  return id
}

export function getActiveMessages(personaId) {
  try {
    const raw = localStorage.getItem(personaStorageKey(ACTIVE_KEY, personaId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveActiveMessages(messages, personaId) {
  localStorage.setItem(personaStorageKey(ACTIVE_KEY, personaId), JSON.stringify(messages))
  if (!messages.length) return

  const sessionId = getCurrentSessionId(personaId)
  const sessions = getSessions(personaId)
  const preview =
    messages.find((m) => m.role === 'user')?.content?.slice(0, 60) || 'New chat'

  const entry = {
    id: sessionId,
    personaId: personaId || null,
    preview,
    messageCount: messages.length,
    messages,
    updatedAt: Date.now(),
  }

  const others = sessions.filter((s) => s.id !== sessionId)
  localStorage.setItem(personaStorageKey(SESSIONS_KEY, personaId), JSON.stringify([entry, ...others].slice(0, 20)))
  emit(CHAT_UPDATED_EVENT)
}

export function clearActiveChat(personaId) {
  localStorage.removeItem(personaStorageKey(ACTIVE_KEY, personaId))
  localStorage.removeItem(personaStorageKey(CURRENT_SESSION_KEY, personaId))
}

/** Save current conversation to history, then start a blank chat */
export function startNewChat(personaId) {
  const messages = getActiveMessages(personaId)
  if (messages.length) {
    saveActiveMessages(messages, personaId)
  }
  localStorage.removeItem(personaStorageKey(ACTIVE_KEY, personaId))
  localStorage.removeItem(personaStorageKey(CURRENT_SESSION_KEY, personaId))
  emit(NEW_CHAT_EVENT)
  emit(CHAT_UPDATED_EVENT)
}

export function getConversationCount(personaId) {
  return getSessions(personaId).length
}

export function getRecentChats(limit = 5, personaId) {
  return getSessions(personaId).slice(0, limit)
}

export function loadSession(sessionId, personaId) {
  const sessions = getSessions(personaId)
  const session = sessions.find((s) => s.id === sessionId)
  if (!session?.messages?.length) return
  localStorage.setItem(personaStorageKey(ACTIVE_KEY, personaId), JSON.stringify(session.messages))
  localStorage.setItem(personaStorageKey(CURRENT_SESSION_KEY, personaId), sessionId)
  emit(CHAT_UPDATED_EVENT)
}

export function deleteSession(sessionId, personaId) {
  const sessions = getSessions(personaId).filter((s) => s.id !== sessionId)
  localStorage.setItem(personaStorageKey(SESSIONS_KEY, personaId), JSON.stringify(sessions))
  const currentSessionKey = personaStorageKey(CURRENT_SESSION_KEY, personaId)
  const currentId = localStorage.getItem(currentSessionKey)
  if (currentId === sessionId) {
    localStorage.removeItem(personaStorageKey(ACTIVE_KEY, personaId))
    localStorage.removeItem(currentSessionKey)
  }
  emit(CHAT_UPDATED_EVENT)
}
