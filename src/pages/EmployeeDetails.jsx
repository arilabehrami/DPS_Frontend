import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { employeesApi } from '../api/employeesApi'
import { getErrorMessage } from '../api/axios'
import { Loader } from '../components/Loader'
import { Modal } from '../components/Modal'
import { useAuth } from '../hooks/useAuth'

export function EmployeeDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [persona, setPersona] = useState(null)
  const [form, setForm] = useState({ name: '', description: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const { canEdit, isGuest, user } = useAuth()
  const userId = user?.id || user?.user_id

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await employeesApi.getById(id)
        if (data.user_id && userId && String(data.user_id) !== String(userId)) {
          setError('Persona not found')
          setPersona(null)
          return
        }
        setPersona(data)
        setForm({
          name: data.name || '',
          description: data.description || '',
        })
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load persona'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, userId])

  const handleUpdate = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!form.name.trim()) {
      setFormError('Persona name is required')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...persona,
        name: form.name.trim(),
        description: form.description.trim(),
        user_id: persona.user_id || userId,
      }
      const { data } = await employeesApi.update(id, payload)
      setPersona(data)
      setEditOpen(false)
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to update persona'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    setError('')
    try {
      await employeesApi.delete(id)
      navigate('/employees', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete persona'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader label="Loading persona..." />
  if (error) {
    return (
      <section className="page">
        <p className="alert alert--error">{error}</p>
        <Link to="/employees" className="btn-secondary mt-4 inline-flex">
          Back to registry
        </Link>
      </section>
    )
  }

  if (!persona) return null

  return (
    <section className="page max-w-2xl space-y-6">
      <header>
        <Link to="/employees" className="text-sm text-violet-500 hover:text-violet-400">
          Back to persona registry
        </Link>
        <h1 className="page-title mt-2">{persona.name}</h1>
      </header>

      <article className="card p-6 space-y-4">
        <DetailRow label="Description" value={persona.description} />
      </article>

      {canEdit && !isGuest && (
        <div className="flex gap-3">
          <button type="button" className="btn-primary" onClick={() => setEditOpen(true)}>
            Edit persona
          </button>
          <button type="button" className="btn-secondary text-red-600" onClick={handleDelete} disabled={saving}>
            Delete
          </button>
        </div>
      )}

      <Modal
        open={editOpen}
        onClose={() => !saving && setEditOpen(false)}
        title="Edit persona"
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" form="edit-persona-form" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </>
        }
      >
        <form id="edit-persona-form" onSubmit={handleUpdate} className="space-y-4">
          {formError && <p className="alert alert--error">{formError}</p>}
          <label className="form-label text-slate-700 dark:text-slate-300">
            Name
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
            Description
            <textarea
              className="input-field mt-1.5 min-h-28 resize-y"
              value={form.description}
              onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
              disabled={saving}
            />
          </label>
        </form>
      </Modal>
    </section>
  )
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-slate-800 dark:text-slate-100">{value || '-'}</p>
    </div>
  )
}
