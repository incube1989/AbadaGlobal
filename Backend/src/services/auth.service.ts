import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto'
import { PASSWORD_SALT, env } from '../config/env.js'
import { pool } from '../db/pool.js'
import { toPublicUser, type PublicUser, type UserRow } from '../models/user.js'

const TOKEN_ALG = 'HS256'
const TOKEN_TYP = 'abadaglobal'

function hashPassword(password: string): string {
  return scryptSync(password, PASSWORD_SALT, 64).toString('hex')
}

/** Constant-time comparison of a candidate password against a stored scrypt hash. */
export function verifyPassword(password: string, storedHash: string): boolean {
  const candidate = Buffer.from(hashPassword(password), 'hex')
  const expected = Buffer.from(storedHash, 'hex')
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

export async function findByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    `SELECT id, email, password_hash AS "passwordHash", name, role,
            created_at AS "createdAt"
       FROM users
      WHERE email = $1`,
    [email],
  )
  return rows[0] ?? null
}

export async function findById(id: number): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    `SELECT id, email, password_hash AS "passwordHash", name, role,
            created_at AS "createdAt"
       FROM users
      WHERE id = $1`,
    [id],
  )
  return rows[0] ?? null
}

/** Validate email + password; returns the public user or null. */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<PublicUser | null> {
  const row = await findByEmail(email)
  if (!row || !verifyPassword(password, row.passwordHash)) {
    return null
  }
  return toPublicUser(row)
}

export interface TokenPayload {
  uid: number
  exp: number
}

function base64urlEncode(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function sign(data: string): string {
  return createHmac('sha256', env.authSecret).update(data).digest('base64url')
}

/** Issue an opaque HMAC-signed token valid for env.tokenTtlDays days. */
export function issueToken(userId: number): string {
  const header = base64urlEncode({ alg: TOKEN_ALG, typ: TOKEN_TYP })
  const payload = base64urlEncode({
    uid: userId,
    exp: Date.now() + env.tokenTtlDays * 24 * 60 * 60 * 1000,
  })
  return `${header}.${payload}.${sign(`${header}.${payload}`)}`
}

/** Verify signature and expiry; returns the payload or null. */
export function verifyToken(token: string): TokenPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) {
    return null
  }
  const [header, payload, signature] = parts
  const expected = Buffer.from(sign(`${header}.${payload}`))
  const given = Buffer.from(signature)
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return null
  }
  try {
    const decoded = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as Partial<TokenPayload>
    if (typeof decoded.uid !== 'number' || typeof decoded.exp !== 'number') {
      return null
    }
    if (decoded.exp <= Date.now()) {
      return null
    }
    return { uid: decoded.uid, exp: decoded.exp }
  } catch {
    return null
  }
}