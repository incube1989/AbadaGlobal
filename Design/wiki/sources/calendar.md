---
title: Source — Calendar Increment Doc
tags: [source, calendar]
created: 2026-10-07
updated: 2026-10-18
---

# Source — Calendar Increment Doc

Summary of [`Design/Increment/calendar.md`](../../Increment/calendar.md)
(archived as `Design/Archive/calendar.md`). Updated for version0.2 (event
create/edit).

## Date views

- Months — months listed as rows; event panels in chronological order within each month panel
- Weeks — weeks listed as rows under a month block; event panels in chronological order
- Days — table; X-axis is weekdays starting Monday; event panels stretch across day cells

All date views allow scrolling up and down.

## Filters

- Scope: world, Russia, region, local
- Type: competition, festival, batizado, camp, coach only

## Event panel and event page

Fields taken from the DB: name, start date, end date, country (+region), type,
scope, status.

On the calendar the panel shows the event name and a scope color (MVP):
red = world, blue = Russia, green = region, yellow = local.

Clicking a panel opens a popup with short information and a link to the event
page; the link redirects to the full event page with all event information.

## Create and edit (version0.2)

- Every logged-in user has a "create new event" button on the calendar page
- It opens a form page with the event fields; actions: cancel, publish event,
  save as draft (save as draft is disabled for now)
- A user can edit an event if they are its owner **or** a moderator **or** an
  administrator
- An "edit event" button appears on the event popup and the event page for
  those users
- Events can be soft-deleted (status = deleted) by the same roles

Full behavior spec: [[concepts/calendar-spec|Calendar Spec]].
Event data model: [[concepts/domain-model|Domain Model]].