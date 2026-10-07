# Backend — API + database layer

Node.js + Express + TypeScript API server backed by PostgreSQL.

## Stack

- [Express 5](https://expressjs.com) with TypeScript (strict mode, ESM)
- [PostgreSQL](https://www.postgresql.org) via [`pg`](https://node-postgres.com)
- SQL migrations with the runner in [`db/migrate.ts`](db/migrate.ts)
- [Vitest](https://vitest.dev) + [Supertest](https://github.com/ladjs/supertest) for tests
- [tsx](https://tsx.is) for the dev server (hot reload)

## Getting started

```bash
npm install
npm run dev          # starts the API on http://localhost:3000
```

API endpoints are served under the `/api` prefix — health check:
`GET http://localhost:3000/api/health`.

See [`db/README.md`](db/README.md) for PostgreSQL setup and migrations.

## Scripts

| Script | Purpose |
| ------ | ------- |
| `npm run dev` | Start the dev server with watch mode |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server (`node dist/src/server.js`) |
| `npm run typecheck` | Type-check without emitting |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run db:migrate` | Apply pending SQL migrations |

## Structure

```
src/
├── config/        # environment configuration
├── db/            # pg connection pool
├── routes/        # feature routers (mounted at /api)
├── controllers/   # request handlers per feature
├── services/      # business logic per feature
├── models/        # data models / type definitions
├── middleware/    # cross-cutting middleware (errors, auth, ...)
└── tests/         # Vitest + Supertest specs
```

## Conventions

- The API surface is defined in [`../Contracts/api/openapi.yaml`](../Contracts/api/openapi.yaml).
  Implement the contract — update it first when the API changes.
- One feature = one folder set (`routes`, `controllers`, `services`).
- Use the shared pool from `src/db/pool.ts` for database access; never open
  ad-hoc connections.
- Schema changes always go through migrations in `db/migrations/`.