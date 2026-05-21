import axios from 'axios'

const MOCK_MODE = true // Set to false when backend is ready

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// Mock data
const mockUsers = {
  'test@example.com': { id: 1, email: 'test@example.com', username: 'testuser' },
}

const mockPersonalities = [
  {
    id: 1,
    name: 'Albert Einstein',
    profession: 'Physicist',
    communication_style: 'Academic, thoughtful',
    personality_traits: ['Curious', 'Brilliant', 'Humble'],
  },
  {
    id: 2,
    name: 'Sherlock Holmes',
    profession: 'Detective',
    communication_style: 'Sharp, analytical',
    personality_traits: ['Brilliant', 'Observant', 'Arrogant'],
  },
]

const mockChatResponses = [
  'That is an interesting observation.',
  'I must deduce from the evidence...',
  'Elementary, my dear Watson!',
  'Your question requires deeper analysis.',
  'Fascinating... let me think about this.',
]

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getRandomResponse = () => {
  return mockChatResponses[Math.floor(Math.random() * mockChatResponses.length)]
}

// Authentication endpoints
export const authAPI = {
  login: async (email, password) => {
    if (MOCK_MODE) {
      await delay(500)
      if (email && password) {
        const token = `mock-jwt-token-${Date.now()}`
        localStorage.setItem('token', token)
        return {
          data: {
            token,
            user: mockUsers[email] || { id: 1, email, username: email.split('@')[0] },
          },
        }
      }
      throw new Error('Invalid credentials')
    }
    return api.post('/auth/login', { email, password })
  },

  register: async (email, password, username) => {
    if (MOCK_MODE) {
      await delay(500)
      if (email && password && username) {
        mockUsers[email] = { id: Math.random(), email, username }
        const token = `mock-jwt-token-${Date.now()}`
        localStorage.setItem('token', token)
        return {
          data: {
            token,
            user: { id: Math.random(), email, username },
          },
        }
      }
      throw new Error('Registration failed')
    }
    return api.post('/auth/register', { email, password, username })
  },
}

// Personality endpoints
export const personalityAPI = {
  getAll: async (search = '', filters = {}) => {
    if (MOCK_MODE) {
      await delay(300)
      let results = [...mockPersonalities]
      if (search) {
        results = results.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        )
      }
      if (filters.profession) {
        results = results.filter((p) => p.profession === filters.profession)
      }
      return { data: results }
    }
    return api.get('/personalities', { params: { search, ...filters } })
  },

  getById: async (id) => {
    if (MOCK_MODE) {
      await delay(300)
      const personality = mockPersonalities.find((p) => p.id === parseInt(id))
      if (!personality) throw new Error('Personality not found')
      return { data: personality }
    }
    return api.get(`/personalities/${id}`)
  },

  create: async (personality) => {
    if (MOCK_MODE) {
      await delay(500)
      const newPersonality = {
        id: Math.max(...mockPersonalities.map((p) => p.id)) + 1,
        ...personality,
      }
      mockPersonalities.push(newPersonality)
      return { data: newPersonality }
    }
    return api.post('/personalities', personality)
  },

  update: async (id, personality) => {
    if (MOCK_MODE) {
      await delay(500)
      const index = mockPersonalities.findIndex((p) => p.id === parseInt(id))
      if (index === -1) throw new Error('Personality not found')
      mockPersonalities[index] = { ...mockPersonalities[index], ...personality }
      return { data: mockPersonalities[index] }
    }
    return api.put(`/personalities/${id}`, personality)
  },

  delete: async (id) => {
    if (MOCK_MODE) {
      await delay(300)
      const index = mockPersonalities.findIndex((p) => p.id === parseInt(id))
      if (index === -1) throw new Error('Personality not found')
      mockPersonalities.splice(index, 1)
      return { data: { success: true } }
    }
    return api.delete(`/personalities/${id}`)
  },
}

// Chat endpoints
export const chatAPI = {
  sendMessage: async (personalityId, message) => {
    if (MOCK_MODE) {
      await delay(800)
      return {
        data: {
          response: getRandomResponse(),
          personalityId,
        },
      }
    }
    return api.post(`/chat/${personalityId}`, { message })
  },

  getChatHistory: async (personalityId) => {
    if (MOCK_MODE) {
      await delay(300)
      return {
        data: {
          messages: [
            { role: 'user', content: 'Hello!' },
            { role: 'assistant', content: 'Greetings!' },
          ],
        },
      }
    }
    return api.get(`/chat/${personalityId}/history`)
  },

  clearHistory: async (personalityId) => {
    if (MOCK_MODE) {
      await delay(300)
      return { data: { success: true } }
    }
    return api.delete(`/chat/${personalityId}/history`)
  },
}

export default api
