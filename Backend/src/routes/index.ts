import { Router } from 'express'
import { adminRouter } from './admin.routes.js'
import { authRouter } from './auth.routes.js'
import { countriesRouter } from './countries.routes.js'
import { eventsRouter } from './events.routes.js'
import { healthRouter } from './health.routes.js'
import { ownersRouter } from './owners.routes.js'
import { personsRouter } from './persons.routes.js'
import { regionsRouter } from './regions.routes.js'

/**
 * Top-level API router. Mounted at /api in app.ts.
 * Each feature registers its own sub-router here.
 */
export const apiRouter = Router()

apiRouter.use(healthRouter)
apiRouter.use(authRouter)
apiRouter.use(eventsRouter)
apiRouter.use(ownersRouter)
apiRouter.use(countriesRouter)
apiRouter.use(regionsRouter)
apiRouter.use(personsRouter)
apiRouter.use(adminRouter)