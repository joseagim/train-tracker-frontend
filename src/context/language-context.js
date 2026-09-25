import { createContext, useContext } from 'react'

export const LanguageContext = createContext(null)

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage debe usarse dentro de <LanguageProvider>')
  return ctx
}
