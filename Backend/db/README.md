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

## Data dictionary

Information about the database's entities and tables lives in two places:

1. **In the database itself** — every table and column carries a `COMMENT`
   written next to its DDL in [`migrations/`](migrations/). Comments are
   versioned by migrations, travel with dumps, and are queryable at any time.
2. **In this folder** — [`SCHEMA.md`](SCHEMA.md) is the human-readable mirror:
   ER diagram and per-table reference. Keep it in sync with the migrations.

Query the dictionary straight from SQL:

```sql
SELECT * FROM v_data_dictionary ORDER BY "table", "column";
SELECT * FROM v_data_dictionary WHERE "table" = 'app_meta';
```

The `v_data_dictionary` view is created by
[`migrations/002_data_dictionary.sql`](migrations/002_data_dictionary.sql).

## Layout

```
db/
├── migrate.ts        # migration runner
├── SCHEMA.md         # human-readable schema reference (ERD + tables)
├── migrations/       # numbered SQL migrations (DDL + COMMENT statements)
└── seeds/            # optional seed data
```

Runtime DB access from the API uses the shared pool in
[`../src/db/pool.ts`](../src/db/pool.ts).