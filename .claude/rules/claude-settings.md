---
paths:
  - ".claude/settings.json"
  - ".claude/settings.local.json"
---

# Settings and Permissions

When adding entries to `.claude/settings.json` permissions, never include
absolute paths (e.g. `/Users/username/...` or `/home/username/...`). All
allowed commands must use paths relative to the project root or generic glob
patterns. Entries with hardcoded absolute paths or specific commit hashes must
not be added.

## additionalDirectories

Sibling repos (`../buildtools`, `../server`) are granted with
`permissions.additionalDirectories`, using a **relative** path for the same
reason as above. An entry pointing at a directory that is not checked out is
harmless — Claude Code starts normally and simply ignores it — so a standalone
client clone needs no change here. Instructions that *use* those paths must
still guard on existence themselves; the setting grants access, it does not
promise the directory is there.
