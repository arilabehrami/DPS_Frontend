import { http } from './http'

export const employeesApi = {
  getAll: (params) => http.get('/api/employees', { params }),

  getById: (id) => http.get(`/api/employees/${id}`),

  create: (data) => http.post('/api/employees', data),

  update: (id, data) => http.put(`/api/employees/${id}`, data),

  delete: (id) => http.delete(`/api/employees/${id}`),
}
