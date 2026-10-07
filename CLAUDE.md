# AbadaGlobal — Agent Schema

This file teaches any agent working in this repository how the project is
organized and how to maintain the project wiki. It follows the **LLM wiki
pattern** (https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

## Repository map

| Path | Layer | Owner |
| ---- | ----- | ----- |
| `Frontend/` | Code — React + Vite + TS site | Humans + agents editing code |
| `Backend/` | Code — Node + Express + TS API, PostgreSQL migrations | Humans + agents editing code |
| `Contracts/` | API contracts — OpenAPI spec | Humans + agents; treated as source of truth |
| `Design/raw/` | Raw sources — immutable documents | Humans curate; agents read, never modify |
| `Design/Increment/` | Incoming documents awaiting review and approved merge | Humans drop files; agents read and propose |
| `Design/Archive/` | Documents already merged into the wiki | Agents move files here after approved merge |
| `Design/wiki/` | The wiki — interlinked markdown pages | Agents write and maintain; humans read |
| `CLAUDE.md` | The schema — this file | Co-evolved by humans and agents |

## The three-layer wiki pattern

**Raw sources** (`Design/raw/`): briefs, transcripts, articles, references,
data files. Immutable — the LLM reads from them but never modifies them. This
is the source of truth.

**The wiki** (`Design/wiki/`): LLM-generated markdown pages. Summaries, entity
pages, concept pages, an overview, a synthesis. The LLM owns this layer
entirely: it creates pages, updates them when new sources arrive, maintains
cross-references, and keeps everything consistent.

**The schema** (this file): tells the LLM how the wiki is structured, what the
conventions are, and what workflows to follow. Evolve it over time as the
domain clarifies.

## Wiki conventions

### Page format

Every wiki page starts with YAML frontmatter:

```yaml
---
title: Entity or page name
tags: [entity, backend]
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: N
---
```

Then markdown body with clear headings. Link between pages using wiki-style
links: `[[page-name]]` or relative markdown links `[name](entities/x.md)`.
Prefer wiki-style links for graph views.

### Special files

- `Design/wiki/index.md` — **content-oriented catalog**. Every page listed
  with a link, one-line summary, and optional metadata (date, source count),
  organized by category (entities, concepts, sources). Updated on every ingest.
- `Design/wiki/log.md` — **chronological, append-only** record of what happened
  and when. Every entry starts with the prefix `## [YYYY-MM-DD] action | Title`
  so the log stays parseable with unix tools, e.g. `grep "^## \[" log.md | tail -5`.

### Category folders

- `Design/wiki/entities/` — pages for real things: systems (frontend, backend,
  database), people, organizations, domains.
- `Design/wiki/concepts/` — ideas, decisions, ADRs, comparisons, patterns.
- `Design/wiki/sources/` — one summary page per ingested source document.

## Workflows

### Ingest

1. Human drops a new source into `Design/raw/` and asks the agent to process it.
2. Agent reads the source, discusses key takeaways with the human.
3. Agent writes a summary page in `Design/wiki/sources/`.
4. Agent updates `Design/wiki/index.md`.
5. Agent updates relevant entity and concept pages across the wiki
   (a single source may touch several pages).
6. Agent appends an entry to `Design/wiki/log.md`.

Ingest sources one at a time and stay involved. Batch ingestion is allowed only
with explicit human approval.

### Query

1. Agent reads `Design/wiki/index.md` first to find relevant pages.
2. Agent reads those pages and synthesizes an answer **with citations** to
   wiki pages and/or raw sources.
3. Good answers can be filed back into the wiki as new concept pages — do not
   let valuable syntheses disappear into chat history.

### Lint

Periodically, the human may ask for a health check of the wiki. Look for:

- contradictions between pages,
- stale claims superseded by newer sources,
- orphan pages with no inbound links,
- important concepts mentioned but lacking their own page,
- missing cross-references.

Suggest new questions to investigate and new sources to look for.

### Incremental merge (Design/Increment)

New information arrives in `Design/Increment/`. Processing it is a gated
workflow — **never merge without explicit approval**:

1. **Read** every new file in `Design/Increment/`.
2. **Raise issues first.** Compare the material against the current wiki and
   report conflicts, open questions, and inaccuracies. Wait for the human's
   answers; do not modify the wiki yet.
3. After issues are resolved, **ask for explicit approval to merge**.
4. Only on approval: perform the merge — write/update wiki pages, refresh
   `Design/wiki/index.md`, append to `Design/wiki/log.md` — then **move the
   source files from `Design/Increment/` to `Design/Archive/`**.
5. Never leave merged sources in `Design/Increment/`; never merge without
   approval.

The merge itself follows the same page/index/log conventions as **Ingest**.

## Engineering conventions

- API surface is defined in `Contracts/api/openapi.yaml`; backend implements
  it, frontend consumes it. Update the contract first, then the code.
- Backend database changes go through migrations in `Backend/db/migrations/`.
- Secrets never go in code — use `.env` files (see `.env.example` in each package).
- After any significant work touching project knowledge, update the wiki so
  knowledge compounds instead of being re-derived.