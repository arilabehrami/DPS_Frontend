import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CHAT_UPDATED_EVENT,
  deleteSession,
  getSessions,
  loadSession,
} from '../services/chatService'
import { PERSONALITY_NAME } from '../utils/constants'

export function ChatHistory() {
  const [sessions, setSessions] = useState(getSessions)

  useEffect(() => {
    const refresh = () => setSessions(getSessions())
    window.addEventListener(CHAT_UPDATED_EVENT, refresh)
    return () => window.removeEventListener(CHAT_UPDATED_EVENT, refresh)
  }, [])

  const handleOpen = (sessionId) => {
    loadSession(sessionId)
  }

  const handleDelete = (sessionId) => {
    deleteSession(sessionId)
    setSessions(getSessions())
  }

  return (
    <section className="page max-w-3xl space-y-6">
      <header>
        <h1 className="page-title">Chat history</h1>
        <p className="page-subtitle">
          Past conversations with {PERSONALITY_NAME}
        </p>
      </header>

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
          <p className="text-slate-500">No chat history yet.</p>
          <Link to="/ai-chat" className="btn-primary mt-4 inline-flex">
            Start chatting with {PERSONALITY_NAME}
          </Link>
        </article>
      )}
    </section>
  )
}
