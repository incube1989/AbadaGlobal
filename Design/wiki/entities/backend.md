---
title: Backend
tags: [entity, backend, api]
created: 2026-10-07
updated: 2026-10-18
sources: 12
---

# Backend

The API server and application layer of AbadaGlobal. Node.js + Express 5 +
TypeScript (ESM, strict mode).

## Key facts

- Code: [`../../../Backend/`](../../../Backend/)
- Dev server: `http://localhost:3000` (`npm run dev`), routes mounted at `/api`
- Endpoints: health, auth (login/me), events (read/create/edit/soft-delete),
  countries, regions, persons (moderation CRUD), admin (users, role, ban)
- Tests: Vitest + Supertest (auth, events + permissions, moderation, admin)
- Layering: routes → controllers → services → models
- Startup: a fatal check ensures at least one super admin exists
  ([[concepts/rights-model|Rights Model]])

## Domain

Users (email + password, 4-level rights, ban state, 7-day token auth), persons,
countries/regions, and events (country/region, status, creator, owner list).
Model details: [[concepts/domain-model|Domain Model]].

## API surface (mounted at /api)

- `GET /health`
- `POST /auth/login`, `GET /auth/me`
- `GET/POST /events`, `GET/PUT/DELETE /events/:id`
- `GET /owner-candidates` — owner-picker search over persons only (`?search=`),
  label resolution for the edit form (`?ids=person:1,person:2`)
- `GET/POST /countries`, `PUT/DELETE /countries/:id`
- `GET/POST /regions`, `PUT/DELETE /regions/:id`
- `GET/POST /persons`, `PUT/DELETE /persons/:id`
- `GET /admin/users`, `PUT /admin/users/:id/role`, `PUT /admin/users/:id/ban`

Auth: `Authorization: Bearer <token>`; moderation writes require moderator+;
admin routes require administrator+. Contract:
[`Contracts/api/openapi.yaml`](../../../Contracts/api/openapi.yaml).

## Relationships

- Implements the contract in [[contracts|Contracts]]
- Persists to [[entities/database|Database]] via the shared `pg` pool