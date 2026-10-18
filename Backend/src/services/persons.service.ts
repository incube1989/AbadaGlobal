import { pool } from '../db/pool.js'
import type { Person, PersonInput } from '../models/person.js'

const PERSON_COLUMNS = `id, nickname, country_id AS "countryId",
  user_id AS "userId", is_deleted AS "isDeleted"`

/** Non-deleted persons, optionally filtered by country and/or searched by nickname. */
export async function listPersons(
  countryId?: number,
  search?: string,
): Promise<Person[]> {
  const params: unknown[] = []
  const clauses: string[] = [`is_deleted = false`]
  if (countryId !== undefined) {
    params.push(countryId)
    clauses.push(`country_id = $${params.length}`)
  }
  if (search) {
    params.push(`%${search}%`)
    clauses.push(`nickname ILIKE $${params.length}`)
  }
  const { rows } = await pool.query<Person>(
    `SELECT ${PERSON_COLUMNS} FROM persons
      WHERE ${clauses.join(' AND ')}
      ORDER BY nickname`,
    params,
  )
  return rows
}

export async function getPerson(id: number): Promise<Person | null> {
  const { rows } = await pool.query<Person>(
    `SELECT ${PERSON_COLUMNS} FROM persons WHERE id = $1`,
    [id],
  )
  return rows[0] ?? null
}

export async function createPerson(input: PersonInput): Promise<Person> {
  const { rows } = await pool.query<Person>(
    `INSERT INTO persons (nickname, country_id, user_id)
     VALUES ($1, $2, $3)
     RETURNING ${PERSON_COLUMNS}`,
    [input.nickname, input.countryId, input.userId],
  )
  return rows[0]
}

/** Update a person; userId null unlinks the linked user account. */
export async function updatePerson(
  id: number,
  input: PersonInput,
): Promise<Person | null> {
  const { rows } = await pool.query<Person>(
    `UPDATE persons SET nickname = $1, country_id = $2, user_id = $3
      WHERE id = $4
     RETURNING ${PERSON_COLUMNS}`,
    [input.nickname, input.countryId, input.userId, id],
  )
  return rows[0] ?? null
}

/** Soft-delete a person. */
export async function deletePerson(id: number): Promise<boolean> {
  const { rowCount } = await pool.query(
    `UPDATE persons SET is_deleted = true WHERE id = $1 AND is_deleted = false`,
    [id],
  )
  return (rowCount ?? 0) > 0
}