/** Rights levels (version0.2): default | moderator | administrator | super admin. */
export type UserRole =
  | 'default'
  | 'moderator'
  | 'administrator'
  | 'super admin'

export const USER_ROLES: readonly UserRole[] = [
  'default',
  'moderator',
  'administrator',
  'super admin',
]

/** Row shape of the users table (internal, includes the password hash). */
export interface UserRow {
  id: number
  email: string
  passwordHash: string
  name: string
  role: UserRole
  isBanned: boolean
  createdAt: Date
}

/** Public user payload sent to the frontend (never includes the hash). */
export interface PublicUser {
  id: number
  email: string
  name: string
  role: UserRole
  isBanned: boolean
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    isBanned: row.isBanned,
  }
}