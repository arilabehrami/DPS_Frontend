import React from 'react'
import '../style.css'

export const MessageBubble = ({ message, isUser }) => {
  return (
    <div className={`message-bubble ${isUser ? 'user' : 'ai'}`}>
      <div className={`message-content ${isUser ? 'user-content' : 'ai-content'}`}>
        {message}
      </div>
    </div>
  )
}
