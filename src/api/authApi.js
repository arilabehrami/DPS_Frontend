import { http } from './http'

const sanitizePublicRegisterPayload = (payload = {}) => {
  const { workspace_id, ...rest } = payload
  return rest
}

export const authApi = {
  login: (identifier, password) => {
    const trimmed = identifier.trim()
    const isEmail = trimmed.includes('@')

    return http.post('/auth/login', {
      email: isEmail ? trimmed : undefined,
      username: isEmail ? undefined : trimmed,
      identifier: trimmed,
      password,
    })
  },

  register: (payload) => http.post('/auth/register', sanitizePublicRegisterPayload(payload)),
  requestRegisterOtp: (payload) => http.post('/auth/request-otp', sanitizePublicRegisterPayload(payload)),
  verifyRegisterOtp: (email, code) => http.post('/auth/verify-otp', { email, code }),
  requestForgotPasswordOtp: (email) => http.post('/auth/forgot-password/request-otp', { email }),
  verifyForgotPasswordOtp: (email, code) => http.post('/auth/forgot-password/verify-otp', { email, code }),
  resetForgotPassword: (resetToken, newPassword) =>
    http.post('/auth/forgot-password/reset', {
      reset_token: resetToken,
      new_password: newPassword,
    }),
  requestChangePasswordOtp: () => http.post('/auth/change-password/request-otp'),
  confirmChangePassword: ({ code, current_password, new_password }) =>
    http.post('/auth/change-password/confirm', { code, current_password, new_password }),

  getProfile: () => http.get('/auth/me'),
  deleteCurrentUser: (userId) =>
    http.delete('/users/me').catch((error) => {
      if (![404, 405].includes(error?.response?.status)) throw error
      if (!userId) throw error
      return http.delete(`/users/${userId}`)
    }),
}
