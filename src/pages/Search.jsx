import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { employeesApi } from '../api/employeesApi'
import { getErrorMessage } from '../api/axios'
import { SearchBar } from '../components/SearchBar'
import { Filters } from '../components/Filters'
import { Table } from '../components/Table'
import { Pagination } from '../components/Pagination'
import { Loader } from '../components/Loader'
import { useDebounce } from '../hooks/useDebounce'
import { useTranslation } from '../hooks/useTranslation'
import {
  DEPARTMENTS,
  PERSONA_ROLES,
  PERSONA_STATUSES,
  SORT_OPTIONS,
  PAGE_SIZE,
  PERSONALITY_NAME,
} from '../utils/constants'

export function Search() {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState('name_asc')
  const [page, setPage] = useState(1)
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const debouncedSearch = useDebounce(search)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const columns = [
    { key: 'name', label: t('employees.persona') },
    { key: 'description', label: 'Description' },
    { key: 'workspace_id', label: 'Workspace ID' },
    { key: 'user_id', label: 'User ID' },
    { key: 'id', label: 'Persona ID' },
  ]

  const handleFilterChange = (name, value) => {
    if (name === 'department') setDepartment(value)
    if (name === 'role') setRole(value)
    if (name === 'status') setStatus(value)
    if (name === 'dateFrom') setDateFrom(value)
    if (name === 'dateTo') setDateTo(value)
    if (name === 'sort') setSort(value)
    setPage(1)
  }

  const resetFilters = () => {
    setSearch('')
    setDepartment('')
    setRole('')
    setStatus('')
    setDateFrom('')
    setDateTo('')
    setSort('name_asc')
    setPage(1)
  }

  const fetchResults = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        search: debouncedSearch || undefined,
        department: department || undefined,
        role: role || undefined,
        status: status || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        sort,
        page,
        page_size: PAGE_SIZE,
      }
      const { data } = await employeesApi.getAll(params)
      const list = data.items || data.results || data
      setResults(Array.isArray(list) ? list : [])
      setTotal(data.total || data.count || list?.length || 0)
    } catch (err) {
      setError(getErrorMessage(err, t('search.error')))
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, department, role, status, dateFrom, dateTo, sort, page, t])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  const filterConfig = [
    {
      name: 'department',
      label: t('employees.style'),
      type: 'select',
      value: department,
      options: DEPARTMENTS.map((d) => ({ value: d, label: d })),
    },
    {
      name: 'role',
      label: t('common.role'),
      type: 'select',
      value: role,
      options: PERSONA_ROLES.map((r) => ({ value: r, label: r })),
    },
    {
      name: 'status',
      label: t('employees.status'),
      type: 'select',
      value: status,
      options: PERSONA_STATUSES.map((s) => ({ value: s, label: s })),
    },
    { name: 'dateFrom', label: t('search.fromDate'), type: 'date', value: dateFrom },
    { name: 'dateTo', label: t('search.toDate'), type: 'date', value: dateTo },
    {
      name: 'sort',
      label: t('search.sortBy'),
      type: 'select',
      value: sort,
      options: SORT_OPTIONS,
    },
  ]

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const queryPreview = [
    debouncedSearch && `search=${debouncedSearch}`,
    role && `role=${role}`,
    department && `department=${department}`,
    status && `status=${status}`,
  ]
    .filter(Boolean)
    .join('&')

  return (
    <section className="page space-y-6">
      <header>
        <h1 className="page-title">{t('search.title')}</h1>
        <p className="page-subtitle">
          {t('search.subtitle', { name: PERSONALITY_NAME })} · GET /personas/?
          {queryPreview || '...'}
        </p>
      </header>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={t('employees.searchPlaceholder')}
      />

      <Filters filters={filterConfig} onChange={handleFilterChange} onReset={resetFilters} />

      {error && <p className="alert alert--error">{error}</p>}

      {loading ? (
        <Loader label={t('search.loading')} />
      ) : (
        <>
          <p className="text-sm text-slate-500">{t('search.results', { count: total })}</p>
          <Table
            columns={columns}
            data={results}
            onRowClick={(row) => navigate(`/employees/${row.id}`)}
            emptyMessage={t('search.empty')}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  )
}
