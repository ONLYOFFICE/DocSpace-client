# Bugzilla tooling

Read-only Bugzilla fetch + attachment download, plus the `/bugs`, `/bug`,
`/fix-bug` slash commands (in `.claude/commands/`). The committed code carries
**no** host, credentials, or personal data — everything personal is configured
locally and git-ignored.

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

   (Non-macOS: export `BZ_API_KEY` in your shell instead.)

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

## Instance note

This Bugzilla ignores the `X-BUGZILLA-API-KEY` header — the key must go in the
`api_key` query param (the script handles this). Summaries are returned
HTML-entity-encoded and are decoded for display.
