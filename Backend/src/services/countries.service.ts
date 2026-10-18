import { pool } from '../db/pool.js'
import type { Country, CountryInput } from '../models/country.js'

const COUNTRY_COLUMNS = `id, name, is_deleted AS "isDeleted"`

/** Non-deleted countries, optionally searched by name. */
export async function listCountries(search?: string): Promise<Country[]> {
  const params: unknown[] = []
  let where = `is_deleted = false`
  if (search) {
    params.push(`%${search}%`)
    where += ` AND name ILIKE $${params.length}`
  }
  const { rows } = await pool.query<Country>(
    `SELECT ${COUNTRY_COLUMNS} FROM countries WHERE ${where} ORDER BY name`,
    params,
  )
  return rows
}

export async function getCountry(id: number): Promise<Country | null> {
  const { rows } = await pool.query<Country>(
    `SELECT ${COUNTRY_COLUMNS} FROM countries WHERE id = $1`,
    [id],
  )
  return rows[0] ?? null
}

export async function createCountry(input: CountryInput): Promise<Country> {
  const { rows } = await pool.query<Country>(
    `INSERT INTO countries (name) VALUES ($1)
     RETURNING ${COUNTRY_COLUMNS}`,
    [input.name],
  )
  return rows[0]
}

export async function updateCountry(
  id: number,
  input: CountryInput,
): Promise<Country | null> {
  const { rows } = await pool.query<Country>(
    `UPDATE countries SET name = $1 WHERE id = $2
     RETURNING ${COUNTRY_COLUMNS}`,
    [input.name, id],
  )
  return rows[0] ?? null
}

/** Soft-delete a country. */
export async function deleteCountry(id: number): Promise<boolean> {
  const { rowCount } = await pool.query(
    `UPDATE countries SET is_deleted = true WHERE id = $1 AND is_deleted = false`,
    [id],
  )
  return (rowCount ?? 0) > 0
}