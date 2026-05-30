import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../api/http', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import { http } from '../api/http'
import { clientsApi } from '../api/clientsApi'

describe('clientsApi.create', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds client payload with username from email', async () => {
    http.post.mockResolvedValueOnce({ data: { id: 1 } })

    await clientsApi.create({
      name: 'Lola',
      email: 'lola@gmail.com',
      password: 'pass12345',
      workspaceId: 1,
    })

    expect(http.post).toHaveBeenCalledWith('/clients/', {
      name: 'Lola',
      full_name: 'Lola',
      username: 'lola',
      email: 'lola@gmail.com',
      password: 'pass12345',
      workspace_id: 1,
      role_id: 3,
      role: 'client',
      role_name: 'client',
    })
  })

  it('falls back to /users/ when /clients/ is unsupported', async () => {
    http.post
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockResolvedValueOnce({ data: { id: 2 } })

    await clientsApi.create({
      name: 'Andrea',
      email: 'andrea@gmail.com',
      password: 'pass12345',
      workspaceId: 1,
    })

    expect(http.post).toHaveBeenNthCalledWith(1, '/clients/', expect.any(Object))
    expect(http.post).toHaveBeenNthCalledWith(2, '/users/', expect.any(Object))
  })
})

describe('clientsApi.getAll', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('maps role_id to normalized role labels', async () => {
    http.get
      .mockResolvedValueOnce({
        data: [
          { id: 10, full_name: 'Emp', email: 'e@test.com', role_id: 1 },
          { id: 20, full_name: 'Admin', email: 'a@test.com', role_id: 2 },
          { id: 30, full_name: 'Client', email: 'c@test.com', role_id: 3 },
        ],
      })
      .mockResolvedValueOnce({ data: [] })

    const { data } = await clientsApi.getAll()

    expect(data.find((x) => x.id === 10)?.role).toBe('employee')
    expect(data.find((x) => x.id === 20)?.role).toBe('admin')
    expect(data.find((x) => x.id === 30)?.role).toBe('client')
  })
})

