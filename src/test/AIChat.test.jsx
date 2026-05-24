import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AIChat } from '../pages/AIChat'
import { ThemeProvider } from '../context/ThemeContext'
import { LanguageProvider } from '../context/LanguageContext'

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
      data: [{ id: 7, name: 'Demo persona' }],
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

  it('sends message and displays assistant response', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ThemeProvider>
          <LanguageProvider>
            <AIChat />
          </LanguageProvider>
        </ThemeProvider>
      </MemoryRouter>
    )

    await user.type(screen.getByPlaceholderText(/message/i), 'Hello')
    await user.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() => {
      expect(aiApi.chat).toHaveBeenCalledWith(
        'Hello',
        expect.objectContaining({ personaId: 7, conversationId: 1 })
      )
    })

    expect(await screen.findByText('Hello from assistant')).toBeInTheDocument()
  })
})
