import type { HealthResponse } from './types'

/**
 * Base URL of the backend API.
 * Defaults to the Vite dev proxy (/api -> http://localhost:3000).
 * Override with VITE_API_BASE_URL in .env when the API is hosted elsewhere.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

/** GET /api/health — backend liveness check. */
export function fetchHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/health')
}