---
title: Source — Main Increment Doc
tags: [source, vision, mvp]
created: 2026-10-07
updated: 2026-10-07
---

# Source — Main Increment Doc

Summary of [`Design/Increment/Main.md`](../../Increment/Main.md) (archived as
`Design/Archive/Main.md`).

## Vision

A site with a backend for a Capoeira school in Russia, aimed at coaches.

## Main features (full scope)

- Calendar of events with create and edit ability
- Login; roles: admin, moderator, simple user
- Notifications for each user
- Video database with manually set access
- Main page with school information and upcoming events
- All pages accessible only to logged-in users by default
- Three languages: Russian (main), English, Portuguese
- Desktop and mobile support
- Navigation bar on all pages

## MVP scope

- Login with hardcoded users
- Calendar of events from a hardcoded set
- Event page
- Navigation bar
- User and event data stored on the backend

See [[concepts/mvp-scope|MVP Scope]] for the detailed decisions.