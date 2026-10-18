import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { AuthProvider } from '../auth/AuthContext'
import { I18nProvider } from '../i18n/I18nContext'

interface Options {
  initialEntries?: string[]
  /** When provided, this token is stored in localStorage before rendering. */
  token?: string
}

/**
 * Renders a node inside the app providers (router + auth + i18n) with a clean
 * localStorage state unless a token is explicitly requested.
 */
export function renderWithProviders(ui: ReactNode, options: Options = {}) {
  const { initialEntries = ['/'], token } = options
  localStorage.removeItem('abadaglobal.token')
  if (token) {
    localStorage.setItem('abadaglobal.token', token)
  }
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <I18nProvider>{ui}</I18nProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}