import type { Request, Response } from 'express'
import { toPublicUser } from '../models/user.js'
import {
  findById,
  issueToken,
  verifyCredentials,
} from '../services/auth.service.js'

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const body = req.body as { email?: unknown; password?: unknown } | undefined
  const { email, password } = body ?? {}
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }
  const check = await verifyCredentials(email, password)
  if (check === null) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }
  if (check.status === 'banned') {
    res.status(403).json({ error: 'You are banned, contact administrator' })
    return
  }
  const { user } = check
  res.json({ token: issueToken(user.id), user })
}

export async function meHandler(req: Request, res: Response): Promise<void> {
  const row = await findById(req.userId!)
  if (!row) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  res.json(toPublicUser(row))
}