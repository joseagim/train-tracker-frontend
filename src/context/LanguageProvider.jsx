import { useCallback, useEffect, useMemo, useState } from 'react'
import * as api from '../services/api'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, translations } from '../i18n/translations'
import { LanguageContext } from './language-context'

const STORAGE_KEY = 'tt_language'

function detectInitialLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored
  } catch {
    // localStorage no disponible: seguimos con la detección por navegador.
  }
  const browserLanguage = navigator.language?.slice(0, 2)
  return SUPPORTED_LANGUAGES.includes(browserLanguage) ? browserLanguage : DEFAULT_LANGUAGE
}

function getByPath(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export default function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(detectInitialLanguage)

  useEffect(() => {
    document.documentElement.lang = language
    api.setApiLanguage(language)
  }, [language])

  const setLanguage = useCallback((next) => {
    if (!SUPPORTED_LANGUAGES.includes(next)) return
    setLanguageState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // localStorage no disponible: el idioma solo dura la sesión actual.
    }
  }, [])

  // `t('namespace.key', { count, ...vars })`: si la entrada tiene forma
  // { one, other } se elige según `count` antes de interpolar el resto de
  // variables con la sintaxis "{nombre}".
  const t = useCallback(
    (key, vars) => {
      let template = getByPath(translations[language], key) ?? getByPath(translations[DEFAULT_LANGUAGE], key)
      if (template == null) return key
      if (typeof template === 'object') {
        template = vars?.count === 1 ? template.one : template.other
      }
      if (!vars) return template
      return Object.entries(vars).reduce((str, [name, value]) => str.replaceAll(`{${name}}`, value), template)
    },
    [language],
  )

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
