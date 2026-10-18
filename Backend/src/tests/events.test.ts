import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { pool } from '../db/pool.js'
import type { Event } from '../models/event.js'
import { issueToken } from '../services/auth.service.js'

// Isolate the API from PostgreSQL — pool.query is mocked in every test.
vi.mock('../db/pool.js', () => ({
  pool: { query: vi.fn() },
}))

const sampleEvents: Event[] = [
  {
    id: 1,
    name: 'Zumbimba',
    startDate: '2027-11-01',
    endDate: '2027-11-30',
    place: 'Rio de Janeiro',
    type: 'batizado',
    scope: 'world',
  },
  {
    id: 2,
    name: 'Competition',
    startDate: '2026-12-04',
    endDate: '2026-12-06',
    place: 'Voronezh',
    type: 'competition',
    scope: 'Russia',
  },
]

const token = issueToken(1)

function mockRows(rows: unknown[]): void {
  vi.mocked(pool.query).mockResolvedValue({
    rows,
  } as unknown as Awaited<ReturnType<typeof pool.query>>)
}

describe('GET /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('responds 401 without a token', async () => {
    const res = await request(app).get('/api/events')
    expect(res.status).toBe(401)
  })

  it('lists all events with a valid token', async () => {
    mockRows(sampleEvents)
    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[0]).toMatchObject({ name: 'Zumbimba', scope: 'world' })
  })

  it('passes scope and type filters to the query', async () => {
    mockRows([sampleEvents[1]])
    await request(app)
      .get('/api/events?scope=Russia&type=competition')
      .set('Authorization', `Bearer ${token}`)

    expect(vi.mocked(pool.query)).toHaveBeenCalledWith(
      expect.stringContaining('WHERE scope = $1 AND type = $2'),
      ['Russia', 'competition'],
    )
  })

  it('rejects an unknown scope with 400', async () => {
    const res = await request(app)
      .get('/api/events?scope=bogus')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(400)
  })

  it('rejects an unknown type with 400', async () => {
    const res = await request(app)
      .get('/api/events?type=party')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(400)
  })
})

describe('GET /api/events/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('responds 401 without a token', async () => {
    const res = await request(app).get('/api/events/1')
    expect(res.status).toBe(401)
  })

  it('returns a single event', async () => {
    mockRows([sampleEvents[0]])
    const res = await request(app)
      .get('/api/events/1')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 1, name: 'Zumbimba' })
  })

  it('responds 404 for an unknown id', async () => {
    mockRows([])
    const res = await request(app)
      .get('/api/events/9999')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it('responds 400 for a non-numeric id', async () => {
    const res = await request(app)
      .get('/api/events/abc')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(400)
  })
})