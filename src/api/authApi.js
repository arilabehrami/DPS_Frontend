import { http } from './http'

export const authApi = {
  login: (email, password) => http.post('/auth/login', { email, password }),

  register: (payload) => http.post('/auth/register', payload),

  getProfile: () => http.get('/auth/me'),
}
