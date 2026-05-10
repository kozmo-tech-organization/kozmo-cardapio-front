import { createContext, useContext, useState, type ReactNode } from 'react'

import adminPt from './lib/admin/pt.json'
import adminEn from './lib/admin/en.json'
import adminEs from './lib/admin/es.json'
import authPt from './lib/auth/pt.json'
import authEn from './lib/auth/en.json'
import authEs from './lib/auth/es.json'
import landingPt from './lib/landing/pt.json'
import landingEn from './lib/landing/en.json'
import landingEs from './lib/landing/es.json'
import menuPt from './lib/menu/pt.json'
import menuEn from './lib/menu/en.json'
import menuEs from './lib/menu/es.json'

export type Language = 'pt' | 'en' | 'es'

const translations: Record<Language, Record<string, string>> = {
  pt: { ...adminPt, ...authPt, ...landingPt, ...menuPt },
  en: { ...adminEn, ...authEn, ...landingEn, ...menuEn },
  es: { ...adminEs, ...authEs, ...landingEs, ...menuEs },
}

type I18nContextValue = {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

const STORAGE_KEY = 'kozmo-lang'

function getSavedLang(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'pt' || saved === 'en' || saved === 'es') return saved
  } catch {}
  return 'pt'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(getSavedLang)

  function setLang(next: Language) {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
  }

  function t(key: string, vars?: Record<string, string | number>): string {
    const translation = translations[lang][key] ?? key
    if (!vars) return translation
    return Object.entries(vars).reduce(
      (str, [k, v]) => str.replaceAll(`{${k}}`, String(v)),
      translation,
    )
  }

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslation must be used inside I18nProvider')
  return ctx
}
