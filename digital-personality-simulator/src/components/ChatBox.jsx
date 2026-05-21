import React, { useState, useRef, useEffect } from 'react'
import { chatAPI } from '../services/api'
import { MessageBubble } from './MessageBubble'
import '../style.css'

export const ChatBox = ({ personalityId, personalityName }) => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchChatHistory()
  }, [personalityId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChatHistory = async () => {
    try {
      const response = await chatAPI.getChatHistory(personalityId)
      setMessages(response.data.messages || [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch chat history:', err)
      setError('Failed to load chat history')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!inputValue.trim()) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setError(null)

    // Add user message to UI
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage, timestamp: new Date() },
    ])

    setLoading(true)

    try {
      const response = await chatAPI.sendMessage(personalityId, userMessage)
      const aiMessage = response.data.response || response.data.message

      // Add AI response to UI
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: aiMessage, timestamp: new Date() },
      ])
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send message'
      setError(errorMessage)
      console.error('Failed to send message:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear chat history?')) return

    try {
      await chatAPI.clearHistory(personalityId)
      setMessages([])
      setError(null)
    } catch (err) {
      setError('Failed to clear history')
      console.error('Failed to clear history:', err)
    }
  }

  return (
    <div className="chatbox-container">
      <div className="chat-header">
        <h2>{personalityName}</h2>
        <button
          onClick={handleClearHistory}
          className="clear-button"
          disabled={messages.length === 0 || loading}
        >
          Clear History
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Start a conversation with {personalityName}!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble
              key={index}
              message={msg.content}
              isUser={msg.role === 'user'}
            />
          ))
        )}

        {loading && (
          <div className="loading-indicator">
            <p>🤖 {personalityName} is typing...</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          rows="3"
          className="chat-input"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="send-button"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
