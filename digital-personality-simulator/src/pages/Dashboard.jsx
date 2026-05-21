import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { PersonalitiesList } from '../components/PersonalitiesList'
import { ChatPanel } from '../components/ChatPanel'
import { personalityAPI } from '../services/api'
import '../styles/dashboard.css'

export const Dashboard = () => {
  const navigate = useNavigate()
  const [personalities, setPersonalities] = useState([])
  const [selectedPersonality, setSelectedPersonality] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadPersonalities()
  }, [])

  const loadPersonalities = async () => {
    try {
      setIsLoading(true)
      const response = await personalityAPI.getAll()
      setPersonalities(response.data || [])
      setError('')
    } catch (err) {
      console.error('Failed to load personalities:', err)
      setError('Failed to load personalities')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectPersonality = (personality) => {
    setSelectedPersonality(personality)
  }

  const handleDeletePersonality = async (id) => {
    try {
      await personalityAPI.delete(id)
      setPersonalities((prev) => prev.filter((p) => p.id !== id))
      if (selectedPersonality?.id === id) {
        setSelectedPersonality(null)
      }
    } catch (err) {
      console.error('Failed to delete personality:', err)
      setError('Failed to delete personality')
    }
  }

  const handleCreateNew = () => {
    navigate('/create-personality')
  }

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Left Panel - Personalities List */}
        <div className="personalities-panel">
          {isLoading ? (
            <div className="loading-state">
              <p>⏳ Loading personalities...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>⚠️ {error}</p>
              <button onClick={loadPersonalities} className="btn-retry">
                Retry
              </button>
            </div>
          ) : (
            <PersonalitiesList
              personalities={personalities}
              selectedId={selectedPersonality?.id}
              onSelect={handleSelectPersonality}
              onDelete={handleDeletePersonality}
              onCreateNew={handleCreateNew}
            />
          )}
        </div>

        {/* Right Panel - Chat */}
        <div className="chat-section">
          <ChatPanel personality={selectedPersonality} />
        </div>
      </div>
    </div>
  )
}
