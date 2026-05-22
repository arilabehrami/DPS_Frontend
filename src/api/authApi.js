import { http } from './http'

export const authApi = {
  login: (email, password) => http.post('/api/login', { email, password }),

  register: (payload) => http.post('/api/register', payload),

  getProfile: () => http.get('/api/profile'),
}
