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
