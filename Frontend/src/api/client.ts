import type {
  Country,
  Event,
  EventFilters,
  EventInput,
  HealthResponse,
  LoginRequest,
  LoginResponse,
  OwnerCandidate,
  Person,
  PersonInput,
  Region,
  User,
  UserRole,
} from './types'

/**
 * Base URL of the backend API.
 * Defaults to the Vite dev proxy (/api -> http://localhost:3000).
 * Override with VITE_API_BASE_URL in .env when the API is hosted elsewhere.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

/** Error carrying the HTTP status returned by the API. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions {
  method?: string
  body?: unknown
  token?: string
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`
    try {
      const data = (await res.json()) as { error?: string }
      if (data?.error) {
        message = data.error
      }
    } catch {
      // Keep the default message when the body is not JSON.
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

/** GET /api/health — backend liveness check. */
export function fetchHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/health')
}

/** POST /api/auth/login — exchange credentials for a token and the user. */
export function login(credentials: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: credentials,
  })
}

/** GET /api/auth/me — current user from a stored token. */
export function fetchMe(token: string): Promise<User> {
  return request<User>('/auth/me', { token })
}

/** GET /api/events — optional scope/type filters applied server-side. */
export function fetchEvents(filters: EventFilters, token: string): Promise<Event[]> {
  const params = new URLSearchParams()
  if (filters.scope) params.set('scope', filters.scope)
  if (filters.type) params.set('type', filters.type)
  const qs = params.toString()
  return request<Event[]>(`/events${qs ? `?${qs}` : ''}`, { token })
}

/** GET /api/events/:id — a single event. */
export function fetchEvent(id: number, token: string): Promise<Event> {
  return request<Event>(`/events/${id}`, { token })
}

/** POST /api/events — create an event. */
export function createEvent(input: EventInput, token: string): Promise<Event> {
  return request<Event>('/events', { method: 'POST', body: input, token })
}

/** PUT /api/events/:id — update an event. */
export function updateEvent(
  id: number,
  input: EventInput,
  token: string,
): Promise<Event> {
  return request<Event>(`/events/${id}`, { method: 'PUT', body: input, token })
}

/** DELETE /api/events/:id — soft-delete an event. */
export function deleteEvent(id: number, token: string): Promise<void> {
  return request<void>(`/events/${id}`, { method: 'DELETE', token })
}

/** GET /api/countries — list countries (optional search). */
export function fetchCountries(search?: string, token?: string): Promise<Country[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : ''
  return request<Country[]>(`/countries${qs}`, { token })
}

/** POST /api/countries — add a country. */
export function createCountry(name: string, token: string): Promise<Country> {
  return request<Country>('/countries', { method: 'POST', body: { name }, token })
}

/** PUT /api/countries/:id — edit a country. */
export function updateCountry(id: number, name: string, token: string): Promise<Country> {
  return request<Country>(`/countries/${id}`, { method: 'PUT', body: { name }, token })
}

/** DELETE /api/countries/:id — soft-delete a country. */
export function deleteCountry(id: number, token: string): Promise<void> {
  return request<void>(`/countries/${id}`, { method: 'DELETE', token })
}

/** GET /api/regions — list regions (optional country filter + search). */
export function fetchRegions(
  countryId?: number,
  search?: string,
  token?: string,
): Promise<Region[]> {
  const params = new URLSearchParams()
  if (countryId !== undefined) params.set('countryId', String(countryId))
  if (search) params.set('search', search)
  const qs = params.toString()
  return request<Region[]>(`/regions${qs ? `?${qs}` : ''}`, { token })
}

/** POST /api/regions — add a region. */
export function createRegion(
  name: string,
  countryId: number,
  token: string,
): Promise<Region> {
  return request<Region>('/regions', {
    method: 'POST',
    body: { name, countryId },
    token,
  })
}

/** PUT /api/regions/:id — edit a region. */
export function updateRegion(
  id: number,
  name: string,
  countryId: number,
  token: string,
): Promise<Region> {
  return request<Region>(`/regions/${id}`, {
    method: 'PUT',
    body: { name, countryId },
    token,
  })
}

/** DELETE /api/regions/:id — soft-delete a region. */
export function deleteRegion(id: number, token: string): Promise<void> {
  return request<void>(`/regions/${id}`, { method: 'DELETE', token })
}

/** GET /api/persons — list persons (optional country filter + search). */
export function fetchPersons(
  countryId?: number,
  search?: string,
  token?: string,
): Promise<Person[]> {
  const params = new URLSearchParams()
  if (countryId !== undefined) params.set('countryId', String(countryId))
  if (search) params.set('search', search)
  const qs = params.toString()
  return request<Person[]>(`/persons${qs ? `?${qs}` : ''}`, { token })
}

/** POST /api/persons — add a person (optionally with a corda). */
export function createPerson(
  nickname: string,
  countryId: number,
  token: string,
  corda?: Person['corda'],
): Promise<Person> {
  return request<Person>('/persons', {
    method: 'POST',
    body: { nickname, countryId, userId: null, corda: corda ?? null },
    token,
  })
}

/** PUT /api/persons/:id — edit a person (corda/curator/head; title is derived). */
export function updatePerson(
  id: number,
  input: PersonInput,
  token: string,
): Promise<Person> {
  return request<Person>(`/persons/${id}`, { method: 'PUT', body: input, token })
}

/** DELETE /api/persons/:id — soft-delete a person. */
export function deletePerson(id: number, token: string): Promise<void> {
  return request<void>(`/persons/${id}`, { method: 'DELETE', token })
}

/** GET /api/admin/users — list all users (administrator+). */
export function fetchAdminUsers(token: string): Promise<User[]> {
  return request<User[]>('/admin/users', { token })
}

/** PUT /api/admin/users/:id/role — change a user's role. */
export function changeUserRole(
  id: number,
  role: UserRole,
  token: string,
): Promise<User> {
  return request<User>(`/admin/users/${id}/role`, {
    method: 'PUT',
    body: { role },
    token,
  })
}

/** PUT /api/admin/users/:id/ban — ban or unban a user. */
export function setUserBan(id: number, banned: boolean, token: string): Promise<User> {
  return request<User>(`/admin/users/${id}/ban`, {
    method: 'PUT',
    body: { banned },
    token,
  })
}

/** GET /api/owner-candidates?search= — search users and persons for the owner picker. */
export function fetchOwnerCandidates(search: string, token: string): Promise<OwnerCandidate[]> {
  return request<OwnerCandidate[]>(`/owner-candidates?search=${encodeURIComponent(search)}`, {
    token,
  })
}

/** GET /api/owner-candidates?ids=user:1,person:2 — resolve labels for existing owners. */
export function resolveOwnerCandidates(ids: string, token: string): Promise<OwnerCandidate[]> {
  return request<OwnerCandidate[]>(`/owner-candidates?ids=${encodeURIComponent(ids)}`, {
    token,
  })
}