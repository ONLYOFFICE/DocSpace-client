# Tasks

## 1. Icon colour

- [x] 1.1 Make the paths of the save-action icons use the current text colour in `packages/shared/dialogs/key-generation/RecoveryPhraseDisplayModal.module.scss`; verify with a new case "Dark theme" in `packages/client/__tests__/keys-management.spec.ts` that gives a save action a text colour and expects the fill of its icon to equal it (`docker compose run --rm -T -e WORKERS=3 tests-dev pnpm exec playwright test __tests__/keys-management.spec.ts -g "Dark theme"`)
