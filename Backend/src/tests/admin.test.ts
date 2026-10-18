import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { pool } from '../db/pool.js'
import type { UserRow } from '../models/user.js'
import { issueToken } from '../services/auth.service.js'

vi.mock('../db/pool.js', () => ({
  pool: { query: vi.fn(), connect: vi.fn() },
}))

const adminRow: UserRow = {
  id: 1,
  email: 'admin@gmail.com',
  passwordHash: 'x',
  name: 'Admin',
  role: 'administrator',
  isBanned: false,
  createdAt: new Date('2026-10-07T00:00:00.000Z'),
}

const superAdminRow: UserRow = {
  id: 4,
  email: 'superadmin@gmail.com',
  passwordHash: 'x',
  name: 'Super Admin',
  role: 'super admin',
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

const adminToken = issueToken(adminRow.id)
const userToken = issueToken(defaultRow.id)

type QueryResult = { rows: unknown[]; rowCount?: number }

function mockDb(viewer: UserRow, dispatch: (sql: string) => QueryResult): void {
  const impl = async (sql: string): Promise<QueryResult> => {
    // Auth lookup (requireAuth -> findById) is the only users query that
    // selects password_hash; everything else goes to the test dispatch.
    if (sql.includes('FROM users') && sql.includes('password_hash')) {
      return { rows: [viewer] }
    }
    return dispatch(sql)
  }
  vi.mocked(pool.query).mockImplementation(impl as never)
}

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists all users for an administrator', async () => {
    mockDb(adminRow, (sql) =>
      sql.includes('FROM users')
        ? { rows: [adminRow, defaultRow] }
        : { rows: [] },
    )
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(2)
    expect(res.body[0]).toMatchObject({ role: 'administrator' })
  })

  it('forbids a default user', async () => {
    mockDb(defaultRow, () => ({ rows: [] }))
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`)
    expect(res.status).toBe(403)
  })
})

describe('PUT /api/admin/users/:id/role', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('changes the role of a non-super-admin user', async () => {
    mockDb(adminRow, (sql) =>
      sql.includes('UPDATE users')
        ? { rows: [{ ...defaultRow, role: 'moderator' }] }
        : { rows: [defaultRow] },
    )
    const res = await request(app)
      .put('/api/admin/users/3/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'moderator' })
    expect(res.status).toBe(200)
    expect(res.body.role).toBe('moderator')
  })

  it('rejects changing a super admin with 403', async () => {
    mockDb(adminRow, (sql) =>
      sql.includes('FROM users') ? { rows: [superAdminRow] } : { rows: [] },
    )
    const res = await request(app)
      .put('/api/admin/users/4/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'default' })
    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: 'Super admin cannot be modified' })
  })

  it('rejects an invalid role with 400', async () => {
    mockDb(adminRow, () => ({ rows: [] }))
    const res = await request(app)
      .put('/api/admin/users/3/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'boss' })
    expect(res.status).toBe(400)
  })
})

describe('PUT /api/admin/users/:id/ban', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('bans a non-super-admin user', async () => {
    mockDb(adminRow, (sql) =>
      sql.includes('UPDATE users')
        ? { rows: [{ ...defaultRow, isBanned: true }] }
        : { rows: [defaultRow] },
    )
    const res = await request(app)
      .put('/api/admin/users/3/ban')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ banned: true })
    expect(res.status).toBe(200)
    expect(res.body.isBanned).toBe(true)
  })

  it('rejects banning a super admin with 403', async () => {
    mockDb(adminRow, (sql) =>
      sql.includes('FROM users') ? { rows: [superAdminRow] } : { rows: [] },
    )
    const res = await request(app)
      .put('/api/admin/users/4/ban')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ banned: true })
    expect(res.status).toBe(403)
  })

  it('rejects a non-boolean banned value with 400', async () => {
    mockDb(adminRow, () => ({ rows: [] }))
    const res = await request(app)
      .put('/api/admin/users/3/ban')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ banned: 'yes' })
    expect(res.status).toBe(400)
  })
})