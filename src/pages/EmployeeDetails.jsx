import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { employeesApi } from '../api/employeesApi'
import { getErrorMessage } from '../api/axios'
import { Loader } from '../components/Loader'
import { useAuth } from '../hooks/useAuth'
import { PERSONALITY_NAME } from '../utils/constants'

export function EmployeeDetails() {
  const { id } = useParams()
  const [persona, setPersona] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { canEdit, isGuest } = useAuth()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await employeesApi.getById(id)
        setPersona(data)
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load persona'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

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
          ← Back to persona registry
        </Link>
        <h1 className="page-title mt-2">{persona.name}</h1>
        <p className="page-subtitle">
          Persona profile · used by {PERSONALITY_NAME} simulations
        </p>
      </header>

      <article className="card p-6 space-y-4">
        <DetailRow label="Description" value={persona.description} />
        <DetailRow label="Workspace ID" value={persona.workspace_id} />
        <DetailRow label="User ID" value={persona.user_id} />
        <DetailRow label="Persona ID" value={persona.id} />
      </article>

      {canEdit && !isGuest && (
        <div className="flex gap-3">
          <button type="button" className="btn-primary" disabled title="Connect backend to enable">
            Edit persona
          </button>
          <button type="button" className="btn-secondary text-red-600" disabled title="Connect backend to enable">
            Delete
          </button>
        </div>
      )}
    </section>
  )
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-slate-800 dark:text-slate-100">{value || '—'}</p>
    </div>
  )
}
