import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import App from '../App'
import {
  createEvent,
  fetchCountries,
  fetchMe,
  fetchRegions,
  resolveOwnerCandidates,
  updateEvent,
} from '../api/client'
import type { User } from '../api/types'
import { renderWithProviders } from './testUtils'

vi.mock('../api/client', () => ({
  ApiError: class extends Error {},
  fetchMe: vi.fn(),
  login: vi.fn(),
  fetchEvents: vi.fn().mockResolvedValue([]),
  fetchEvent: vi.fn(),
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
  deleteEvent: vi.fn(),
  fetchCountries: vi.fn(),
  fetchRegions: vi.fn(),
  fetchOwnerCandidates: vi.fn(),
  resolveOwnerCandidates: vi.fn(),
}))

const user: User = {
  id: 1,
  email: 'admin@gmail.com',
  name: 'Admin',
  role: 'administrator',
  isBanned: false,
}

const countries = [{ id: 1, name: 'Russia', isDeleted: false }]
const regions = [{ id: 1, name: 'Samara', countryId: 1, isDeleted: false }]

const existingEvent = {
  id: 5,
  name: 'Batizado',
  startDate: '2027-04-23',
  endDate: '2027-04-25',
  countryId: 1,
  regionId: 1,
  type: 'batizado' as const,
  scope: 'region' as const,
  status: 'published' as const,
  createdBy: 1,
  owners: [{ personId: 5 }],
}

describe('Event form', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(fetchMe).mockResolvedValue(user)
    vi.mocked(fetchCountries).mockResolvedValue(countries)
    vi.mocked(fetchRegions).mockResolvedValue(regions)
    vi.mocked(resolveOwnerCandidates).mockResolvedValue([
      { type: 'person', id: 5, label: 'Falcão' },
    ])
  })

  it('renders the create-event form and publishes a new event', async () => {
    vi.mocked(createEvent).mockResolvedValue(existingEvent)
    renderWithProviders(<App />, {
      initialEntries: ['/events/new'],
      token: 'tok',
    })

    expect(
      await screen.findByRole('heading', { name: 'Новое событие' }),
    ).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Название'), {
      target: { value: 'New event' },
    })
    fireEvent.change(screen.getByLabelText('Начало'), {
      target: { value: '2028-03-01' },
    })
    fireEvent.change(screen.getByLabelText('Конец'), {
      target: { value: '2028-03-03' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Опубликовать' }))

    await waitFor(() =>
      expect(createEvent).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New event', status: 'published', owners: [] }),
        'tok',
      ),
    )
  })

  it('shows the save-as-draft button as disabled for now', async () => {
    renderWithProviders(<App />, {
      initialEntries: ['/events/new'],
      token: 'tok',
    })

    await screen.findByRole('heading', { name: 'Новое событие' })
    const draft = screen.getByRole('button', { name: 'Сохранить черновик' })
    expect(draft).toBeDisabled()
  })

  it('renders the owners search picker', async () => {
    renderWithProviders(<App />, {
      initialEntries: ['/events/new'],
      token: 'tok',
    })

    await screen.findByRole('heading', { name: 'Новое событие' })
    expect(screen.getByText('Владельцы')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Поиск людей…')).toBeInTheDocument()
  })

  it('prefills the form (including owner chips) when editing an existing event', async () => {
    const { fetchEvent } = await import('../api/client')
    vi.mocked(fetchEvent).mockResolvedValue(existingEvent)
    vi.mocked(updateEvent).mockResolvedValue(existingEvent)

    renderWithProviders(<App />, {
      initialEntries: ['/events/5/edit'],
      token: 'tok',
    })

    await screen.findByRole('heading', { name: 'Редактирование события' })
    expect(screen.getByLabelText('Название')).toHaveValue('Batizado')
    // Existing owner resolved to a friendly person chip.
    expect(await screen.findByText('Falcão')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Название'), {
      target: { value: 'Batizado Updated' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Опубликовать' }))

    await waitFor(() =>
      expect(updateEvent).toHaveBeenCalledWith(
        5,
        expect.objectContaining({ name: 'Batizado Updated' }),
        'tok',
      ),
    )
  })
})