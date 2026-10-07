# Raw sources

**Immutable.** This directory holds the curated collection of source documents
that feed the wiki: project briefs, requirements, meeting transcripts,
articles, references, images, data files.

## Rules

- Documents here are the **source of truth** — the LLM reads from them but
  never modifies them.
- The wiki (`../wiki/`) summarizes and synthesizes this material; raw sources
  are never edited to match the wiki.
- Prefer stable file names and keep a short note in the file itself about
  where it came from and when it was added.
- Add new sources here, then ask an agent to **ingest** them (see
  [`../CLAUDE.md`](../CLAUDE.md)).

## Suggested organization

```
raw/
├── briefs/       # project briefs and requirements
├── meetings/     # meeting notes and transcripts
├── research/     # articles, references, competitive analysis
└── assets/       # images and other binary attachments
```

Create subfolders as needed — they are free-form.