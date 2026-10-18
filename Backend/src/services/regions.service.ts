import { pool } from '../db/pool.js'
import type { Region, RegionInput } from '../models/region.js'

const REGION_COLUMNS = `id, name, country_id AS "countryId", is_deleted AS "isDeleted"`

/** Non-deleted regions, optionally filtered by country and/or searched by name. */
export async function listRegions(
  countryId?: number,
  search?: string,
): Promise<Region[]> {
  const params: unknown[] = []
  const clauses: string[] = [`is_deleted = false`]
  if (countryId !== undefined) {
    params.push(countryId)
    clauses.push(`country_id = $${params.length}`)
  }
  if (search) {
    params.push(`%${search}%`)
    clauses.push(`name ILIKE $${params.length}`)
  }
  const { rows } = await pool.query<Region>(
    `SELECT ${REGION_COLUMNS} FROM regions
      WHERE ${clauses.join(' AND ')}
      ORDER BY name`,
    params,
  )
  return rows
}

export async function getRegion(id: number): Promise<Region | null> {
  const { rows } = await pool.query<Region>(
    `SELECT ${REGION_COLUMNS} FROM regions WHERE id = $1`,
    [id],
  )
  return rows[0] ?? null
}

export async function createRegion(input: RegionInput): Promise<Region> {
  const { rows } = await pool.query<Region>(
    `INSERT INTO regions (name, country_id) VALUES ($1, $2)
     RETURNING ${REGION_COLUMNS}`,
    [input.name, input.countryId],
  )
  return rows[0]
}

export async function updateRegion(
  id: number,
  input: RegionInput,
): Promise<Region | null> {
  const { rows } = await pool.query<Region>(
    `UPDATE regions SET name = $1, country_id = $2 WHERE id = $3
     RETURNING ${REGION_COLUMNS}`,
    [input.name, input.countryId, id],
  )
  return rows[0] ?? null
}

/** Soft-delete a region. */
export async function deleteRegion(id: number): Promise<boolean> {
  const { rowCount } = await pool.query(
    `UPDATE regions SET is_deleted = true WHERE id = $1 AND is_deleted = false`,
    [id],
  )
  return (rowCount ?? 0) > 0
}