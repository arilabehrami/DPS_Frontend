import { useEffect, useRef, useState } from 'react'
import { aiApi } from '../api/aiApi'
import { employeesApi } from '../api/employeesApi'
import { getErrorMessage } from '../api/axios'
import {
  CHAT_UPDATED_EVENT,
  NEW_CHAT_EVENT,
  clearActiveChat,
  getActiveMessages,
  getSessions,
  loadSession,
  saveActiveMessages,
  setSelectedPersonaId as saveSelectedPersonaId,
} from '../services/chatService'
import { getSettings } from '../services/settingsService'
import { PERSONALITY_NAME } from '../utils/constants'
import { useTranslation } from '../hooks/useTranslation'

function getList(data) {
  const list = data?.items || data?.results || data?.personas || data?.data || data
  return Array.isArray(list) ? list : []
}

function TypingIndicator({ name }) {
  return (
    <article className="chat-typing" aria-live="polite">
      <span className="chat-typing-dots">
        <span />
        <span />
        <span />
      </span>
      {name} is typing...
    </article>
  )
}

export function AIChat() {
  const [messages, setMessages] = useState([])
  const [personas, setPersonas] = useState([])
  const [selectedPersonaId, setSelectedPersonaId] = useState('')
  const [conversationIds, setConversationIds] = useState({})
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [personasLoading, setPersonasLoading] = useState(true)
  const [error, setError] = useState('')
  const [historyOpen, setHistoryOpen] = useState(true)
  const [sessions, setSessions] = useState(getSessions)
  const endRef = useRef(null)
  const settings = getSettings()
  const { language } = useTranslation()
  const selectedPersona = personas.find((persona) => String(persona.id) === String(selectedPersonaId))

  const refreshFromStorage = () => {
    setMessages(getActiveMessages(selectedPersonaId))
    setSessions(getSessions(selectedPersonaId))
  }

  useEffect(() => {
    const onUpdate = () => {
      setMessages(getActiveMessages(selectedPersonaId))
      setSessions(getSessions(selectedPersonaId))
    }
    const onNewChat = () => {
      setMessages([])
      setSessions(getSessions(selectedPersonaId))
      setError('')
      setInput('')
    }

    window.addEventListener(CHAT_UPDATED_EVENT, onUpdate)
    window.addEventListener(NEW_CHAT_EVENT, onNewChat)

    return () => {
      window.removeEventListener(CHAT_UPDATED_EVENT, onUpdate)
      window.removeEventListener(NEW_CHAT_EVENT, onNewChat)
    }
  }, [selectedPersonaId])

  useEffect(() => {
    saveSelectedPersonaId(selectedPersonaId)
    setMessages(getActiveMessages(selectedPersonaId))
    setSessions(getSessions(selectedPersonaId))
    setError('')
    setInput('')
  }, [selectedPersonaId])

  useEffect(() => {
    const loadPersonas = async () => {
      setPersonasLoading(true)
      try {
        const { data } = await employeesApi.getAll()
        const list = getList(data)
        setPersonas(list)
        setSelectedPersonaId((current) => current || String(list[0]?.id || ''))
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load personas'))
      } finally {
        setPersonasLoading(false)
      }
    }

    loadPersonas()
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [messages, loading])

  const persist = (list) => {
    setMessages(list)
    saveActiveMessages(list, selectedPersonaId)
    setSessions(getSessions(selectedPersonaId))
  }

  const handleSend = async (e) => {
    e.preventDefault()

    if (!input.trim() || loading || !selectedPersonaId) return

    const userMsg = {
      role: 'user',
      content: input.trim(),
      ts: Date.now(),
    }

    const next = [...messages, userMsg]

    persist(next)
    setInput('')
    setError('')
    setLoading(true)

    try {
      const persona = selectedPersona

      if (!persona?.id) {
        throw new Error('Choose a persona before sending a message.')
      }

      const { data } = await aiApi.chat(userMsg.content, {
        personaId: persona.id,
        conversationId: conversationIds[persona.id],
        model: settings.model,
        language,
      })

      if (data.conversation_id) {
        setConversationIds((current) => ({
          ...current,
          [persona.id]: data.conversation_id,
        }))
      }

      const reply =
        data.response_text ||
        data.response ||
        data.message ||
        data.content ||
        'No response'

      persist([
        ...next,
        {
          role: 'assistant',
          content: reply,
          ts: Date.now(),
        },
      ])
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to get AI response'))
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    clearActiveChat(selectedPersonaId)
    setMessages([])
    setSessions(getSessions(selectedPersonaId))
    setError('')
  }

  const handleOpenSession = (sessionId) => {
    loadSession(sessionId, selectedPersonaId)
    refreshFromStorage()
  }

  return (
    <section className="chat-page">
      <header className="chat-header">
        <div>
          <h1 className="page-title">Chat with {selectedPersona?.name || PERSONALITY_NAME}</h1>
          <p className="page-subtitle">POST /chat/generate</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="input-field w-48 py-2 text-xs"
            value={selectedPersonaId}
            onChange={(e) => {
              setSelectedPersonaId(e.target.value)
            }}
            disabled={personasLoading || loading}
            aria-label="Choose persona"
          >
            {!personas.length && <option value="">No personas</option>}
            {personas.map((persona) => (
              <option key={persona.id} value={persona.id}>
                {persona.name || `Persona ${persona.id}`}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="btn-secondary text-xs hidden sm:inline-flex"
          >
            {historyOpen ? 'Hide' : 'Show'} history
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="btn-secondary text-xs"
            disabled={!messages.length}
          >
            Clear chat
          </button>
        </div>
      </header>

      <section className="chat-layout">
        {historyOpen && (
          <aside className="chat-history-panel hidden md:flex">
            <h2 className="chat-history-title">History</h2>

            <ul className="chat-history-list">
              {sessions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => handleOpenSession(s.id)}
                    className="chat-history-item w-full text-left"
                    title={s.preview}
                  >
                    {s.preview}
                  </button>
                </li>
              ))}

              {!sessions.length && (
                <li className="px-3 py-2 text-xs text-slate-400">
                  No history yet
                </li>
              )}
            </ul>
          </aside>
        )}

        <article className="chat-window">
          <section className="chat-messages">
            {!messages.length && (
              <div className="chat-empty">
                <span className="text-4xl">🧠</span>

                <p className="mt-4 text-lg font-medium">
                  Start a conversation with {selectedPersona?.name || PERSONALITY_NAME}
                </p>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Ask anything and keep each persona conversation separate.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <article
                key={i}
                className={`chat-bubble-row ${
                  msg.role === 'user' ? 'chat-bubble-row--user' : ''
                }`}
              >
                {msg.role === 'assistant' && (
                  <span className="chat-avatar">🧠</span>
                )}

                <div
                  className={`chat-bubble ${
                    msg.role === 'user'
                      ? 'chat-bubble--user'
                      : 'chat-bubble--assistant'
                  }`}
                >
                  {msg.content}
                </div>
              </article>
            ))}

            {loading && <TypingIndicator name={selectedPersona?.name || PERSONALITY_NAME} />}

            {error && (
              <p className="alert alert--error" role="alert">
                {error}
              </p>
            )}

            <span ref={endRef} />
          </section>

          <form onSubmit={handleSend} className="chat-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Message ${selectedPersona?.name || PERSONALITY_NAME}...`}
              disabled={loading || personasLoading || !selectedPersonaId}
              className="chat-input"
            />

            <button
              type="submit"
              disabled={loading || personasLoading || !selectedPersonaId || !input.trim()}
              className="btn-primary"
            >
              Send
            </button>
          </form>
        </article>
      </section>
    </section>
  )
}
