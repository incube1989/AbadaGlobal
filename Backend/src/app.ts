import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { apiRouter } from './routes/index.js'
import { errorHandler, notFoundHandler } from './middleware/error.js'

/** Express application factory (exported separately for tests). */
export const app = express()

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      // Remove 'upgrade-insecure-requests': on a plain-HTTP origin (no domain/TLS yet)
      // it makes browsers load every subresource over https, which fails -> blank page.
      directives: {
        'upgrade-insecure-requests': null,
      },
    },
    // HSTS is meaningless (and potentially harmful) on an http-only origin.
    strictTransportSecurity: false,
  }),
)
app.use(cors())
app.use(express.json())

app.use('/api', apiRouter)

// Production (Topology A): serve the built SPA from ../public when present.
// In the deploy image the SPA lives at /srv/app/public; in dev there is no
// public/ directory, so this block stays a no-op and Vite handles the client.
const publicDir = path.resolve(import.meta.dirname, '../../public')
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir))
  // SPA fallback: serve index.html for any non-API route (deep links).
  app.get(/^\/(?!api).*/, (_req, res) => res.sendFile(path.join(publicDir, 'index.html')))
}

app.use(notFoundHandler)
app.use(errorHandler)