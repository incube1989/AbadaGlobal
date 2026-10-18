---
title: Calendar Spec
tags: [concept, calendar, frontend, events]
created: 2026-10-07
updated: 2026-10-18
sources: 2
---

# Calendar Spec

Behavior of the calendar page, from [[sources/calendar]].

## Date views

- Months: months shown as rows; event panels listed chronologically inside each month panel
- Weeks: weeks shown as rows under a month block; event panels in chronological order
- Days: weekday table starting Monday; event panels stretch across day cells

All views scroll vertically.

## Filters

- By scope: world, Russia, region, local
- By type: competition, festival, batizado, camp, coach only

## Event panel

DB fields: name, start/end dates, country (+region), type, scope, status.

On the calendar the panel shows the event name plus a scope color. MVP colors:
world = red, Russia = blue, region = green, local = yellow.

Clicking a panel opens a popup with short information and a link to the event page.

## Create / edit / delete (version0.2)

- Any logged-in user sees a "create new event" button on the calendar
- The create form: event fields; actions cancel / publish / save-as-draft
  (draft disabled for now)
- Edit is allowed for the event owner **or** a moderator **or** an
  administrator; an "edit event" button appears on the popup and the event page
- Soft-delete (status = deleted) is allowed for the same roles

Visibility: published events are visible to everyone; drafts are additionally
visible to their owner, moderators, and administrators; deleted events are
never shown.

## Domain data

Event type/scope/status vocabulary, ownership, and the event data model:
[[concepts/domain-model|Domain Model]]. Seed events: [[sources/hardcoded-events]].