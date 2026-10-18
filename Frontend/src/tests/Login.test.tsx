import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import App from '../App'
import { ApiError, login } from '../api/client'
import { renderWithProviders } from './testUtils'

vi.mock('../api/client', () => ({
  ApiError: class extends Error {
    constructor(
      public readonly status: number,
      message: string,
    ) {
      super(message)
      this.name = 'ApiError'
    }
  },
  fetchMe: vi.fn(),
  login: vi.fn(),
  fetchEvents: vi.fn().mockResolvedValue([]),
  fetchEvent: vi.fn(),
}))

describe('Login page', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(login).mockResolvedValue({
      token: 'token-123',
      user: { id: 1, email: 'admin@gmail.com', name: 'Admin', role: 'admin' },
    })
  })

  it('logs in with credentials and lands on the calendar', async () => {
    renderWithProviders(<App />, { initialEntries: ['/login'] })

    fireEvent.change(screen.getByLabelText(/Электронная почта/), {
      target: { value: 'admin@gmail.com' },
    })
    fireEvent.change(screen.getByLabelText(/Пароль/), {
      target: { value: '1234' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }))

    expect(await screen.findByRole('heading', { name: 'Календарь событий' })).toBeInTheDocument()
    expect(login).toHaveBeenCalledWith({ email: 'admin@gmail.com', password: '1234' })
  })

  it('shows the API error message on failed login', async () => {
    vi.mocked(login).mockRejectedValue(new ApiError(401, 'Invalid email or password'))
    renderWithProviders(<App />, { initialEntries: ['/login'] })

    fireEvent.change(screen.getByLabelText(/Электронная почта/), {
      target: { value: 'admin@gmail.com' },
    })
    fireEvent.change(screen.getByLabelText(/Пароль/), {
      target: { value: 'wrong' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }))

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument()
  })
})