import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { employeesApi } from '../api/employeesApi'
import { getErrorMessage } from '../api/axios'
import { Table } from '../components/Table'
import { Loader } from '../components/Loader'
import { Modal } from '../components/Modal'
import { Pagination } from '../components/Pagination'
import { SearchBar } from '../components/SearchBar'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { useDebounce } from '../hooks/useDebounce'
import { PAGE_SIZE, PERSONALITY_NAME } from '../utils/constants'

export function Employees() {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const debouncedSearch = useDebounce(search)
  const navigate = useNavigate()
  const { canEdit, isGuest, user } = useAuth()
  const { t } = useTranslation()

  const columns = [
    { key: 'name', label: t('employees.persona') },
    { key: 'description', label: 'Description' },
    { key: 'workspace_id', label: 'Workspace ID' },
    { key: 'user_id', label: 'User ID' },
    { key: 'id', label: 'Persona ID' },
  ]

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await employeesApi.getAll({
        search: debouncedSearch || undefined,
        page,
        page_size: PAGE_SIZE,
      })
      const list = data.items || data.results || data.personas || data.data || data
      setEmployees(Array.isArray(list) ? list : [])
      setTotal(data.total || data.count || list?.length || 0)
    } catch (err) {
      setError(getErrorMessage(err, t('employees.loadError')))
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, page, t])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const workspaceId = user?.workspace_id || user?.workspace?.id || 1
  const userId = user?.id || user?.user_id || 1

  const handleCreate = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!form.name.trim()) {
      setFormError('Persona name is required')
      return
    }

    setCreating(true)
    try {
      await employeesApi.create({
        name: form.name.trim(),
        description: form.description.trim(),
        workspace_id: workspaceId,
        user_id: userId,
      })
      setForm({ name: '', description: '' })
      setModalOpen(false)
      await fetchEmployees()
    } catch (err) {
      setFormError(getErrorMessage(err, 'Failed to create persona'))
    } finally {
      setCreating(false)
    }
  }

  return (
    <section className="page space-y-6">
      <header className="page-header-row">
        <div>
          <h1 className="page-title">{t('employees.title')}</h1>
          <p className="page-subtitle">
            {t('employees.subtitle')}
            {isGuest && ` · ${t('common.readOnly')}`}
          </p>
        </div>
        {canEdit && (
          <button type="button" className="btn-primary" onClick={() => setModalOpen(true)}>
            {t('employees.addPersona')}
          </button>
        )}
      </header>

      <p className="text-sm text-slate-500">
        {t('employees.hint', { name: PERSONALITY_NAME })}
      </p>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={t('employees.searchPlaceholder')}
      />

      {error && <p className="alert alert--error">{error}</p>}

      {loading ? (
        <Loader label={t('employees.loading')} />
      ) : (
        <>
          <Table
            columns={columns}
            data={employees}
            onRowClick={(row) => navigate(`/employees/${row.id}`)}
            emptyMessage={t('employees.empty')}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          if (!creating) {
            setModalOpen(false)
            setFormError('')
          }
        }}
        title="Create persona"
        footer={
          <>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setModalOpen(false)}
              disabled={creating}
            >
              Cancel
            </button>
            <button type="submit" form="create-persona-form" className="btn-primary" disabled={creating}>
              {creating ? 'Creating...' : 'Create persona'}
            </button>
          </>
        }
      >
        <form id="create-persona-form" onSubmit={handleCreate} className="space-y-4">
          {formError && <p className="alert alert--error">{formError}</p>}
          <label className="form-label text-slate-700 dark:text-slate-300">
            Name
            <input
              type="text"
              className="input-field mt-1.5"
              value={form.name}
              onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
              placeholder="Support persona"
              disabled={creating}
              required
            />
          </label>
          <label className="form-label text-slate-700 dark:text-slate-300">
            Description
            <textarea
              className="input-field mt-1.5 min-h-28 resize-y"
              value={form.description}
              onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
              placeholder="Describe how this persona should behave"
              disabled={creating}
            />
          </label>
          <p className="text-xs text-slate-500">
            This will use workspace_id {workspaceId} and user_id {userId}.
          </p>
        </form>
      </Modal>
    </section>
  )
}
