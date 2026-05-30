import { useCallback, useEffect, useMemo, useState } from 'react'
import { clientsApi } from '../api/clientsApi'
import { getErrorMessage } from '../api/axios'
import { Loader } from '../components/Loader'
import { Modal } from '../components/Modal'
import { Table } from '../components/Table'
import { useAuth } from '../hooks/useAuth'
import { ROLES } from '../utils/constants'

function formatRole(role) {
  if (role === 'admin') return 'Administrator'
  if (role === 'employ') return 'Employ'
  if (role === 'user') return 'User'
  if (role === 'client') return 'Client'
  return role || 'Client'
}

function renderAvgRate(row) {
  const last = row?.lastRate ?? row?.last_rating ?? row?.last_rate
  const avg = row?.avgRate ?? row?.avg_rating
  const count = Number(row?.ratingsCount ?? row?.ratings_count ?? 0)
  const value = avg ?? last

  if (value == null || count === 0) return 'No ratings yet'

  const filled = Math.round(Number(value) || 0)
  const stars = [1, 2, 3, 4, 5].map((i) => (
    <span key={i} style={{ color: i <= filled ? '#f5b301' : '#d1d5db' }}>
      *
    </span>
  ))

  return (
    <div className="flex items-center gap-2">
      <span>{Number(value).toFixed(1)}/5</span>
      <span className="tracking-tight">{stars}</span>
      <span className="text-xs text-slate-500">({count} votes)</span>
    </div>
  )
}

function isSameUser(left, right) {
  return left != null && right != null && String(left) === String(right)
}

function isPrimaryAdmin(row) {
  const email = row?.email?.toLowerCase?.() || ''
  const username = row?.username?.toLowerCase?.() || ''
  const fullName = (row?.full_name || row?.name || '').toLowerCase()
  const role = String(row?.role || '').toLowerCase()

  return (
    row?.is_super_admin === true ||
    (row?.is_admin === true && role === 'admin') ||
    username === 'admin' ||
    fullName === 'admin user' ||
    email === 'admin@dps.com' ||
    email === 'bahrieveseli1@gmail.com'
  )
}

function isAdminOrEmployeeRole(role, roleId) {
  const normalized = String(role || '').toLowerCase()
  return normalized === 'admin' || normalized === 'employ' || normalized === 'employee' || Number(roleId) === 1 || Number(roleId) === 2
}

function isEmployeeRole(role, roleId) {
  const normalized = String(role || '').toLowerCase()
  return normalized === 'employee' || normalized === 'employ' || Number(roleId) === 1
}

function isClientRole(role, roleId) {
  const normalized = String(role || '').toLowerCase()
  return normalized === 'client' || Number(roleId) === 3
}

