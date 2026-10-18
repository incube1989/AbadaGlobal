---
title: Calendar Spec
tags: [concept, calendar, frontend]
created: 2026-10-07
updated: 2026-10-07
sources: 1
---

# Calendar Spec

Behavior of the calendar page, from [[sources/calendar|the calendar increment doc]].

## Date views

- Months: months shown as rows; event panels listed chronologically inside each month panel
- Weeks: weeks shown as rows under a month block; event panels in chronological order
- Days: weekday table starting Monday; event panels stretch across day cells

All views scroll vertically.

## Filters

- By scope: world, Russia, region, local
- By type: competition, festival, batizado, camp, coach only

## Event panel

DB fields: name, start date, end date, place, type, scope.

On the calendar the panel shows the event name plus a scope color. MVP colors:
world = red, Russia = blue, region = green, local = yellow.

Clicking a panel opens a popup with short information and a link to the event page.

## Domain data

Event type/scope vocabulary and data model: [[concepts/domain-model|Domain Model]].
Seed events: [[sources/hardcoded-events]].