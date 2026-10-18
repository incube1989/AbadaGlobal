---
title: Backend
tags: [entity, backend, api]
created: 2026-10-07
updated: 2026-10-07
sources: 6
---

# Backend

The API server and application layer of AbadaGlobal. Node.js + Express 5 +
TypeScript (ESM, strict mode).

## Key facts

- Code: [`../../../Backend/`](../../../Backend/)
- Dev server: `http://localhost:3000` (`npm run dev`), routes mounted at `/api`
- Endpoints: currently `GET /api/health`
- Tests: Vitest + Supertest
- Layering: routes → controllers → services → models

## Domain

Users (email + password, role, 7-day token auth) and events (name, dates,
place, type, scope). Model details: [[concepts/domain-model|Domain Model]].
Event and user data are stored on the backend; the MVP uses seeded/hardcoded
data.

## Roadmap

1. Auth: login endpoint (email + password) issuing a token that expires in 7 days
2. Events: read API for the calendar and event pages
3. Seeds: load the hardcoded events from [[sources/hardcoded-events]]

Contract-first: extend [`Contracts/api/openapi.yaml`](../../../Contracts/api/openapi.yaml)
before implementing.

## Relationships

- Implements the contract in [[contracts|Contracts]]
- Persists to [[entities/database|Database]] via the shared `pg` pool

## Open questions

- Token transport (header vs cookie) to be decided during implementation