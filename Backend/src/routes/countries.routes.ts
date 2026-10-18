import { Router } from 'express'
import {
  createCountryHandler,
  deleteCountryHandler,
  getCountryHandler,
  listCountriesHandler,
  updateCountryHandler,
} from '../controllers/countries.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'

export const countriesRouter = Router()

countriesRouter.get('/countries', requireAuth, listCountriesHandler)
countriesRouter.get('/countries/:id', requireAuth, getCountryHandler)
countriesRouter.post(
  '/countries',
  requireAuth,
  requireRole('moderator', 'administrator', 'super admin'),
  createCountryHandler,
)
countriesRouter.put(
  '/countries/:id',
  requireAuth,
  requireRole('moderator', 'administrator', 'super admin'),
  updateCountryHandler,
)
countriesRouter.delete(
  '/countries/:id',
  requireAuth,
  requireRole('moderator', 'administrator', 'super admin'),
  deleteCountryHandler,
)