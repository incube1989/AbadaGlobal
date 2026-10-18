# AbadaGlobal MVP — Tasks

Ordered checklist used to build and run the MVP. Phases are sequential; tasks
within a phase can be parallelized. Every task lists concrete files and an
acceptance check. Reference docs: [`plan.md`](plan.md), the
[Design wiki](../../Design/wiki/index.md), and
[`Contracts/api/openapi.yaml`](../../Contracts/api/openapi.yaml).

> **Status: COMPLETE (2026-10-07)** — the MVP is built and running locally.
> All tasks below are done; both apps pass typecheck, tests, and build.

Legend: ✅ = done, 🔄 = in progress, ⬜ = pending.

---

## Phase 0 — Database schema and seed

### T1. Create `users` and `events` tables
- [✅] Add `Backend/db/migrations/003_mvp_domain.sql`:
  - `users`: `id serial PK`, `email text UNIQUE NOT NULL`, `password_hash text NOT NULL`, `name text NOT NULL`, `role text NOT NULL CHECK (role IN ('admin','moderator','simple user'))`, `created_at timestamptz NOT NULL DEFAULT now()`
  - `events`: `id serial PK`, `name text NOT NULL`, `start_date date NOT NULL`, `end_date date NOT NULL`, `place text NOT NULL`, `type text NOT NULL CHECK (type IN ('competition','festival','batizado','camp','coach only'))`, `scope text NOT NULL CHECK (scope IN ('world','Russia','region','local'))`
  - Add a `COMMENT ON COLUMN`/`COMMENT ON TABLE` for every object (DB-as-dictionary convention from `Backend/db/SCHEMA.md`)
- [✅] Acceptance: `npm run db:migrate` applies `003_mvp_domain.sql`; `SELECT * FROM v_data_dictionary WHERE "table" IN ('users','events')` lists all columns.

### T2. Seed users and events
- [✅] Compute scrypt hashes: `node -e "const c=require('crypto');console.log(c.scryptSync('1234','abadaglobal-mvp-salt',64).toString('hex'))"` for `1234` and `4321`; record both hex values
- [✅] Add `Backend/db/migrations/004_seed_mvp.sql`:
  - Insert `admin@gmail.com` (hash of `1234`, name `Admin`, role `admin`) and `user@gmail.com` (hash of `4321`, name `User`, role `simple user`) with `ON CONFLICT (email) DO NOTHING`
  - Insert the 17 normalized events from [`Design/Increment/hardcodedEvents.md`](../../Design/Increment/hardcodedEvents.md) with `ON CONFLICT DO NOTHING`-style idempotency (unique seed rows via `WHERE NOT EXISTS`), including the resolved placeholders (Festival Cultural scope `region`, Capoeira na Beira do Volga scope `local`, kids camp place Moscow Region, Jogos Mundiais `2027-08-01..2027-08-31` place `TBD`) — each deviation documented in a SQL comment
- [✅] Acceptance: after `npm run db:migrate`, `SELECT count(*) FROM users` = 2 and `SELECT count(*) FROM events` = 17.

### T3. Update database documentation
- [✅] Update `Backend/db/SCHEMA.md`: ER diagram (add `USERS`, `EVENTS`), table reference sections, and the note about seed data
- [✅] Acceptance: SCHEMA.md mirrors the new migrations.

---

## Phase 1 — API contract

### T4. Extend the OpenAPI contract
- [✅] Update `Contracts/api/openapi.yaml`:
  - Schemas: `User` (id, email, name, role), `Event` (id, name, startDate, endDate, place, type, scope), `LoginRequest` (email, password), `LoginResponse` (token, user)
  - `securitySchemes.bearerAuth` (HTTP bearer) and a default security on protected paths
  - Paths: `POST /auth/login` (200 LoginResponse, 401 ErrorResponse), `GET /auth/me` (200 User, 401), `GET /events` (200 Event[], query params `scope`, `type`), `GET /events/{id}` (200 Event, 404)
- [✅] Acceptance: YAML is valid (`openapi` parsable) and reflects the API surface in `plan.md` section 3.

---

## Phase 2 — Backend auth

### T5. Config and env
- [✅] In `Backend/src/config/env.ts` add `authSecret` (env `AUTH_SECRET`) with a dev fallback constant and a startup warning when unset; add token TTL (7 days)
- [✅] Update `Backend/.env.example` with `AUTH_SECRET=`
- [✅] Acceptance: server starts with and without the env var.

### T6. Auth models and token service
- [✅] Add `Backend/src/models/user.ts` — `UserRow`/`User` types (id, email, name, role, passwordHash) and a `toPublicUser` mapper that strips the hash
- [✅] Add `Backend/src/services/auth.service.ts`:
  - `verifyCredentials(email, password)` — query `users` by email via the pool, compare with `crypto.scryptSync` using the shared salt, return the public user or null
  - `issueToken(userId)` — HMAC-signed opaque token (header + payload + HMAC signature via Node `crypto`), `exp` = now + 7 days
  - `verifyToken(token)` — validate signature and expiry, return `{ userId, exp }` or null
