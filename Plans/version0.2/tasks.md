# AbadaGlobal version0.2 — Tasks

Ordered checklist used to build and verify version0.2. Phases are sequential;
tasks within a phase can be parallelized. Every task lists concrete files and
an acceptance check. Reference docs: [`plan.md`](plan.md), the
[Design wiki](../../Design/wiki/index.md), and
[`Contracts/api/openapi.yaml`](../../Contracts/api/openapi.yaml).

Legend: ✅ = done, 🔄 = in progress, ⬜ = pending.

---

## Phase 0 — Database schema and seed

### T1. Rework users and add new domain tables
- [ ] Add `Backend/db/migrations/005_version02_domain.sql`:
  - `users`: change `role` CHECK to `('default','moderator','administrator','super admin')`; add `is_banned boolean NOT NULL DEFAULT false`
  - `countries`: `id serial PK`, `name text NOT NULL UNIQUE`, `is_deleted boolean NOT NULL DEFAULT false`, `created_at`
  - `regions`: `id serial PK`, `name text NOT NULL`, `country_id int NOT NULL REFERENCES countries(id)`, `is_deleted boolean NOT NULL DEFAULT false`, `created_at`, `UNIQUE (country_id, name)`
  - `persons`: `id serial PK`, `nickname text NOT NULL`, `country_id int NOT NULL REFERENCES countries(id)`, `user_id int NULL UNIQUE REFERENCES users(id)`, `is_deleted boolean NOT NULL DEFAULT false`, `created_at`, `UNIQUE (country_id, nickname)`
  - `events`: drop `place`; add `country_id int NULL REFERENCES countries(id)`, `region_id int NULL REFERENCES regions(id)`, `status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft','published','deleted'))`, `created_by int NOT NULL REFERENCES users(id)`
  - `event_owners`: `id serial PK`, `event_id int NOT NULL REFERENCES events(id) ON DELETE CASCADE`, `user_id int NULL REFERENCES users(id)`, `person_id int NULL REFERENCES persons(id)`, `CHECK ((user_id IS NOT NULL)::int + (person_id IS NOT NULL)::int = 1)`; partial unique indexes on `(event_id, user_id)` and `(event_id, person_id)` where not null
  - Add a `COMMENT ON` for every new/changed object (DB-as-dictionary convention)
- [ ] Acceptance: `npm run db:migrate` applies `005`; `v_data_dictionary` lists the new tables/columns.

### T2. Seed roles, super admin, countries/regions, and re-point events
- [ ] Add `Backend/db/migrations/006_seed_version02.sql`:
  - Update `users.role`: `admin` → `administrator`, `simple user` → `default` (moderator unchanged)
  - Insert `superadmin@gmail.com` (hash of `1234`, name `Super Admin`, role `super admin`) with `ON CONFLICT (email) DO NOTHING`
  - Insert countries: Russia, Luxembourg, Brazil
  - Insert regions: Samara, Moscow Region, Saint Petersburg, Voronezh, Yekaterinburg, Moscow (Russia); Rio de Janeiro (Brazil)
  - Re-point the 17 events: set `country_id`/`region_id` from their place; Jogos Mundiais → null/null (TBD); set `status='published'`; set `created_by` = super admin id
  - Insert `event_owners` rows: super admin as owner of each seed event
  - All inserts idempotent (ON CONFLICT / WHERE NOT EXISTS)
- [ ] Acceptance: after migrate, 3 users with correct roles; 3 countries; 7 regions; 17 events with country/region/status/created_by; 17 owner rows.

### T3. Update database documentation
- [ ] Update `Backend/db/SCHEMA.md`: ER diagram, table reference sections, seed notes
- [ ] Acceptance: SCHEMA.md mirrors the new migrations.

---

## Phase 1 — API contract

### T4. Extend the OpenAPI contract
- [ ] Update `Contracts/api/openapi.yaml`:
  - `User`: role enum → `[default, moderator, administrator, super admin]`; add `isBanned`
  - New schemas: `Country`, `Region`, `Person`, `EventOwner`, `EventInput`, `EventStatus`, `Role`
  - `Event`: replace `place` with `countryId`, `regionId`; add `status`, `createdBy`, `owners`
  - Paths: `POST /events`, `PUT /events/{id}`, `DELETE /events/{id}`; `GET/POST /countries`, `PUT/DELETE /countries/{id}`; `GET/POST /regions`, `PUT/DELETE /regions/{id}`; `GET/POST /persons`, `PUT/DELETE /persons/{id}`; `GET /admin/users`, `PUT /admin/users/{id}/role`, `PUT /admin/users/{id}/ban`
  - Security: moderation/admin paths require `moderator+` / `administrator+` (documented via a `x-required-role` note or explicit security)
- [ ] Acceptance: YAML is valid and reflects the new API surface.

---

