import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { pool } from '../db/pool.js'
import type { Event } from '../models/event.js'
import type { UserRow } from '../models/user.js'
import { issueToken } from '../services/auth.service.js'

// Isolate the API from PostgreSQL — pool.query / pool.connect are mocked.
vi.mock('../db/pool.js', () => ({
  pool: { query: vi.fn(), connect: vi.fn() },
}))

const viewerRow: UserRow = {
  id: 1,
  email: 'admin@gmail.com',
  passwordHash: 'x',
  name: 'Admin',
  role: 'administrator',
  isBanned: false,
  createdAt: new Date('2026-10-07T00:00:00.000Z'),
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
    ownerList: [],
    guests: [],
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
    ownerList: [],
    guests: [],
  },
]

/** Row the mocked guest query returns (corda azul -> Graduado). */
const GUEST_ROW = { id: 5, nickname: 'Falcão', corda: 'azul' }

const sampleGuests: Event['guests'] = [
  { id: 5, nickname: 'Falcão', corda: 'azul', title: 'Graduado' },
]

const token = issueToken(1)

type QueryResult = { rows: unknown[]; rowCount?: number }

/** Dispatch pool.query / client.query by SQL content. */
function mockDb(dispatch: (sql: string, params?: unknown[]) => QueryResult): void {
  const impl = async (sql: string, params?: unknown[]): Promise<QueryResult> =>
    dispatch(sql, params)
  vi.mocked(pool.query).mockImplementation(impl as never)
  const client = { query: vi.fn(impl as never), release: vi.fn() }
  vi.mocked(pool.connect).mockResolvedValue(client as never)
}

function defaultDispatch(events: Event[] = sampleEvents) {
  return (sql: string): QueryResult => {
    if (sql.includes('FROM users')) {
      return { rows: [viewerRow] }
    }
    // NOTE: the events list query contains an EXISTS subquery over
    // event_owners, so 'FROM events' must be matched before 'FROM event_owners'.
    if (sql.includes('FROM events')) {
      return { rows: events }
    }
    if (sql.includes('FROM event_owners')) {
      return { rows: [{ userId: 1, personId: null, nickname: 'Admin', corda: null }] }
    }
    if (sql.includes('FROM event_guests')) {
      return { rows: [GUEST_ROW] }
    }
    if (sql.includes('INSERT INTO events')) {
      return { rows: [events[0]] }
    }
    if (sql.includes('UPDATE events')) {
      return { rows: [events[0]] }
    }
    if (sql.includes('DELETE FROM event_owners')) {
      return { rows: [] }
    }
    if (sql.includes('DELETE FROM event_guests')) {
      return { rows: [] }
    }
    return { rows: [] }
  }
}

