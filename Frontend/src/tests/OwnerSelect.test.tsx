import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import OwnerSelect from '../components/OwnerSelect'
import { fetchMe, fetchOwnerCandidates } from '../api/client'
import type { EventOwner, User } from '../api/types'
import { renderWithProviders } from './testUtils'

vi.mock('../api/client', () => ({
  ApiError: class extends Error {},
  fetchMe: vi.fn(),
  login: vi.fn(),
  fetchOwnerCandidates: vi.fn(),
  resolveOwnerCandidates: vi.fn().mockResolvedValue([]),
}))

const user: User = {
  id: 1,
  email: 'admin@gmail.com',
  name: 'Admin',
  role: 'administrator',
  isBanned: false,
}

function Harness({ initial }: { initial?: EventOwner[] }) {
  const [owners, setOwners] = useState<EventOwner[]>(initial ?? [])
  return <OwnerSelect owners={owners} onOwnersChange={setOwners} />
}

describe('OwnerSelect', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(fetchMe).mockResolvedValue(user)
    vi.mocked(fetchOwnerCandidates).mockResolvedValue([
      { type: 'person', id: 5, label: 'Falcão' },
      { type: 'person', id: 6, label: 'Curinga' },
    ])
  })

  it('searches persons by substring and adds them as owners', async () => {
    renderWithProviders(<Harness />, { token: 'tok' })

    const input = screen.getByPlaceholderText('Поиск людей…')
    fireEvent.change(input, { target: { value: 'fal' } })

    expect(await screen.findByRole('option', { name: 'Falcão' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('option', { name: 'Falcão' }))

    expect(screen.getByText('Falcão')).toBeInTheDocument()
    expect(fetchOwnerCandidates).toHaveBeenCalledWith('fal', 'tok')
  })

  it('keeps an added person as a chip that can be removed', async () => {
    renderWithProviders(<Harness />, { token: 'tok' })

    const input = screen.getByPlaceholderText('Поиск людей…')
    fireEvent.change(input, { target: { value: 'cur' } })
    await waitFor(() => expect(fetchOwnerCandidates).toHaveBeenCalled())

    fireEvent.click(await screen.findByRole('option', { name: 'Curinga' }))
    const chip = screen.getByText('Curinga')
    expect(chip).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Убрать' }))
    expect(screen.queryByText('Curinga')).not.toBeInTheDocument()
  })

  it('opens the dropdown with all persons in alphabetical order on focus', async () => {
    renderWithProviders(<Harness />, { token: 'tok' })

    fireEvent.focus(screen.getByPlaceholderText('Поиск людей…'))

    // Empty search fetches the full alphabetical list and shows the dropdown.
    await waitFor(() => expect(fetchOwnerCandidates).toHaveBeenCalledWith('', 'tok'))
    expect(await screen.findByRole('option', { name: 'Falcão' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Curinga' })).toBeInTheDocument()
  })
})