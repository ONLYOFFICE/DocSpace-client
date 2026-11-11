# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). No behaviour changes; server behaviour was read in `../server` through CodeGraph on 2026-11-11 at `a7d94e4b81` (design.md, Context).

## 1. Copies and pointers

- [x] 1.1 Give the copies in `private-rooms-server-hardening` the text of this change's deltas (design decision 2): "File keys follow the share", "Owner change requires the new owner's keys" and "Invitation e-mails carry the room title" in its `server-contract` delta; the leave requirement under its new name in its `room-membership` delta; "Member removal warning" with its reworded scenario "Remove a group" and the leave requirement under its new name in its `sdk-surface` delta. Verify: each block there is identical to the block in this change (a `diff` of the two), and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. Done 2026-11-11: six blocks copied by script and compared, identical; validation 21 of 21. Until this change is archived the validation notes that the copies name requirements the main spec does not have yet
- [x] 1.2 Client and SDK: point the two code comments at the renamed requirements, in `packages/client/src/components/dialogs/LeaveRoomDialog/index.js` and `packages/sdk/src/app/(private)/_hooks/usePrivateOwnerChangeFlow.ts` (design decision 3). Verify: no file under `packages/` names "revokes own access first"; `pnpm exec tsc` in client and sdk. Done 2026-11-11: no file under `packages/` names the old requirements; `tsc` clean in client and sdk

## 2. Gate

- [ ] 2.1 Run `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`, and archive `private-rooms-server-hardening` on a scratch copy of `openspec/` after this change, to see that its copies still apply over the renamed requirements. Verify: both green, recorded here with the date

## Workflow follow-up

- Archive after 2.1; the archive rewrites the eight requirements in the main specs.
- The two statements about guests left out of this change (proposal.md, Out of scope) wait for the answer of `private-rooms-server-followups` 1.5.