- [✅] Acceptance: unit checks pass — valid token verifies, expired/tampered token is rejected.

### T7. Auth middleware and routes
- [✅] Add `Backend/src/middleware/auth.ts` — `requireAuth` parses `Authorization: Bearer <token>`, calls `verifyToken`, attaches `req.userId`, responds 401 `{ error: 'Unauthorized' }` otherwise
- [✅] Add `Backend/src/controllers/auth.controller.ts` — `loginHandler` (400 missing fields, 401 bad credentials, 200 `{ token, user }`), `meHandler` (200 public user from `req.userId`)
- [✅] Add `Backend/src/routes/auth.routes.ts` — `POST /auth/login`, `GET /auth/me` (protected)
- [✅] Register the auth router in `Backend/src/routes/index.ts`
- [✅] Acceptance: `POST /api/auth/login` with `admin@gmail.com`/`1234` returns token+user; wrong password returns 401; `GET /api/auth/me` returns the user with a valid token and 401 without.

---

## Phase 3 — Backend events

### T8. Events model and service
- [✅] Add `Backend/src/models/event.ts` — `Event` type (id, name, startDate, endDate, place, type, scope) and row mapper (ISO date strings in responses)
- [✅] Add `Backend/src/services/events.service.ts`:
  - `listEvents(filters)` — `SELECT` all events, optionally `WHERE scope = $1 AND type = $2`, ordered by `start_date`
  - `getEvent(id)` — single event by id or null
- [✅] Acceptance: service returns the 17 seeded events ordered by start date; filters narrow the result.

### T9. Events controller and routes
- [✅] Add `Backend/src/controllers/events.controller.ts` — `listEventsHandler` (validate/ignore unknown query params, 400 for invalid enum values), `getEventHandler` (404 when not found)
- [✅] Add `Backend/src/routes/events.routes.ts` — `GET /events`, `GET /events/:id`, both behind `requireAuth`
- [✅] Register the events router in `Backend/src/routes/index.ts`
- [✅] Acceptance: `GET /api/events` returns 401 without token, 200 with token and optional `?scope=world&type=competition`; `GET /api/events/9999` returns 404.

---

## Phase 4 — Backend tests

### T10. Auth tests
- [✅] Add `Backend/src/tests/auth.test.ts` (Vitest + Supertest against the express `app`, with the pool/service mocked):
  - login success for both users, 401 for wrong password/unknown email, 400 for missing fields
  - `/auth/me` 401 without header, 200 with valid token
- [✅] Acceptance: `npm test` in `Backend/` passes.

### T11. Events tests
- [✅] Add `Backend/src/tests/events.test.ts`:
  - list returns events and applies filters; 401 without token; 404 for unknown id
- [✅] Acceptance: `npm test` in `Backend/` passes alongside the existing health test.

---

## Phase 5 — Frontend foundation

### T12. API client and types
- [✅] Extend `Frontend/src/api/types.ts` — `User`, `Event`, `LoginRequest`, `LoginResponse`, `EventFilters`
- [✅] Extend `Frontend/src/api/client.ts` — `request` gains method/body/headers support and an optional token parameter; add `login(email, password)`, `fetchMe(token)`, `fetchEvents(filters, token)`, `fetchEvent(id, token)`
- [✅] Acceptance: typecheck passes; client functions map to the contract paths.

### T13. i18n foundation
- [✅] Add `Frontend/src/i18n/dictionaries.ts` (or `ru.ts`/`en.ts`/`pt.ts`) with keys for: nav buttons, login form, calendar (views, filters, popup), event page fields, restricted/under-construction copy, common actions; Russian is the base/default
- [✅] Add `Frontend/src/i18n/I18nContext.tsx` — provider holding `lang` (persisted in `localStorage`, default `ru`), `t(key)` helper, `setLang`
- [✅] Wrap the app in the provider in `Frontend/src/main.tsx`
- [✅] Acceptance: `t('nav.calendar')` returns the right string per language.

### T14. Auth context
- [✅] Add `Frontend/src/auth/AuthContext.tsx` — state `{ user, token, status: 'loading' | 'anon' | 'authed' }`; `login()` calls the API and stores the token in `localStorage`; on mount, restores the token and calls `fetchMe`; `logout()` clears state and storage
- [✅] Wire the provider into `main.tsx`/`App.tsx`
- [✅] Acceptance: refresh keeps the session; expired/invalid token falls back to `anon`.

### T15. Protected routing and layout
- [✅] Add `Frontend/src/components/ProtectedRoute.tsx` — renders children for authed users; while status is `loading` show a minimal loader; otherwise render the restricted page (unlogged variant)
- [✅] Add `Frontend/src/components/Layout.tsx` — page shell with the nav panel and an outlet; applied to all protected pages
- [✅] Update `Frontend/src/App.tsx` — routes per the route map in `plan.md`; `/` redirects based on auth status; remove the old `Home` import (or repoint `Home` to the redirect)
- [✅] Acceptance: unlogged navigation to `/calendar` renders the restricted page; logged-in navigation shows the layout.

