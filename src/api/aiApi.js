import { http } from './http'

export const aiApi = {
  chat: (message, history = []) =>
    http.post('/api/ai/chat', { message, history }),
}
