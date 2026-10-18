---
title: Database
tags: [entity, database, postgresql]
created: 2026-10-07
updated: 2026-10-07
sources: 6
---

# Database

The PostgreSQL persistence layer for AbadaGlobal.

## Key facts

- Engine: PostgreSQL 14+
- Migrations: numbered `.sql` files in
  [`../../../Backend/db/migrations/`](../../../Backend/db/migrations/), applied
  by the runner in [`../../../Backend/db/migrate.ts`](../../../Backend/db/migrate.ts)
- Migration tracking: `schema_migrations` table
- Seeds: [`../../../Backend/db/seeds/`](../../../Backend/db/seeds/) (manual, never automatic)
- Connection: `DATABASE_URL` env var, pool in
  [`../../../Backend/src/db/pool.ts`](../../../Backend/src/db/pool.ts)
- Data dictionary: SQL `COMMENT` statements in migrations + the
  `v_data_dictionary` view; human-readable mirror in
  [`../../../Backend/db/SCHEMA.md`](../../../Backend/db/SCHEMA.md)

## Current schema

- `app_meta` — placeholder key/value table (demonstrates the pipeline)
- `schema_migrations` — migration bookkeeping (managed by the runner)
- `v_data_dictionary` — queryable data dictionary view (tables, columns,
  types, comments)

## Planned tables (first feature)

- `users` — email, password, name, role (admin | moderator | simple user)
- `events` — name, start/end dates, place, type, scope
- Seed: the hardcoded event set from [[sources/hardcoded-events]]

Field semantics: [[concepts/domain-model|Domain Model]].

## Relationships

- Used by [[entities/backend|Backend]]

## Open questions

- None blocking; tables introduced with the auth/calendar feature