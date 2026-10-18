import { Router } from 'express'
import { loginHandler, meHandler } from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.js'

export const authRouter = Router()

authRouter.post('/auth/login', loginHandler)
authRouter.get('/auth/me', requireAuth, meHandler)