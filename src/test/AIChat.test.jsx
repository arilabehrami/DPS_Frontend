import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AIChat } from '../pages/AIChat'
import { ThemeProvider } from '../context/ThemeContext'
import { LanguageProvider } from '../context/LanguageContext'

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 99, name: 'Tester', email: 'tester@test.com', role: 'employee', role_id: 1 },
  }),
}))

vi.mock('../api/aiApi', () => ({
  aiApi: {
    chat: vi.fn(),
  },
}))

vi.mock('../api/employeesApi', () => ({
  employeesApi: {
    getAll: vi.fn(),
  },
}))

import { aiApi } from '../api/aiApi'
import { employeesApi } from '../api/employeesApi'

describe('AIChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    aiApi.chat.mockResolvedValue({
      data: { response: 'Hello from assistant' },
    })
    employeesApi.getAll.mockResolvedValue({
      data: [{ id: 7, name: 'Demo persona', user_id: 99 }],
    })
  })

  it('renders chat input and send button', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <LanguageProvider>
            <AIChat />
          </LanguageProvider>
        </ThemeProvider>
      </MemoryRouter>
    )
    expect(screen.getByPlaceholderText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

})