### T16. Navigation panel
- [✅] Add `Frontend/src/components/NavPanel.tsx`:
  - Desktop: fixed left sidebar; Mobile: burger button toggling a slide-in panel
  - Buttons: Main, Calendar, Database, Profile, Settings (nav links) and Log out (calls `logout`)
  - Includes the language switcher
  - Active route highlighted; labels come from `t()`
- [✅] Add `Frontend/src/components/LanguageSwitcher.tsx` — RU / EN / PT selector wired to `I18nContext`
- [✅] Acceptance: nav renders on protected pages, switches language, and logs out correctly.

---

## Phase 6 — Frontend pages

### T17. Login page
- [✅] Add `Frontend/src/pages/Login.tsx` — email + password form with validation, error display from the API, submit calls `login()` then navigates to `/calendar`; redirects away if already authed; fully translated
- [✅] Acceptance: login with either seed user lands on the calendar; wrong credentials show an error.

### T18. Calendar page
- [✅] Add `Frontend/src/pages/Calendar.tsx` and helpers/components under `Frontend/src/components/calendar/`:
  - View toggle: months (default), weeks, days — all vertically scrollable; days view is a weekday table starting Monday
  - Filters: scope (world/Russia/region/local) and type (competition/festival/batizado/camp/coach only), multi-selectable
  - Event panel: event name + scope color bar (world=red, Russia=blue, region=green, local=yellow); panels positioned chronologically per view
  - Clicking a panel opens a popup with short info (name, dates, place, type, scope) and a link to `/events/:id`
  - Data loaded via `fetchEvents` with the current filters; loading/error/empty states
- [✅] Acceptance: all 17 events appear; filters narrow results; views switch; colors correct; popup links open the event page.

### T19. Event page
- [✅] Add `Frontend/src/pages/EventPage.tsx` — loads `fetchEvent(id)`, shows name, start/end dates, place, type, scope (labels translated, scope shown with its color), a back-to-calendar link; handles 404 with a not-found message
- [✅] Acceptance: navigating from the calendar popup shows full event info; unknown id shows not-found.

### T20. Under construction and restricted pages
- [✅] Add `Frontend/src/pages/UnderConstruction.tsx` — centered translated copy "Sorry, page is yet under construction. Contact Admin for details"
- [✅] Add `Frontend/src/pages/Restricted.tsx` — two variants by auth state: unlogged → "Sorry, you do not have permission to view this page. Please log in to continue." with a login link; logged → "Sorry, you do not have permission to view this page. Contact Admin for details."
- [✅] Acceptance: `/database`, `/profile`, `/settings` show under construction; unlogged access to protected pages shows the restricted page with a login link.

### T21. Styles
- [✅] Update `Frontend/src/styles/global.css` — layout shell (sidebar + content), burger menu styles, calendar panels and scope colors, popup, forms, responsive breakpoints
- [✅] Acceptance: pages look coherent on desktop and mobile widths.

---

## Phase 7 — Frontend tests

### T22. Page and component tests
- [✅] Add/update tests (Vitest + Testing Library, jsdom):
  - `Login.test.tsx` — submit calls `login` and navigates; shows error on failure
  - `Calendar.test.tsx` — renders events from a mocked client; filters and view toggle work
  - `Restricted.test.tsx` / `UnderConstruction.test.tsx` — copy variants per auth state
  - `NavPanel.test.tsx` — renders buttons, calls logout
  - `I18n.test.tsx` — switching language updates strings
  - Update `App.test.tsx` for the new route map
- [✅] Mock `src/api/client.ts` (no network) and control `AuthContext` state in tests
- [✅] Acceptance: `npm test` in `Frontend/` passes (15/15).

---

## Phase 8 — Integration and run verification

### T23. Full-stack verification
- [✅] Start PostgreSQL, run `npm run db:migrate`, start backend and frontend
- [✅] Manually verify the acceptance criteria from `plan.md` section 7:
  - both users log in; wrong password rejected
  - calendar shows seeded events with correct colors and filters; views switch
  - popup → event page works; unknown id shows not-found
  - unlogged access to `/calendar` and `/events/:id` shows the restricted page
  - database/profile/settings show under construction
  - language switch (ru/en/pt) updates UI
  - logout returns to login; reload keeps the session
- [✅] Run in both apps: `npm run typecheck`, `npm test`, `npm run build`
- [✅] Update `Backend/README.md` and `Frontend/README.md` with the MVP run steps and seed credentials if not already present
- [✅] Acceptance: the full user journey works end to end on the local machine.

---

## Definition of done

All tasks above are checked. The MVP runs locally with the two seed users, the
seeded calendar, event pages, navigation, restricted/under-construction pages,
and a working language switcher. Both apps pass typecheck, tests, and build.