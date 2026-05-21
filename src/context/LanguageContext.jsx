import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { translate } from '../i18n/translations'
import { getSettings, saveSettings } from '../services/settingsService'
import { LANGUAGES } from '../utils/constants'

export const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => getSettings().language)

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang)
    saveSettings({ language: lang })
  }, [])

  const t = useCallback(
    (key, vars) => translate(language, key, vars),
    [language]
  )

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: LANGUAGES,
      t,
    }),
    [language, setLanguage, t]
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}
