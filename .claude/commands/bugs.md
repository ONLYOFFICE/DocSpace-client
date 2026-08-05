---
description: List Bugzilla bugs (assignee / product / component / status filters)
argument-hint: "[assignee=email] [product=DocSpace] [component=API] [status=NEW,REOPENED] [changed-since=YYYY-MM-DD] [limit=N] | <saved-search URL>"
---

# List Bugzilla bugs

Show a compact digest of Bugzilla bugs, filtered as requested.

The fetcher reads its host + default assignee from a git-ignored local config
(`.claude/scripts/bugzilla/config.local.json`) and the API key from the Keychain
(see `.claude/scripts/bugzilla/README.md` for setup). If it reports "Not
configured", point the user at that README.

Script (run from the repo root): `.claude/scripts/bugzilla/bz.mjs`

## Step 1 — parse `$ARGUMENTS`

`$ARGUMENTS` holds the filter request. Map it to `bz.mjs` flags:

| User input | Flag |
|-----------|------|
| `assignee=<email>` (or "по <name>") | `--assigned <email>` |
| `product=<name>` | `--product "<name>"` |
| `component=<name>` (the bug section: API, Files, Rooms, AI, AI.Agent, …) | `--component "<name>"` |
| `status=NEW,REOPENED,…` | `--status NEW,REOPENED,…` |
| `changed-since=YYYY-MM-DD` | `--changed-since YYYY-MM-DD` |
| `limit=N` | `--limit N` |
| a full `buglist.cgi?…` saved-search URL | `--url "<URL>"` |

Defaults when unspecified: bugs **assigned to the configured user**, **open
only** (`resolution=---`), `--limit 500`. Component names may be prefixed by a
product (`UI.Desktop/AI.Agent`) — pass only the component part to `--component`.

## Step 2 — run

```bash
node .claude/scripts/bugzilla/bz.mjs [flags]
```

## Step 3 — present

Print the returned table as-is. Then add a one-line breakdown (total count, and
by severity or component if the list is long). If the result is large (>40),
offer to narrow further or to read a specific bug with `/bug <id>`.

Do not fabricate bugs or fields — show only what the script returns.
