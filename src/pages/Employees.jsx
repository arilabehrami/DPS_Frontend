import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { employeesApi } from '../api/employeesApi'
import { getErrorMessage } from '../api/axios'
import { Table } from '../components/Table'
import { Loader } from '../components/Loader'
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
  const [error, setError] = useState('')
  const debouncedSearch = useDebounce(search)
  const navigate = useNavigate()
  const { canEdit, isGuest } = useAuth()
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
      const list = data.items || data.results || data
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
          <button type="button" className="btn-primary" disabled title={t('employees.backendRequired')}>
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
    </section>
  )
}
