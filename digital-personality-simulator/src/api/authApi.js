import { apiClient } from './axios'
import { isMockMode } from '../mocks/config'
import { mockAuthApi } from '../mocks/mockApi'

export const authApi = {
  login: (email, password) =>
    isMockMode
      ? mockAuthApi.login(email, password)
      : apiClient.post('/api/login', { email, password }),
  register: (payload) =>
    isMockMode
      ? mockAuthApi.register(payload)
      : apiClient.post('/api/register', payload),
  getProfile: () =>
    isMockMode ? mockAuthApi.getProfile() : apiClient.get('/api/profile'),
}
