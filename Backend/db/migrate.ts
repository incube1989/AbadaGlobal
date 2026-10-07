import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { pool } from '../src/db/pool.js'

/**
 * Minimal SQL migration runner.
 *
 * - Applies db/migrations/*.sql in filename order, once each.
 * - Tracks applied migrations in the schema_migrations table.
 * - Each migration runs inside a transaction.
 *
 * Usage (from the Backend/ directory): npm run db:migrate
 */
const MIGRATIONS_DIR = path.resolve(process.cwd(), 'db/migrations')

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `)
}

async function applyPending(): Promise<void> {
  await ensureMigrationsTable()

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith('.sql'))
    .sort()

  const { rows } = await pool.query<{ name: string }>(
    'SELECT name FROM schema_migrations',
  )
  const applied = new Set(rows.map((r) => r.name))

  for (const file of files) {
    if (applied.has(file)) {
      continue
    }

    const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8')
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
      await client.query('COMMIT')
      console.log(`[migrate] applied ${file}`)
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }
}

applyPending()
  .then(() => pool.end())
  .catch(async (err) => {
    console.error('[migrate] failed:', err)
    await pool.end()
    process.exitCode = 1
  })