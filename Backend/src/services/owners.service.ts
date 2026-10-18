import { pool } from '../db/pool.js'

/** One result of the owner picker: a person (owners are persons only). */
export interface OwnerCandidate {
  type: 'person'
  id: number
  label: string
}

const LIMIT = 50

/**
 * Search non-deleted persons for the event owner picker. Owners are persons
 * only — users are not owner candidates. An empty search returns all persons
 * in alphabetical order (for the dropdown on focus); a non-empty search does a
 * case-insensitive substring match on the nickname.
 */
export async function searchOwners(search: string): Promise<OwnerCandidate[]> {
  const term = search.trim()
  const params: unknown[] = []
  let where = `is_deleted = false`
  if (term) {
    params.push(`%${term}%`)
    where += ` AND nickname ILIKE $${params.length}`
  }
  const { rows } = await pool.query<{ id: number; nickname: string }>(
    `SELECT id, nickname FROM persons
      WHERE ${where}
      ORDER BY nickname
      LIMIT ${LIMIT}`,
    params,
  )
  return rows.map((p) => ({ type: 'person' as const, id: p.id, label: p.nickname }))
}

/**
 * Resolve concrete persons by ids ("person:1,person:2") so the edit form can
 * show friendly labels for an event's existing owner list.
 */
export async function resolveOwners(ids: string): Promise<OwnerCandidate[]> {
  const personIds: number[] = []
  for (const token of ids.split(',').map((t) => t.trim())) {
    if (!token) continue
    const sep = token.indexOf(':')
    if (sep === -1) continue
    const type = token.slice(0, sep)
    if (type !== 'person') continue
    const id = Number(token.slice(sep + 1))
    if (Number.isInteger(id) && id >= 1) {
      personIds.push(id)
    }
  }
  if (personIds.length === 0) {
    return []
  }
  const { rows } = await pool.query<{ id: number; nickname: string }>(
    `SELECT id, nickname FROM persons WHERE id = ANY($1) ORDER BY nickname`,
    [personIds],
  )
  return rows.map((p) => ({ type: 'person' as const, id: p.id, label: p.nickname }))
}