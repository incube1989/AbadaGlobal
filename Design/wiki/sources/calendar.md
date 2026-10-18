---
title: Source — Calendar Increment Doc
tags: [source, calendar]
created: 2026-10-07
updated: 2026-10-07
---

# Source — Calendar Increment Doc

Summary of [`Design/Increment/calendar.md`](../../Increment/calendar.md)
(archived as `Design/Archive/calendar.md`).

## Date views

- Months — months listed as rows; event panels in chronological order within each month panel
- Weeks — weeks listed as rows under a month block; event panels in chronological order
- Days — table; X-axis is weekdays starting Monday; event panels stretch across day cells

All date views allow scrolling up and down.

## Filters

- Scope: world, Russia, region, local
- Type: competition, festival, batizado, camp, coach only

## Event panel

Fields taken from the DB: name, start date, end date, place, type, scope.

On the calendar the panel shows the event name and a scope color (MVP):
red = world, blue = Russia, green = region, yellow = local.

Clicking a panel opens a popup with short information and a link to the event
page; the link redirects to the full event page with all event information.

Full behavior spec: [[concepts/calendar-spec|Calendar Spec]].