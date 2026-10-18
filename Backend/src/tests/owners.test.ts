import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { pool } from '../db/pool.js'
import type { UserRow } from '../models/user.js'
import { issueToken } from '../services/auth.service.js'

vi.mock('../db/pool.js', () => ({
  pool: { query: vi.fn(), connect: vi.fn() },
}))

const viewerRow: UserRow = {
  id: 3,
  email: 'superadmin@gmail.com',
  passwordHash: 'x',
  name: 'Super Admin',
  role: 'super admin',
  isBanned: false,
  createdAt: new Date('2026-10-07T00:00:00.000Z'),
}

const token = issueToken(viewerRow.id)

type QueryResult = { rows: unknown[] }

function mockDb(dispatch: (sql: string) => QueryResult): void {
  const impl = async (sql: string): Promise<QueryResult> => {
    if (sql.includes('FROM users') && sql.includes('password_hash')) {
      return { rows: [viewerRow] }
    }
    return dispatch(sql)
  }
  vi.mocked(pool.query).mockImplementation(impl as never)
}

describe('GET /api/owner-candidates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('responds 401 without a token', async () => {
    const res = await request(app).get('/api/owner-candidates?search=fal')
    expect(res.status).toBe(401)
  })

  it('searches persons by substring (owners are persons only)', async () => {
    mockDb((sql) => {
      if (sql.includes('FROM persons')) {
        return { rows: [{ id: 5, nickname: 'Falcão' }] }
      }
      return { rows: [] }
    })
    const res = await request(app)
      .get('/api/owner-candidates?search=fal')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual([{ type: 'person', id: 5, label: 'Falcão' }])
    // No users query is performed (only persons are candidates).
    const sqlCalls = vi.mocked(pool.query).mock.calls.map((c) => String(c[0]))
    expect(sqlCalls.some((s) => s.includes('FROM users') && s.includes('ILIKE'))).toBe(false)
  })

  it('returns all persons in alphabetical order for an empty search', async () => {
    mockDb((sql) => {
      if (sql.includes('FROM persons')) {
        return {
          rows: [
            { id: 1, nickname: 'Caverna' },
            { id: 2, nickname: 'Curinga' },
          ],
        }
      }
      return { rows: [] }
    })
    const res = await request(app)
      .get('/api/owner-candidates?search=')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual([
      { type: 'person', id: 1, label: 'Caverna' },
      { type: 'person', id: 2, label: 'Curinga' },
    ])
    // The empty-search query must not contain a LIKE filter.
    expect(vi.mocked(pool.query)).toHaveBeenCalledWith(
      expect.not.stringContaining('ILIKE'),
      expect.anything(),
    )
  })

  it('resolves concrete person ids for the edit form and ignores user ids', async () => {
    mockDb((sql) => {
      if (sql.includes('FROM persons')) {
        return { rows: [{ id: 5, nickname: 'Falcão' }] }
      }
      return { rows: [] }
    })
    const res = await request(app)
      .get('/api/owner-candidates?ids=person:5,user:1')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual([{ type: 'person', id: 5, label: 'Falcão' }])
    expect(vi.mocked(pool.query)).toHaveBeenCalledWith(
      expect.stringContaining('WHERE id = ANY($1)'),
      [[5]],
    )
  })
})