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

/**
 * Capoeira belt ("corda"). Portuguese by design — never translate. See
 * Design/Increment/beltsandcolors.md.
 */
export const CORDAS = [
  'crua',
  'crua-amarela',
  'amarela',
  'amarela-laranja',
  'laranja',
  'laranja-azul',
  'azul',
  'azul-verde',
  'verde',
  'verde-roxa',
  'roxa',
  'roxa-marrom',
  'marrom',
  'marrom-vermelha',
  'vermelha-branco',
  'branco',
] as const

export type Corda = (typeof CORDAS)[number]

/** Titles granted by a corda. Portuguese by design — never translate. */
export type CordaTitle =
  | 'Graduado'
  | 'Instrutor'
  | 'Professor'
  | 'Mestrando'
  | 'Mestre'
  | 'Grão Mestre'

/**
 * Title derived from a corda. A title can never be set manually — it always
 * comes from the belt. NOTE: the design doc lists both Mestrando and Mestre
 * with the same `vermelha-branco` corda; a single corda carries one title,
 * so the value collapses to `Mestre`.
 */
export const CORDA_TITLES: Record<Corda, CordaTitle | null> = {
  crua: null,
  'crua-amarela': null,
  amarela: null,
  'amarela-laranja': null,
  laranja: null,
  'laranja-azul': null,
  azul: 'Graduado',
  'azul-verde': 'Graduado',
  verde: 'Graduado',
  'verde-roxa': 'Graduado',
  roxa: 'Instrutor',
  'roxa-marrom': 'Instrutor',
  marrom: 'Professor',
  'marrom-vermelha': 'Professor',
  'vermelha-branco': 'Mestre',
  branco: 'Grão Mestre',
}

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

/** A person on the guest list of an event (resolved for display). */
export interface EventGuest {
  id: number
  nickname: string
  corda: Corda | null
  title: CordaTitle | null
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
  /** Resolved owners, shown at the top of the event page. */
  ownerList: EventOwnerInfo[]
  guests: EventGuest[]
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
  /** Guest person ids (undefined = leave unchanged on update). */
  guests?: number[]
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
  /** Capoeira belt (Portuguese); null when not set. */
  corda: Corda | null
  /** Derived from corda; null when the corda grants no title. */
  title: CordaTitle | null
  /** Curator person ids; null when there are none. */
  curator: number[] | null
  /** Region ids headed by the person; null when there are none. */
  head: number[] | null
}

/** Payload for creating or updating a person. Title is never part of the input. */
export interface PersonInput {
  nickname: string
  countryId: number
  userId: number | null
  corda?: Corda | null
  curator?: number[] | null
  head?: number[] | null
}

/** One result of the owner picker search (owners are persons only). */
export interface OwnerCandidate {
  type: 'person'
  id: number
  label: string
  corda: Corda | null
  title: CordaTitle | null
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