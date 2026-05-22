import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Search } from '../pages/Search'
import { ThemeProvider } from '../context/ThemeContext'
import { LanguageProvider } from '../context/LanguageContext'

vi.mock('../api/employeesApi', () => ({
  employeesApi: {
    getAll: vi.fn(),
  },
}))

import { employeesApi } from '../api/employeesApi'

describe('Search page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    employeesApi.getAll.mockResolvedValue({
      data: { items: [], total: 0 },
    })
  })

  it('renders search input and filters', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <LanguageProvider>
            <Search />
          </LanguageProvider>
        </ThemeProvider>
      </MemoryRouter>
    )
    expect(screen.getByLabelText(/search/i)).toBeInTheDocument()
    expect(screen.getByText(/style/i)).toBeInTheDocument()
    expect(screen.getByText(/reset filters/i)).toBeInTheDocument()
  })

  it('calls API with debounced search', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ThemeProvider>
          <LanguageProvider>
            <Search />
          </LanguageProvider>
        </ThemeProvider>
      </MemoryRouter>
    )

    await user.type(screen.getByLabelText(/search/i), 'john')

    await waitFor(
      () => {
        expect(employeesApi.getAll).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'john' })
        )
      },
      { timeout: 800 }
    )
  })
})
