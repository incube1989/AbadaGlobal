/** Country as returned by the API. */
export interface Country {
  id: number
  name: string
  isDeleted: boolean
}

/** Payload for creating or updating a country. */
export interface CountryInput {
  name: string
}