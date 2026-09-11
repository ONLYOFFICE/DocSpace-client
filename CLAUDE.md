# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ONLYOFFICE DocSpace frontend client - a document collaboration hub built with React. This is a pnpm monorepo managed with Nx containing 6 packages.

## Common Commands

```bash
# Unit tests (shared package, Vitest)
pnpm test

# Unit tests (client package, Vitest)
pnpm test:client               # all @docspace/client unit tests
pnpm test:store                # only client store tests (src/store, incl. FilesStore)

# Run single unit test file
cd packages/shared && pnpm vitest run path/to/file.test.ts
cd packages/client && pnpm exec vitest run src/store/filesStore

# E2E tests (Playwright, requires Docker)
cd packages/client
pnpm test:e2e:docker:build    # First time only
pnpm test:e2e:docker:start    # Run all E2E tests

# Run single E2E test
cd packages/client && pnpm exec playwright test path/to/test.spec.ts

# Update E2E screenshots
pnpm test:e2e:docker:update-screenshots

# Translation tests (run after any locale changes)
cd common/tests && npx vitest run test/locales.test.js
```

## Architecture

### State Management

MobX stores in `packages/shared/store/` are injected via React context. Main stores:
- AuthStore - Authentication state
- UserStore - User information
- SettingsStore - Application settings

### Build Pipeline

1. `build:translations` generates i18n files
2. Vite builds client package; Next.js builds login, doceditor, management, sdk
3. Nx orchestrates parallel builds with caching
4. Static file hashes (browserDetector.js, config.json) are computed on-demand via `packages/shared/utils/static-hash.ts`

### Dev Server

- Client (Vite): `http://localhost:5001` — served behind nginx proxy at port 8092
- Static assets (images, fonts, scripts): served by nginx from `/var/www/public/` at `/static/` prefix
- Other dev ports: login 5011, doceditor 5013, management 5015, sdk 5099;
  Storybook: shared 8082, ui-kit 6006; E2E serve: client 5110, login 5111,
  sdk 5112, doceditor 5113, management 5115; Playwright reports 9325–9329
- Backend is a **sibling repo**: `../server` (run via VSCode tasks →
  `cd ../server/common/ASC.AppHost ; dotnet run --launch-profile frontend-dev`
  with `SKIP_CLIENT=true`; `APP_EDITION` unset = CE, `enterprise`/`developer`
  for EE/DE). `pnpm deploy` writes to `../publish/web`; SSR apps expect
  `../buildtools/config` for appsettings

### ui-kit: separate repo, consumed as a prebuilt tarball

`@onlyoffice/apps-ui-kit` lives in its own repository (`docspace-ui-kit-react`)
and is **not** a git submodule, a pnpm workspace member, or a checkout inside
this repo. Its code is fixed there, never here. This repo consumes only the
committed tarball `onlyoffice-apps-ui-kit.tgz` at the root, which the six apps
depend on via `"file:../../onlyoffice-apps-ui-kit.tgz"`.

The tarball is built **in the ui-kit repository** (`pnpm build && pnpm pack`
there) and copied here by hand. To pick up a new ui-kit version: drop the new
`onlyoffice-apps-ui-kit.tgz` at the repo root, run `pnpm install` to relink the
`file:` dependency, and commit the tarball together with any
`pnpm-lock.yaml` changes it causes. There is no build script on this side.

The tarball must be produced by `pnpm pack`, not `npm pack`: ui-kit's `main`,
`module`, `types` and `exports` fields live under `publishConfig`, which only
pnpm promotes to the top level when packing. An npm-packed tarball has no entry
points at all.

`@onlyoffice/ai-chat` is an **optional peer** of ui-kit that ui-kit statically
imports from its `ai-agent/*` and `api/ai` subpaths without bundling it. Its
own tarball (`onlyoffice-ai-chat-<version>.tgz`) is therefore committed here
too and declared by the apps that render the AI agent — that `file:` dependency
is what satisfies ui-kit's peer, so it cannot be dropped while those subpaths
are used.

## Code Quality

### Language

All files committed to the repository — source code, comments, docs, Markdown,
commit messages, and planning notes — must be written in English. User-facing
strings are the only exception and must go through the i18n system, never
hardcoded.

### Branch review

Use the `review-branch` skill to review a branch against its parent. ui-kit is a
separate repository that this repo consumes only as a prebuilt tarball, so a
ui-kit change must be reviewed inside a `docspace-ui-kit-react` checkout (its
own base branch, via `git config branch.<name>.reviewBase` or auto-detect) —
nothing in this repo's diff reflects it beyond the swapped tarball.