export function Clients() {
  const { user, role, canManageUsers } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updatingRoleId, setUpdatingRoleId] = useState(null)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [formError, setFormError] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [verifySuccess, setVerifySuccess] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showVerifyInvite, setShowVerifyInvite] = useState(false)
  const [verifyingInvite, setVerifyingInvite] = useState(false)
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [verifyForm, setVerifyForm] = useState({
    email: '',
    code: '',
  })

  useEffect(() => {
    if (!info) return undefined
    const timer = setTimeout(() => setInfo(''), 5000)
    return () => clearTimeout(timer)
  }, [info])

  useEffect(() => {
    if (!verifySuccess) return undefined
    const timer = setTimeout(() => setVerifySuccess(''), 5000)
    return () => clearTimeout(timer)
  }, [verifySuccess])

  const sessionKey = user?.email || user?.id || 'anonymous'
  const workspaceId = user?.workspace_id || user?.workspace?.id || 1
  const canManageClients = canManageUsers || role === ROLES.EMPLOYEE

  const loadClients = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await clientsApi.getAll()
      setClients(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load clients'))
      setClients([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setClients([])
    loadClients()
  }, [loadClients, sessionKey])

  const visibleClients = useMemo(() => {
    if (role === ROLES.EMPLOYEE) {
      return clients.filter((item) => {
        if (isSameUser(item.id, user?.id)) return false
        if (isAdminOrEmployeeRole(item.role, item.role_id)) return false
        return Number(item.role_id) === 3 || String(item.role || '').toLowerCase() === 'client'
      })
    }
    if (role === ROLES.ADMIN) {
      const ordered = [...clients]
      ordered.sort((a, b) => {
        const aSuper = isPrimaryAdmin(a)
        const bSuper = isPrimaryAdmin(b)
        if (aSuper && !bSuper) return -1
        if (!aSuper && bSuper) return 1
        return String(a.name || '').localeCompare(String(b.name || ''))
      })
      return ordered
    }
    return clients
  }, [clients, role, user?.id])

  const overallAvgLabel = useMemo(() => {
    const usersWithAvg = clients.filter((u) => (u.avgRate ?? u.avg_rating) != null)
    const totalCount = usersWithAvg.reduce(
      (acc, u) => acc + Number(u.ratingsCount ?? u.ratings_count ?? 0),
      0
    )
    const weighted = usersWithAvg.reduce((acc, u) => {
      const av = Number(u.avgRate ?? u.avg_rating ?? 0)
      const c = Number(u.ratingsCount ?? u.ratings_count ?? 0)
      return acc + av * c
    }, 0)
    if (!totalCount) return 'Overall avg: No ratings yet'
    return `Overall avg: ${(weighted / totalCount).toFixed(2)}/5`
  }, [clients])

  const columns = useMemo(() => {
    const baseColumns = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      {
        key: 'role',
        label: 'Role',
        render: (row) => formatRole(row.role),
      },
      {
        key: 'avg_rate',
        label: 'Avg rate',
        render: (row) => renderAvgRate(row),
      },
    ]

    if (!canManageClients) return baseColumns

    return [
      ...baseColumns,
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => (
          <div className="flex flex-wrap justify-end gap-2">
            {canManageUsers &&
              !isSameUser(row.id, user?.id) &&
              (Number(row.role_id) === 1 ||
                String(row.role || '').toLowerCase() === 'employee' ||
                String(row.role || '').toLowerCase() === 'employ' ||
                String(row.role || '').toLowerCase() === 'user') && (
              <button
                type="button"
                className="btn-secondary px-3 py-1.5 text-xs"
                onClick={() => handleRoleChange(row.id, 2)}
                disabled={updatingRoleId === row.id}
              >
                {updatingRoleId === row.id ? 'Updating...' : 'Make Admin'}
              </button>
            )}
            {canManageUsers &&
              role === ROLES.ADMIN &&
              !isSameUser(row.id, user?.id) &&
              !isEmployeeRole(row.role, row.role_id) &&
              !isClientRole(row.role, row.role_id) &&
              String(row.role || '').toLowerCase() !== 'user' &&
              !isPrimaryAdmin(row) && (
                <button
                  type="button"
                  className="btn-secondary px-3 py-1.5 text-xs"
                  onClick={() => handleMakeEmployee(row.id)}
                  disabled={updatingRoleId === row.id}
                >
                  {updatingRoleId === row.id ? 'Updating...' : 'Make Employ'}
                </button>
              )}
            {!isPrimaryAdmin(row) && (
              <button
                type="button"
                className="btn-secondary px-3 py-1.5 text-xs text-red-600"
                onClick={() => setDeleteTarget(row)}
              >
                Delete
              </button>
            )}
          </div>
        ),
      },
    ]
  }, [canManageClients, canManageUsers, role, updatingRoleId, user?.id])

  const handleAdd = async (e) => {
    e.preventDefault()
    setFormError('')
    setInfo('')
    setVerifyError('')
    setVerifySuccess('')
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError('Full name, email, and password are required')
      return
    }
    if (form.password !== form.confirmPassword) {
      setFormError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setFormError('Password must be at least 6 characters')
      return
    }

    setSaving(true)
    try {
      const { data } = await clientsApi.inviteEmployee({
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        workspaceId,
      })
      setForm({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
      setAddOpen(false)
      setInfo(data?.detail || 'Employee invitation sent. Account will be created after OTP verification.')
      setVerifyForm({ email: form.email.trim(), code: '' })
      setShowVerifyInvite(true)
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to send employee invitation'))
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyInvite = async (e) => {
    e.preventDefault()
    setVerifyError('')
    setVerifySuccess('')

    if (!verifyForm.email.trim() || verifyForm.code.trim().length !== 6) {
      setVerifyError('Please provide email and 6-digit code.')
      return
    }

    setVerifyingInvite(true)
    try {
      await clientsApi.verifyInviteOtp({
        email: verifyForm.email.trim(),
        code: verifyForm.code.trim(),
      })
      setVerifySuccess('Employee account created successfully')
      setVerifyForm({ email: '', code: '' })
      setShowVerifyInvite(false)
      await loadClients()
    } catch (err) {
      const status = err?.response?.status
      const detail = String(err?.response?.data?.detail || '').toLowerCase()
      if (status === 400 && detail.includes('invalid verification code')) {
        setVerifyError('Invalid verification code')
      } else if (status === 400 && detail.includes('expired')) {
        setVerifyError('Verification code expired')
      } else if (status === 404) {
        setVerifyError('No pending invite for this email')
      } else if (status === 429) {
        setVerifyError('Too many invalid attempts. Invite again.')
      } else {
        setVerifyError(getErrorMessage(err, 'Failed to verify invite code'))
      }
    } finally {
      setVerifyingInvite(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return

    setDeleting(true)
    setError('')
    try {
      await clientsApi.delete(deleteTarget.id)
      setDeleteTarget(null)
      await loadClients()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete client'))
    } finally {
      setDeleting(false)
    }
  }

  const handleRoleChange = async (id, roleId) => {
    setUpdatingRoleId(id)
    setError('')
    try {
      await clientsApi.updateRole(id, roleId)
      await loadClients()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update role'))
    } finally {
      setUpdatingRoleId(null)
    }
  }

  const handleMakeEmployee = async (id) => {
    setUpdatingRoleId(id)
    setError('')
    setInfo('')
    try {
      await clientsApi.makeEmployee(id)
      setInfo('User u bë employee me sukses.')
      await loadClients()
    } catch (err) {
      const status = err?.response?.status
      const detail = String(err?.response?.data?.detail || '').toLowerCase()
      if (status === 401) {
        window.location.href = '/login'
        return
      }
      if (status === 403) {
        setError('Nuk ke leje')
        return
      }
      if (status === 404) {
        setError('User s’u gjet.')
        return
      }
      if (status === 400 && detail.includes('employee role not found')) {
        setError('Employee role not found')
        return
      }
      setError(getErrorMessage(err, 'Failed to make employee'))
    } finally {
      setUpdatingRoleId(null)
    }
  }

  return (
    <section className="page space-y-6">
      <header className="page-header-row">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Managed client and employee entities</p>
          <p className="mt-1 text-sm text-slate-500">{overallAvgLabel}</p>
        </div>
        {canManageUsers && (
          <button type="button" className="btn-primary" onClick={() => setAddOpen(true)}>
            Invite employee
          </button>
        )}
      </header>

      {error && <p className="alert alert--error">{error}</p>}
      {info && <p className="alert alert--info">{info}</p>}
      {verifySuccess && <p className="alert alert--info">{verifySuccess}</p>}

      {canManageUsers && showVerifyInvite && (
        <article className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Verify invite code</h2>
          <p className="mt-1 text-sm text-slate-500">
            After OTP verification, employee account is created.
          </p>
          <form className="mt-4 space-y-4" onSubmit={handleVerifyInvite}>
            {verifyError && <p className="alert alert--error">{verifyError}</p>}
            <label className="form-label text-slate-700 dark:text-slate-300">
              Email
              <input
                type="email"
                className="input-field mt-1.5"
                value={verifyForm.email}
                onChange={(e) => setVerifyForm((current) => ({ ...current, email: e.target.value }))}
                disabled={verifyingInvite}
                required
              />
            </label>
            <label className="form-label text-slate-700 dark:text-slate-300">
              Code
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="input-field mt-1.5"
                value={verifyForm.code}
                onChange={(e) =>
                  setVerifyForm((current) => ({
                    ...current,
                    code: e.target.value.replace(/\D/g, '').slice(0, 6),
                  }))
                }
                disabled={verifyingInvite}
                required
              />
            </label>
            <button type="submit" className="btn-primary" disabled={verifyingInvite}>
              {verifyingInvite ? 'Verifying...' : 'Verify & Create Employee'}
            </button>
          </form>
        </article>
      )}

      {loading ? (
        <Loader label="Loading clients..." />
      ) : (
        <Table columns={columns} data={visibleClients} emptyMessage="No clients found" />
      )}

      <Modal
        open={addOpen}
        onClose={() => !saving && setAddOpen(false)}
        title="Invite employee"
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setAddOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" form="add-client-form" className="btn-primary" disabled={saving}>
              {saving ? 'Sending invitation...' : 'Send invite'}
            </button>
          </>
        }
      >
        <form id="add-client-form" onSubmit={handleAdd} className="space-y-4">
          {formError && <p className="alert alert--error">{formError}</p>}
          <label className="form-label text-slate-700 dark:text-slate-300">
            Full name
            <input
              type="text"
              className="input-field mt-1.5"
              value={form.name}
              onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
              disabled={saving}
              required
            />
          </label>
          <label className="form-label text-slate-700 dark:text-slate-300">
            Username
            <input
              type="text"
              className="input-field mt-1.5"
              value={form.username}
              onChange={(e) => setForm((current) => ({ ...current, username: e.target.value }))}
              disabled={saving}
            />
          </label>
          <label className="form-label text-slate-700 dark:text-slate-300">
            Email
            <input
              type="email"
              className="input-field mt-1.5"
              value={form.email}
              onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
              disabled={saving}
              required
            />
          </label>
          <label className="form-label text-slate-700 dark:text-slate-300">
            Password
            <input
              type="password"
              className="input-field mt-1.5"
              value={form.password}
              onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
              disabled={saving}
              required
            />
          </label>
          <label className="form-label text-slate-700 dark:text-slate-300">
            Confirm password
            <input
              type="password"
              className="input-field mt-1.5"
              value={form.confirmPassword}
              onChange={(e) => setForm((current) => ({ ...current, confirmPassword: e.target.value }))}
              disabled={saving}
              required
            />
          </label>
          <p className="text-xs text-slate-500">
            Invitation will be sent to email. Account is created only after OTP verification. Workspace: {workspaceId}
          </p>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Delete user?"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary bg-red-600 hover:bg-red-500"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Yes, delete'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
          {deleteTarget && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900/60">
              <p className="font-semibold text-slate-900 dark:text-white">
                {deleteTarget.name || 'Unnamed user'}
              </p>
              <p className="mt-1 text-slate-500">{deleteTarget.email}</p>
            </div>
          )}
        </div>
      </Modal>
    </section>
  )
}

