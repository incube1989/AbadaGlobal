import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'

describe('GET /api/health', () => {
  it('responds with ok status', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ status: 'ok' })
    expect(typeof res.body.uptime).toBe('number')
    expect(typeof res.body.timestamp).toBe('string')
  })
})

describe('unknown route', () => {
  it('responds 404 with a JSON error', async () => {
    const res = await request(app).get('/api/nope')
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Not found' })
  })
})