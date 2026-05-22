import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'
import { LanguageProvider } from '../context/LanguageContext'
import { TOKEN_KEY, USER_KEY } from '../api/axios'

vi.mock('../api/authApi', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getProfile: vi.fn(),
  },
}))

import { authApi } from '../api/authApi'

function renderProtected(initialPath = '/protected') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ThemeProvider>
        <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-only"
              element={
                <ProtectedRoute roles={['admin']}>
                  <div>Admin Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects unauthenticated users to login', async () => {
    renderProtected()
    expect(await screen.findByText('Login Page')).toBeInTheDocument()
  })

  it('renders children when authenticated', async () => {
    const user = { name: 'User', email: 'u@test.com', role: 'employee' }
    localStorage.setItem(TOKEN_KEY, 'token')
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    authApi.getProfile.mockResolvedValue({ data: user })
    renderProtected()
    expect(await screen.findByText('Protected Content')).toBeInTheDocument()
  })
})
