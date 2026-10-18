---
title: Database
tags: [entity, database, postgresql]
created: 2026-10-07
updated: 2026-10-18
sources: 12
---

# Database

The PostgreSQL persistence layer for AbadaGlobal.

## Key facts

- Engine: PostgreSQL 14+
- Migrations: numbered `.sql` files in
  [`../../../Backend/db/migrations/`](../../../Backend/db/migrations/), applied
  by the runner in [`../../../Backend/db/migrate.ts`](../../../Backend/db/migrate.ts)
- Migration tracking: `schema_migrations` table
- Seeds: migration-embedded seed data (comments document each deviation)
- Connection: `DATABASE_URL` env var, pool in
  [`../../../Backend/src/db/pool.ts`](../../../Backend/src/db/pool.ts)
- Data dictionary: SQL `COMMENT` statements in migrations + the
  `v_data_dictionary` view; human-readable mirror in
  [`../../../Backend/db/SCHEMA.md`](../../../Backend/db/SCHEMA.md)

## Current schema (version0.2)

- `users` — email, password hash, name, role (default | moderator |
  administrator | super admin), `is_banned`, created_at
- `countries` — name (unique), is_deleted
- `regions` — name, country_id (FK), is_deleted
- `persons` — nickname, country_id (FK), optional unique user_id (FK), is_deleted
- `events` — name, start/end dates, country_id (FK, nullable), region_id (FK,
  nullable), type, scope, status (draft | published | deleted), created_by (FK)
- `event_owners` — polymorphic owner list (user_id **or** person_id per row)
- `app_meta`, `schema_migrations`, `v_data_dictionary` — infrastructure

Seed data: 3 users (super admin / administrator / default), 3 countries,
7 regions, the 17 events re-pointed to country/region
([[sources/hardcoded-events]]), super admin as owner of each event.

Field semantics: [[concepts/domain-model|Domain Model]].

## Relationships

- Used by [[entities/backend|Backend]]

## Open questions

- Jogos Mundiais 2027 country/region remains TBD (null) until corrected from
  the admin window