# Bugzilla tooling

Read-only Bugzilla fetch + attachment download, plus the `/bugs`, `/bug`,
`/fix-bug` and `/bugs-audit` skills (in `.claude/skills/`). The committed code
carries **no** host, credentials, or personal data — everything personal is
configured locally and git-ignored.

- `lib.mjs` — config resolution and REST helpers shared by the scripts.
- `bz.mjs` — list / show bugs, download attachments. Read-only.
- `audit.mjs` — backlog audit. The **only** code that writes to Bugzilla, and
  only through `apply --confirm` after a reviewed dry-run.

## One-time setup (per person)

1. Copy the config template and fill in your values:

   ```bash
   cp .claude/scripts/bugzilla/config.example.json .claude/scripts/bugzilla/config.local.json
   ```

   `config.local.json` is git-ignored. Fields:
   - `host` — your Bugzilla base URL
   - `assigned` — your Bugzilla account email (default assignee for `/bugs`)
   - `keychainService` — macOS Keychain service name for the API key
   - `attachDir` — optional; where `--dump-attachments` writes (default:
     `~/.cache/docspace-bugzilla/attachments`, kept out of the repo)

2. Store your API key (Bugzilla → *Preferences → API Keys*) in the Keychain —
   it never touches disk in the repo:

   ```bash
   security add-generic-password -s bugzilla -a "$USER" -w '<your-key>'
   ```

   Non-macOS: set `BZ_API_KEY` instead. On Windows, as a user variable:

   ```powershell
   [Environment]::SetEnvironmentVariable("BZ_API_KEY", "<your-key>", "User")
   ```

   then restart the terminal / VS Code. The backlog audit needs an account
   allowed to change status, priority and whiteboard.

## Config resolution order

Env vars override the config file: `BZ_HOST`, `BZ_ASSIGNED`,
`BZ_KEYCHAIN_SERVICE`, `BZ_ATTACH_DIR`, `BZ_API_KEY`.

## Usage

```bash
node .claude/scripts/bugzilla/bz.mjs                        # your open bugs
node .claude/scripts/bugzilla/bz.mjs --component API --limit 10
node .claude/scripts/bugzilla/bz.mjs --show 82726 --dump-attachments
```

Or via the slash commands: `/bugs`, `/bug <id>`, `/fix-bug <id>`.

### Backlog audit

```bash
node .claude/scripts/bugzilla/audit.mjs                              # usage + examples
node .claude/scripts/bugzilla/audit.mjs fields                       # instance values + components
node .claude/scripts/bugzilla/audit.mjs export --components Files,Rooms --sample 20 --name pilot
node .claude/scripts/bugzilla/audit.mjs plan --model "Claude Opus 5.5" # dry-run preview of every change
node .claude/scripts/bugzilla/audit.mjs apply --only <id> --confirm  # writes; re-reads each bug first
node .claude/scripts/bugzilla/audit.mjs suggestions                  # suggestions .md
node .claude/scripts/bugzilla/audit.mjs report                       # stdout + report.md
```

Every `export` creates a run folder `runs/<date-time>[-name]/` next to the
script; the other commands work on the latest run unless `--dir` points at
another. `runs/` is git-ignored: it holds Bugzilla data (names, emails), so it
stays local and is never committed. A run keeps `index.json`, `bugs.json`,
`decisions.json`, `actions.json`, `apply-log.json`, `suggestions.md` and
`report.md`.

The review between `export` and `plan` (writing `decisions.json`) is done by
`/bugs-audit` — see its SKILL.md for the decision schema and evidence rules.
`apply` skips bugs that changed after the export (`conflict`) or already carry
the change, so it is safe to rerun. Every reviewed bug gets a comment with the
finding, whatever the verdict (only high-confidence closes and quick fixes also
change fields), and every comment ends with
"— Generated with Claude Code (<model>)" — `plan` requires `--model`. Comments
are posted in Russian or English: `plan --lang ru|en`, or, run in a terminal
without the flag, `plan` asks on the console (the `/bugs-audit` skill asks with a
choice dialog instead). `plan` rejects a comment that is not in the chosen
language. `report.md` and
`suggestions.md` stay in Russian.
`report.md` and `suggestions.md` are split by where the fix belongs (client,
server, editors, ai-chat, ui-kit, other) — the `side` the review set, not the
Bugzilla component.

## Instance note

This Bugzilla ignores the `X-BUGZILLA-API-KEY` header — the key must go in the
`api_key` query param (the script handles this). Summaries are returned
HTML-entity-encoded and are decoded for display.
