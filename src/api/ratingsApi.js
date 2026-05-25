import { http } from './http'

export const ratingsApi = {
  getAll() {
    return http.get('/ratings/')
  },

  createUserRating({ userId, workspaceId, score }) {
    return http.post('/ratings/', {
      user_id: userId,
      workspace_id: workspaceId,
      score,
    })
  },
}
