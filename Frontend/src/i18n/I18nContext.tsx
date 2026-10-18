import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { dictionary, type Lang } from './dictionaries'

const STORAGE_KEY = 'abadaglobal.lang'

interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function getInitialLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'en' || saved === 'pt' || saved === 'ru' ? saved : 'ru'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const t = useCallback(
    (key: string) => dictionary[lang][key] ?? key,
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return ctx
}