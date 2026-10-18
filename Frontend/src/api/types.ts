export interface HealthResponse {
  status: 'ok'
  uptime: number
  timestamp: string
}

export type UserRole = 'admin' | 'moderator' | 'simple user'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
}

export type EventType =
  | 'competition'
  | 'festival'
  | 'batizado'
  | 'camp'
  | 'coach only'

export type EventScope = 'world' | 'Russia' | 'region' | 'local'

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

export interface Event {
  id: number
  name: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  place: string
  type: EventType
  scope: EventScope
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