## Phase 2 — Backend auth & rights

### T5. Role-aware user model and banned login
- [ ] Update `Backend/src/models/user.ts`: `role` type → `'default' | 'moderator' | 'administrator' | 'super admin'`; add `isBanned`; add `personId`
- [ ] Update `Backend/src/services/auth.service.ts`: `verifyCredentials` returns a distinct result for banned users (e.g. `{ status: 'banned' }`) so the controller can return the "you are banned" message
- [ ] Update `Backend/src/controllers/auth.controller.ts`: login returns 403 with "you are banned, contact administrator" for banned users
- [ ] Acceptance: banned user login → 403 banned message; normal login works.

### T6. requireRole middleware and super-admin startup check
- [ ] Add `Backend/src/middleware/role.ts` — `requireRole(...roles)` reads `req.userId`, loads the user, checks role, 403 otherwise
- [ ] Add a startup check in `Backend/src/server.ts` (or app bootstrap): query for a super admin; if none, `console.error` fatal and `process.exit(1)`
- [ ] Acceptance: non-moderator gets 403 on moderation routes; server exits when no super admin exists.

---

## Phase 3 — Backend events (create / edit / soft-delete)

### T7. Event model and service
- [ ] Update `Backend/src/models/event.ts`: add `countryId`, `regionId`, `status`, `createdBy`, `owners`; keep type/scope
- [ ] Update `Backend/src/services/events.service.ts`:
  - `listEvents(filters, viewer)` — published events for everyone; drafts also visible to owner/moderator/administrator; exclude `deleted`
  - `getEvent(id, viewer)` — same visibility rules
  - `createEvent(input, userId)` — insert with `status`, `created_by`, country/region; add creator as owner
  - `updateEvent(id, input, userId)` — permission: owner/moderator/administrator; update fields and owner list
  - `deleteEvent(id, userId)` — soft-delete (`status='deleted'`); permission: owner/moderator/administrator
- [ ] Acceptance: service enforces visibility and permissions.

### T8. Events controller and routes
- [ ] Update `Backend/src/controllers/events.controller.ts` and `Backend/src/routes/events.routes.ts`:
  - `POST /events` (create), `PUT /events/:id` (edit), `DELETE /events/:id` (soft delete), all behind `requireAuth`
  - Validate country/region/status/type/scope enums; 400 on invalid input; 403 on forbidden edit/delete; 404 on missing
- [ ] Acceptance: create/edit/delete work with correct status codes and permission checks.

---

## Phase 4 — Backend moderation (countries / regions / persons)

### T9. Countries
- [ ] Add `Backend/src/models/country.ts`, `Backend/src/services/countries.service.ts`, controller, routes:
  - `GET /countries` (list, optional search, exclude deleted), `POST /countries`, `PUT /countries/:id`, `DELETE /countries/:id` (soft)
  - Write routes behind `requireRole('moderator','administrator','super admin')`
- [ ] Acceptance: CRUD + soft-delete + search work; non-moderator gets 403.

### T10. Regions
- [ ] Add `Backend/src/models/region.ts`, service, controller, routes:
  - `GET /regions?country=&search=` (filter by country), `POST /regions`, `PUT /regions/:id`, `DELETE /regions/:id` (soft)
  - Write routes behind `requireRole('moderator','administrator','super admin')`
- [ ] Acceptance: CRUD + country filter + soft-delete work.

### T11. Persons
- [ ] Add `Backend/src/models/person.ts`, service, controller, routes:
  - `GET /persons?country=&search=` (filter by country), `POST /persons`, `PUT /persons/:id` (edit fields and link/unlink `user_id`), `DELETE /persons/:id` (soft)
  - Write routes behind `requireRole('moderator','administrator','super admin')`
- [ ] Acceptance: CRUD + country filter + link/unlink user work.

---

## Phase 5 — Backend admin

### T12. Admin users
- [ ] Add `Backend/src/services/admin.service.ts`, controller, routes:
  - `GET /admin/users` (list all users with role + isBanned)
  - `PUT /admin/users/:id/role` (change role; reject if target is super admin)
  - `PUT /admin/users/:id/ban` (set/unset `is_banned`; reject if target is super admin)
  - All behind `requireRole('administrator','super admin')`
- [ ] Acceptance: admin can change roles and ban users; super admin is protected; non-admin gets 403.

---

## Phase 6 — Backend tests

### T13. Auth tests
- [ ] Update `Backend/src/tests/auth.test.ts`: banned login → 403 banned message; role-aware `/auth/me`
- [ ] Acceptance: `npm test` in `Backend/` passes.

### T14. Events tests
- [ ] Update `Backend/src/tests/events.test.ts`: create, edit, soft-delete; visibility (drafts); permission (non-owner cannot edit)
- [ ] Acceptance: `npm test` passes.

