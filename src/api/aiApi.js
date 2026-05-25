import { http } from './http'

export const aiApi = {
  chat: (message, options = {}) =>
    http.post('/chat/generate', {
      persona_id: options.personaId || 1,
      ...(options.conversationId ? { conversation_id: options.conversationId } : {}),
      message,
      ...(options.model ? { model: options.model } : {}),
    }),
}
