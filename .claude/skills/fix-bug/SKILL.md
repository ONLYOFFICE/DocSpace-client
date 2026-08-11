---
name: fix-bug
description: Fix one Bugzilla bug end-to-end (route → locate → fix → test → gate → confirm → commit)
argument-hint: "<bugId>"
---

# Fix a Bugzilla bug (gated)

Take a single bug from report to a committed fix on its own branch. This is a
**gated** procedure: a human confirms before any commit, nothing is pushed, and
Bugzilla is never written to via the API — the commit message alone is what the
server-side git action uses to close the ticket.

Script (run from the repo root): `.claude/scripts/bugzilla/bz.mjs`
Config/setup: `.claude/scripts/bugzilla/README.md`.

## Commit convention (single source of truth)

```
Fix Bug <ID> - <EN TITLE>
```

- Proven format in history (client 177×, server 832×) — this is what the git
  action recognizes. If it turns out the action needs `Fixed Bug`, change only
  this line.
- `<EN TITLE>`: a concise English title derived from the Russian summary, in the
  repo's style (keep the leading area tag, e.g. `Files.`, `API.`, `Accounts.`).
- One bug per commit, one branch `bugfix/bug-<ID>`.

## Step 1 — read the bug

```bash
node .claude/scripts/bugzilla/bz.mjs --show $ARGUMENTS --dump-attachments
```

Read screenshots/HAR (see `/bug`). Extract: product/component, summary, repro
steps, expected vs actual, environment, and any **linked test URL** in the
description (often a `...spec.ts` link — read it for the exact scenario even
though we do not run that external suite).

## Step 2 — route to the right repo/area

The bug's product/component decides where the fix lands and how it is verified:

| Product / component | Repo & area | Local gate |
|---|---|---|
| `DocSpace/API`, `DocSpace/AI` (routes `/api/2.0/ai/*`) | **server**: `common/ASC.NewAi` (Node — `app/controllers/*`, `app/routes.ts`) for most `/ai/*`; some in `products/ASC.AI/Server/**` (C#, e.g. `TextToDocxController.cs`). Grep the exact route to pick the layer. | ASC.NewAi: `yarn typecheck` (+ unit tests if present). C#: build the project. |
| `UI.Desktop/AI.Agent`, `SDK.Desktop/AI.Agent`, `AI.Agent/UI` | the **`@onlyoffice/ai-chat` source checkout** → then the tgz handoff into ui-kit + client + ASC.NewAi. HEAVY, multi-repo. | ai-chat build; then consumer builds. |
| `DocSpace/Files`, `Rooms`, `Accounts`, `Settings`, `Plugins` | **client**: `packages/client/**` (React); some `Settings` UI in `libs/ui-kit`. | `pnpm tsc && pnpm lint && pnpm test:client` (or the targeted test). |
| `DocSpace/DocEditor` (Forms) | client `packages/doceditor/**` (or server forms). | `pnpm tsc && pnpm lint`. |
| `DocSpace/Server` (`Srv:*`) | **server** C# (`products/`, `web/`). | build the affected project. |

If the component maps to **AI.Agent (ai-chat source)**: STOP after diagnosis and
confirm with the user before proceeding — it triggers the full pack→install
handoff across three repos, not a single edit.

## Step 3 — locate the code

Grep the repo for the endpoint/route/string/component named in the report. Read
the surrounding code and confirm you understand the actual vs expected behavior
described in Step 1. If you cannot confidently locate the cause, say so and stop
with your findings — do not guess-edit.

## Step 4 — write a test first, if the infra supports it

If the target repo has a unit-test harness and the bug is unit-testable, add a
test that **reproduces the bug (red)** before fixing:
- client / shared: Vitest (`pnpm test:client`, `packages/shared` vitest).
- ASC.NewAi: only if a test setup exists — check `package.json` scripts.

If there is no local harness or the bug needs a running backend/browser to
reproduce (we do NOT wire up the external api-tests suite or a live stack), skip
the test, state that verification is limited to typecheck/lint/build, and flag
the fix as **lower confidence**.

## Step 5 — apply the minimal fix

Edit only what's needed, matching surrounding code style and repo conventions.
No drive-by refactors.

## Step 6 — gate (mandatory, before proposing a commit)

Run the repo-appropriate checks from the table in Step 2. All must pass:
- the new test (if written) must now be **green**;
- typecheck + lint must be clean;
- build / relevant unit tests pass.

If any gate fails, fix or stop — never propose a commit over a failing gate.

## Step 7 — confirm with the human

Present, and then WAIT for explicit approval:
- the diff (files + hunks),
- the new test (if any) and gate output,
- the branch `bugfix/bug-<ID>` and the exact commit message
  `Fix Bug <ID> - <EN TITLE>`.

Do not commit until the user approves.

## Step 8 — commit (after approval)

```bash
git -C <repo> checkout -b bugfix/bug-<ID>      # off the repo's dev branch (usually develop)
git -C <repo> add <only the changed files>
git -C <repo> commit -m "Fix Bug <ID> - <EN TITLE>"
```

Stage only the files for this fix. Do **not** push. Do **not** call the Bugzilla
API. Report the commit hash and branch. If the fix spanned the ai-chat handoff,
list every repo touched and its commit.