### T15. Moderation and admin tests
- [ ] Add `Backend/src/tests/moderation.test.ts` (countries/regions/persons CRUD + role gating) and `Backend/src/tests/admin.test.ts` (list, role change, ban, super-admin protection)
- [ ] Acceptance: `npm test` passes.

---

## Phase 7 — Frontend foundation

### T16. API types and client
- [ ] Update `Frontend/src/api/types.ts`: `UserRole` → new roles + `isBanned`; `Event` → countryId/regionId/status/createdBy/owners; add `Country`, `Region`, `Person`, `EventInput`
- [ ] Update `Frontend/src/api/client.ts`: `createEvent`, `updateEvent`, `deleteEvent`, `fetchCountries`, `createCountry`, `updateCountry`, `deleteCountry`, `fetchRegions`, `createRegion`, `updateRegion`, `deleteRegion`, `fetchPersons`, `createPerson`, `updatePerson`, `deletePerson`, `fetchAdminUsers`, `changeUserRole`, `setUserBan`
- [ ] Acceptance: typecheck passes; client maps to the contract.

### T17. Auth context role helpers
- [ ] Update `Frontend/src/auth/AuthContext.tsx`: expose `isModerator`, `isAdministrator`, `isSuperAdmin` (or a `can(role)` helper) from `user.role`
- [ ] Acceptance: role helpers reflect the current user.

### T18. Navigation by rights
- [ ] Update `Frontend/src/components/NavPanel.tsx`: add "moderation" and "administration" buttons shown only when the user has the corresponding rights
- [ ] Update `Frontend/src/App.tsx`: add routes `/moderation` and `/administration` (role-gated)
- [ ] Acceptance: buttons appear only for authorized users; routes are protected.

---

## Phase 8 — Frontend pages

### T19. Event create/edit form
- [ ] Add `Frontend/src/pages/EventForm.tsx` (used for both create and edit): fields name, start/end date, country (select), region (select filtered by country), type, scope; actions cancel / publish / save-as-draft (draft disabled)
- [ ] Add routes `/events/new` and `/events/:id/edit`; wire the calendar "create new event" button and the edit buttons
- [ ] Acceptance: create publishes an event; edit updates it; draft button is disabled.

### T20. Calendar and event page updates
- [ ] Update `Frontend/src/pages/Calendar.tsx`: "create new event" button for logged-in users; "edit event" button on the popup for owner/moderator/administrator
- [ ] Update `Frontend/src/pages/EventPage.tsx`: show country/region/status; "edit event" button for authorized users
- [ ] Acceptance: create/edit entry points appear per rights.

### T21. Moderation page (3 tabs)
- [ ] Add `Frontend/src/pages/Moderation.tsx` with tabs: Countries, Regions, Persons
  - Countries: list + search, add/edit/soft-delete
  - Regions: list filtered by country + search, add/edit/soft-delete
  - Persons: list filtered by country + search, add/edit/soft-delete, link/unlink user
- [ ] Acceptance: all three tabs work against the API.

### T22. Admin page
- [ ] Add `Frontend/src/pages/Admin.tsx`: list all users (name, email, role, banned); change role (except super admin); ban/unban
- [ ] Acceptance: admin can change roles and ban users; super admin row is protected.

### T23. i18n and styles
- [ ] Update `Frontend/src/i18n/dictionaries.ts`: keys for moderation, admin, event form, new nav buttons, banned message, statuses, roles — in ru/en/pt
- [ ] Update `Frontend/src/styles/global.css`: tabs, tables, forms, role/banned badges
- [ ] Acceptance: all new UI is translated and styled.

---

## Phase 9 — Frontend tests

### T24. Page and component tests
- [ ] Add/update tests: `EventForm.test.tsx`, `Moderation.test.tsx`, `Admin.test.tsx`, `NavPanel.test.tsx` (role-gated buttons), `Calendar.test.tsx` (create/edit buttons), `EventPage.test.tsx` (edit button)
- [ ] Mock `src/api/client.ts`; control `AuthContext` state
- [ ] Acceptance: `npm test` in `Frontend/` passes.

---

## Phase 10 — Integration and run verification

### T25. Full-stack verification
- [ ] Start PostgreSQL, `npm run db:migrate`, start backend and frontend
- [ ] Manually verify acceptance criteria from `plan.md` section 7
- [ ] Run in both apps: `npm run typecheck`, `npm test`, `npm run build`
- [ ] Update `Backend/README.md` and `Frontend/README.md` with version0.2 run steps and seed credentials
- [ ] Acceptance: the full version0.2 journey works end to end.

---

## Definition of done

All tasks above are checked. version0.2 runs locally with the 4-level rights
model, admin panel, moderation page (countries/regions/persons), event
create/edit/soft-delete, user banning, and the super-admin guarantee. Both apps
pass typecheck, tests, and build.