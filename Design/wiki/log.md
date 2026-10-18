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

## [2026-10-07] merge | Design increment batch — vision, MVP, calendar, seed events

- Read and reviewed six documents in `Design/Increment/`; raised and resolved
  open questions (auth model, roles, languages, event data normalization).
- Created source pages: [[sources/main]], [[sources/calendar]],
  [[sources/navigation-panel]], [[sources/restricted-page]],
  [[sources/under-construction]], [[sources/hardcoded-events]].
- Created concept pages: [[concepts/mvp-scope]], [[concepts/calendar-spec]],
  [[concepts/domain-model]].
- Updated [[overview]], [[entities/frontend]], [[entities/backend]],
  [[entities/database]]; refreshed [[index]].
- Decisions recorded: email+password login with a 7-day token; MVP roles equal
  (only logged-in state matters); all three languages in MVP starting with Russian.
- Normalized `hardcodedEvents.md` (ISO dates, standard places, type/scope);
  corrections: Festival Cultural → Saint Petersburg, Zumbimba → whole November
  in Rio de Janeiro.
- Archived merged files to `Design/Archive/` (originals still present in
  `Design/Increment/` pending filesystem removal).