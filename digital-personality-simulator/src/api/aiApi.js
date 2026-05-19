import { apiClient } from './axios'
import { isMockMode } from '../mocks/config'
import { mockAiApi } from '../mocks/mockApi'

export const aiApi = {
  chat: (message, history = []) =>
    isMockMode
      ? mockAiApi.chat(message, history)
      : apiClient.post('/api/ai/chat', { message, history }),
  getHistory: () => apiClient.get('/api/ai/chat/history'),
}
