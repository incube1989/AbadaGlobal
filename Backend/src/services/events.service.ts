import { pool } from '../db/pool.js'
import type { Corda, EventGuest } from '../models/person.js'
import { CORDA_TITLES } from '../models/person.js'
import type { UserRole } from '../models/user.js'
import type {
  Event,
  EventInput,
  EventOwner,
  EventOwnerInfo,
  EventScope,
  EventType,
} from '../models/event.js'

export interface EventFilters {
  scope?: EventScope
  type?: EventType
}

/** Who is asking: used for draft visibility and edit permissions. */
export interface EventViewer {
  id: number
  role: UserRole
}

const EVENT_COLUMNS = `e.id, e.name,
  to_char(e.start_date, 'YYYY-MM-DD') AS "startDate",
  to_char(e.end_date, 'YYYY-MM-DD') AS "endDate",
  e.country_id AS "countryId",
  e.region_id AS "regionId",
  e.type, e.scope, e.status,
  e.created_by AS "createdBy"`

/** Roles that may manage any event (edit / soft-delete). */
const MANAGER_ROLES: readonly UserRole[] = ['moderator', 'administrator', 'super admin']

/** Load the guest list of an event (persons). */
async function loadGuests(eventId: number): Promise<EventGuest[]> {
  const { rows } = await pool.query<{
    id: number
    nickname: string
    corda: EventGuest['corda']
  }>(
    `SELECT p.id, p.nickname, p.corda
       FROM event_guests g
       JOIN persons p ON p.id = g.person_id
      WHERE g.event_id = $1
      ORDER BY p.nickname`,
    [eventId],
  )
  return rows.map((r) => ({
    id: r.id,
    nickname: r.nickname,
    corda: r.corda,
    title: r.corda ? (CORDA_TITLES[r.corda] ?? null) : null,
  }))
}

/** Replace the guest list of an event (delete all, insert the given ids). */
async function replaceGuests(
  client: { query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }> },
  eventId: number,
  guests: number[],
): Promise<void> {
  await client.query('DELETE FROM event_guests WHERE event_id = $1', [eventId])
  for (const personId of new Set(guests)) {
    if (Number.isInteger(personId) && personId >= 1) {
      await client.query(
        'INSERT INTO event_guests (event_id, person_id) VALUES ($1, $2)',
        [eventId, personId],
      )
    }
  }
}

/**
 * Load the resolved owner list of an event (names + corda/title for display,
 * shown at the top of the event page). Owners are persons in practice; user
 * owners fall back to the user name.
 */
async function loadOwnerList(eventId: number): Promise<EventOwnerInfo[]> {
  const { rows } = await pool.query<{
    userId: number | null
    personId: number | null
    nickname: string | null
    corda: Corda | null
  }>(
    `SELECT o.user_id AS "userId", o.person_id AS "personId",
            COALESCE(u.name, p.nickname) AS "nickname",
            p.corda
       FROM event_owners o
       LEFT JOIN users u ON u.id = o.user_id
       LEFT JOIN persons p ON p.id = o.person_id
      WHERE o.event_id = $1
      ORDER BY o.id`,
    [eventId],
  )
  return rows.map((r) => ({
    ...(r.userId !== null ? { userId: r.userId } : { personId: r.personId! }),
    nickname: r.nickname ?? '',
    corda: r.corda ?? null,
    title: r.corda ? (CORDA_TITLES[r.corda] ?? null) : null,
  }))
}

/** Load the owner list of an event. */
async function loadOwners(eventId: number): Promise<EventOwner[]> {
  const { rows } = await pool.query<{ userId: number | null; personId: number | null }>(
    `SELECT user_id AS "userId", person_id AS "personId"
       FROM event_owners
      WHERE event_id = $1
      ORDER BY id`,
    [eventId],
  )
  return rows.map((r) =>
    r.userId !== null ? { userId: r.userId } : { personId: r.personId! },
  )
}

