import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import Moderation from '../pages/Moderation'
import { fetchCountries, fetchMe, fetchPersons, fetchRegions } from '../api/client'
import type { User } from '../api/types'
import { renderWithProviders } from './testUtils'

vi.mock('../api/client', () => ({
  ApiError: class extends Error {},
  fetchMe: vi.fn(),
  login: vi.fn(),
  fetchEvents: vi.fn(),
  fetchEvent: vi.fn(),
  fetchCountries: vi.fn(),
  fetchRegions: vi.fn(),
  fetchPersons: vi.fn(),
  createCountry: vi.fn(),
  updateCountry: vi.fn(),
  deleteCountry: vi.fn(),
  createRegion: vi.fn(),
  updateRegion: vi.fn(),
  deleteRegion: vi.fn(),
  createPerson: vi.fn(),
  updatePerson: vi.fn(),
  deletePerson: vi.fn(),
}))

const moderator: User = {
  id: 2,
  email: 'mod@gmail.com',
  name: 'Moderator',
  role: 'moderator',
  isBanned: false,
}

const countries = [
  { id: 1, name: 'Russia', isDeleted: false },
  { id: 3, name: 'Brazil', isDeleted: false },
]
const regions = [{ id: 1, name: 'Samara', countryId: 1, isDeleted: false }]
const persons = [
  {
    id: 1,
    nickname: 'Falcão',
    countryId: 1,
    userId: null,
    isDeleted: false,
    corda: null,
    title: null,
    curator: null,
    head: null,
  },
]

describe('Moderation page', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(fetchMe).mockResolvedValue(moderator)
    vi.mocked(fetchCountries).mockResolvedValue(countries)
    vi.mocked(fetchRegions).mockResolvedValue(regions)
    vi.mocked(fetchPersons).mockResolvedValue(persons)
  })

  it('lists countries on the default tab', async () => {
    renderWithProviders(<Moderation />, { token: 'tok' })

    expect(await screen.findByText('Russia')).toBeInTheDocument()
    expect(screen.getByText('Brazil')).toBeInTheDocument()
  })

  it('switches to the regions tab and loads regions', async () => {
    renderWithProviders(<Moderation />, { token: 'tok' })

    fireEvent.click(screen.getByRole('tab', { name: 'Регионы' }))
    expect(await screen.findByText('Samara')).toBeInTheDocument()
  })

  it('switches to the persons tab and loads persons', async () => {
    renderWithProviders(<Moderation />, { token: 'tok' })

    fireEvent.click(screen.getByRole('tab', { name: 'Люди' }))
    expect(await screen.findByText('Falcão')).toBeInTheDocument()
  })

  it('adds a country from the form', async () => {
    const { createCountry } = await import('../api/client')
    vi.mocked(createCountry).mockResolvedValue({ id: 4, name: 'Portugal', isDeleted: false })

    renderWithProviders(<Moderation />, { token: 'tok' })
    await screen.findByText('Russia')

    fireEvent.change(screen.getByPlaceholderText('Название страны'), {
      target: { value: 'Portugal' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Добавить' }))

    await waitFor(() =>
      expect(createCountry).toHaveBeenCalledWith('Portugal', 'tok'),
    )
  })
})