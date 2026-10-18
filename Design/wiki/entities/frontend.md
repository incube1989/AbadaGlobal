---
title: Frontend
tags: [entity, frontend, site]
created: 2026-10-07
updated: 2026-10-07
sources: 6
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

## Pages

- Main page — school information and upcoming events
- Calendar — see [[concepts/calendar-spec|Calendar Spec]]
- Event page — full event information
- Login — email + password; see [[concepts/mvp-scope|MVP Scope]]
- Profile, Settings, Database (video) — under construction page in the MVP
- Restricted and under-construction pages with the fixed copy:
  [[sources/restricted-page]], [[sources/under-construction]]

## Layout

- Navigation bar on all pages: left panel on desktop, burger menu on mobile
  ([[sources/navigation-panel]])
- All three languages in the MVP (Russian first); desktop and mobile support

## Relationships

- Consumes the API defined in [[contracts|Contracts]] — see
  [`../../../Contracts/api/openapi.yaml`](../../../Contracts/api/openapi.yaml)
- Calls [[entities/backend|Backend]] over HTTP

## Open questions

- Detailed page layouts to be specified (team follow-up task)