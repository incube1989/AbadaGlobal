export interface HealthResponse {
  status: 'ok'
  uptime: number
  timestamp: string
}

export type UserRole = 'default' | 'moderator' | 'administrator' | 'super admin'

export const USER_ROLES: readonly UserRole[] = [
  'default',
  'moderator',
  'administrator',
  'super admin',
]

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  isBanned: boolean
}

export type EventType =
  | 'competition'
  | 'festival'
  | 'batizado'
  | 'camp'
  | 'coach only'

export type EventScope = 'world' | 'Russia' | 'region' | 'local'

export type EventStatus = 'draft' | 'published' | 'deleted'

export const EVENT_TYPES: readonly EventType[] = [
  'competition',
  'festival',
  'batizado',
  'camp',
  'coach only',
]

export const EVENT_SCOPES: readonly EventScope[] = [
  'world',
  'Russia',
  'region',
  'local',
]

export const EVENT_STATUSES: readonly EventStatus[] = ['draft', 'published', 'deleted']

/** One entry of the event owner list: exactly one of userId/personId is set. */
export interface EventOwner {
  userId?: number
  personId?: number
}

export interface Event {
  id: number
  name: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  countryId: number | null
  regionId: number | null
  type: EventType
  scope: EventScope
  status: EventStatus
  createdBy: number
  owners: EventOwner[]
}

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

export interface Country {
  id: number
  name: string
  isDeleted: boolean
}

export interface Region {
  id: number
  name: string
  countryId: number
  isDeleted: boolean
}

export interface Person {
  id: number
  nickname: string
  countryId: number
  userId: number | null
  isDeleted: boolean
}

/** One result of the owner picker search (owners are persons only). */
export interface OwnerCandidate {
  type: 'person'
  id: number
  label: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface EventFilters {
  scope?: EventScope
  type?: EventType
}