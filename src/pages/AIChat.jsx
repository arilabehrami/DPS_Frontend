import { useEffect, useRef, useState } from 'react'
import { aiApi } from '../api/aiApi'
import { getErrorMessage } from '../api/axios'
import {
  CHAT_UPDATED_EVENT,
  NEW_CHAT_EVENT,
  clearActiveChat,
  getActiveMessages,
  getSessions,
  loadSession,
  saveActiveMessages,
} from '../services/chatService'
import { getSettings } from '../services/settingsService'
import { PERSONALITY_NAME } from '../utils/constants'

function TypingIndicator() {
  return (
    <article className="chat-typing" aria-live="polite">
      <span className="chat-typing-dots">
        <span />
        <span />
        <span />
      </span>
      {PERSONALITY_NAME} is typing...
    </article>
  )
}

export function AIChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [historyOpen, setHistoryOpen] = useState(true)
  const [sessions, setSessions] = useState(getSessions)
  const endRef = useRef(null)
  const settings = getSettings()

  const refreshFromStorage = () => {
    setMessages(getActiveMessages())
    setSessions(getSessions())
  }

  useEffect(() => {
    refreshFromStorage()

    const onUpdate = () => refreshFromStorage()
    const onNewChat = () => {
      setMessages([])
      setSessions(getSessions())
      setError('')
      setInput('')
    }

    window.addEventListener(CHAT_UPDATED_EVENT, onUpdate)
    window.addEventListener(NEW_CHAT_EVENT, onNewChat)
    return () => {
      window.removeEventListener(CHAT_UPDATED_EVENT, onUpdate)
      window.removeEventListener(NEW_CHAT_EVENT, onNewChat)
    }
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [messages, loading])

  const persist = (list) => {
    setMessages(list)
    saveActiveMessages(list)
    setSessions(getSessions())
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim(), ts: Date.now() }
    const next = [...messages, userMsg]
    persist(next)
    setInput('')
    setError('')
    setLoading(true)

    try {
      const history = settings.memoryEnabled
        ? messages.map((m) => ({ role: m.role, content: m.content }))
        : []
      const { data } = await aiApi.chat(userMsg.content, history)
      const reply =
        data.response || data.message || data.content || 'No response'
      persist([...next, { role: 'assistant', content: reply, ts: Date.now() }])
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to get AI response'))
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    clearActiveChat()
    setMessages([])
    setSessions(getSessions())
    setError('')
  }

  const handleOpenSession = (sessionId) => {
    loadSession(sessionId)
    refreshFromStorage()
  }

  return (
    <section className="chat-page">
      <header className="chat-header">
        <div>
          <h1 className="page-title">Chat with {PERSONALITY_NAME}</h1>
          <p className="page-subtitle">POST /api/ai/chat</p>
        </div>
        <div className="flex gap-2">
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
                <li className="px-3 py-2 text-xs text-slate-400">No history yet</li>
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
                  Start a conversation with {PERSONALITY_NAME}
                </p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Ask anything — your digital personality remembers context when memory is enabled.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <article
                key={i}
                className={`chat-bubble-row ${msg.role === 'user' ? 'chat-bubble-row--user' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <span className="chat-avatar">🧠</span>
                )}
                <div
                  className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble--user' : 'chat-bubble--assistant'}`}
                >
                  {msg.content}
                </div>
              </article>
            ))}
            {loading && <TypingIndicator />}
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
              placeholder={`Message ${PERSONALITY_NAME}...`}
              disabled={loading}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
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
