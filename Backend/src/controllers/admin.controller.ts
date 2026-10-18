import type { Request, Response } from 'express'
import { USER_ROLES, type UserRole } from '../models/user.js'
import {
  SuperAdminProtectedError,
  changeRole,
  listUsers,
  setBan,
} from '../services/admin.service.js'

function parseId(raw: string | string[]): number | null {
  const id = Number(raw)
  return Number.isInteger(id) && id >= 1 ? id : null
}

export async function listUsersHandler(_req: Request, res: Response): Promise<void> {
  res.json(await listUsers())
}

export async function changeRoleHandler(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id)
  if (id === null) {
    res.status(400).json({ error: 'User id must be a positive integer' })
    return
  }
  const body = req.body as { role?: unknown } | undefined
  const role = body?.role
  if (typeof role !== 'string' || !USER_ROLES.includes(role as UserRole)) {
    res.status(400).json({ error: `role must be one of: ${USER_ROLES.join(', ')}` })
    return
  }
  try {
    const user = await changeRole(id, role as UserRole)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json(user)
  } catch (err) {
    if (err instanceof SuperAdminProtectedError) {
      res.status(403).json({ error: 'Super admin cannot be modified' })
      return
    }
    throw err
  }
}

export async function setBanHandler(req: Request, res: Response): Promise<void> {
  const id = parseId(req.params.id)
  if (id === null) {
    res.status(400).json({ error: 'User id must be a positive integer' })
    return
  }
  const body = req.body as { banned?: unknown } | undefined
  if (typeof body?.banned !== 'boolean') {
    res.status(400).json({ error: 'banned must be a boolean' })
    return
  }
  try {
    const user = await setBan(id, body.banned)
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json(user)
  } catch (err) {
    if (err instanceof SuperAdminProtectedError) {
      res.status(403).json({ error: 'Super admin cannot be modified' })
      return
    }
    throw err
  }
}