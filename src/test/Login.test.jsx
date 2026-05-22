import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Login } from '../pages/Login'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'
import { LanguageProvider } from '../context/LanguageContext'

vi.mock('../api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getProfile: vi.fn(),
  },
}))

import { authApi } from '../api/authApi'

function renderLogin() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    authApi.getProfile.mockRejectedValue(new Error('no session'))
  })

  it('renders email and password fields', () => {
    renderLogin()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation when fields are empty', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/required/i)
  })

  it('calls login API on submit', async () => {
    authApi.login.mockResolvedValue({
      data: { token: 'jwt-123', user: { name: 'Test', email: 'a@b.com', role: 'admin' } },
    })
    authApi.getProfile.mockResolvedValue({
      data: { name: 'Test', email: 'a@b.com', role: 'admin' },
    })

    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })
})
