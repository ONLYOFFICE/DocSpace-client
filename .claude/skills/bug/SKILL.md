---
name: bug
description: Read one Bugzilla bug in full — fields, description, comments, attachments
argument-hint: "<bugId>[,<bugId>...]"
---

# Read a Bugzilla bug in full

Fetch complete detail for one or more bugs and make the attachments viewable.

Script (run from the repo root): `.claude/scripts/bugzilla/bz.mjs`
Config/setup: `.claude/scripts/bugzilla/README.md`.

## Step 1 — parse `$ARGUMENTS`

`$ARGUMENTS` is a bug id or comma-separated ids (e.g. `82726` or `82726,82739`).
If empty, ask which bug.

## Step 2 — fetch detail + download attachments

```bash
node .claude/scripts/bugzilla/bz.mjs --show $ARGUMENTS --dump-attachments
```

This prints fields, the description (comment #0), attachment list, and the
latest comment; and downloads non-obsolete attachments to the configured
attachment dir (outside the repo by default), printing their local paths.

## Step 3 — view attachments

For each downloaded file the script lists:
- **images** (`image/*`) — open with the Read tool and describe what the
  screenshot shows relative to the bug (the actual vs expected UI).
- **text/HAR/logs** (`application/json`, `text/*`, `.har`) — Read and pull out
  the parts relevant to the report (failing request, status code, payload).
- other binaries — just note the path; don't try to render them.

## Step 4 — present

Give a tight summary: id, severity, product/component, status, the essence of
the report (translate the Russian summary/steps to English if the user works in
English), the key attachment findings, and the bug link the script printed.

Report only what the API and attachments actually contain.
