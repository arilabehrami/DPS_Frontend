import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getErrorMessage } from '../api/axios'
import { messagesApi } from '../api/messagesApi'
import { Loader } from '../components/Loader'
import { useAuth } from '../hooks/useAuth'

const ROLE_LABELS = {
  admin: 'Send to Employees and Clients',
  employee: 'Send to Admin and Clients',
  client: 'Send to Employee Support',
}
const SUPER_ADMIN_EMAIL = 'bahrieveseli1@gmail.com'
const GROUP_ALL_EMPLOYEES = '__group_all_employees__'
const GROUP_ALL_CLIENTS = '__group_all_clients__'
const GROUP_ALL_USERS = '__group_all_users__'
function normalizeRole(role) {
  const normalized = String(role || '').toLowerCase()
  if (normalized === 'employ' || normalized === 'user') return 'employee'
  return normalized
}

export function Messages() {
  const { user, role } = useAuth()
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [recipients, setRecipients] = useState([])
  const [inbox, setInbox] = useState([])
  const [form, setForm] = useState({
    recipient_user_ids: [],
    subject: '',
    content: '',
  })
  const [recipientOpen, setRecipientOpen] = useState(false)
  const recipientMenuRef = useRef(null)

  const currentRole = normalizeRole(role || user?.role_name)
  const canSendEmail = String(user?.email || '').toLowerCase() === SUPER_ADMIN_EMAIL
  const admins = recipients.filter((u) => String(u.role_name || '').toLowerCase() === 'admin')
  const employees = recipients.filter((u) => {
    const roleName = String(u.role_name || '').toLowerCase()
    return roleName === 'employee' || roleName === 'employ'
  })
  const clients = recipients.filter((u) => String(u.role_name || '').toLowerCase() === 'client')

  const resolveSelectedRecipientIds = (selectedValues) => {
    const ids = new Set()

    selectedValues.forEach((value) => {
      if (value === GROUP_ALL_EMPLOYEES) {
        employees.forEach((u) => ids.add(Number(u.id)))
        return
      }
      if (value === GROUP_ALL_CLIENTS) {
        clients.forEach((u) => ids.add(Number(u.id)))
        return
      }
      ids.add(Number(value))
    })

    return Array.from(ids).filter((id) => Number.isFinite(id))
  }

  const recipientOptions = useMemo(() => {
    const items = []
    if (employees.length > 1) items.push({ value: GROUP_ALL_EMPLOYEES, label: 'All employees', isGroup: true })
    if (clients.length > 0) items.push({ value: GROUP_ALL_CLIENTS, label: 'All clients', isGroup: true })

    recipients.forEach((u) => {
      items.push({
        value: String(u.id),
        label: `${u.full_name} (${u.email}) - ${u.role_name}`,
        isGroup: false,
      })
    })
    return items
  }, [admins.length, clients.length, employees.length, recipients])

  const selectedRecipientSet = useMemo(() => new Set(form.recipient_user_ids), [form.recipient_user_ids])
  const selectedLabel = useMemo(() => {
    if (!form.recipient_user_ids.length) return 'Select recipients'
    return `${form.recipient_user_ids.length} selected`
  }, [form.recipient_user_ids.length])

  const toggleRecipient = (value) => {
    setForm((current) => {
      const set = new Set(current.recipient_user_ids)
      if (set.has(value)) set.delete(value)
      else set.add(value)
      return { ...current, recipient_user_ids: Array.from(set) }
    })
  }

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (canSendEmail) {
        const { data } = await messagesApi.getAllowedRecipients()
        const list = Array.isArray(data) ? data : []
        setRecipients(list)
        setInbox([])
      } else {
        const { data } = await messagesApi.getInbox()
        const list = Array.isArray(data) ? data : []
        setInbox(list)
        setRecipients([])
      }
    } catch (err) {
      setError(getErrorMessage(err, canSendEmail ? 'Failed to load recipients' : 'Failed to load messages'))
      if (!canSendEmail) setInbox([])
    } finally {
      setLoading(false)
    }
  }, [canSendEmail])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    if (!recipientOpen) return undefined
    const onClickOutside = (event) => {
      if (!recipientMenuRef.current) return
      if (!recipientMenuRef.current.contains(event.target)) {
        setRecipientOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [recipientOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.recipient_user_ids.length) {
      setError('Please choose at least one recipient')
      return
    }
    if (!canSendEmail) {
      setError('Only super admin can send emails.')
      return
    }
    if (!form.subject.trim()) {
      setError('Subject is required')
      return
    }
    if (!form.content.trim()) {
      setError('Message is required')
      return
    }

    setSending(true)
    try {
      const trimmedSubject = form.subject.trim()
      const trimmedContent = form.content.trim()
      const targetIds = resolveSelectedRecipientIds(form.recipient_user_ids)

      if (targetIds.length === 0) {
        setError('No recipients found for selected group.')
        return
      }

      const results = await Promise.allSettled(
        targetIds.map((recipientId) =>
          messagesApi.sendEmail(
            {
              recipient_user_id: recipientId,
              subject: trimmedSubject,
              content: trimmedContent,
            },
            canSendEmail
          )
        )
      )

      const successCount = results.filter((r) => r.status === 'fulfilled').length
      const failed = results.find((r) => r.status === 'rejected')
      if (successCount === targetIds.length) {
        setSuccess(`Email queued successfully (${successCount})`)
      } else if (successCount > 0) {
        setSuccess(`Email queued partially (${successCount}/${targetIds.length})`)
      }

      if (failed && failed.status === 'rejected') {
        const status = failed.reason?.response?.status
        if (status === 401) {
          window.location.href = '/login'
          return
        }
        if (status === 403) {
          setError('Only super admin can send emails.')
          return
        }
        if (status === 404) {
          setError('Recipient user not found in your workspace')
          return
        }
        setError('Something went wrong')
        return
      }

      setForm({
        recipient_user_ids: [],
        subject: '',
        content: '',
      })
      await loadUsers()
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        window.location.href = '/login'
        return
      }
      if (status === 403) {
        setError('Only super admin can send emails.')
        return
      }
      if (status === 404) {
        setError('Recipient user not found in your workspace')
        return
      }
      setError('Something went wrong')
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async (id) => {
    if (!id) return
    setDeletingId(id)
    setError('')
    setSuccess('')
    try {
      await messagesApi.deleteInboxMessage(id)
      setInbox((current) => current.filter((item) => item.id !== id))
    } catch (err) {
      if (err?.code === 'DELETE_ENDPOINT_NOT_FOUND') {
        setError('Delete API is missing in backend. Please add DELETE /background-jobs/email/inbox/{id}.')
        return
      }
      setError(getErrorMessage(err, 'Failed to delete message'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="page max-w-3xl space-y-6">
      <header>
        <h1 className="page-title">Messages</h1>
        <p className="page-subtitle">{ROLE_LABELS[currentRole] || 'Send message'}</p>
      </header>

      {loading ? (
        <Loader label="Loading recipients..." />
      ) : (
        <article className="card p-6">
          {error && <p className="alert alert--error">{error}</p>}
          {success && <p className="alert alert--info">{success}</p>}
          {canSendEmail ? (
            recipients.length === 0 ? (
              <p className="text-sm text-slate-500">No allowed recipients</p>
            ) : (
              <>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <label className="form-label text-slate-700 dark:text-slate-300">
                    Recipients
                    <div className="relative mt-1.5" ref={recipientMenuRef}>
                      <button
                        type="button"
                        className="input-field flex w-full items-center justify-between text-left"
                        onClick={() => setRecipientOpen((prev) => !prev)}
                        disabled={sending}
                        aria-haspopup="listbox"
                        aria-expanded={recipientOpen}
                      >
                        <span>{selectedLabel}</span>
                        <span className="text-xs text-slate-500">{recipientOpen ? '▲' : '▼'}</span>
                      </button>
                      {recipientOpen && (
                        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                          {recipientOptions.map((option) => (
                            <label
                              key={option.value}
                              className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <input
                                type="checkbox"
                                checked={selectedRecipientSet.has(option.value)}
                                onChange={() => toggleRecipient(option.value)}
                                disabled={sending}
                              />
                              <span className={option.isGroup ? 'font-semibold text-slate-700 dark:text-slate-200' : ''}>
                                {option.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">You can select one or multiple recipients.</p>
                  </label>

                  <label className="form-label text-slate-700 dark:text-slate-300">
                    Subject
                    <input
                      type="text"
                      className="input-field mt-1.5"
                      value={form.subject}
                      onChange={(e) => setForm((current) => ({ ...current, subject: e.target.value }))}
                      disabled={sending}
                      required
                    />
                  </label>

                  <label className="form-label text-slate-700 dark:text-slate-300">
                    Message
                    <textarea
                      className="input-field mt-1.5 min-h-36"
                      value={form.content}
                      onChange={(e) => setForm((current) => ({ ...current, content: e.target.value }))}
                      disabled={sending}
                      required
                    />
                  </label>

                  <div className="pt-2">
                    <button type="submit" className="btn-primary" disabled={sending}>
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </form>
              </>
            )
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">Only super admin can send emails.</p>
              {inbox.length ? (
                <ul className="space-y-3">
                  {inbox.map((item) => (
                    <li key={item.id || `${item.sender_email}-${item.subject}-${item.created_at || ''}`}>
                      <article className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                        <p className="text-xs text-slate-500">
                          From: <span className="font-medium">{item.sender_email || 'System'}</span>
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{item.subject}</p>
                        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{item.content}</p>
                        {item.created_at && (
                          <p className="mt-2 text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</p>
                        )}
                        <div className="mt-3">
                          <button
                            type="button"
                            className="btn-secondary px-3 py-1.5 text-xs text-red-600"
                            onClick={() => handleDeleteMessage(item.id)}
                            disabled={deletingId === item.id}
                          >
                            {deletingId === item.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No messages yet.</p>
              )}
            </div>
          )}
        </article>
      )}
    </section>
  )
}
