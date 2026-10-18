import { useI18n } from '../i18n/I18nContext'
import type { Lang } from '../i18n/dictionaries'

const LANGS: Lang[] = ['ru', 'en', 'pt']

/** RU / EN / PT switcher, rendered inside the nav panel. */
export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n()

  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          className={l === lang ? 'active' : ''}
          onClick={() => setLang(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}