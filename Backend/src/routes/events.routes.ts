import { Router } from 'express'
import {
  getEventHandler,
  listEventsHandler,
} from '../controllers/events.controller.js'
import { requireAuth } from '../middleware/auth.js'

export const eventsRouter = Router()

eventsRouter.get('/events', requireAuth, listEventsHandler)
eventsRouter.get('/events/:id', requireAuth, getEventHandler)