import type { Request, Response } from 'express'
import {
  EVENT_SCOPES,
  EVENT_STATUSES,
  EVENT_TYPES,
  type EventInput,
  type EventOwner,
  type EventScope,
  type EventStatus,
  type EventType,
} from '../models/event.js'
import {
  ForbiddenError,
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  updateEvent,
  type EventViewer,
} from '../services/events.service.js'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function viewerOf(req: Request): EventViewer {
  return { id: req.userId!, role: req.user!.role }
}

function parseId(raw: string | string[]): number | null {
  const id = Number(raw)
  return Number.isInteger(id) && id >= 1 ? id : null
}

/** Validate and normalize the event input body; returns null when invalid. */
function parseEventInput(body: unknown): EventInput | null {
  if (typeof body !== 'object' || body === null) {
    return null
  }
  const b = body as Record<string, unknown>
  const { name, startDate, endDate, type, scope } = b
  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof startDate !== 'string' ||
    !DATE_RE.test(startDate) ||
    typeof endDate !== 'string' ||
    !DATE_RE.test(endDate) ||
    typeof type !== 'string' ||
    !EVENT_TYPES.includes(type as EventType) ||
    typeof scope !== 'string' ||
    !EVENT_SCOPES.includes(scope as EventScope)
  ) {
    return null
  }
  if (startDate > endDate) {
    return null
  }
  const countryId = b.countryId === null || b.countryId === undefined ? null : Number(b.countryId)
  const regionId = b.regionId === null || b.regionId === undefined ? null : Number(b.regionId)
  if (
    (countryId !== null && (!Number.isInteger(countryId) || countryId < 1)) ||
    (regionId !== null && (!Number.isInteger(regionId) || regionId < 1))
  ) {
    return null
  }
  let status: EventStatus | undefined
  if (b.status !== undefined) {
    if (typeof b.status !== 'string' || !EVENT_STATUSES.includes(b.status as EventStatus)) {
      return null
    }
    status = b.status as EventStatus
  }
  let owners: EventOwner[] | undefined
  if (b.owners !== undefined) {
    if (!Array.isArray(b.owners)) {
      return null
    }
    owners = []
    for (const o of b.owners) {
      if (typeof o !== 'object' || o === null) {
        return null
      }
      const { userId, personId } = o as Record<string, unknown>
      const hasUser = userId !== undefined && userId !== null
      const hasPerson = personId !== undefined && personId !== null
      if (hasUser === hasPerson) {
        return null // exactly one of userId/personId must be set
      }
      if (hasUser) {
        const uid = Number(userId)
        if (!Number.isInteger(uid) || uid < 1) return null
        owners.push({ userId: uid })
      } else {
        const pid = Number(personId)
        if (!Number.isInteger(pid) || pid < 1) return null
        owners.push({ personId: pid })
      }
    }
  }
  // Guests: a list of person ids (optional).
  let guests: number[] | undefined
  if (b.guests !== undefined) {
    if (!Array.isArray(b.guests)) {
      return null
    }
    guests = []
    for (const g of b.guests) {
      const gid = Number(g)
      if (!Number.isInteger(gid) || gid < 1) return null
      guests.push(gid)
    }
  }
  return {
    name: name.trim(),
    startDate,
    endDate,
    countryId,
    regionId,
    type: type as EventType,
    scope: scope as EventScope,
    status,
    owners,
    guests,
  }
}

export async function listEventsHandler(req: Request, res: Response): Promise<void> {
  const { scope, type } = req.query
  if (scope !== undefined && (typeof scope !== 'string' || !EVENT_SCOPES.includes(scope as EventScope))) {
    res.status(400).json({ error: `scope must be one of: ${EVENT_SCOPES.join(', ')}` })
    return
  }
  if (type !== undefined && (typeof type !== 'string' || !EVENT_TYPES.includes(type as EventType))) {
    res.status(400).json({ error: `type must be one of: ${EVENT_TYPES.join(', ')}` })
    return
  }
  const events = await listEvents(
    {
      scope: scope as EventScope | undefined,
      type: type as EventType | undefined,
    },
    viewerOf(req),
  )
  res.json(events)
}

export async function getEventHandler(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id)
  if (id === null) {
    res.status(400).json({ error: 'Event id must be a positive integer' })
    return
  }
  const event = await getEvent(id, viewerOf(req))
  if (!event) {
    res.status(404).json({ error: 'Event not found' })
    return
  }
  res.json(event)
}

export async function createEventHandler(req: Request, res: Response): Promise<void> {
  const input = parseEventInput(req.body)
  if (!input) {
    res.status(400).json({ error: 'Invalid event data' })
    return
  }
  const event = await createEvent(input, req.userId!)
  res.status(201).json(event)
}

export async function updateEventHandler(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id)
  if (id === null) {
    res.status(400).json({ error: 'Event id must be a positive integer' })
    return
  }
  const input = parseEventInput(req.body)
  if (!input) {
    res.status(400).json({ error: 'Invalid event data' })
    return
  }
  try {
    const event = await updateEvent(id, input, viewerOf(req))
    if (!event) {
      res.status(404).json({ error: 'Event not found' })
      return
    }
    res.json(event)
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    throw err
  }
}

export async function deleteEventHandler(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id)
  if (id === null) {
    res.status(400).json({ error: 'Event id must be a positive integer' })
    return
  }
  try {
    const deleted = await deleteEvent(id, viewerOf(req))
    if (!deleted) {
      res.status(404).json({ error: 'Event not found' })
      return
    }
    res.status(204).end()
  } catch (err) {
    if (err instanceof ForbiddenError) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    throw err
  }
}