---
title: Rights Model
tags: [concept, rights, roles, admin, moderation]
created: 2026-10-18
updated: 2026-10-18
sources: 3
---

# Rights Model

Access model for AbadaGlobal, from [[sources/rights-levels]],
[[sources/admin-panel]], and [[sources/navigation-panel]].

## Levels

| Level | Moderation page | Administration page | Notes |
| ----- | --------------- | ------------------- | ----- |
| default | — | — | Any logged-in user can create events |
| moderator | ✅ | — | |
| administrator | ✅ | ✅ | May change/ban any user except super admin |
| super admin | ✅ | ✅ | Cannot be stripped of rights. Ever. |

Mapping from the MVP roles: `simple user → default`, `admin → administrator`,
`moderator → moderator`, plus the new `super admin`.

## Rules

- **Super admin guarantee:** at least one super admin must always exist. If
  none is found, the backend fails fatally and exits at startup.
- **Protection:** super admin accounts cannot be changed or banned — even by
  other super admins.
- **Ban:** a banned user cannot log in; the login page shows "You are banned,
  contact administrator". A valid token of a banned user is also rejected.
- **Navigation:** the moderation and administration buttons in the nav panel
  are shown only to users with the corresponding rights
  ([[sources/navigation-panel]]).
- **Private data:** all user data is public for now; private-data visibility is
  deferred.

## Implemented surface

- Backend: `requireAuth` + `requireRole(...roles)` middleware; admin routes
  (`GET /admin/users`, `PUT /admin/users/:id/role`, `PUT /admin/users/:id/ban`);
  startup super-admin check in `server.ts`
- Frontend: role helpers in `AuthContext` (`canModerate`, `canAdminister`,
  `isSuperAdmin`), `RoleRoute` guard, admin page, moderation page
- Contract: `Contracts/api/openapi.yaml`

See also [[concepts/domain-model|Domain Model]] and
[[sources/version0-2|the version0.2 increment]].