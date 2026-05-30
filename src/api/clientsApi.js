import { http } from './http'

function listFrom(data) {
  const list = data?.items || data?.results || data?.clients || data?.users || data?.data || data
  return Array.isArray(list) ? list : []
}

function isUnsupported(error) {
  return [404, 405].includes(error?.response?.status)
}

function normalizeRole(user) {
  if (Number(user?.role_id) === 1) return 'employee'
  if (Number(user?.role_id) === 2) return 'admin'
  if (Number(user?.role_id) === 3) return 'client'

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
    role_id: client.role_id,
    avg_rating: client.avgRate ?? client.avg_rating ?? null,
    ratings_count: client.ratingsCount ?? client.ratings_count ?? 0,
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

function withRatingStats(users, ratings) {
  return users.map((item) => {
    const userRatings = ratings
      .filter((rating) => String(rating.user_id || rating.user?.id) === String(item.id))
      .sort((a, b) => {
        const aTime = new Date(a.created_at || a.updated_at || a.timestamp || 0).getTime()
        const bTime = new Date(b.created_at || b.updated_at || b.timestamp || 0).getTime()
        return bTime - aTime
      })

    const last = userRatings[0]
    const numericScores = userRatings
      .map((rating) => Number(rating.score ?? rating.rating))
      .filter((score) => Number.isFinite(score))
    const ratingsCount = numericScores.length
    const avgRating = ratingsCount
      ? numericScores.reduce((acc, score) => acc + score, 0) / ratingsCount
      : null

    return {
      ...item,
      avg_rating: item.avg_rating ?? avgRating,
      ratings_count: Number(item.ratings_count || 0) || ratingsCount,
      avgRate: item.avgRate ?? item.avg_rating ?? avgRating,
      ratingsCount: Number(item.ratingsCount || 0) || ratingsCount,
      lastRate: item.lastRate ?? item.last_rate ?? last?.score ?? last?.rating ?? null,
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
    return { data: withRatingStats(clients, ratings) }
  },

  async inviteEmployee({ name, username, email, password, workspaceId }) {
    const payload = {
      name,
      full_name: name,
      username: username?.trim() || String(email || '').split('@')[0],
      email,
      password,
      workspace_id: workspaceId,
      role_id: 1,
      role: 'employee',
      role_name: 'employee',
    }

    return http.post('/users/', payload)
  },

  verifyInviteOtp({ email, code }) {
    return http.post('/users/verify-invite-otp', { email, code })
  },

  async delete(id) {
    try {
      return await http.delete(`/clients/${id}`)
    } catch (error) {
      if (!isUnsupported(error)) throw error
      return http.delete(`/users/${id}`)
    }
  },

  updateRole(id, roleId) {
    return http.put(`/users/${id}`, { role_id: roleId })
  },

  makeEmployee(id) {
    return http.patch(`/users/${id}/make-employee`)
  },
}
