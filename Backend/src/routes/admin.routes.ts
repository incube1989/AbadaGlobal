import { Router } from 'express'
import {
  changeRoleHandler,
  listUsersHandler,
  setBanHandler,
} from '../controllers/admin.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'

export const adminRouter = Router()

adminRouter.get(
  '/admin/users',
  requireAuth,
  requireRole('administrator', 'super admin'),
  listUsersHandler,
)
adminRouter.put(
  '/admin/users/:id/role',
  requireAuth,
  requireRole('administrator', 'super admin'),
  changeRoleHandler,
)
adminRouter.put(
  '/admin/users/:id/ban',
  requireAuth,
  requireRole('administrator', 'super admin'),
  setBanHandler,
)