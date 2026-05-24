import { http } from './http'

export const aiApi = {
  chat: (message, options = {}) =>
    http.post('/chat/generate', {
      persona_id: options.personaId || 1,
      conversation_id: options.conversationId || 1,
      message,
      ...(options.model ? { model: options.model } : {}),
    }),
}