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

## [2026-10-18] merge | Design increment batch — version0.2 (rights, admin, moderation, event CRUD)

- Reviewed seven version0.2 documents in `Design/Increment/` (`version0.2.md`,
  `adminpage.md`, `levelofrights.md`, `moderationpage.md`,
  `usersandperson.md`, updated `calendar.md` and `navigationpanel.md`);
  raised and resolved open questions with the team (role mapping, event
  country/region/status/owners, person shape, ban semantics, super-admin
  guarantee, moderation page scope, seed data).
- Created source pages: [[sources/version0-2]], [[sources/admin-panel]],
  [[sources/rights-levels]], [[sources/moderation-page]],
  [[sources/users-and-persons]]; updated [[sources/calendar]] and
  [[sources/navigation-panel]].
- Created concept page [[concepts/rights-model]]; updated
  [[concepts/domain-model]] and [[concepts/calendar-spec]].
- Updated [[overview]], [[entities/frontend]], [[entities/backend]],
  [[entities/database]]; refreshed [[index]].
- Decisions recorded: roles `default | moderator | administrator | super admin`
  (MVP roles mapped, one super admin seeded); event place → country+region,
  status draft/published/deleted, created_by, polymorphic owner list; person =
  nickname + country with optional user link; banned users cannot log in;
  at least one super admin required at startup (fatal + exit); all data public
  for now; moderation page split into 3 tabs.
- Implemented in code alongside the merge (plan/tasks in
  [`Plans/version0.2/`](../../Plans/version0.2/README.md)); 44 backend +
  29 frontend tests passing; live at http://localhost:5173.
- Archived the seven merged files to `Design/Archive/`.