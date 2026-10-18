import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import Restricted from '../pages/Restricted'

/**
 * Guards protected routes. Unlogged users see the restricted page instead of
 * the requested content; the nav layout is not rendered for them.
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const { t } = useI18n()

  if (status === 'loading') {
    return <div className="page-loader">{t('common.loading')}</div>
  }

  if (status === 'anon') {
    return <Restricted unlogged />
  }

  return <>{children}</>
}