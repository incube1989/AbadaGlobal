import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { pool } from '../db/pool.js'
import type { UserRow } from '../models/user.js'
import { issueToken } from '../services/auth.service.js'

vi.mock('../db/pool.js', () => ({
  pool: { query: vi.fn(), connect: vi.fn() },
}))

const moderatorRow: UserRow = {
  id: 2,
  email: 'mod@gmail.com',
  passwordHash: 'x',
  name: 'Moderator',
  role: 'moderator',
  isBanned: false,
  createdAt: new Date('2026-10-07T00:00:00.000Z'),
}

const defaultRow: UserRow = {
  id: 3,
  email: 'user@gmail.com',
  passwordHash: 'x',
  name: 'User',
  role: 'default',
  isBanned: false,
  createdAt: new Date('2026-10-07T00:00:00.000Z'),
}

const modToken = issueToken(moderatorRow.id)
const userToken = issueToken(defaultRow.id)

type QueryResult = { rows: unknown[]; rowCount?: number }

function mockDb(viewer: UserRow, dispatch: (sql: string) => QueryResult): void {
  const impl = async (sql: string): Promise<QueryResult> => {
    if (sql.includes('FROM users')) {
      return { rows: [viewer] }
    }
    return dispatch(sql)
  }
  vi.mocked(pool.query).mockImplementation(impl as never)
}

describe('countries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists countries for any logged-in user', async () => {
    mockDb(defaultRow, (sql) =>
      sql.includes('FROM countries') ? { rows: [{ id: 1, name: 'Russia', isDeleted: false }] } : { rows: [] },
    )
    const res = await request(app)
      .get('/api/countries')
      .set('Authorization', `Bearer ${userToken}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual([{ id: 1, name: 'Russia', isDeleted: false }])
  })

  it('allows a moderator to create a country', async () => {
    mockDb(moderatorRow, (sql) =>
      sql.includes('INSERT INTO countries')
        ? { rows: [{ id: 4, name: 'Portugal', isDeleted: false }] }
        : { rows: [] },
    )
    const res = await request(app)
      .post('/api/countries')
      .set('Authorization', `Bearer ${modToken}`)
      .send({ name: 'Portugal' })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ name: 'Portugal' })
  })

  it('forbids a default user from creating a country', async () => {
    mockDb(defaultRow, () => ({ rows: [] }))
    const res = await request(app)
      .post('/api/countries')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Portugal' })
    expect(res.status).toBe(403)
  })

  it('soft-deletes a country as a moderator', async () => {
    mockDb(moderatorRow, (sql) =>
      sql.includes('UPDATE countries')
        ? { rows: [], rowCount: 1 }
        : { rows: [] },
    )
    const res = await request(app)
      .delete('/api/countries/1')
      .set('Authorization', `Bearer ${modToken}`)
    expect(res.status).toBe(204)
  })
})

describe('regions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists regions filtered by country', async () => {
    mockDb(defaultRow, (sql) =>
      sql.includes('FROM regions')
        ? { rows: [{ id: 1, name: 'Samara', countryId: 1, isDeleted: false }] }
        : { rows: [] },
    )
    const res = await request(app)
      .get('/api/regions?countryId=1')
      .set('Authorization', `Bearer ${userToken}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(vi.mocked(pool.query)).toHaveBeenCalledWith(
      expect.stringContaining('country_id = $1'),
      expect.anything(),
    )
  })

  it('allows a moderator to create a region', async () => {
    mockDb(moderatorRow, (sql) =>
      sql.includes('INSERT INTO regions')
        ? { rows: [{ id: 8, name: 'Lisbon', countryId: 4, isDeleted: false }] }
        : { rows: [] },
    )
    const res = await request(app)
      .post('/api/regions')
      .set('Authorization', `Bearer ${modToken}`)
      .send({ name: 'Lisbon', countryId: 4 })
    expect(res.status).toBe(201)
  })

  it('forbids a default user from creating a region', async () => {
    mockDb(defaultRow, () => ({ rows: [] }))
    const res = await request(app)
      .post('/api/regions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Lisbon', countryId: 4 })
    expect(res.status).toBe(403)
  })
})

describe('persons', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists persons filtered by country', async () => {
    mockDb(defaultRow, (sql) =>
      sql.includes('FROM persons')
        ? { rows: [{ id: 1, nickname: 'Falcão', countryId: 1, userId: null, isDeleted: false, corda: null }] }
        : { rows: [] },
    )
    const res = await request(app)
      .get('/api/persons?countryId=1')
      .set('Authorization', `Bearer ${userToken}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual([
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
    ])
  })

  it('links a person to a user via update', async () => {
    mockDb(moderatorRow, (sql) =>
      sql.includes('UPDATE persons')
        ? { rows: [{ id: 1, nickname: 'Falcão', countryId: 1, userId: 3, isDeleted: false, corda: null }] }
        : { rows: [] },
    )
    const res = await request(app)
      .put('/api/persons/1')
      .set('Authorization', `Bearer ${modToken}`)
      .send({ nickname: 'Falcão', countryId: 1, userId: 3 })
    expect(res.status).toBe(200)
    expect(res.body.userId).toBe(3)
    expect(res.body.corda).toBeNull()
    expect(res.body.title).toBeNull()
  })

  it('sets the corda on a person and derives the title', async () => {
    mockDb(moderatorRow, (sql) =>
      sql.includes('UPDATE persons')
        ? { rows: [{ id: 1, nickname: 'Falcão', countryId: 1, userId: null, isDeleted: false, corda: 'azul-verde' }] }
        : { rows: [] },
    )
    const res = await request(app)
      .put('/api/persons/1')
      .set('Authorization', `Bearer ${modToken}`)
      .send({ nickname: 'Falcão', countryId: 1, userId: null, corda: 'azul-verde' })
    expect(res.status).toBe(200)
    expect(res.body.corda).toBe('azul-verde')
    expect(res.body.title).toBe('Graduado')
  })

  it('stores the curator list of a person', async () => {
    mockDb(moderatorRow, (sql) => {
      if (sql.includes('UPDATE persons')) {
        return { rows: [{ id: 1, nickname: 'Falcão', countryId: 1, userId: null, isDeleted: false, corda: null }] }
      }
      if (sql.includes('FROM person_curators')) {
        return { rows: [{ curatorId: 22 }] }
      }
      return { rows: [] }
    })
    const res = await request(app)
      .put('/api/persons/1')
      .set('Authorization', `Bearer ${modToken}`)
      .send({ nickname: 'Falcão', countryId: 1, userId: null, curator: [22] })
    expect(res.status).toBe(200)
    expect(res.body.curator).toEqual([22])
  })

  it('rejects an unknown corda with 400', async () => {
    mockDb(moderatorRow, () => ({ rows: [] }))
    const res = await request(app)
      .put('/api/persons/1')
      .set('Authorization', `Bearer ${modToken}`)
      .send({ nickname: 'Falcão', countryId: 1, userId: null, corda: 'bogus' })
    expect(res.status).toBe(400)
  })

  it('forbids a default user from creating a person', async () => {
    mockDb(defaultRow, () => ({ rows: [] }))
    const res = await request(app)
      .post('/api/persons')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nickname: 'Falcão', countryId: 1 })
    expect(res.status).toBe(403)
  })
})