### Dependency audits

The repo has several independent lockfiles, so a clean `pnpm audit` at the root
covers only the pnpm workspace. Use the `audit-deps` skill (or run
`node .claude/scripts/audit/audit-deps.mjs`) to audit every tree at once -
including the npm sub-projects under `common/` - and to get the override line
that fixes each finding. Overrides go in `pnpm-workspace.yaml` for pnpm trees
and in the project's own `package.json` for npm trees; ui-kit is a separate
repository and its findings belong there, not here.

### License headers

Every new source file (`.ts`, `.tsx`, `.js`, `.jsx`; `.scss` by convention)
must start with the standard AGPL header — copy it from any neighboring file,
or run `python3 common/scripts/update-license-headers.py` to fix headers in
bulk. Enforced for `.ts/.tsx/.js/.jsx` by `common/tests/test/license.test.js`
in the pre-push gate (tests, stories, configs and `.d.ts` are exempt); its
allowlist JSONs freeze pre-existing debt and must only ever shrink — see
`.claude/rules/source-checks.md` for details.

### Commit messages

Do not add `Co-Authored-By` trailers or any other AI-attribution lines to
commit messages.

### Git hooks (lefthook)

`lefthook.yml` runs a blocking pre-push gate — five sequential commands, any
failure aborts the push:

1. `pnpm run tsc` — type checking, all packages
2. `pnpm run lint` — Biome, all packages
3. `npm --prefix ./common/tests run test:lefthook` — locale, asset, color,
   license-header and dependency checks (translation-completeness suites are
   skipped here, so a green push does **not** mean locales are complete)
4. `pnpm run test` — shared unit tests
5. `pnpm run test:client` — client unit tests (incl. store tests)

Expect a push to take several minutes. To debug a blocked push, run the
failing command individually. Never bypass the gate with `git push --no-verify`.

CI lives in Gitea Actions (`.gitea/workflows/frontend-common-tests.yaml`) but
is **manual-dispatch only** — there is no automatic PR/push CI, so the
pre-push gate is the only automatic check. CI additionally covers what
lefthook skips: full locale completeness, `pnpm licenses-audit`, and all
Playwright E2E suites.

## Internationalization (i18n)

User-facing strings always go through `t()`. **Never hardcode brand names or
product names** — neither in code nor in translation strings. Pass them as
`{{variables}}` via `getBrandName()` (`@docspace/shared/constants/brands`),
`getConstName()` (`@docspace/shared/constants/consts`) or `getCultureLabel()`
(`@docspace/shared/constants/cultures`).

Full reference (locale file locations, test rules, completeness reports,
supported languages) is in `.claude/rules/i18n.md`, loaded automatically when
editing locale files. For translation work use the `translate-locales`,
`translate-key` and `translate-progress` skills; `translate-stale` finds keys
whose English was reworded while the translations stayed behind — no test
catches that.

## Detailed rules (auto-loaded by path)

| Rule | Loaded when editing |
|------|---------------------|
| `.claude/rules/client-architecture.md` | `packages/client/src/**`, `packages/shared/**` |
| `.claude/rules/source-checks.md` | `packages/**`, `public/images/**` |
| `.claude/rules/generated-artifacts.md` | `public/locales/.constants/**`, `**/biome-plugins/**`, `**/package.json` |
| `.claude/rules/unit-tests.md` | `**/*.test.*`, `**/__tests__/**` (unit), vitest configs |
| `.claude/rules/i18n.md` | `public/locales/**`, `common/tests/**` |
| `.claude/rules/bulk-locale-edits.md` | `public/locales/**`, `packages/*/public/locales/**`, `common/scripts/**` |
| `.claude/rules/e2e-tests.md` | `packages/client/__tests__/**`, `packages/shared/__mocks__/**` |
| `.claude/rules/access-matrix.md` | access rules for user types and room roles, and their specs |
| `.claude/rules/dashboard-matrix.md` | `packages/client/src/pages/Dashboard/**`, `dashboard-appearance.spec.ts`, its screenshots |
| `.claude/rules/pnpm.md` | `package.json`, `pnpm-workspace.yaml`, Dockerfiles, CI workflows |
| `.claude/rules/claude-settings.md` | `.claude/settings*.json` |
| `.claude/rules/vscode-tasks.md` | `.vscode/**`, `frontend.code-workspace` |
