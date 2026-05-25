import { useCallback, useEffect, useMemo, useState } from 'react'
import { clientsApi } from '../api/clientsApi'
import { getErrorMessage } from '../api/axios'
import { Loader } from '../components/Loader'
import { Modal } from '../components/Modal'
import { Table } from '../components/Table'
import { useAuth } from '../hooks/useAuth'

function formatRole(role) {
  if (role === 'admin') return 'Administrator'
  if (role === 'user') return 'User'
  if (role === 'client') return 'Client'
  return role || 'Client'
}

export function Clients() {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleId: '',
  })

  const sessionKey = user?.email || user?.id || 'anonymous'
  const workspaceId = user?.workspace_id || user?.workspace?.id || 1

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

  const columns = useMemo(
    () => [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      {
        key: 'role',
        label: 'Role',
        render: (row) => formatRole(row.role),
      },
      {
        key: 'last_rate',
        label: 'Last rate',
        render: (row) => (row.last_rate ? `${row.last_rate}/5` : 'No rating yet'),
      },
      {
        key: 'actions',
        label: '',
        render: (row) => (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs text-red-600"
              onClick={() => handleDelete(row.id)}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  )

  const handleAdd = async (e) => {
    e.preventDefault()
    setFormError('')
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
      await clientsApi.create({
        name: form.name.trim(),
        username: (form.username.trim() || form.email.split('@')[0]).trim(),
        email: form.email.trim(),
        password: form.password,
        workspaceId,
        roleId: form.roleId,
      })
      setForm({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        roleId: '',
      })
      setAddOpen(false)
      await loadClients()
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to add client'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setError('')
    try {
      await clientsApi.delete(id)
      await loadClients()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete client'))
    }
  }

  return (
    <section className="page space-y-6">
      <header className="page-header-row">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">Managed client entities</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setAddOpen(true)}>
          Add client
        </button>
      </header>

      {error && <p className="alert alert--error">{error}</p>}

      {loading ? (
        <Loader label="Loading clients..." />
      ) : (
        <Table columns={columns} data={clients} emptyMessage="No clients found" />
      )}

      <Modal
        open={addOpen}
        onClose={() => !saving && setAddOpen(false)}
        title="Add client"
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setAddOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" form="add-client-form" className="btn-primary" disabled={saving}>
              {saving ? 'Adding...' : 'Add client'}
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
              placeholder="Auto-filled from email if empty"
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
          <label className="form-label text-slate-700 dark:text-slate-300">
            Client role ID
            <input
              type="number"
              min="1"
              className="input-field mt-1.5"
              value={form.roleId}
              onChange={(e) => setForm((current) => ({ ...current, roleId: e.target.value }))}
              placeholder="Optional if backend accepts role='client'"
              disabled={saving}
            />
          </label>
          <p className="text-xs text-slate-500">
            Client will be created with role client and workspace_id {workspaceId}.
          </p>
        </form>
      </Modal>
    </section>
  )
}