describe('GET /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('responds 401 without a token', async () => {
    const res = await request(app).get('/api/events')
    expect(res.status).toBe(401)
  })

  it('lists events with a valid token', async () => {
    mockDb(defaultDispatch())
    const res = await request(app)
      .get('/api/events')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[0]).toMatchObject({ name: 'Zumbimba', scope: 'world', status: 'published' })
    expect(res.body[0].owners).toEqual([{ userId: 1 }])
    // Resolved owners for the event page top: name + corda/title.
    expect(res.body[0].ownerList).toEqual([
      { userId: 1, nickname: 'Admin', corda: null, title: null },
    ])
    expect(res.body[0].guests).toEqual(sampleGuests)
  })

  it('passes scope and type filters to the query', async () => {
    mockDb(defaultDispatch([sampleEvents[1]]))
    await request(app)
      .get('/api/events?scope=Russia&type=competition')
      .set('Authorization', `Bearer ${token}`)

    expect(vi.mocked(pool.query)).toHaveBeenCalledWith(
      expect.stringContaining('e.scope = $1 AND e.type = $2'),
      expect.anything(),
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
    mockDb(defaultDispatch([sampleEvents[0]]))
    const res = await request(app)
      .get('/api/events/1')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: 1, name: 'Zumbimba' })
  })

  it('responds 404 for an unknown id', async () => {
    mockDb(defaultDispatch([]))
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

describe('POST /api/events', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates an event and returns 201', async () => {
    mockDb(defaultDispatch())
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New event',
        startDate: '2028-01-10',
        endDate: '2028-01-12',
        countryId: 1,
        regionId: 2,
        type: 'camp',
        scope: 'region',
      })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ name: 'Zumbimba' })
  })

  it('persists guests when creating an event', async () => {
    const client = { query: vi.fn(), release: vi.fn() }
    vi.mocked(pool.connect).mockResolvedValue(client as never)
    vi.mocked(pool.query).mockImplementation(
      async (sql: string): Promise<QueryResult> => {
        if (sql.includes('FROM users')) {
          return { rows: [viewerRow] }
        }
        if (sql.includes('INSERT INTO events')) {
          return { rows: [sampleEvents[0]] }
        }
        return { rows: [] }
      },
    )
    vi.mocked(client.query).mockImplementation(
      async (sql: string): Promise<QueryResult> => {
        if (sql.includes('INSERT INTO events')) {
          return { rows: [sampleEvents[0]] }
        }
        return { rows: [] }
      },
    )

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New event',
        startDate: '2028-01-10',
        endDate: '2028-01-12',
        countryId: 1,
        regionId: 2,
        type: 'camp',
        scope: 'region',
        guests: [5, 6],
      })
    expect(res.status).toBe(201)
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO event_guests'),
      expect.anything(),
    )
  })

  it('rejects invalid event data with 400', async () => {
    mockDb(defaultDispatch())
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '', startDate: 'bad', endDate: '2028-01-12', type: 'camp', scope: 'region' })
    expect(res.status).toBe(400)
  })
})

describe('PUT /api/events/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates an event the user owns', async () => {
    mockDb(defaultDispatch())
    const res = await request(app)
      .put('/api/events/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated event',
        startDate: '2028-02-01',
        endDate: '2028-02-03',
        countryId: 1,
        regionId: null,
        type: 'festival',
        scope: 'local',
        owners: [{ userId: 1 }],
      })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ name: 'Zumbimba' })
  })

  it('replaces guests when updating an event', async () => {
    const client = { query: vi.fn(), release: vi.fn() }
    vi.mocked(pool.connect).mockResolvedValue(client as never)
    vi.mocked(pool.query).mockImplementation(
      async (sql: string): Promise<QueryResult> => {
        if (sql.includes('FROM users')) {
          return { rows: [viewerRow] }
        }
        if (sql.includes('FROM events')) {
          return { rows: [sampleEvents[0]] }
        }
        if (sql.includes('FROM event_guests')) {
          return { rows: [GUEST_ROW] }
        }
        return { rows: [] }
      },
    )
    vi.mocked(client.query).mockImplementation(
      async (sql: string): Promise<QueryResult> =>
        sql.includes('UPDATE events') ? { rows: [sampleEvents[0]] } : { rows: [] },
    )

    const res = await request(app)
      .put('/api/events/1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated event',
        startDate: '2028-02-01',
        endDate: '2028-02-03',
        countryId: 1,
        regionId: null,
        type: 'festival',
        scope: 'local',
        guests: [9],
      })
    expect(res.status).toBe(200)
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM event_guests'),
      expect.anything(),
    )
    expect(client.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO event_guests'),
      expect.anything(),
    )
  })

  it('responds 404 for an unknown event', async () => {
    mockDb(defaultDispatch([]))
    const res = await request(app)
      .put('/api/events/9999')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'X',
        startDate: '2028-02-01',
        endDate: '2028-02-03',
        countryId: null,
        regionId: null,
        type: 'festival',
        scope: 'local',
      })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/events/:id', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('soft-deletes an event the user owns', async () => {
    mockDb(defaultDispatch())
    const res = await request(app)
      .delete('/api/events/1')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(204)
  })

  it('responds 404 for an unknown event', async () => {
    mockDb(defaultDispatch([]))
    const res = await request(app)
      .delete('/api/events/9999')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
  })
})