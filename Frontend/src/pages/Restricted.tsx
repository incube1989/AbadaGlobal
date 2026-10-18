import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'

interface Props {
  /** unlogged=true shows the "please log in" variant; otherwise the contact-admin copy. */
  unlogged?: boolean
}

/** Access-denied page with the fixed MVP copy. */
export default function Restricted({ unlogged = false }: Props) {
  const { t } = useI18n()

  return (
    <main className="restricted-page">
      <p>{unlogged ? t('restricted.unlogged') : t('restricted.logged')}</p>
      {unlogged && <Link to="/login">{t('restricted.loginLink')}</Link>}
    </main>
  )
}