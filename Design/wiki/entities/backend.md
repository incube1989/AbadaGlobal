---
title: Backend
tags: [entity, backend, api]
created: 2026-10-07
updated: 2026-10-07
sources: 0
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

## Relationships

- Implements the contract in [[contracts|Contracts]] —
  [`../../../Contracts/api/openapi.yaml`](../../../Contracts/api/openapi.yaml)
- Persists to [[database|Database]] via the shared `pg` pool

## Open questions

- Feature roadmap and domain model to be defined.