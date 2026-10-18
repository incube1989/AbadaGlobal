export type EventType =
  | 'competition'
  | 'festival'
  | 'batizado'
  | 'camp'
  | 'coach only'

export type EventScope = 'world' | 'Russia' | 'region' | 'local'

/** Event as returned by the API (dates are YYYY-MM-DD strings). */
export interface Event {
  id: number
  name: string
  startDate: string
  endDate: string
  place: string
  type: EventType
  scope: EventScope
}

export const EVENT_SCOPES: readonly EventScope[] = ['world', 'Russia', 'region', 'local']
export const EVENT_TYPES: readonly EventType[] = [
  'competition',
  'festival',
  'batizado',
  'camp',
  'coach only',
]