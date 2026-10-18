import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, screen } from '@testing-library/react'
import NavPanel from '../components/NavPanel'
import { renderWithProviders } from './testUtils'

vi.mock('../api/client', () => ({
  ApiError: class extends Error {},
  fetchMe: vi.fn().mockResolvedValue({
    id: 1,
    email: 'admin@gmail.com',
    name: 'Admin',
    role: 'administrator',
    isBanned: false,
  }),
  login: vi.fn(),
  fetchEvents: vi.fn(),
  fetchEvent: vi.fn(),
  fetchCountries: vi.fn().mockResolvedValue([]),
  fetchRegions: vi.fn().mockResolvedValue([]),
}))

describe('Navigation panel', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  /** Flush the AuthProvider session-restore microtasks before asserting. */
  async function flushAuth() {
    await act(async () => {})
  }

  it('renders nav links, language switcher and log out in Russian by default', async () => {
    renderWithProviders(<NavPanel />, { initialEntries: ['/calendar'], token: 'tok' })
    await flushAuth()

    expect(screen.getByText('Главная')).toBeInTheDocument()
    expect(screen.getByText('Календарь')).toBeInTheDocument()
    expect(screen.getByText('База видео')).toBeInTheDocument()
    expect(screen.getByText('Профиль')).toBeInTheDocument()
    expect(screen.getByText('Настройки')).toBeInTheDocument()
    expect(screen.getByText('Выйти')).toBeInTheDocument()
  })

  it('switches the interface language', async () => {
    renderWithProviders(<NavPanel />, { initialEntries: ['/calendar'], token: 'tok' })
    await flushAuth()

    fireEvent.click(screen.getByText('EN'))
    expect(screen.getByText('Calendar')).toBeInTheDocument()
    expect(screen.getByText('Log out')).toBeInTheDocument()

    fireEvent.click(screen.getByText('PT'))
    expect(screen.getByText('Calendário')).toBeInTheDocument()
    expect(screen.getByText('Sair')).toBeInTheDocument()
  })

  it('clears the session on log out', async () => {
    renderWithProviders(<NavPanel />, { initialEntries: ['/calendar'], token: 'tok' })
    await flushAuth()
    expect(localStorage.getItem('abadaglobal.token')).toBe('tok')

    fireEvent.click(screen.getByText('Выйти'))
    expect(localStorage.getItem('abadaglobal.token')).toBeNull()
  })

  it('shows moderation and administration buttons for an administrator', async () => {
    const { fetchMe } = await import('../api/client')
    vi.mocked(fetchMe).mockResolvedValue({
      id: 1,
      email: 'admin@gmail.com',
      name: 'Admin',
      role: 'administrator',
      isBanned: false,
    })

    renderWithProviders(<NavPanel />, { initialEntries: ['/calendar'], token: 'tok' })
    await flushAuth()

    expect(screen.getByText('Модерация')).toBeInTheDocument()
    expect(screen.getByText('Администрирование')).toBeInTheDocument()
  })

  it('hides moderation and administration buttons for a default user', async () => {
    const { fetchMe } = await import('../api/client')
    vi.mocked(fetchMe).mockResolvedValue({
      id: 3,
      email: 'user@gmail.com',
      name: 'User',
      role: 'default',
      isBanned: false,
    })

    renderWithProviders(<NavPanel />, { initialEntries: ['/calendar'], token: 'tok' })
    await flushAuth()

    expect(screen.queryByText('Модерация')).not.toBeInTheDocument()
    expect(screen.queryByText('Администрирование')).not.toBeInTheDocument()
  })
})