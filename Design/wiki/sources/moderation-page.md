---
title: Source — Moderation Page Increment Doc
tags: [source, moderation, countries, regions, persons]
created: 2026-10-18
updated: 2026-10-18
---

# Source — Moderation Page Increment Doc

Summary of [`Design/Increment/moderationpage.md`](../../Increment/moderationpage.md)
(archived as `Design/Archive/moderationpage.md`).

On the moderation page, moderators can:

- list all **countries**; search by name; add, edit, or mark as deleted
- list all **regions**; filter by country, search by name; add, edit, or mark
  as deleted
- list all **persons**; filter by country, search by name; add, edit, or mark
  as deleted; link a person to a user entity and unlink

Version0.2 renders this as three tabs (countries, regions, persons). "Mark as
deleted" is a soft delete. See [[concepts/rights-model|Rights Model]].