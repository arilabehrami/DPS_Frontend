import { describe, expect, it, vi } from 'vitest'

vi.mock('../api/http', () => ({
  http: {
    post: vi.fn(),
  },
}))

import { http } from '../api/http'
import { authApi } from '../api/authApi'

describe('authApi.login', () => {
  it('uses email when identifier is email', async () => {
    http.post.mockResolvedValueOnce({ data: {} })
    await authApi.login('user@example.com', 'secret123')

    expect(http.post).toHaveBeenCalledWith('/auth/login', {
      email: 'user@example.com',
      username: undefined,
      identifier: 'user@example.com',
      password: 'secret123',
    })
  })

  it('uses username when identifier is username', async () => {
    http.post.mockResolvedValueOnce({ data: {} })
    await authApi.login('lola', 'secret123')

    expect(http.post).toHaveBeenCalledWith('/auth/login', {
      email: undefined,
      username: 'lola',
      identifier: 'lola',
      password: 'secret123',
    })
  })
})

describe('authApi.register payload sanitization', () => {
  it('removes workspace_id from /auth/register payload', async () => {
    http.post.mockResolvedValueOnce({ data: {} })
    await authApi.register({
      full_name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'secret123',
      workspace_id: 99,
    })

    expect(http.post).toHaveBeenCalledWith('/auth/register', {
      full_name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'secret123',
    })
  })

  it('removes workspace_id from /auth/request-otp payload', async () => {
    http.post.mockResolvedValueOnce({ data: {} })
    await authApi.requestRegisterOtp({
      full_name: 'OTP User',
      username: 'otpuser',
      email: 'otp@example.com',
      password: 'secret123',
      workspace_id: 7,
    })

    expect(http.post).toHaveBeenCalledWith('/auth/request-otp', {
      full_name: 'OTP User',
      username: 'otpuser',
      email: 'otp@example.com',
      password: 'secret123',
    })
  })
})
