import type { Request, Response } from 'express'
import { getHealth } from '../services/health.service.js'

export function healthHandler(_req: Request, res: Response): void {
  res.json(getHealth())
}