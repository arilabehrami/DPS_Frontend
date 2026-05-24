import { http } from './http'

export const employeesApi = {
  getAll: (params) => http.get('/personas/', { params }),

  getById: (id) => http.get(`/personas/${id}`),

  create: (data) => http.post('/personas/', data),

  update: (id, data) => http.put(`/personas/${id}`, data),

  delete: (id) => http.delete(`/personas/${id}`),
}