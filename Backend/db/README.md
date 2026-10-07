# Database layer

PostgreSQL is used for persistence. Schema changes are managed with SQL
migrations; reference data can be loaded via seeds.

## Requirements

- PostgreSQL 14+ running locally (or reachable via `DATABASE_URL`)

## Setup

Create the database:

```sql
CREATE DATABASE abadaglobal;
```

Copy [`../.env.example`](../.env.example) to `.env` and adjust:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/abadaglobal
```

## Migrations

Migrations live in [`migrations/`](migrations/) as numbered `.sql` files.
They are applied in filename order by a small runner:

```bash
npm run db:migrate
```

The runner:

- tracks applied migrations in a `schema_migrations` table,
- runs each migration inside a transaction,
- never re-applies an already-applied migration.

To add a new migration, create `migrations/00N_name.sql` with the next number
and run `npm run db:migrate`.

## Seeds

Seeds (reference/demo data) live in [`seeds/`](seeds/). They are written as
plain `.sql` files (or TypeScript scripts) and executed on demand — they are
never applied automatically.

## Layout

```
db/
├── migrate.ts        # migration runner
├── migrations/       # numbered SQL migrations
└── seeds/            # optional seed data
```

Runtime DB access from the API uses the shared pool in
[`../src/db/pool.ts`](../src/db/pool.ts).