import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import App from '../App'
import { fetchEvents, fetchMe } from '../api/client'
import type { Event, User } from '../api/types'
import { renderWithProviders } from './testUtils'

vi.mock('../api/client', () => ({
  ApiError: class extends Error {},
  fetchMe: vi.fn(),
  login: vi.fn(),
  fetchEvents: vi.fn(),
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

const sampleEvents: Event[] = [
  {
    id: 1,
    name: 'Zumbimba',
    startDate: '2027-11-01',
    endDate: '2027-11-30',
    countryId: 3,
    regionId: 7,
    type: 'batizado',
    scope: 'world',
    status: 'published',
    createdBy: 1,
    owners: [{ userId: 1 }],
    ownerList: [] as const,
    guests: [{ id: 5, nickname: 'Falcão', corda: 'azul', title: 'Graduado' }],
  },
  {
    id: 2,
    name: 'Competition',
    startDate: '2026-12-04',
    endDate: '2026-12-06',
    countryId: 1,
    regionId: 4,
    type: 'competition',
    scope: 'Russia',
    status: 'published',
    createdBy: 1,
    owners: [{ userId: 1 }],
    ownerList: [] as const,
    guests: [],
  },
]

describe('Calendar page', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(fetchMe).mockResolvedValue(user)
    vi.mocked(fetchEvents).mockResolvedValue(sampleEvents)
  })

  it('renders the fetched events', async () => {
    renderWithProviders(<App />, {
      initialEntries: ['/calendar'],
      token: 'valid-token',
    })

    // Days view is the default; a multi-week event renders once per week row.
    expect((await screen.findAllByText('Zumbimba')).length).toBeGreaterThan(0)
    expect(screen.getByText('Competition')).toBeInTheDocument()
    expect(fetchEvents).toHaveBeenCalled()
  })

  it('shows the create-event button for logged-in users', async () => {
    renderWithProviders(<App />, {
      initialEntries: ['/calendar'],
      token: 'valid-token',
    })

    expect((await screen.findAllByText('Zumbimba')).length).toBeGreaterThan(0)
    expect(screen.getByText('Создать событие')).toBeInTheDocument()
  })

  it('filters events by scope', async () => {
    renderWithProviders(<App />, {
      initialEntries: ['/calendar'],
      token: 'valid-token',
    })

    await screen.findAllByText('Zumbimba')

    fireEvent.click(screen.getByLabelText('Мир'))
    // Only the world-scoped event remains visible.
    expect(screen.getAllByText('Zumbimba').length).toBeGreaterThan(0)
    expect(screen.queryByText('Competition')).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Мир'))
    expect(screen.getByText('Competition')).toBeInTheDocument()
  })

  it('shows the guest list at the top of the event popup', async () => {
    renderWithProviders(<App />, {
      initialEntries: ['/calendar'],
      token: 'valid-token',
    })

    fireEvent.click((await screen.findAllByText('Zumbimba'))[0])
    expect(await screen.findByText(/Гости:/)).toBeInTheDocument()
    // The guest chip carries the derived Portuguese title before the name.
    expect(screen.getByText('Graduado')).toBeInTheDocument()
    expect(screen.getByText('Falcão')).toBeInTheDocument()
  })

  it('shows the days view by default and keeps it when selected', async () => {
    const { container } = renderWithProviders(<App />, {
      initialEntries: ['/calendar'],
      token: 'valid-token',
    })

    await screen.findAllByText('Zumbimba')

    // Days is the default view.
    expect(container.querySelector('.day-grid')).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Дни' }))
    expect(container.querySelector('.day-grid')).not.toBeNull()
  })
})