export type EventType =
  | 'competition'
  | 'festival'
  | 'batizado'
  | 'camp'
  | 'coach only'

export type EventScope = 'world' | 'Russia' | 'region' | 'local'

export type EventStatus = 'draft' | 'published' | 'deleted'

export const EVENT_SCOPES: readonly EventScope[] = ['world', 'Russia', 'region', 'local']
export const EVENT_TYPES: readonly EventType[] = [
  'competition',
  'festival',
  'batizado',
  'camp',
  'coach only',
]
export const EVENT_STATUSES: readonly EventStatus[] = ['draft', 'published', 'deleted']

/** One entry of the event owner list: exactly one of userId/personId is set. */
export interface EventOwner {
  userId?: number
  personId?: number
}

/** Event as returned by the API (dates are YYYY-MM-DD strings). */
export interface Event {
  id: number
  name: string
  startDate: string
  endDate: string
  countryId: number | null
  regionId: number | null
  type: EventType
  scope: EventScope
  status: EventStatus
  createdBy: number
  owners: EventOwner[]
}

/** Payload for creating or updating an event. */
export interface EventInput {
  name: string
  startDate: string
  endDate: string
  countryId: number | null
  regionId: number | null
  type: EventType
  scope: EventScope
  status?: EventStatus
  owners?: EventOwner[]
}