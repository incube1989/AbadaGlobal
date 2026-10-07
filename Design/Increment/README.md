# Increment

Drop **new information** here — documents, notes, drafts, data — that should
eventually be **merged into the wiki**.

## Rules

1. Files placed here are *candidates* for the wiki, not wiki pages yet.
2. When an agent is asked to process this folder, it must follow the gated
   merge workflow (full rules in [`../CLAUDE.md`](../CLAUDE.md)):

   1. **Read** every new file.
   2. **Ask first** about conflicts, open questions, and inaccuracies it finds
      against the current wiki ([`../wiki/`](../wiki/)). Do not edit anything yet.
   3. After everything is resolved, **ask for explicit approval to merge**.
      Never merge without explicit approval.
   4. On approval, **merge** the information into the wiki — add/update wiki
      pages, refresh `wiki/index.md`, append to `wiki/log.md`.
   5. **Move** the processed files to [`../Archive/`](../Archive/). The
      Increment folder is for incoming work, not history.

3. Files that are still being reviewed stay here; only approved-and-merged
   files move to Archive.

## Why

Merging is a judgment call — the human decides what belongs in the wiki. The
agent proposes, discusses, and executes only after approval.