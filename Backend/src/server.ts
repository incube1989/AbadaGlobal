import { app } from './app.js'
import { env } from './config/env.js'
import { pool } from './db/pool.js'

/**
 * Super-admin guarantee: at least one super admin must always exist.
 * If none is found, the backend fails fatally and exits.
 */
async function assertSuperAdminExists(): Promise<void> {
  const { rows } = await pool.query<{ count: string }>(
    `SELECT count(*)::text AS count FROM users WHERE role = 'super admin'`,
  )
  const count = Number(rows[0]?.count ?? 0)
  if (count < 1) {
    console.error(
      '[fatal] No super admin found in the database. ' +
        'At least one super admin must exist — the backend will not start.',
    )
    await pool.end()
    process.exit(1)
  }
}

async function main(): Promise<void> {
  await assertSuperAdminExists()
  app.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port}`)
  })
}

main().catch(async (err) => {
  console.error('[fatal] failed to start the server:', err)
  await pool.end()
  process.exit(1)
})