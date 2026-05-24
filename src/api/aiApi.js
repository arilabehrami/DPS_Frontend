import { http } from './http'

export const aiApi = {
  chat: (message, history = []) =>
    http.post('/openai/chat', { message, history }),
}
