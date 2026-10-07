---
title: Frontend
tags: [entity, frontend, site]
created: 2026-10-07
updated: 2026-10-07
sources: 0
---

# Frontend

The site part of AbadaGlobal. A single-page application built with React 19,
Vite 7, TypeScript, and React Router.

## Key facts

- Code: [`../../../Frontend/`](../../../Frontend/)
- Dev server: `http://localhost:5173` (`npm run dev`)
- API access: typed client in `src/api/`, proxied to the backend at
  `http://localhost:3000` during development
- Tests: Vitest + Testing Library

## Relationships

- Consumes the API defined in [[contracts|Contracts]] — see
  [`../../../Contracts/api/openapi.yaml`](../../../Contracts/api/openapi.yaml)
- Calls [[backend|Backend]] over HTTP

## Open questions

- Site content and pages to be defined.