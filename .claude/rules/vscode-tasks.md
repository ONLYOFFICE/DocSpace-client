---
paths:
  - ".vscode/**"
  - "frontend.code-workspace"
---

# VSCode Tasks

The `frontend.code-workspace` file drives the grouped status-bar buttons
(Server / Client / Tests / E2E / Tools) via the **VsCodeTaskButtons**
extension. The wiring is three layers — change all three when adding a button:

1. **`package.json` (root)** — the actual pnpm script (e.g. `test:client`,
   `test:store`). This is the source of truth; it also works from the CLI.
2. **`.vscode/tasks.json`** — a VSCode task whose `command` runs the script,
   e.g. `cd ${workspaceFolder} ; pnpm run test:store`. Its `label` (e.g.
   `Test | Vitest:store`) is what buttons reference.
3. **`frontend.code-workspace`** → `settings > VsCodeTaskButtons.tasks` — a
   button whose `task` field must exactly match a `tasks.json` label. Buttons
   are grouped (the `Tests` group holds the unit/lint/tsc buttons).

`frontend.code-workspace` is JSONC (trailing commas / comments allowed), so it
is not parseable as strict JSON.
