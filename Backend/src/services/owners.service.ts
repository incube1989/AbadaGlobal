import { pool } from '../db/pool.js'
import type { Corda, CordaTitle } from '../models/person.js'
import { CORDA_TITLES } from '../models/person.js'

/** One result of the owner/guest picker: a person (owners are persons only). */
export interface OwnerCandidate {
  type: 'person'
  id: number
  label: string
  /** Capoeira belt of the person (for the corda badge in pickers). */
  corda: Corda | null
  /** Title derived from the corda. */
  title: CordaTitle | null
}

/** Row of the persons SELECT shared by search/resolve. */
interface PersonCandidateRow {
  id: number
  nickname: string
  corda: Corda | null
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
  const { rows } = await pool.query<PersonCandidateRow>(
    `SELECT id, nickname, corda FROM persons
      WHERE ${where}
      ORDER BY nickname
      LIMIT ${LIMIT}`,
    params,
  )
  return rows.map((p) => ({
    type: 'person' as const,
    id: p.id,
    label: p.nickname,
    corda: p.corda ?? null,
    title: p.corda ? (CORDA_TITLES[p.corda] ?? null) : null,
  }))
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
  const { rows } = await pool.query<PersonCandidateRow>(
    `SELECT id, nickname, corda FROM persons WHERE id = ANY($1) ORDER BY nickname`,
    [personIds],
  )
  return rows.map((p) => ({
    type: 'person' as const,
    id: p.id,
    label: p.nickname,
    corda: p.corda ?? null,
    title: p.corda ? (CORDA_TITLES[p.corda] ?? null) : null,
  }))
}