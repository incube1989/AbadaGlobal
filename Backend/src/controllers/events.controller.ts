import type { Request, Response } from 'express'
import {
  EVENT_SCOPES,
  EVENT_TYPES,
  type EventScope,
  type EventType,
} from '../models/event.js'
import { getEvent, listEvents } from '../services/events.service.js'

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
  const events = await listEvents({
    scope: scope as EventScope | undefined,
    type: type as EventType | undefined,
  })
  res.json(events)
}

export async function getEventHandler(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ error: 'Event id must be a positive integer' })
    return
  }
  const event = await getEvent(id)
  if (!event) {
    res.status(404).json({ error: 'Event not found' })
    return
  }
  res.json(event)
}