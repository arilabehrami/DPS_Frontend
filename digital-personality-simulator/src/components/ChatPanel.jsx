import React, { useState, useEffect, useRef } from 'react'
import { chatAPI } from '../services/api'
import '../styles/chat-panel.css'

export const ChatPanel = ({ personality }) => {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (personality) {
      loadChatHistory()
    }
  }, [personality])

  const loadChatHistory = async () => {
    try {
      const response = await chatAPI.getChatHistory(personality.id)
      setMessages(response.data || [])
      setError('')
    } catch (err) {
      console.error('Failed to load chat history:', err)
      setMessages([])
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!inputValue.trim()) return

    const userMessage = { text: inputValue, sender: 'user' }
    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setError('')

    try {
      const response = await chatAPI.sendMessage(personality.id, inputValue)
      const aiMessage = { text: response.data.response, sender: 'ai' }
      setMessages((prev) => [...prev, aiMessage])
    } catch (err) {
      setError('Failed to get response from AI. Please try again.')
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!personality) {
    return (
      <div className="chat-panel empty">
        <div className="empty-state-chat">
          <p>👈 Select a personality to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-panel">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-personality">
          <span className="chat-avatar">🎭</span>
          <div className="chat-personality-info">
            <h3>{personality.name}</h3>
            <p>{personality.profession}</p>
          </div>
        </div>
        <button className="btn-info" title="More options">⋯</button>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="no-messages">
            <p>👋 Start a conversation with {personality.name}!</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <div className="message-avatar">
              {msg.sender === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <p>{msg.text}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message ai">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="message-error">
            <p>⚠️ {error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
          className="chat-input"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="btn-send"
          title="Send message"
        >
          {isLoading ? '⏳' : '➤'}
        </button>
      </form>
    </div>
  )
}
