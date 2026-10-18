import type { NextFunction, Request, Response } from 'express'
import { findById, verifyToken } from '../services/auth.service.js'
import { toPublicUser, type PublicUser } from '../models/user.js'

declare global {
  namespace Express {
    interface Request {
      /** Id of the authenticated user, set by requireAuth. */
      userId?: number
      /** Public user attached by requireAuth (includes role and ban state). */
      user?: PublicUser
    }
  }
}

/** Require a valid `Authorization: Bearer <token>` header. */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
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
  const row = await findById(payload.uid)
  if (!row) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  if (row.isBanned) {
    res.status(403).json({ error: 'You are banned, contact administrator' })
    return
  }
  req.userId = row.id
  req.user = toPublicUser(row)
  next()
}