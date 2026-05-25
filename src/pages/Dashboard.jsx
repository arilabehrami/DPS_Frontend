import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatCard } from '../components/Cards/StatCard'
import { CredentialSaveForm } from '../components/CredentialSaveForm'
import { employeesApi } from '../api/employeesApi'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import {
  getConversationCount,
  getRecentChats,
} from '../services/chatService'
import { PERSONALITY_NAME, ROLES } from '../utils/constants'

function getList(data) {
  const list = data?.items || data?.results || data?.personas || data?.data || data
  return Array.isArray(list) ? list : []
}

export function Dashboard() {
  const { user, role, canManageUsers, isGuest } = useAuth()
  const { t } = useTranslation()
  const conversationCount = getConversationCount()
  const recentChats = getRecentChats(4)
  const [personas, setPersonas] = useState([])
  const [personasLoading, setPersonasLoading] = useState(true)
  const personaNames = personas
    .map((persona) => persona.name || `Persona ${persona.id}`)
    .filter(Boolean)
  const personaLabel = personaNames.length ? personaNames.join(', ') : PERSONALITY_NAME
  const firstName = user?.name?.split(' ')[0] || 'there'
  const roleLabel = t(`roles.${role}`)

  useEffect(() => {
    let mounted = true

    const loadPersonas = async () => {
      setPersonasLoading(true)
      try {
        const { data } = await employeesApi.getAll()
        if (mounted) {
          setPersonas(getList(data))
        }
      } catch {
        if (mounted) {
          setPersonas([])
        }
      } finally {
        if (mounted) {
          setPersonasLoading(false)
        }
      }
    }

    loadPersonas()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="page space-y-8">
      <CredentialSaveForm />

      <header>
        <h1 className="page-title">{t('dashboard.welcome', { name: firstName })}</h1>
        <p className="page-subtitle">
          {t('dashboard.subtitle', {
            ai: personaLabel,
            roleLabel,
          })}
        </p>
      </header>

      {isGuest && (
        <p className="alert alert--info">
          {t('dashboard.guestNotice', { name: PERSONALITY_NAME })}
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="card p-5 transition hover:shadow-md">
          <header className="flex items-start justify-between gap-4">
            <section className="min-w-0">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {t('dashboard.personality')}
              </p>
              {personasLoading ? (
                <p className="mt-2 text-sm text-slate-400">Loading...</p>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(personaNames.length ? personaNames : [PERSONALITY_NAME]).map((name) => (
                    <span
                      key={name}
                      className="rounded-lg border border-violet-100 bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-300"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              )}
            </section>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl dark:bg-violet-950/50">
              🧠
            </span>
          </header>
        </article>
        <StatCard
          title={t('dashboard.conversations')}
          value={conversationCount}
          icon="💬"
          subtitle={t('dashboard.totalSessions')}
        />
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('dashboard.recentChats')}
          </h2>
          <Link to="/history" className="text-sm font-medium text-violet-500 hover:text-violet-400">
            {t('dashboard.viewAll')}
          </Link>
        </div>
        {recentChats.length ? (
          <ul className="mt-4 space-y-2">
            {recentChats.map((chat) => (
              <li key={chat.id}>
                <Link
                  to="/ai-chat"
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 transition hover:border-violet-300 hover:bg-violet-50/50 dark:border-slate-700 dark:hover:border-violet-700 dark:hover:bg-violet-950/20"
                >
                  <span className="truncate text-sm text-slate-700 dark:text-slate-200">
                    {chat.preview}
                  </span>
                  <span className="ml-3 shrink-0 text-xs text-slate-400">
                    {chat.messageCount} msgs
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            {t('dashboard.noConversations', { name: PERSONALITY_NAME })}
          </p>
        )}
      </section>

      {canManageUsers && (
        <section className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('dashboard.adminTools')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{t('dashboard.adminDesc')}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/employees" className="btn-primary">
              {t('dashboard.personaRegistry')}
            </Link>
            <Link to="/clients" className="btn-secondary">
              Clients
            </Link>
            <Link to="/settings" className="btn-secondary">
              {t('nav.settings')}
            </Link>
          </div>
        </section>
      )}

      <section className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t('dashboard.quickActions')}
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/ai-chat" className="btn-primary">
            {t('dashboard.chatWith', { name: PERSONALITY_NAME })}
          </Link>
          <Link to="/employees" className="btn-secondary">
            {t('dashboard.personaRegistry')}
          </Link>
          <Link to="/history" className="btn-secondary">
            {t('dashboard.chatHistory')}
          </Link>
          <Link to="/profile" className="btn-secondary">
            {t('nav.profile')}
          </Link>
          {role !== ROLES.GUEST && (
            <Link to="/notifications" className="btn-secondary">
              {t('nav.notifications')}
            </Link>
          )}
        </div>
      </section>
    </section>
  )
}
