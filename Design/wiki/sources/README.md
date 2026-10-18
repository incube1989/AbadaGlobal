# Sources

One summary page per **ingested source document** from the design increments
(archived in [`../../../Design/Archive/`](../../../Design/Archive/)).

## Conventions

- One page per source document; slug mirrors the doc (e.g. `admin-panel.md`,
  `hardcoded-events.md`).
- YAML frontmatter: `title`, `tags` (include `source`), `created`, `updated`.
- Body structure: summary of the document, key points, and links to the
  affected entity/concept pages.
- Ingestion always updates [[../index|the index]] and appends to
  [[../log|the log]].

## Pages

- [[main|Main increment doc]] — vision, main features, MVP scope
- [[version0-2|version0.2 increment doc]] — admin panel, event CRUD, rights
- [[calendar|Calendar increment doc]] — calendar + create/edit
- [[navigation-panel|Navigation panel increment doc]] — nav layout + role-gated buttons
- [[restricted-page|Restricted page increment doc]] — access-denied copy
- [[under-construction|Under construction increment doc]] — placeholder copy
- [[hardcoded-events|Hardcoded events data]] — normalized 2026–2027 seed events
- [[admin-panel|Admin panel increment doc]] — administration page behavior
- [[rights-levels|Rights levels increment doc]] — the four rights levels
- [[moderation-page|Moderation page increment doc]] — countries / regions / persons
- [[users-and-persons|Users and persons increment doc]] — user vs. person entities