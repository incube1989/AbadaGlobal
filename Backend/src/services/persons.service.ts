import { pool } from '../db/pool.js'
import type {
  Corda,
  CordaTitle,
  Person,
  PersonInput,
} from '../models/person.js'
import { CORDA_TITLES } from '../models/person.js'

const PERSON_COLUMNS = `id, nickname, country_id AS "countryId",
  user_id AS "userId", is_deleted AS "isDeleted", corda`

/** Title derived from the stored corda. */
function titleOf(corda: Corda | null): CordaTitle | null {
  return corda ? (CORDA_TITLES[corda] ?? null) : null
}

/** The plain row shape produced by PERSON_COLUMNS. */
type PersonRow = Omit<Person, 'title' | 'curator' | 'head'>

/** Curator person ids of a person; null when there are none. */
async function loadCurators(personId: number): Promise<number[] | null> {
  const { rows } = await pool.query<{ curatorId: number }>(
    'SELECT curator_id AS "curatorId" FROM person_curators WHERE person_id = $1 ORDER BY id',
    [personId],
  )
  return rows.length ? rows.map((r) => r.curatorId) : null
}

/** Region ids headed by a person; null when there are none. */
async function loadHeads(personId: number): Promise<number[] | null> {
  const { rows } = await pool.query<{ regionId: number }>(
    'SELECT region_id AS "regionId" FROM person_heads WHERE person_id = $1 ORDER BY id',
    [personId],
  )
  return rows.length ? rows.map((r) => r.regionId) : null
}

/** Assemble the full API shape (title + curator + head) for a person row. */
async function decorate(row: PersonRow): Promise<Person> {
  return {
    ...row,
    title: titleOf(row.corda),
    curator: await loadCurators(row.id),
    head: await loadHeads(row.id),
  }
}

/** Replace the curator list of a person (null clears it). */
async function replaceCurators(personId: number, curators: number[] | null): Promise<void> {
  await pool.query('DELETE FROM person_curators WHERE person_id = $1', [personId])
  if (curators) {
    for (const curatorId of new Set(curators)) {
      if (Number.isInteger(curatorId) && curatorId >= 1 && curatorId !== personId) {
        await pool.query(
          'INSERT INTO person_curators (person_id, curator_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [personId, curatorId],
        )
      }
    }
  }
}

/** Replace the headed-region list of a person (null clears it). */
async function replaceHeads(personId: number, heads: number[] | null): Promise<void> {
  await pool.query('DELETE FROM person_heads WHERE person_id = $1', [personId])
  if (heads) {
    for (const regionId of new Set(heads)) {
      if (Number.isInteger(regionId) && regionId >= 1) {
        await pool.query(
          'INSERT INTO person_heads (person_id, region_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [personId, regionId],
        )
      }
    }
  }
}

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
  const { rows } = await pool.query<PersonRow>(
    `SELECT ${PERSON_COLUMNS} FROM persons
      WHERE ${clauses.join(' AND ')}
      ORDER BY nickname`,
    params,
  )
  return Promise.all(rows.map(decorate))
}

export async function getPerson(id: number): Promise<Person | null> {
  const { rows } = await pool.query<PersonRow>(
    `SELECT ${PERSON_COLUMNS} FROM persons WHERE id = $1`,
    [id],
  )
  const row = rows[0]
  return row ? decorate(row) : null
}

export async function createPerson(input: PersonInput): Promise<Person> {
  const { rows } = await pool.query<PersonRow>(
    `INSERT INTO persons (nickname, country_id, user_id, corda)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PERSON_COLUMNS}`,
    [input.nickname, input.countryId, input.userId, input.corda ?? null],
  )
  const person = rows[0]
  if (input.curator !== undefined) {
    await replaceCurators(person.id, input.curator)
  }
  if (input.head !== undefined) {
    await replaceHeads(person.id, input.head)
  }
  return decorate(person)
}

/**
 * Update a person; userId null unlinks the linked user account. Optional
 * fields: corda (null clears), curator (null clears, undefined = untouched),
 * head (null clears, undefined = untouched). Title is never settable.
 */
export async function updatePerson(
  id: number,
  input: PersonInput,
): Promise<Person | null> {
  const { rows } = await pool.query<PersonRow>(
    `UPDATE persons SET nickname = $1, country_id = $2, user_id = $3, corda = $4
      WHERE id = $5
     RETURNING ${PERSON_COLUMNS}`,
    [input.nickname, input.countryId, input.userId, input.corda ?? null, id],
  )
  const person = rows[0]
  if (!person) {
    return null
  }
  if (input.curator !== undefined) {
    await replaceCurators(id, input.curator)
  }
  if (input.head !== undefined) {
    await replaceHeads(id, input.head)
  }
  return decorate(person)
}

/** Soft-delete a person. */
export async function deletePerson(id: number): Promise<boolean> {
  const { rowCount } = await pool.query(
    `UPDATE persons SET is_deleted = true WHERE id = $1 AND is_deleted = false`,
    [id],
  )
  return (rowCount ?? 0) > 0
}