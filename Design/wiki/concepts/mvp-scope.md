---
title: MVP Scope
tags: [concept, mvp, decisions]
created: 2026-10-07
updated: 2026-10-07
sources: 1
---

# MVP Scope

Decisions defining the MVP, derived from [[sources/main|the Main increment doc]] and team review.

## In scope

- Login with hardcoded users — email + password on the login page; a token that
  expires in 7 days
- Calendar of events from a hardcoded set (stored on the backend) — built to
  test the calendar itself; event data will be refined later
- Event page (full event information)
- Navigation bar on all pages
- All pages default to logged-in-only; restricted and under-construction pages
  use the fixed copy from [[sources/restricted-page]] and
  [[sources/under-construction]]

## Roles

Admin, moderator, and simple user roles exist, but in the MVP all roles have
the same rights — only whether the user is logged in matters.

## Languages

All three languages (Russian, English, Portuguese) are in MVP scope;
implementation starts with Russian.

## Deferred to post-MVP

- Event create/edit (calendar CRUD)
- Per-user notifications
- Video database with manual access control
- Role-based permission differences