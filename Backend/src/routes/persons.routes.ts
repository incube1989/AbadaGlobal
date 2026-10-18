import { Router } from 'express'
import {
  createPersonHandler,
  deletePersonHandler,
  getPersonHandler,
  listPersonsHandler,
  updatePersonHandler,
} from '../controllers/persons.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/role.js'

export const personsRouter = Router()

personsRouter.get('/persons', requireAuth, listPersonsHandler)
personsRouter.get('/persons/:id', requireAuth, getPersonHandler)
personsRouter.post(
  '/persons',
  requireAuth,
  requireRole('moderator', 'administrator', 'super admin'),
  createPersonHandler,
)
personsRouter.put(
  '/persons/:id',
  requireAuth,
  requireRole('moderator', 'administrator', 'super admin'),
  updatePersonHandler,
)
personsRouter.delete(
  '/persons/:id',
  requireAuth,
  requireRole('moderator', 'administrator', 'super admin'),
  deletePersonHandler,
)