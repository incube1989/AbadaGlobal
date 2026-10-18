import { Router } from 'express'
import { authRouter } from './auth.routes.js'
import { eventsRouter } from './events.routes.js'
import { healthRouter } from './health.routes.js'

/**
 * Top-level API router. Mounted at /api in app.ts.
 * Each feature registers its own sub-router here.
 */
export const apiRouter = Router()

apiRouter.use(healthRouter)
apiRouter.use(authRouter)
apiRouter.use(eventsRouter)