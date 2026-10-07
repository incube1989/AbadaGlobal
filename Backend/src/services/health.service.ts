export interface HealthStatus {
  status: 'ok'
  uptime: number
  timestamp: string
}

/** Liveness check payload — see Contracts/api/openapi.yaml. */
export function getHealth(): HealthStatus {
  return {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }
}