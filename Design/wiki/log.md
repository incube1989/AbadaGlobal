# Wiki Log

Chronological, append-only record of wiki activity. Every entry uses the
prefix `## [YYYY-MM-DD] action | Title` so the log stays parseable, e.g.:

```bash
grep "^## \[" log.md | tail -5
```

## [2026-10-07] init | Repository scaffold

- Scaffolded the monorepo: Frontend (React + Vite + TS), Backend (Express + TS + PostgreSQL), Contracts (OpenAPI), Design wiki.
- Created initial entity pages: [[entities/frontend|Frontend]], [[entities/backend|Backend]], [[entities/database|Database]].
- Established the wiki schema in [`../../CLAUDE.md`](../../CLAUDE.md) (ingest / query / lint workflows).