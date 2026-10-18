---
title: Source — Rights Levels Increment Doc
tags: [source, rights, roles]
created: 2026-10-18
updated: 2026-10-18
---

# Source — Rights Levels Increment Doc

Summary of [`Design/Increment/levelofrights.md`](../../Increment/levelofrights.md)
(archived as `Design/Archive/levelofrights.md`).

Four levels of rights for users:

- **default** — no special access
- **moderator** — can access the moderation page
- **administrator** — can access the moderation and administration pages
- **super admin** — same as administrator, but cannot be stripped of those
  rights. Never. At least one super admin must always exist; if none is in the
  base, the backend fails fatally and exits.

Mapping from the MVP roles: `simple user → default`, `admin → administrator`,
`moderator → moderator`, plus the new `super admin`.

See [[concepts/rights-model|Rights Model]].