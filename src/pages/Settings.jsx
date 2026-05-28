import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useTranslation } from '../hooks/useTranslation'
import { RoleBadge } from '../components/RoleBadge'
import { PERSONALITY_NAME } from '../utils/constants'

export function Settings() {
  const { user, role } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const { t, language, setLanguage, languages } = useTranslation()

  return (
    <section className="page max-w-2xl space-y-6">
      <header>
        <h1 className="page-title">{t('settings.title')}</h1>
        <p className="page-subtitle">{t('settings.subtitle', { name: PERSONALITY_NAME })}</p>
      </header>

      <article className="card p-6 space-y-8">
        <section>
          <h2 className="font-semibold text-slate-800 dark:text-white">
            {t('settings.appearance')}
          </h2>
          <label className="mt-4 flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-700">
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {t('settings.darkMode')}
            </span>
            <input type="checkbox" checked={darkMode} onChange={toggleTheme} className="h-4 w-4" />
          </label>
        </section>

        <section>
          <h2 className="font-semibold text-slate-800 dark:text-white">
            {t('settings.language')}
          </h2>
          <label className="mt-4 block text-sm text-slate-500">
            {t('settings.interfaceLanguage')}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input-field mt-1.5"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section>
          <h2 className="font-semibold text-slate-800 dark:text-white">
            {t('settings.account')}
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{user?.email}</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            {t('common.role')}: <RoleBadge role={role} />
          </p>
        </section>
      </article>
    </section>
  )
}
