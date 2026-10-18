import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import App from '../App'
import { fetchEvent, fetchMe } from '../api/client'
import type { User } from '../api/types'
import { renderWithProviders } from './testUtils'

vi.mock('../api/client', () => ({
  ApiError: class extends Error {},
  fetchMe: vi.fn(),
  login: vi.fn(),
  fetchEvents: vi.fn().mockResolvedValue([]),
  fetchEvent: vi.fn(),
  fetchCountries: vi.fn().mockResolvedValue([]),
  fetchRegions: vi.fn().mockResolvedValue([]),
}))

const user: User = {
  id: 1,
  email: 'admin@gmail.com',
  name: 'Admin',
  role: 'administrator',
  isBanned: false,
}

const existingEvent = {
  id: 5,
  name: 'Batizado',
  startDate: '2027-04-23',
  endDate: '2027-04-25',
  countryId: null,
  regionId: null,
  type: 'batizado' as const,
  scope: 'region' as const,
  status: 'published' as const,
  createdBy: 1,
  owners: [{ userId: 1 }],
  ownerList: [
    { userId: 1, nickname: 'Admin', corda: null, title: null },
    { personId: 6, nickname: 'Besouro', corda: 'branco' as const, title: 'Grão Mestre' as const },
  ],
  guests: [
    { id: 7, nickname: 'Xuxa', corda: 'roxa' as const, title: 'Instrutor' as const },
    { id: 8, nickname: 'Caverna', corda: null, title: null },
  ],
}

describe('Event page', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(fetchMe).mockResolvedValue(user)
    vi.mocked(fetchEvent).mockResolvedValue(existingEvent)
  })

  it('shows the owner and guest lists at the top of the event information', async () => {
    renderWithProviders(<App />, {
      initialEntries: ['/events/5'],
      token: 'tok',
    })

    expect(await screen.findByRole('heading', { name: 'Batizado' })).toBeInTheDocument()
    // Owners first (user name, and person with derived Portuguese title).
    expect(screen.getByText(/Владельцы:/)).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Grão Mestre')).toBeInTheDocument()
    expect(screen.getByText('Besouro')).toBeInTheDocument()
    // Then guests with their derived title before the nickname.
    expect(screen.getByText(/Гости:/)).toBeInTheDocument()
    expect(screen.getByText('Instrutor')).toBeInTheDocument()
    expect(screen.getByText('Xuxa')).toBeInTheDocument()
    expect(screen.getByText('Caverna')).toBeInTheDocument()
  })
})