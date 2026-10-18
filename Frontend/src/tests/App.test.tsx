import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import App from '../App'
import { renderWithProviders } from './testUtils'

vi.mock('../api/client', () => ({
  ApiError: class extends Error {},
  fetchHealth: vi.fn(),
  fetchMe: vi.fn(),
  login: vi.fn(),
  fetchEvents: vi.fn(),
  fetchEvent: vi.fn(),
}))

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('redirects an unauthenticated visitor from / to the login page', async () => {
    renderWithProviders(<App />, { initialEntries: ['/'] })
    expect(await screen.findByRole('heading', { name: 'Вход' })).toBeInTheDocument()
  })

  it('shows the restricted page instead of protected content when logged out', async () => {
    renderWithProviders(<App />, { initialEntries: ['/calendar'] })
    expect(
      await screen.findByText(/у вас нет прав на просмотр этой страницы/),
    ).toBeInTheDocument()
  })
})