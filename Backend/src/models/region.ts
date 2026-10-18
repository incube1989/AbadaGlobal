/** Region as returned by the API. */
export interface Region {
  id: number
  name: string
  countryId: number
  isDeleted: boolean
}

/** Payload for creating or updating a region. */
export interface RegionInput {
  name: string
  countryId: number
}