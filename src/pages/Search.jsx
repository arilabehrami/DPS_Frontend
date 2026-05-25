import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { employeesApi } from '../api/employeesApi'
import { getErrorMessage } from '../api/axios'
import { SearchBar } from '../components/SearchBar'
import { Table } from '../components/Table'
import { Pagination } from '../components/Pagination'
import { Loader } from '../components/Loader'
import { useDebounce } from '../hooks/useDebounce'
import { useTranslation } from '../hooks/useTranslation'
import {
  PAGE_SIZE,
  PERSONALITY_NAME,
} from '../utils/constants'

export function Search() {
  const [search, setSearch] = useState('')
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

  const fetchResults = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        search: debouncedSearch || undefined,
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
  }, [debouncedSearch, page, t])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const queryPreview = [
    debouncedSearch && `search=${debouncedSearch}`,
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
