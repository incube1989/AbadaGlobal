# Multi-stage build for the AbadaGlobal single app image:
#   stage frontend -> builds Frontend/dist (SPA statics)
#   stage backend  -> compiles Backend to dist/
#   stage runtime  -> node:22-alpine running the API, serving the SPA from ./public
# Build context must contain ./Frontend and ./Backend (see docker-compose.yml).

# ---------- stage 1: frontend ----------
FROM node:22-alpine AS frontend
WORKDIR /build/frontend
COPY Frontend/package*.json ./
RUN npm ci
COPY Frontend/ ./
RUN npm run build

# ---------- stage 2: backend ----------
FROM node:22-alpine AS backend
WORKDIR /build/backend
COPY Backend/package*.json ./
RUN npm ci
COPY Backend/ ./
RUN npm run build

# ---------- stage 3: runtime ----------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /srv/app

COPY --from=backend /build/backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled backend + SQL migrations (migrate.js reads ./db/migrations at runtime)
COPY --from=backend /build/backend/dist ./dist
COPY --from=backend /build/backend/db ./db

# Built SPA — served by Express static from /srv/app/public
COPY --from=frontend /build/frontend/dist ./public

EXPOSE 3000
CMD ["node", "dist/src/server.js"]