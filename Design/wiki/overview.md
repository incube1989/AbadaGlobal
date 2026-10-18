---
title: Project Overview
tags: [overview]
created: 2026-10-07
updated: 2026-10-18
sources: 12
---

# AbadaGlobal — Project Overview

Synthesis page describing the project as a whole.

## What this is

A site with a backend for a Capoeira school in Russia, aimed at coaches.
Monorepo with four top-level areas:

| Area | Purpose | See |
| ---- | ------- | --- |
| Frontend | Site — React + Vite + TypeScript SPA | [[entities/frontend\|Frontend]] |
| Backend | API server + database layer — Express + TS, PostgreSQL | [[entities/backend\|Backend]], [[entities/database\|Database]] |
| Contracts | API documentation — OpenAPI source of truth | |
| Design | Project knowledge base — this wiki | |

## Main features

Calendar with create/edit events, login with four rights levels (default,
moderator, administrator, super admin), per-user notifications (later), video
database with manual access (later), main page with school info and upcoming
events (later), logged-in-only pages by default, three languages (Russian main,
English, Portuguese), desktop and mobile, navigation bar on all pages.

## MVP scope (built)

Login with hardcoded users (email + password, 7-day token), calendar from a
hardcoded event set, event page, navigation bar. Details:
[[concepts/mvp-scope|MVP Scope]].

## version0.2 (built)

- Four **rights levels** with a super-admin guarantee; admin panel (change
  rights, ban); moderation page (countries / regions / persons, 3 tabs)
  → [[concepts/rights-model|Rights Model]]
- **Event create / edit / soft-delete**; event now has country+region,
  `draft | published | deleted` status, a creator, and a **persons-only**
  owner list → [[concepts/calendar-spec|Calendar Spec]],
  [[concepts/domain-model|Domain Model]]
- **Persons** (nickname + country, optional user link) and countries/regions
  entities → [[sources/users-and-persons]]
- User banning (banned users cannot log in) → [[concepts/rights-model|Rights Model]]
- Plan and tasks: [`Plans/version0.2/`](../../Plans/version0.2/README.md)

## version0.3 (built)

- **Corda belt system** — 16 belts (corda) with two colors each; belt names
  and titles stay Portuguese and are never translated; the title (Graduado /
  Instrutor / Professor / Mestre / Grão Mestre) is derived from the belt,
  never edited or stored; the corda is drawn as a two-color badge before
  titles/names → [[sources/version0-3]]
- **Person profile** — public info gains `corda`, auto `title`, `curator`
  (persons), `head` (regions) → [[concepts/domain-model|Domain Model]]
- **Event guests** — a guest list of persons shown at the top of the event
  pop-up and the event page; owners are resolved and also shown at the top of
  the event page
- Implemented alongside the merge (backend + OpenAPI + frontend); see
  [[sources/version0-3]]

## Current state

- Monorepo scaffolded with working dev setup for frontend and backend
- Database migration pipeline in place (MVP + version0.2 + version0.3
  migrations applied)
- API contract covers auth, events CRUD, moderation, admin, belts/person
  profile, and event guests
- Design batches merged: vision, MVP, calendar spec, domain model, seed events,
  version0.2 (rights model, moderation, event CRUD, persons), version0.3
  (corda belts, person profile, event guests & owners)

## Open questions

- Jogos Mundiais 2027 exact dates/city and venue remain TBD
- Private-data visibility ([[sources/admin-panel]]) is deferred
- Person **private info** section is still TBD (public info is built)
- Mestrando vs. Mestre share the `vermelha-branco` belt — currently collapses
  to Mestre pending a separate title field
- Event draft workflow (the draft button exists but is disabled)
- Notifications and video database remain post-MVP

## Source count

Fifteen raw sources ingested (MVP design batch 2026-10-07 + version0.2 batch
2026-10-18 + version0.3 batch 2026-10-18).