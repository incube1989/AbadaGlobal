---
title: Project Overview
tags: [overview]
created: 2026-10-07
updated: 2026-10-07
sources: 0
---

# AbadaGlobal — Project Overview

Synthesis page describing the project as a whole. Kept current by agents as
sources are ingested and decisions are made.

## What this is

A site project organized as a monorepo with four top-level areas:

| Area | Purpose | See |
| ---- | ------- | --- |
| Frontend | Site part — React + Vite + TypeScript SPA | [[entities/frontend\|Frontend]] |
| Backend | API server + database layer — Express + TS, PostgreSQL | [[entities/backend\|Backend]], [[entities/database\|Database]] |
| Contracts | API documentation — OpenAPI source of truth | |
| Design | Project knowledge base — this wiki | |

## Current state

- Monorepo scaffolded with working dev setup for frontend and backend.
- API contract defined for the health endpoint (`GET /api/health`).
- Database migration pipeline in place (SQL migrations, runner, seeds).

## Open questions

_(To be filled in as the project evolves.)_

## Source count

No raw sources ingested yet.