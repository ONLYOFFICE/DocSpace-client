# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ONLYOFFICE DocSpace frontend client - a document collaboration hub built with React. This is a pnpm monorepo managed with Nx containing 6 packages.

## Common Commands

```bash
# Install dependencies
pnpm install

# Development (full stack - all 5 apps)
pnpm start

# Development (core apps only - client, login, doceditor)
pnpm start:lite

# Production build
pnpm build

# Linting (Biome)
pnpm lint
pnpm lint:fix

# Type checking
pnpm tsc

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

# Storybook (component documentation)
pnpm storybook

# Check circular dependencies
pnpm check-circular
```

## VSCode Tasks

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

## Architecture

### Monorepo Structure

```
packages/
├── client/      # Main web application (Vite 6)
├── login/       # Authentication application
├── doceditor/   # Document editor application
├── management/  # Admin management panel
├── sdk/         # JavaScript SDK for external integrations
└── shared/      # Shared components, hooks, stores, utilities
```

### Tech Stack

- **React 19** with React Compiler (babel-plugin-react-compiler)
- **TypeScript 5.9** (strict mode)
- **MobX 6** for state management
- **Styled-Components 5** + SCSS for styling
- **i18next** for internationalization
- **Biome** for linting/formatting (replaces ESLint/Prettier)

### Shared Package (`@docspace/shared`)

The shared package is the core dependency for all applications:

- `components/` - 130+ reusable React components
- `hooks/` - Custom React hooks
- `store/` - MobX stores (AuthStore, UserStore, SettingsStore, etc.)
- `api/` - API client and service definitions
- `utils/` - Utility functions
- `types/` - TypeScript type definitions
- `dialogs/` - Modal/dialog components

### State Management

MobX stores in `packages/shared/store/` are injected via React context. Main stores:
- AuthStore - Authentication state
- UserStore - User information
- SettingsStore - Application settings

### Testing

- **Unit Tests**: Vitest in `packages/shared/`, run with `pnpm test`
- **E2E Tests**: Playwright in `packages/client/__tests__/`, run via Docker
- **Visual Regression**: Screenshot comparison with 0.16 threshold

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

### Pre-push Hooks (Lefthook)

Automatically runs before push:
1. TypeScript type checking
2. Biome linting
3. Translation validation tests
4. Unit tests

### Biome Configuration

- 80 character line width
- Double quotes
- Trailing commas
- CRLF line endings
- Strict React and TypeScript rules

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

### Supported languages

`ar-SA, az, bg, cs, de, el-GR, es, fi, fr, hy-AM, it, ja-JP, ko-KR, lo-LA, lv, nl, pl, pt, pt-BR, ro, ru, si, sk, sl, sq-AL, sr-Cyrl-RS, sr-Latn-RS, tr, uk-UA, vi, zh-CN`

Base languages (enforced by tests): `de, es, fr, hy-AM, it, ja-JP, pt-BR, ro, ru, sr-Cyrl-RS, sr-Latn-RS, zh-CN`

## Requirements

- Node.js >= 24
- pnpm >= 10.28.0
- Docker (for E2E tests)

## Settings and Permissions

When adding entries to `.claude/settings.json` permissions, never include absolute paths (e.g. `/Users/username/...` or `/home/username/...`). All allowed commands must use paths relative to the project root or generic glob patterns. Entries with hardcoded absolute paths or specific commit hashes must not be added.
