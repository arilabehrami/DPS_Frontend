import { http } from './http'

function listFrom(data) {
  const list = data?.items || data?.results || data?.users || data?.data || data
  return Array.isArray(list) ? list : []
}

function normalizeRoleName(user) {
  const roleName = String(user?.role_name || user?.role?.name || user?.role || '').toLowerCase()
  if (roleName) return roleName
  const roleId = Number(user?.role_id)
  if (roleId === 2) return 'admin'
  if (roleId === 1) return 'employee'
  if (roleId === 3) return 'client'
  return ''
}

function normalizeUser(user) {
  return {
    id: user?.id,
    full_name: user?.full_name || user?.name || user?.username || user?.email || `User ${user?.id ?? ''}`,
    email: user?.email || '',
    workspace_id: user?.workspace_id ?? user?.workspace?.id ?? null,
    role_name: normalizeRoleName(user),
  }
}

function normalizeInboxItem(item) {
  return {
    id: item?.id,
    sender_email:
      item?.sender_email ||
      item?.from_email ||
      item?.from ||
      item?.sender?.email ||
      '',
    subject: item?.subject || '(No subject)',
    content: item?.content || item?.body || item?.message || '',
    created_at: item?.created_at || item?.sent_at || item?.updated_at || null,
  }
}

export const messagesApi = {
  async getAllowedRecipients() {
    const { data } = await http.get('/users/allowed-recipients')
    return { data: listFrom(data).map(normalizeUser) }
  },

  sendEmail(payload, canSendEmail) {
    if (!canSendEmail) {
      throw new Error('Only super admin can send emails')
    }
    return http.post('/background-jobs/email/send', payload)
  },

  async getInbox() {
    const endpoints = [
      '/background-jobs/email/inbox',
      '/background-jobs/email/messages',
      '/emails/inbox',
      '/messages/inbox',
    ]
    let lastError = null
    for (const endpoint of endpoints) {
      try {
        const { data } = await http.get(endpoint)
        return { data: listFrom(data).map(normalizeInboxItem) }
      } catch (error) {
        lastError = error
        const status = error?.response?.status
        if (![404, 405].includes(status)) {
          throw error
        }
      }
    }
    throw lastError || new Error('Inbox endpoint not found')
  },

  async deleteInboxMessage(id) {
    const endpoints = [
      `/background-jobs/email/inbox/${id}`,
      `/background-jobs/email/messages/${id}`,
      `/emails/inbox/${id}`,
      `/messages/inbox/${id}`,
    ]
    let lastError = null
    for (const endpoint of endpoints) {
      try {
        return await http.delete(endpoint)
      } catch (error) {
        lastError = error
        const status = error?.response?.status
        if (![404, 405].includes(status)) {
          throw error
        }
      }
    }
    if (lastError?.response?.status === 404) {
      const error = new Error('Delete endpoint not found in backend')
      error.code = 'DELETE_ENDPOINT_NOT_FOUND'
      throw error
    }
    throw lastError || new Error('Delete inbox endpoint not found')
  },
}
