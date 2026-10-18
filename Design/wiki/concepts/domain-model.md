---
title: Domain Model
tags: [concept, domain, users, events]
created: 2026-10-07
updated: 2026-10-07
sources: 2
---

# Domain Model

Initial entities for AbadaGlobal, from [[sources/main]] and [[sources/calendar]].

## User

- id
- email, password (email + password login)
- name
- role: admin | moderator | simple user (all roles equal in the MVP)

Authentication: a token is issued on login and expires in 7 days. See
[[concepts/mvp-scope|MVP Scope]].

## Event

- name
- start date, end date
- place
- type: competition | festival | batizado | camp | coach only
- scope: world | Russia | region | local

MVP events come from a hardcoded/seed set stored on the backend:
[[sources/hardcoded-events]].

## Backend storage

User and event data live on the backend. Planned persistence: [[entities/database|Database]].