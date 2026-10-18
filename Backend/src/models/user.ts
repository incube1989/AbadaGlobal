/** Row shape of the users table (internal, includes the password hash). */
export interface UserRow {
  id: number
  email: string
  passwordHash: string
  name: string
  role: 'admin' | 'moderator' | 'simple user'
  createdAt: Date
}

/** Public user payload sent to the frontend (never includes the hash). */
export interface PublicUser {
  id: number
  email: string
  name: string
  role: UserRow['role']
}

export function toPublicUser(row: UserRow): PublicUser {
  return { id: row.id, email: row.email, name: row.name, role: row.role }
}