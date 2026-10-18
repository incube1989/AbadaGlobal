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

## [2026-10-18] cleanup | Increment folder emptied — no new content to merge

- Reviewed all files in `Design/Increment/` against the wiki and `Design/Archive/`.
- Confirmed the wiki was already up to date: all six documents
  (`calendar.md`, `hardcodedEvents.md`, `Main.md`, `navigationpanel.md`,
  `RestrictedPage.md`, `UnderConstruction.md`) were byte-identical to their
  archived, already-merged counterparts — no wiki page changes required.
- `UmderConstruction.md` (typo-named duplicate of `UnderConstruction.md`, same
  content) was archived as a record; it adds no new information and was not
  given a wiki page.
- Moved all seven files from `Design/Increment/` to `Design/Archive/`;
  `Design/Increment/` now holds only its `README.md`.