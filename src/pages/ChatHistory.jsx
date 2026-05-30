import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { employeesApi } from '../api/employeesApi'
import { getErrorMessage } from '../api/axios'
import {
  CHAT_UPDATED_EVENT,
  deleteSession,
  getSelectedPersonaId,
  getSessions,
  loadSession,
  setSelectedPersonaId,
} from '../services/chatService'
import { PERSONALITY_NAME } from '../utils/constants'
import { getVisiblePersonas } from '../utils/personas'
import { useAuth } from '../hooks/useAuth'

export function ChatHistory() {
  const [personas, setPersonas] = useState([])
  const [personaId, setPersonaId] = useState(getSelectedPersonaId)
  const [sessions, setSessions] = useState(() => getSessions(getSelectedPersonaId()))
  const [error, setError] = useState('')
  const { user } = useAuth()

  const selectedPersona = personas.find((persona) => String(persona.id) === String(personaId))

  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const { data } = await employeesApi.getAll()
        const list = getVisiblePersonas(data, user)
        setPersonas(list)
        setPersonaId((current) => {
          const hasCurrent = list.some((persona) => String(persona.id) === String(current))
          return hasCurrent ? current : String(list[0]?.id || '')
        })
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load personas'))
      }
    }

    loadPersonas()
  }, [user])

  useEffect(() => {
    setSelectedPersonaId(personaId)
    setSessions(getSessions(personaId))
  }, [personaId])

  useEffect(() => {
    const refresh = () => setSessions(getSessions(personaId))
    window.addEventListener(CHAT_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(CHAT_UPDATED_EVENT, refresh)
  }, [personaId])

  const handleOpen = (sessionId) => {
    setSelectedPersonaId(personaId)
    loadSession(sessionId, personaId)
  }

  const handleDelete = (sessionId) => {
    deleteSession(sessionId, personaId)
    setSessions(getSessions(personaId))
  }

  return (
    <section className="page max-w-3xl space-y-6">
      <header className="page-header-row">
        <div>
          <h1 className="page-title">Chat history</h1>
          <p className="page-subtitle">
            Past conversations with {selectedPersona?.name || PERSONALITY_NAME}
          </p>
        </div>
        <select
          className="input-field w-56 py-2 text-sm"
          value={personaId}
          onChange={(e) => setPersonaId(e.target.value)}
          aria-label="Choose persona history"
        >
          {!personas.length && <option value="">No personas</option>}
          {personas.map((persona) => (
            <option key={persona.id} value={persona.id}>
              {persona.name || `Persona ${persona.id}`}
            </option>
          ))}
        </select>
      </header>

      {error && <p className="alert alert--error">{error}</p>}

      {sessions.length ? (
        <ul className="space-y-3">
          {sessions.map((session) => (
            <li key={session.id}>
              <article className="card flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-800 dark:text-slate-100">
                    {session.preview}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {session.messageCount} messages ·{' '}
                    {new Date(session.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    to="/ai-chat"
                    onClick={() => handleOpen(session.id)}
                    className="btn-primary py-2 text-xs"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(session.id)}
                    className="btn-secondary py-2 text-xs text-red-600 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <article className="card p-8 text-center">
          <p className="text-slate-500">No chat history yet for this persona.</p>
          <Link to="/ai-chat" className="btn-primary mt-4 inline-flex">
            Start chatting with {selectedPersona?.name || PERSONALITY_NAME}
          </Link>
        </article>
      )}
    </section>
  )
}
