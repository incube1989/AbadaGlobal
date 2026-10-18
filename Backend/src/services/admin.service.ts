import { pool } from '../db/pool.js'
import { toPublicUser, type PublicUser, type UserRole, type UserRow } from '../models/user.js'

const USER_COLUMNS = `id, email, name, role, is_banned AS "isBanned"`

/** Thrown when an admin tries to modify a super admin. */
export class SuperAdminProtectedError extends Error {
  constructor() {
    super('Super admin cannot be modified')
    this.name = 'SuperAdminProtectedError'
  }
}

/** All users with role and ban state (admin panel). */
export async function listUsers(): Promise<PublicUser[]> {
  const { rows } = await pool.query<UserRow>(
    `SELECT ${USER_COLUMNS} FROM users ORDER BY id`,
  )
  return rows.map(toPublicUser)
}

async function getUserRow(id: number): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
    [id],
  )
  return rows[0] ?? null
}

/** Change a user's role; super admin is protected. */
export async function changeRole(
  id: number,
  role: UserRole,
): Promise<PublicUser | null> {
  const row = await getUserRow(id)
  if (!row) {
    return null
  }
  if (row.role === 'super admin') {
    throw new SuperAdminProtectedError()
  }
  const { rows } = await pool.query<UserRow>(
    `UPDATE users SET role = $1 WHERE id = $2 RETURNING ${USER_COLUMNS}`,
    [role, id],
  )
  return toPublicUser(rows[0])
}

/** Ban or unban a user; super admin is protected. */
export async function setBan(id: number, banned: boolean): Promise<PublicUser | null> {
  const row = await getUserRow(id)
  if (!row) {
    return null
  }
  if (row.role === 'super admin') {
    throw new SuperAdminProtectedError()
  }
  const { rows } = await pool.query<UserRow>(
    `UPDATE users SET is_banned = $1 WHERE id = $2 RETURNING ${USER_COLUMNS}`,
    [banned, id],
  )
  return toPublicUser(rows[0])
}