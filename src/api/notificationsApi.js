import { http } from './http'

export const notificationsApi = {
  getAll: ({ page = 1, pageSize = 20 } = {}) =>
    http.get('/notifications', { params: { page, page_size: pageSize } }),
  markAsRead: (id) => http.put(`/notifications/${id}`, { is_read: true }),
  markAllAsRead: () => http.patch('/notifications/read-all'),
  delete: (id) => http.delete(`/notifications/${id}`),
}
