import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { personalityAPI } from '../services/api'
import { ChatBox } from '../components/ChatBox'
import '../style.css'

export const ChatPage = () => {
  const { personalityId } = useParams()
  const [personality, setPersonality] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPersonality()
  }, [personalityId])

  const fetchPersonality = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await personalityAPI.getById(personalityId)
      setPersonality(response.data.personality || response.data)
    } catch (err) {
      setError('Failed to load personality')
      console.error('Failed to fetch personality:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="chat-page-loading">
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="chat-page-error">
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="back-button">
          Back to Dashboard
        </button>
      </div>
    )
  }

  if (!personality) {
    return (
      <div className="chat-page-error">
        <p>Personality not found</p>
        <button onClick={() => navigate('/dashboard')} className="back-button">
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="chat-page">
      <ChatBox
        personalityId={personalityId}
        personalityName={personality.name}
      />
    </div>
  )
}
