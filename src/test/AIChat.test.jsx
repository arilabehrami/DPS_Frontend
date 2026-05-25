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

    const input = await screen.findByPlaceholderText('Message Demo persona...')
    await user.type(input, 'Hello')
    await user.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() => {
      expect(aiApi.chat).toHaveBeenCalledWith(
        'Hello',
        expect.objectContaining({ personaId: 7, language: 'en' })
      )
    })

    expect(await screen.findByText('Hello from assistant')).toBeInTheDocument()
  })

  it('shows only the selected persona history', async () => {
    const user = userEvent.setup()
    employeesApi.getAll.mockResolvedValue({
      data: [
        { id: 1, name: 'Aura' },
        { id: 2, name: 'Lea' },
      ],
    })
    aiApi.chat
      .mockResolvedValueOnce({ data: { response: 'Aura reply' } })
      .mockResolvedValueOnce({ data: { response: 'Lea reply' } })

    render(
      <MemoryRouter>
        <ThemeProvider>
          <LanguageProvider>
            <AIChat />
          </LanguageProvider>
        </ThemeProvider>
      </MemoryRouter>
    )

    const input = await screen.findByPlaceholderText('Message Aura...')
    await user.type(input, 'hi aura')
    await user.click(screen.getByRole('button', { name: /send/i }))
    expect(await screen.findByText('Aura reply')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'hi aura' })).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Choose persona'), '2')
    await screen.findByPlaceholderText('Message Lea...')
    expect(screen.queryByRole('button', { name: 'hi aura' })).not.toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('Message Lea...'), 'hi lea')
    await user.click(screen.getByRole('button', { name: /send/i }))
    expect(await screen.findByText('Lea reply')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'hi lea' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'hi aura' })).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Choose persona'), '1')
    expect(await screen.findByRole('button', { name: 'hi aura' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'hi lea' })).not.toBeInTheDocument()
  })
})
