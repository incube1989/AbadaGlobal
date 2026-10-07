# Design — project knowledge base

Everything about the AbadaGlobal project lives here as a **persistent,
LLM-maintained wiki** (the *LLM wiki* pattern, see
[`../CLAUDE.md`](../CLAUDE.md) for the schema).

```
Design/
├── raw/          # RAW SOURCES — immutable documents (briefs, transcripts, references)
└── wiki/         # THE WIKI — interlinked markdown pages maintained by agents
    ├── index.md  # content-oriented catalog of every page
    ├── log.md    # append-only chronological record of wiki activity
    ├── overview.md
    ├── entities/ # pages for real things: systems, people, domains
    ├── concepts/ # ideas, decisions, ADRs, comparisons
    └── sources/  # one summary page per ingested source
```

## How it works

**You curate; the LLM maintains.** Drop source documents into [`raw/`](raw/),
ask the agent to ingest them, and it writes/updates wiki pages, refreshes
[`wiki/index.md`](wiki/index.md), and appends to [`wiki/log.md`](wiki/log.md).

Three operations agents perform (full rules in [`../CLAUDE.md`](../CLAUDE.md)):

1. **Ingest** — new source → summary page + index/entity/log updates.
2. **Query** — answers are synthesized from the wiki with citations; valuable
   answers get filed back as new pages.
3. **Lint** — periodic health check: contradictions, stale claims, orphan pages.

## Browsing the wiki

The wiki is plain markdown in a git repo — version history comes for free.
It can also be opened as an [Obsidian](https://obsidian.md) vault (the `wiki/`
folder) to get graph view, backlinks, and Dataview tables from the YAML
frontmatter on each page.

## Getting started

- Read [`wiki/overview.md`](wiki/overview.md) for the project picture.
- Browse [`wiki/index.md`](wiki/index.md) as the entry point to all pages.
- Read [`../CLAUDE.md`](../CLAUDE.md) before asking an agent to maintain the wiki.