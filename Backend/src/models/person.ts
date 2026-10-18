/** Person as returned by the API. */
export interface Person {
  id: number
  nickname: string
  countryId: number
  userId: number | null
  isDeleted: boolean
}

/** Payload for creating or updating a person (userId null unlinks the user). */
export interface PersonInput {
  nickname: string
  countryId: number
  userId: number | null
}