import { useI18n } from '../i18n/I18nContext'

/** Placeholder page for not-yet-implemented routes (database, profile, settings). */
export default function UnderConstruction() {
  const { t } = useI18n()

  return (
    <main className="placeholder-page">
      <p>{t('underConstruction.copy')}</p>
    </main>
  )
}