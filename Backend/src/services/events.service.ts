import { pool } from '../db/pool.js'
import type { Event, EventScope, EventType } from '../models/event.js'

export interface EventFilters {
  scope?: EventScope
  type?: EventType
}

const EVENT_COLUMNS = `id, name,
  to_char(start_date, 'YYYY-MM-DD') AS "startDate",
  to_char(end_date, 'YYYY-MM-DD') AS "endDate",
  place, type, scope`

/** All events (optionally filtered by exact scope/type), ordered by start date. */
export async function listEvents(filters: EventFilters = {}): Promise<Event[]> {
  const clauses: string[] = []
  const params: unknown[] = []
  if (filters.scope) {
    params.push(filters.scope)
    clauses.push(`scope = $${params.length}`)
  }
  if (filters.type) {
    params.push(filters.type)
    clauses.push(`type = $${params.length}`)
  }
  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''
  const { rows } = await pool.query<Event>(
    `SELECT ${EVENT_COLUMNS} FROM events ${where} ORDER BY start_date, id`,
    params,
  )
  return rows
}

/** Single event by id, or null when it does not exist. */
export async function getEvent(id: number): Promise<Event | null> {
  const { rows } = await pool.query<Event>(
    `SELECT ${EVENT_COLUMNS} FROM events WHERE id = $1`,
    [id],
  )
  return rows[0] ?? null
}