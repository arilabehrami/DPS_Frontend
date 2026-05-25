import { http } from './http'

function listFrom(data) {
  const list = data?.items || data?.results || data?.clients || data?.users || data?.data || data
  return Array.isArray(list) ? list : []
}

function isUnsupported(error) {
  return [404, 405].includes(error?.response?.status)
}

function normalizeRole(user) {
  const rawRole =
    user?.role?.name ||
    user?.role_name ||
    user?.role ||
    user?.role_label

  if (rawRole) return String(rawRole).toLowerCase()

  const email = user?.email?.toLowerCase?.() || ''
  const name = (user?.name || user?.full_name || user?.username || '').toLowerCase()
  if (email.startsWith('admin@') || name.includes('admin')) return 'admin'

  return 'client'
}

function normalizeClient(client) {
  const role = normalizeRole(client)
  const lastRate =
    client.lastRate ??
    client.latestRating ??
    client.last_rate ??
    client.latest_rating ??
    client.rating ??
    null

  return {
    ...client,
    name: client.name || client.full_name || client.username || client.email || 'Unnamed client',
    email: client.email || '',
    role,
    last_rate: lastRate,
  }
}

function normalizeUsers(list) {
  return list.map(normalizeClient)
}

async function getRatings() {
  try {
    const { data } = await http.get('/ratings/')
    return listFrom(data)
  } catch {
    return []
  }
}

function withLastRates(users, ratings) {
  return users.map((item) => {
    const userRatings = ratings
      .filter((rating) => String(rating.user_id || rating.user?.id) === String(item.id))
      .sort((a, b) => {
        const aTime = new Date(a.created_at || a.updated_at || a.timestamp || 0).getTime()
        const bTime = new Date(b.created_at || b.updated_at || b.timestamp || 0).getTime()
        return bTime - aTime
      })

    const last = userRatings[0]
    return {
      ...item,
      last_rate: last?.score ?? last?.rating ?? item.last_rate ?? null,
    }
  })
}

export const clientsApi = {
  async getAll() {
    let clients
    try {
      const { data } = await http.get('/users/')
      clients = normalizeUsers(listFrom(data))
    } catch (error) {
      if (!isUnsupported(error)) throw error
      const { data } = await http.get('/clients/')
      clients = normalizeUsers(listFrom(data))
    }

    const ratings = await getRatings()
    return { data: withLastRates(clients, ratings) }
  },

  async create({ name, username, email, password, workspaceId, roleId }) {
    const payload = {
      name,
      full_name: name,
      username,
      email,
      password,
      workspace_id: workspaceId,
      role: 'client',
      role_name: 'client',
      ...(roleId ? { role_id: Number(roleId) } : {}),
    }

    try {
      return await http.post('/clients/', payload)
    } catch (error) {
      if (!isUnsupported(error)) throw error
      try {
        return await http.post('/users/', payload)
      } catch (usersError) {
        if (!isUnsupported(usersError)) throw usersError
        return http.post('/auth/register', payload)
      }
    }
  },

  async delete(id) {
    try {
      return await http.delete(`/clients/${id}`)
    } catch (error) {
      if (!isUnsupported(error)) throw error
      return http.delete(`/users/${id}`)
    }
  },

}
