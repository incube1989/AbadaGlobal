import { beforeEach, describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import Restricted from '../pages/Restricted'
import UnderConstruction from '../pages/UnderConstruction'
import { renderWithProviders } from './testUtils'

describe('Restricted page', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the unlogged variant with a login link', () => {
    renderWithProviders(<Restricted unlogged />)
    expect(
      screen.getByText(/у вас нет прав на просмотр этой страницы/),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Войти' })).toBeInTheDocument()
  })

  it('shows the logged-in variant in English', () => {
    localStorage.setItem('abadaglobal.lang', 'en')
    renderWithProviders(<Restricted />)
    expect(
      screen.getByText(
        'Sorry, you do not have permission to view this page. Contact Admin for details.',
      ),
    ).toBeInTheDocument()
  })
})

describe('Under construction page', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the fixed under-construction copy', () => {
    renderWithProviders(<UnderConstruction />)
    expect(
      screen.getByText(/страница ещё в разработке/),
    ).toBeInTheDocument()
  })
})