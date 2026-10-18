---
title: Frontend
tags: [entity, frontend, site]
created: 2026-10-07
updated: 2026-10-18
sources: 12
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

- Login — email + password; see [[concepts/mvp-scope|MVP Scope]]
- Calendar — views, filters, create button, event popups; see
  [[concepts/calendar-spec|Calendar Spec]]
- Event page — full event information + edit button for authorized users
- Event form (`/events/new`, `/events/:id/edit`) — create/edit with
  country/region/type/scope; publish or save-as-draft (disabled)
- Moderation (`/moderation`, moderator+) — countries / regions / persons tabs
  ([[sources/moderation-page]])
- Administration (`/administration`, administrator+) — user list, change
  rights, ban/unban ([[sources/admin-panel]])
- Profile, Settings, Database (video) — under construction page
- Restricted and under-construction pages with the fixed copy:
  [[sources/restricted-page]], [[sources/under-construction]]

## Layout and rights

- Navigation bar on all pages: left panel on desktop, burger menu on mobile;
  role-gated "moderation" and "administration" buttons
  ([[sources/navigation-panel]])
- All three languages (Russian, English, Portuguese); desktop and mobile
- Role helpers in `AuthContext` and a `RoleRoute` guard enforce the
  [[concepts/rights-model|Rights Model]] on the client

## Relationships

- Consumes the API defined in [[contracts|Contracts]] — see
  [`../../../Contracts/api/openapi.yaml`](../../../Contracts/api/openapi.yaml)
- Calls [[entities/backend|Backend]] over HTTP