/** Replace the owner list of an event (delete all, insert the given ones). */
async function replaceOwners(
  client: { query: (sql: string, params?: unknown[]) => Promise<{ rows: unknown[] }> },
  eventId: number,
  owners: EventOwner[],
): Promise<void> {
  await client.query('DELETE FROM event_owners WHERE event_id = $1', [eventId])
  for (const owner of owners) {
    if (owner.userId !== undefined) {
      await client.query(
        'INSERT INTO event_owners (event_id, user_id) VALUES ($1, $2)',
        [eventId, owner.userId],
      )
    } else if (owner.personId !== undefined) {
      await client.query(
        'INSERT INTO event_owners (event_id, person_id) VALUES ($1, $2)',
        [eventId, owner.personId],
      )
    }
  }
}

/** Is the user an owner of the event? */
export async function isEventOwner(eventId: number, userId: number): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM event_owners WHERE event_id = $1 AND user_id = $2`,
    [eventId, userId],
  )
  return rows.length > 0
}

/** Can the viewer manage (edit / soft-delete) the event? */
export async function canManageEvent(
  event: Pick<Event, 'id' | 'createdBy'>,
  viewer: EventViewer,
): Promise<boolean> {
  if (MANAGER_ROLES.includes(viewer.role)) {
    return true
  }
  return event.createdBy === viewer.id || (await isEventOwner(event.id, viewer.id))
}

/** Fetch a single event row by id (any status), or null. */
async function getEventRow(id: number): Promise<Event | null> {
  const { rows } = await pool.query<Event>(
    `SELECT ${EVENT_COLUMNS} FROM events e WHERE e.id = $1`,
    [id],
  )
  if (!rows[0]) {
    return null
  }
  return {
    ...rows[0],
    owners: await loadOwners(id),
    ownerList: await loadOwnerList(id),
    guests: await loadGuests(id),
  }
}

/**
 * Events visible to the viewer: published for everyone; drafts additionally
 * for their owner / moderators / administrators. Deleted events are never
 * returned.
 */
export async function listEvents(
  filters: EventFilters = {},
  viewer: EventViewer,
): Promise<Event[]> {
  const clauses: string[] = [`e.status <> 'deleted'`]
  const params: unknown[] = []
  if (filters.scope) {
    params.push(filters.scope)
    clauses.push(`e.scope = $${params.length}`)
  }
  if (filters.type) {
    params.push(filters.type)
    clauses.push(`e.type = $${params.length}`)
  }
  params.push(viewer.id)
  const viewerIdParam = `$${params.length}`
  params.push(viewer.role)
  const viewerRoleParam = `$${params.length}`
  clauses.push(
    `(e.status = 'published'
      OR e.created_by = ${viewerIdParam}
      OR ${viewerRoleParam} IN ('moderator', 'administrator', 'super admin')
      OR EXISTS (
        SELECT 1 FROM event_owners o
         WHERE o.event_id = e.id AND o.user_id = ${viewerIdParam}
      ))`,
  )
  const { rows } = await pool.query<Event>(
    `SELECT ${EVENT_COLUMNS}
       FROM events e
      WHERE ${clauses.join(' AND ')}
      ORDER BY e.start_date, e.id`,
    params,
  )
  const withRelations = await Promise.all(
    rows.map(async (row) => ({
      ...row,
      owners: await loadOwners(row.id),
      ownerList: await loadOwnerList(row.id),
      guests: await loadGuests(row.id),
    })),
  )
  return withRelations
}

/** Single event by id with the same visibility rules; null when not visible. */
export async function getEvent(id: number, viewer: EventViewer): Promise<Event | null> {
  const event = await getEventRow(id)
  if (!event || event.status === 'deleted') {
    return null
  }
  if (event.status === 'published') {
    return event
  }
  // Draft: visible to owner / moderators / administrators.
  if (MANAGER_ROLES.includes(viewer.role) || event.createdBy === viewer.id) {
    return event
  }
  if (await isEventOwner(id, viewer.id)) {
    return event
  }
  return null
}

/** Create an event; the creator is added as an owner automatically. */
export async function createEvent(
  input: EventInput,
  userId: number,
): Promise<Event> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query<Event>(
      `INSERT INTO events
         (name, start_date, end_date, country_id, region_id, type, scope, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name,
         to_char(start_date, 'YYYY-MM-DD') AS "startDate",
         to_char(end_date, 'YYYY-MM-DD') AS "endDate",
         country_id AS "countryId", region_id AS "regionId",
         type, scope, status, created_by AS "createdBy"`,
      [
        input.name,
        input.startDate,
        input.endDate,
        input.countryId,
        input.regionId,
        input.type,
        input.scope,
        input.status ?? 'published',
        userId,
      ],
    )
    const event = rows[0]
    // Owners are persons only (product decision). The creator keeps edit rights
    // via created_by; the owner list starts from the submitted persons.
    const seenPersons = new Set<number>()
    for (const owner of input.owners ?? []) {
      if (owner.personId !== undefined && !seenPersons.has(owner.personId)) {
        seenPersons.add(owner.personId)
        await client.query(
          'INSERT INTO event_owners (event_id, person_id) VALUES ($1, $2)',
          [event.id, owner.personId],
        )
      }
    }
    if (input.guests) {
      await replaceGuests(client, event.id, input.guests)
    }
    await client.query('COMMIT')
    return {
      ...event,
      owners: await loadOwners(event.id),
      ownerList: await loadOwnerList(event.id),
      guests: await loadGuests(event.id),
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

/**
 * Update an event (fields and owner list). Allowed for the owner,
 * moderators, and administrators.
 */
export async function updateEvent(
  id: number,
  input: EventInput,
  viewer: EventViewer,
): Promise<Event | null> {
  const existing = await getEventRow(id)
  if (!existing || existing.status === 'deleted') {
    return null
  }
  if (!(await canManageEvent(existing, viewer))) {
    throw new ForbiddenError()
  }
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query<Event>(
      `UPDATE events SET
         name = $1, start_date = $2, end_date = $3,
         country_id = $4, region_id = $5, type = $6, scope = $7,
         status = $8
       WHERE id = $9
       RETURNING id, name,
         to_char(start_date, 'YYYY-MM-DD') AS "startDate",
         to_char(end_date, 'YYYY-MM-DD') AS "endDate",
         country_id AS "countryId", region_id AS "regionId",
         type, scope, status, created_by AS "createdBy"`,
      [
        input.name,
        input.startDate,
        input.endDate,
        input.countryId,
        input.regionId,
        input.type,
        input.scope,
        input.status ?? existing.status,
        id,
      ],
    )
    const event = rows[0]
    if (input.owners) {
      await replaceOwners(client, id, input.owners)
    }
    if (input.guests !== undefined) {
      await replaceGuests(client, id, input.guests)
    }
    await client.query('COMMIT')
    return {
      ...event,
      owners: await loadOwners(id),
      ownerList: await loadOwnerList(id),
      guests: await loadGuests(id),
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

/** Soft-delete an event (status = deleted). Allowed for owner / moderators / administrators. */
export async function deleteEvent(
  id: number,
  viewer: EventViewer,
): Promise<boolean> {
  const existing = await getEventRow(id)
  if (!existing || existing.status === 'deleted') {
    return false
  }
  if (!(await canManageEvent(existing, viewer))) {
    throw new ForbiddenError()
  }
  await pool.query(`UPDATE events SET status = 'deleted' WHERE id = $1`, [id])
  return true
}

/** Thrown when the viewer is not allowed to manage an event. */
export class ForbiddenError extends Error {
  constructor() {
    super('Forbidden')
    this.name = 'ForbiddenError'
  }
}