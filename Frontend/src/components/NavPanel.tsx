import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useI18n } from '../i18n/I18nContext'
import LanguageSwitcher from './LanguageSwitcher'

const LINKS = [
  { to: '/', labelKey: 'nav.main', end: true },
  { to: '/calendar', labelKey: 'nav.calendar', end: false },
  { to: '/database', labelKey: 'nav.database', end: false },
  { to: '/profile', labelKey: 'nav.profile', end: false },
  { to: '/settings', labelKey: 'nav.settings', end: false },
] as const

/**
 * Desktop: fixed left sidebar. Mobile: burger button toggling the panel.
 * Contains the language switcher and the log-out action.
 */
export default function NavPanel() {
  const { t } = useI18n()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <button
        type="button"
        className="nav-burger"
        aria-label={t('nav.toggle')}
        onClick={() => setOpen((v) => !v)}
      >
        ☰
      </button>
      <nav className={`nav-panel${open ? ' open' : ''}`}>
        <ul className="nav-links">
          {LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {t(link.labelKey)}
              </NavLink>
            </li>
          ))}
        </ul>
        <LanguageSwitcher />
        <button type="button" className="nav-logout" onClick={handleLogout}>
          {t('nav.logout')}
        </button>
      </nav>
    </>
  )
}