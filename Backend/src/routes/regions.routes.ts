import { Router } from 'express'
import {
  createRegionHandler,
  deleteRegionHandler,
  getRegionHandler,
  listRegionsHandler,
  updateRegionHandler,
} from '../controllers/regions.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'

export const regionsRouter = Router()

regionsRouter.get('/regions', requireAuth, listRegionsHandler)
regionsRouter.get('/regions/:id', requireAuth, getRegionHandler)
regionsRouter.post(
  '/regions',
  requireAuth,
  requireRole('moderator', 'administrator', 'super admin'),
  createRegionHandler,
)
regionsRouter.put(
  '/regions/:id',
  requireAuth,
  requireRole('moderator', 'administrator', 'super admin'),
  updateRegionHandler,
)
regionsRouter.delete(
  '/regions/:id',
  requireAuth,
  requireRole('moderator', 'administrator', 'super admin'),
  deleteRegionHandler,
)