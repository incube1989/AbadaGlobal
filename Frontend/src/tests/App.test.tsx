import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

describe('App', () => {
  beforeAll(() => {
    // Mock the health-check fetch used by the Home page.
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok', uptime: 1, timestamp: '2026-10-07T00:00:00.000Z' }),
    }) as unknown as typeof fetch
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it('renders the home page heading', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('AbadaGlobal')
    // Flush the health-check effect and verify the API status is shown.
    expect(await screen.findByText('ok')).toBeInTheDocument()
  })
})