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

# Run single unit test file
cd packages/shared && pnpm vitest run path/to/file.test.ts

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

## Architecture

### Monorepo Structure

```
packages/
├── client/      # Main web application (Webpack 5)
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

1. `before-build.js` runs pre-build scripts
2. `build:translations` generates i18n files
3. Webpack builds client package; other packages have their own build configs
4. Nx orchestrates parallel builds with caching

## Code Quality

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

## Requirements

- Node.js >= 24
- pnpm >= 10.28.0
- Docker (for E2E tests)
