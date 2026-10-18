import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { pool } from '../db/pool.js'
import type { UserRow } from '../models/user.js'
import { issueToken } from '../services/auth.service.js'

// Isolate the API from PostgreSQL — pool.query is mocked in every test.
vi.mock('../db/pool.js', () => ({
  pool: { query: vi.fn() },
}))

const adminRow: UserRow = {
  id: 1,
  email: 'admin@gmail.com',
  passwordHash:
    'df4079a602d5f1f40a6d9c3d2db9e31c7163d3451b0637eb845007d0707982ebbd1fa56fca0a74afbcc23b310407c44b3005b2d3f81e9cc1f5d277a04c36644d',
  name: 'Admin',
  role: 'admin',
  createdAt: new Date('2026-10-07T00:00:00.000Z'),
}

function mockUserLookup(row: UserRow | null): void {
  vi.mocked(pool.query).mockResolvedValue({
    rows: row ? [row] : [],
  } as unknown as Awaited<ReturnType<typeof pool.query>>)
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('logs in the admin user and returns a token plus the public user', async () => {
    mockUserLookup(adminRow)
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@gmail.com', password: '1234' })

    expect(res.status).toBe(200)
    expect(typeof res.body.token).toBe('string')
    expect(res.body.token.split('.')).toHaveLength(3)
    expect(res.body.user).toEqual({
      id: 1,
      email: 'admin@gmail.com',
      name: 'Admin',
      role: 'admin',
    })
    expect(res.body.user.passwordHash).toBeUndefined()
  })

  it('rejects a wrong password with 401', async () => {
    mockUserLookup(adminRow)
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@gmail.com', password: 'wrong' })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'Invalid email or password' })
  })

  it('rejects an unknown email with 401', async () => {
    mockUserLookup(null)
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: '1234' })
    expect(res.status).toBe(401)
  })

  it('rejects a missing body with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({})
    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'Email and password are required' })
  })
})

describe('GET /api/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the current user with a valid bearer token', async () => {
    mockUserLookup(adminRow)
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${issueToken(adminRow.id)}`)
    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      id: 1,
      email: 'admin@gmail.com',
      name: 'Admin',
      role: 'admin',
    })
  })

  it('responds 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('responds 401 with a tampered token', async () => {
    mockUserLookup(adminRow)
    const token = `${issueToken(adminRow.id)}tampered`
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(401)
  })
})