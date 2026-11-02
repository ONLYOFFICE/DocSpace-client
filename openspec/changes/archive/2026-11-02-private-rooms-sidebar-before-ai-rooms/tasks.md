# Tasks

## 1. Sidebar order after the release merge

- [x] 1.1 In `packages/client/__tests__/private-rooms-section.spec.ts`, make "Section available" expect the top-level items `forms`, `private-rooms` and `ai-rooms` in that order, and drop the AI Agents folder id the case used; the stock `rootHandler` already serves the AI rooms root (folder type 41). Verify: `cd packages/client && docker-compose run --rm -T -e WORKERS=1 tests-dev pnpm exec playwright test __tests__/private-rooms-section.spec.ts --reporter=line` green.

## 2. Integration

- [x] 2.1 Run `npx -y @fission-ai/openspec@latest validate --all --strict`; verify green.

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-sidebar-before-ai-rooms`, which merges the reworded "Sidebar item" into `private-rooms/sidebar-section`.
