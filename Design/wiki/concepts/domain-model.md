---
title: Domain Model
tags: [concept, domain, users, persons, events, countries, regions, corda, guests]
created: 2026-10-07
updated: 2026-10-18
sources: 7
---

# Domain Model

Entities for AbadaGlobal, from [[sources/main]], [[sources/calendar]],
[[sources/users-and-persons]], [[concepts/rights-model|Rights Model]],
and [[sources/version0-3]].

## User

- id
- email, password (email + password login)
- name
- role: default | moderator | administrator | super admin
- isBanned

Authentication: a token is issued on login and expires in 7 days.
Banned users cannot log in. Rights and ban rules:
[[concepts/rights-model|Rights Model]].

## Person

- id
- nickname (apelido)
- country (FK → country)
- optional unique link to a user (a user may be linked to exactly one person)
- isDeleted (soft delete)
- **corda** (version0.3) — capoeira belt enum (Portuguese, never translated),
  `null` when not set → [[sources/version0-3]]
- **title** (version0.3) — derived from the corda automatically; **never
  editable and never stored**
- **curator** (version0.3) — list of curator persons, `null` by default
- **head** (version0.3) — list of regions headed by the person, `null` by default

A person can exist without a user and a user without a person
([[sources/users-and-persons]]). Public info carries the corda system;
private info is still TBD.

## Country / Region

- **country**: id, name (unique), isDeleted
- **region**: id, name, country (FK), isDeleted; name unique within a country

Managed on the [[entities/frontend|moderation page]]
([[sources/moderation-page]]).

## Event

- name
- start date, end date (inclusive)
- country (FK, nullable while TBD), region (FK, nullable)
- type: competition | festival | batizado | camp | coach only
- scope: world | Russia | region | local
- status: draft | published | deleted (deleted = soft delete)
- createdBy (user)
- owners: a list of **persons** (owners are persons only; the creator keeps
  edit rights via created_by)
- **guests** (version0.3) — a list of persons shown **at the top of the event
  information** (both the calendar pop-up and the event page)
- Resolved **ownerList** (version0.3) — owners with name + corda + title,
  displayed at the top of the event page

The belt system and titles come from [[sources/version0-3]]; MVP seed events
come from [[sources/hardcoded-events]].

## Moderation / admin

- Moderation CRUD for countries, regions, persons with soft-delete and
  person↔user linking: [[concepts/rights-model|Rights Model]]
- Admin can change rights and ban users (except super admin):
  [[sources/admin-panel]]

## Backend storage

User, event, and moderation data live on the backend. Persistence:
[[entities/database|Database]].