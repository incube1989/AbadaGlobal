/**
 * Capoeira belt ("corda"). Values are Portuguese by design and must not be
 * translated in any language of the UI. See Design/Increment/beltsandcolors.md.
 */
export const CORDAS = [
  // no title
  'crua',
  'crua-amarela',
  'amarela',
  'amarela-laranja',
  'laranja',
  'laranja-azul',
  // graduado
  'azul',
  'azul-verde',
  'verde',
  'verde-roxa',
  // instrutor
  'roxa',
  'roxa-marrom',
  // professor
  'marrom',
  'marrom-vermelha',
  // mestre
  'vermelha-branco',
  // grão mestre
  'branco',
] as const

export type Corda = (typeof CORDAS)[number]

/** Titles granted by a corda. Kept in Portuguese, never translated. */
export type CordaTitle =
  | 'Graduado'
  | 'Instrutor'
  | 'Professor'
  | 'Mestrando'
  | 'Mestre'
  | 'Grão Mestre'

/**
 * Title derived from a corda. The title can never be set manually — it is
 * computed on the fly whenever a person is returned.
 *
 * NOTE: the design document lists both "Mestrando" and "Mestre" with the same
 * corda `vermelha-branco`. A single corda can carry only one derived title,
 * so the value collapses to `Mestre` (flagged for the merge discussion).
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

/** A person as referenced by an event guest list. */
export interface EventGuest {
  id: number
  nickname: string
  corda: Corda | null
  title: CordaTitle | null
}

/** Person as returned by the API. */
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
  /** Curator persons (ids); null when there are none. */
  curator: number[] | null
  /** Regions headed by the person (ids); null when there are none. */
  head: number[] | null
}

/**
 * Payload for creating or updating a person. `title` is never part of the
 * input — it is derived from `corda`. Optional fields (`corda`, `curator`,
 * `head`):
 * - undefined — leave unchanged on update;
 * - null — clear / no value;
 * - value — set / replace.
 */
export interface PersonInput {
  nickname: string
  countryId: number
  userId: number | null
  corda?: Corda | null
  curator?: number[] | null
  head?: number[] | null
}