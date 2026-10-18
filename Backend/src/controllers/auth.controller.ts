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
  const user = await verifyCredentials(email, password)
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }
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