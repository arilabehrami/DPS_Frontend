import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { personalityAPI } from '../services/api'
import '../style.css'

export const CreatePersonality = () => {
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    communication_style: '',
    personality_traits: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    if (!formData.profession.trim()) {
      setError('Profession is required')
      return false
    }
    if (!formData.communication_style.trim()) {
      setError('Communication style is required')
      return false
    }
    if (!formData.personality_traits.trim()) {
      setError('Personality traits are required')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await personalityAPI.create(formData)
      navigate('/dashboard')
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create personality'
      setError(errorMessage)
      console.error('Failed to create personality:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-personality-container">
      <div className="create-form-card">
        <h1>Create New Personality</h1>
        <p className="form-subtitle">Define the characteristics of your AI personality</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="personality-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Tech Expert Sarah"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="profession">Profession *</label>
            <input
              id="profession"
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleInputChange}
              placeholder="e.g., Software Engineer, Therapist, Teacher"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="communication_style">Communication Style *</label>
            <select
              id="communication_style"
              name="communication_style"
              value={formData.communication_style}
              onChange={handleInputChange}
              disabled={loading}
              required
            >
              <option value="">Select a communication style</option>
              <option value="formal">Formal & Professional</option>
              <option value="casual">Casual & Friendly</option>
              <option value="technical">Technical & Detailed</option>
              <option value="empathetic">Empathetic & Supportive</option>
              <option value="humorous">Humorous & Witty</option>
              <option value="analytical">Analytical & Logical</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="personality_traits">Personality Traits *</label>
            <textarea
              id="personality_traits"
              name="personality_traits"
              value={formData.personality_traits}
              onChange={handleInputChange}
              placeholder="Describe the key personality traits (e.g., patient, enthusiastic, knowledgeable)"
              disabled={loading}
              rows="5"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Creating...' : 'Create Personality'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            disabled={loading}
            className="cancel-button"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  )
}
