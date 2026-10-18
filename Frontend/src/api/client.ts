import type {
  Event,
  EventFilters,
  HealthResponse,
  LoginRequest,
  LoginResponse,
  User,
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