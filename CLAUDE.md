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
```

VSCode status-bar task buttons have three-layer wiring — see
`.claude/rules/vscode-tasks.md` (loaded automatically when editing
`.vscode/tasks.json` or `frontend.code-workspace`).

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

## Code Quality

### Language

All files committed to the repository — source code, comments, docs, Markdown,
commit messages, and planning notes — must be written in English. User-facing
strings are the only exception and must go through the i18n system (see below),
never hardcoded.

### Commit messages

Do not add `Co-Authored-By` trailers or any other AI-attribution lines to
commit messages.

## Internationalization (i18n)

### Locale file locations

| Namespace | Locale files |
|-----------|-------------|
| `Common` | `public/locales/{lang}/Common.json` |
| `ChangeLinkTypeDialog`, `CompletedForm`, `DeepLink`, `Editor` | `packages/doceditor/public/locales/{lang}/{Namespace}.json` |
| `Confirm`, `Consent`, `Errors`, `Login`, `TenantList`, `Wizard` | `packages/login/public/locales/{lang}/{Namespace}.json` |
| `Management` | `packages/management/public/locales/{lang}/Management.json` |
| *everything else* | `packages/client/public/locales/{lang}/{Namespace}.json` |

Meta files (translator context + code usage examples) live at the same path under `.meta/{Namespace}/{Key}.json`.

### Brand names, constants and culture labels

`public/locales/.constants/` holds three locale-independent JSON files. They are excluded from translation linting and must **never** be accessed via `t()` — each has its own getter:

| File | Content | Getter | Import |
|------|---------|--------|--------|
| `brands.json` | Product/brand names (`DocSpace`, `ONLYOFFICE`, …) | `getBrandName(key)` | `@docspace/shared/constants/brands` |
| `consts.json` | Technical abbreviations (`LDAP`, `PDF`, `OCR`, `BETA`, …) | `getConstName(key)` | `@docspace/shared/constants/consts` |
| `cultures.json` | Language display names in native script (`Русский`, `Deutsch`, …) | `getCultureLabel(code)` | `@docspace/shared/constants/cultures` |

Per-language overrides use a `-{lang}` suffix inside the JSON (e.g. `"OCR-ru": "Распознавание текста"`).

**Never hardcode brand names** in translation strings. Pass them as `{{variables}}`:

```tsx
import { getBrandName } from "@docspace/shared/constants/brands";
import { getConstName } from "@docspace/shared/constants/consts";

t("Common:SomeKey", { productName: getBrandName("ProductName") })
```

```json
"SomeKey": "Expand your {{productName}} with premium modules"
```

### Translation tests

Run after any locale changes:

```bash
cd common/tests && npx vitest run test/locales.test.js
```

Key rules the tests enforce:
- All locale JSON files must use raw UTF-8 characters, **not** `\uXXXX` escape sequences (e.g. write Cyrillic directly, not `к`). This happens when writing JSON with Python's `json.dumps()` without `ensure_ascii=False`.
- Translation strings must not contain hardcoded brand names (`ONLYOFFICE`, `DOCSPACE`). Use `{{productName}}` variables passed via `getBrandName()`.
- Non-English locales must not be identical copies of English for long strings.
- `sr-Cyrl-RS` must use Cyrillic script exclusively (never Latin).

### Translation completeness

Three tests report keys that exist for `en` but not for another language:

| Test | Scope | npm script |
|------|-------|------------|
| `NotTranslatedOnBaseLanguages` | base languages only | `test:only-base-languages` |
| `NotTranslatedOnAllLanguages` | every language folder | `test:only-all-languages` |
| `MissingLocaleFilesTest` | namespace files absent for a language | — |

The last two are covered by `test:only-missing-keys`. All three are skipped on
pre-push (`test:lefthook` sets `SKIP_BASE_LANGUAGES_TEST` and
`SKIP_ALL_LANGUAGES_TEST`), so pending translation work does not block a push —
**a green pre-push run does not mean the locales are complete.**

The same data as a report, with the concrete key list:

```bash
node common/scripts/translation-stats.js --no-meta --missing
```

`libs/ui-kit/locales/` is out of scope for both the tests and the stats script —
the ui-kit is a git submodule, so its gaps must be fixed in
`docspace-ui-kit-react`.

### Supported languages

`ar-SA, az, bg, cs, de, el-GR, es, fi, fr, hy-AM, it, ja-JP, ko-KR, lo-LA, lv, nl, pl, pt, pt-BR, ro, ru, si, sk, sl, sq-AL, sr-Cyrl-RS, sr-Latn-RS, tr, uk-UA, vi, zh-CN`

Base languages: `de, es, fr, hy-AM, it, ja-JP, pt-BR, ro, ru, sr-Cyrl-RS, sr-Latn-RS, zh-CN`

## Requirements

### pnpm configuration

All pnpm settings live in `pnpm-workspace.yaml` (`overrides`, `allowBuilds`, …) —
since pnpm 11 `.npmrc` is read for auth/registry only, and the `pnpm` field in
`package.json` is ignored.

Dependencies with install/postinstall scripts must be listed explicitly in
`allowBuilds` with a `true`/`false` value. An unreviewed package fails the
install with `ERR_PNPM_IGNORED_BUILDS` (`strictDepBuilds` is on by default), and
pnpm appends it to `pnpm-workspace.yaml` as a placeholder. Resolve placeholders
with `pnpm approve-builds` or by editing the file.

`packageManager` in `package.json` is the single source of truth for the pnpm
version: CI (`pnpm/action-setup`) reads it, and the Dockerfiles pin the same
version in `npm install -g pnpm@…` — bump them together.

## Settings and Permissions

When adding entries to `.claude/settings.json` permissions, never include absolute paths (e.g. `/Users/username/...` or `/home/username/...`). All allowed commands must use paths relative to the project root or generic glob patterns. Entries with hardcoded absolute paths or specific commit hashes must not be added.
