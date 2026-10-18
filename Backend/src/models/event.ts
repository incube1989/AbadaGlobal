import type { Corda, CordaTitle, EventGuest } from './person.js'

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

/**
 * Resolved owner entry for display (event page top). Owners are persons in
 * practice, but users are supported by the schema — nickname is the user name
 * or the person nickname, and corda/title only apply to person owners.
 */
export interface EventOwnerInfo {
  userId?: number
  personId?: number
  nickname: string
  corda: Corda | null
  title: CordaTitle | null
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
  /** Resolved owners, shown at the top of the event page. */
  ownerList: EventOwnerInfo[]
  /** Guest persons, resolved with nickname/corda/title for display. */
  guests: EventGuest[]
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
  /** Guest person ids (undefined = leave unchanged in update mode). */
  guests?: number[]
}