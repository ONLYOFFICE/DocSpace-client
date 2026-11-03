# Tasks

One task is one commit with its tick, committed directly on `release/v4.1.0` (the "Commits" paragraph of `openspec/config.yaml`). No server or Document Server work.

## 1. One file per create request

- [ ] 1.1 In `packages/client/src/components/GlobalEvents/CreateEvent.js`, make the dialog-or-create effect depend only on the request fields and call the latest `onSave` through a ref (design decision 1), and drop `keepNewFileName`, `withoutDialog`, `title` and the second `actionEdit` from the `onSave` dependencies (decision 2). Verify:
  - a new `packages/client/src/components/GlobalEvents/__tests__/CreateEvent.test.tsx` (decision 3), written before the fix, whose cases for the ticked box fail on the current code: "Don't ask again ticked in the name dialog", "Name typed and Don't ask again ticked", "Dialog during the creation", "File names not asked", "Another file type requested during a creation" and "Form room: Don't ask again ticked";
  - `cd packages/client && pnpm exec vitest run src/components/GlobalEvents` and `pnpm exec tsc --noEmit -p tsconfig.json`.

## 2. Integration

- [ ] 2.1 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`, `pnpm run test:doceditor`) and `npx -y @fission-ai/openspec@latest validate --all --strict`. Verify: all green.
- [ ] 2.2 On the dev stand with a Document Server, repeat the tester's recording: Common:DontAskAgain off in the profile, a private room, "New presentation", tick the box in the name dialog, Create. Record date, builds and result in design.md: one file, one editor tab, and whether the editor opens. Verify: that record; an editor that still hangs is proposed as its own change.

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-create-dialog-single-file`, which adds "One create action makes one file" to `private-rooms/file-operations`.
- Then tick `private-rooms-beta-release` 0.5 in its own commit.
