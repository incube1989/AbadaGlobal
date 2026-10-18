---
title: Source — Navigation Panel Increment Doc
tags: [source, navigation]
created: 2026-10-07
updated: 2026-10-18
---

# Source — Navigation Panel Increment Doc

Summary of [`Design/Increment/navigationpanel.md`](../../Increment/navigationpanel.md)
(archived as `Design/Archive/navigationpanel.md`). Updated for version0.2.

- Desktop: panel always on the left
- Mobile: hidden behind a burger button
- Buttons: main page, calendar, database, profile, settings, log out
- Clicking a button redirects to the corresponding page; in the MVP some pages
  may be under construction and some restricted for the user

## Version0.2 additions

- Two extra buttons: **moderation** and **administration**
- They are shown only to users with the corresponding rights (moderator+ for
  moderation, administrator+ for administration)
- Moderation leads to the moderation page; administration leads to the admin
  page

Rights model: [[concepts/rights-model|Rights Model]].