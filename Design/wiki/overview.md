---
title: Project Overview
tags: [overview]
created: 2026-10-07
updated: 2026-10-07
sources: 6
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

Calendar with create/edit events, login with three roles (admin, moderator,
simple user), per-user notifications, video database with manual access, main
page with school info and upcoming events, logged-in-only pages by default,
three languages (Russian main, English, Portuguese), desktop and mobile,
navigation bar on all pages.

## MVP scope

Login with hardcoded users (email + password, 7-day token), calendar from a
hardcoded event set, event page, navigation bar. All roles equal in the MVP —
only the logged-in state matters. All three languages in scope, starting with
Russian. Details: [[concepts/mvp-scope|MVP Scope]].

## Current state

- Monorepo scaffolded with working dev setup for frontend and backend
- API contract defines the health endpoint (`GET /api/health`)
- Database migration pipeline in place
- Design batch merged: vision, MVP, calendar spec, domain model, seed events

## Open questions

- Exact dates/city for Jogos Mundiais (August 2027) and venue for the kids camp
- Detailed MVP page specs (deferred by the team to a follow-up task)
- API contract additions for auth and events (update
  `Contracts/api/openapi.yaml` first)

## Source count

Six raw sources ingested (design increment batch, 2026-10-07).