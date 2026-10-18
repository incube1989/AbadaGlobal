import 'dotenv/config'

/**
 * Salt used to hash passwords with Node's scrypt. Must match the seed data
 * in db/migrations/004_seed_mvp.sql so the seeded logins verify correctly.
 */
export const PASSWORD_SALT = 'abadaglobal-mvp-salt'

export const env = {
  /** Port the API server listens on. */
  port: Number(process.env.PORT ?? 3000),
  /** PostgreSQL connection string. */
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgres://postgres:postgres@localhost:5432/abadaglobal',
  /** Secret used to sign auth tokens (HS256). Dev fallback when unset. */
  authSecret: process.env.AUTH_SECRET ?? 'abadaglobal-dev-secret-change-me',
  /** Auth token lifetime in days (per MVP scope). */
  tokenTtlDays: 7,
} as const

if (!process.env.AUTH_SECRET) {
  console.warn('[env] AUTH_SECRET is not set — using the development fallback secret')
}