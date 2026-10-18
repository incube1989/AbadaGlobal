import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../services/auth.service.js'

declare global {
  namespace Express {
    interface Request {
      /** Id of the authenticated user, set by requireAuth. */
      userId?: number
    }
  }
}

/** Require a valid `Authorization: Bearer <token>` header. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ')
    ? header.slice('Bearer '.length)
    : undefined
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  const payload = verifyToken(token)
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  req.userId = payload.uid
  next()
}