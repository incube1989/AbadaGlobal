import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import Admin from '../pages/Admin'
import {
  changeUserRole,
  fetchAdminUsers,
  fetchMe,
  setUserBan,
} from '../api/client'
import type { User } from '../api/types'
import { renderWithProviders } from './testUtils'

vi.mock('../api/client', () => ({
  ApiError: class extends Error {},
  fetchMe: vi.fn(),
  login: vi.fn(),
  fetchEvents: vi.fn(),
  fetchEvent: vi.fn(),
  fetchAdminUsers: vi.fn(),
  changeUserRole: vi.fn(),
  setUserBan: vi.fn(),
}))

const superAdmin: User = {
  id: 4,
  email: 'superadmin@gmail.com',
  name: 'Super Admin',
  role: 'super admin',
  isBanned: false,
}
const admin: User = {
  id: 1,
  email: 'admin@gmail.com',
  name: 'Admin',
  role: 'administrator',
  isBanned: false,
}
const defaultUser: User = {
  id: 3,
  email: 'user@gmail.com',
  name: 'User',
  role: 'default',
  isBanned: true,
}

describe('Admin page', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(fetchMe).mockResolvedValue(admin)
    vi.mocked(fetchAdminUsers).mockResolvedValue([superAdmin, admin, defaultUser])
  })

  it('lists all users with their roles and ban state', async () => {
    renderWithProviders(<Admin />, { token: 'tok' })

    expect(await screen.findByText('Super Admin')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('User')).toBeInTheDocument()
    expect(screen.getByText('Заблокирован')).toBeInTheDocument()
  })

  it('changes a user role', async () => {
    vi.mocked(changeUserRole).mockResolvedValue({ ...defaultUser, role: 'moderator' })

    renderWithProviders(<Admin />, { token: 'tok' })
    await screen.findByText('User')

    const selects = screen.getAllByRole('combobox')
    // The default user's role select (super admin has no select).
    const userSelect = selects.find((el) => el.closest('tr')?.textContent?.includes('user@gmail.com'))
    expect(userSelect).toBeDefined()
    fireEvent.change(userSelect!, { target: { value: 'moderator' } })

    await waitFor(() =>
      expect(changeUserRole).toHaveBeenCalledWith(3, 'moderator', 'tok'),
    )
  })

  it('bans and unbans a user', async () => {
    vi.mocked(setUserBan).mockResolvedValue({ ...defaultUser, isBanned: false })

    renderWithProviders(<Admin />, { token: 'tok' })
    await screen.findByText('User')

    fireEvent.click(screen.getByRole('button', { name: 'Разблокировать' }))

    await waitFor(() => expect(setUserBan).toHaveBeenCalledWith(3, false, 'tok'))
  })

  it('protects the super admin row from changes', async () => {
    renderWithProviders(<Admin />, { token: 'tok' })

    await screen.findByText('Super Admin')
    expect(screen.getByText('Защищён')).toBeInTheDocument()
    // The super admin row has no role select.
    const superRow = screen.getByText('Super Admin').closest('tr')!
    expect(superRow.querySelector('select')).toBeNull()
  })
})