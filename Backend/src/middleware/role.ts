import type { NextFunction, Request, Response } from 'express'
import type { UserRole } from '../models/user.js'

/**
 * Require the authenticated user to have one of the given roles.
 * Must be used after `requireAuth` (req.user is set).
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden' })
      return
    }
    next()
  }
}