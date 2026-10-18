---
title: Source — version0.3 Increment Doc
tags: [source, version0.3, belts, corda, person, events, guests]
created: 2026-10-18
updated: 2026-10-18
---

# Source — version0.3 Increment Doc

Summary of the three version0.3 documents dropped in `Design/Increment/`
(`beltsandcolors.md`, `person.md`, `event.md`; archived as
`Design/Archive/beltsandcolors.md`, `Design/Archive/person.md`,
`Design/Archive/event.md`).

The next increment on top of version0.2:

- **Corda belt system and titles** (`beltsandcolors.md`)
- **Person profile extension** — public info: corda, auto title, curators,
  headed regions (`person.md`)
- **Event guests** — a guest list shown at the top of the event pop-up and the
  event page (`event.md`)

## Corda belts and titles

Capoeira belts are called **corda** (same in English usage, "корда" in
Russian). Every corda is a pair of colors and may grant a title. Belt names
and titles are **Portuguese by design and never translated**.

| Corda | Colors | Title |
| ----- | ------ | ----- |
| Crua | light grey + light grey | — |
| Crua-Amarela | light grey + yellow | — |
| Amarela | yellow + yellow | — |
| Amarela-Laranja | yellow + orange | — |
| Laranja | orange + orange | — |
| Laranja-Azul | orange + blue | — |
| Azul | blue + blue | Graduado |
| Azul-Verde | blue + green | Graduado |
| Verde | green + green | Graduado |
| Verde-Roxa | green + purple | Graduado |
| Roxa | purple + purple | Instrutor |
| Roxa-Marrom | purple + brown | Instrutor |
| Marrom | brown + brown | Professor |
| Marrom-Vermelha | brown + red | Professor |
| Vermelha-Branco | red + white | Mestre |
| Branco | white + white | Grão Mestre |

Display rules:

- The title precedes the person's name ("instructor ABC").
- The corda is **drawn** as a small two-color badge (the corda "emoji") next to
  the title/name.

## Person profile

Person public info gains (private info is still TBD):

- **corda** — enum (Portuguese, never translated); `null` = not set.
- **title** — **cannot be edited**; auto-derived from the corda
  (see mapping above).
- **curator** — list of persons, `null` by default.
- **head** — list of regions, `null` by default.

## Event guests

- An event has **guests**: a list of persons.
- Shown **at the top of the event information** — both the event pop-up on the
  calendar and the event page.
- Implemented alongside: **owners** are also resolved (name + corda + title)
  and displayed at the top of the event page.

## Decisions recorded during the merge

- `Vermelha-Branco` is listed for both *Mestrando* and *Mestre* in the source;
  a single corda carries one derived title, so the value collapses to
  **Mestre** (flagged for the team; a separate title field would be needed to
  distinguish Mestrando).
- The title is **derived on the fly** (backend + frontend mapping) and never
  stored in the database.
- The corda "emoji" is implemented as a drawn two-color stripe badge (CSS),
  keeping grey vs. white belts distinguishable.
- Guests and owner display resolve persons with nickname + corda + title so the
  frontend renders them without extra lookups.

## See also

- [[concepts/domain-model|Domain Model]] — updated Person and Event entities
- [[sources/version0-2|version0.2 increment doc]] — the previous increment