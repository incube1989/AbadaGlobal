import { Router } from 'express'
import { ownerCandidatesHandler } from '../controllers/owners.controller.js'
import { requireAuth } from '../middleware/auth.js'

export const ownersRouter = Router()

ownersRouter.get('/owner-candidates', requireAuth, ownerCandidatesHandler)