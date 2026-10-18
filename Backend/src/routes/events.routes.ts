import { Router } from 'express'
import {
  createEventHandler,
  deleteEventHandler,
  getEventHandler,
  listEventsHandler,
  updateEventHandler,
} from '../controllers/events.controller.js'
import { requireAuth } from '../middleware/auth.js'

export const eventsRouter = Router()

eventsRouter.get('/events', requireAuth, listEventsHandler)
eventsRouter.post('/events', requireAuth, createEventHandler)
eventsRouter.get('/events/:id', requireAuth, getEventHandler)
eventsRouter.put('/events/:id', requireAuth, updateEventHandler)
eventsRouter.delete('/events/:id', requireAuth, deleteEventHandler)