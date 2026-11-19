# Proposal

## Why

The release-readiness review of 2026-11-19 read the main specs of private
rooms against the tests on `release/v4.1.0`. A number of requirements are
implemented, but no test exercises the scenario the spec names, so a
regression there would pass the pre-push gate unnoticed. This change adds
those tests. Each gap was confirmed by searching the test suites for the
scenario and for the code path behind it (design.md lists what was
searched).

## What Changes

Tests only, grouped by package:

- Shared: out-of-range KDF parameters of the identity envelope, an extended
  DSE3 container, the ghost-state notifier, the passkey auto-try and the
  passkey hook, the reasons listed by the key-change dialog, and contract
  cases for a group and a guest sent in the share request of a private room
  (the room-members MSW handler learns to answer them as the server does).
- Client: passkey enrol, enrol failure and removal on Keys management;
  Forget device; the ghost-state toast; the invite panel without external
  links and the invite input of a private room; the Share tab for an
  encrypted file and a folder of a private room; the apps catalog title;
  the live updates of a room the user cannot read; permanent deletion in a
  private room; the PDF tile on mobile; the create hotkey and F2 without
  keys or on an encrypted file; the create entries without keys; a quota
  error of an encrypted item in the middle of a batch; and the E2E cases
  for the invite panel, Forget device, the create-room chooser of Rooms and
  a key-less user in a private room.
- SDK: the shell effects (abort on lock, ghost-state toast, gate reset
  after unlock, disclosure banner, backfill on room entry), the warning of
  the member removal dialog, a role change test that exercises the real
  components instead of a copy of their logic, and the removal of two
  `test.fixme` cases whose subject a unit test already covers.
- Doceditor: the display name recovered from the file header and its
  failure path.

No behaviour of the product changes, so the change carries no spec delta
(`skip_specs`). If a new test fails, the behaviour differs from the main
spec: stop, and fix it through a change of its own, not by bending the
test.

Out of scope:

- "Back from the editor" (sidebar-section): the E2E case of that name opens
  the address the server builds for the editor's back link and asserts the
  section address; design.md cites the server source. Not a gap.
- "Legacy desktop path uses editor-provided keys" (editor-integration): the
  open change `private-rooms-remove-dead-api-calls` rewrites the desktop
  bridge and tests it in its task 2.1; a test of the code that is about to
  go would be thrown away.
- The `test.skip` of `packages/doceditor/__tests__/private-room-editor.spec.ts`
  (around line 162): it skips the mobile projects on purpose, since tablets
  and phones get the deep link page instead of the editor. It cannot be
  enabled.
- The cross-tab lock: `BroadcastLockSync`, the "broadcast-lock" and
  "broadcast-user-scope" fixme cases of the SDK security spec. The open
  change `private-rooms-lock-state-everywhere` changes which locks reach
  other tabs and owns their tests.
- The `/private` routes of the SDK proxy and the "csp-headers" fixme case:
  the open change `private-rooms-sdk-embedding-and-parity` modifies the
  content security policy requirement and adds those unit cases to
  `proxy.test.ts` (its design decision 2). The "change-owner" fixme case of
  `private-rooms.spec.ts` is left to that change too, since it reworks the
  SDK owner change.
- The move of the SDK security spec onto the private and host fixtures,
  its header and the three frame-bridge cases: the open change
  `private-rooms-sdk-private-pages-only` does that (its tasks 4.2 and 4.3).
- The SDK fixme cases that still need infrastructure the suite does not
  have (slowed upload and download streams with store introspection, a
  controlled late key registration): "abort-on-lock-upload",
  "abort-on-lock-download", "401-mid-upload", "revoke-member" and
  "backfill". Their subjects get unit tests here where the code allows it
  (abort on lock, backfill effect, removal flow); the fixme cases stay with
  their blocker notes.

Decisions that need a human: none.

Depends on: nothing in `../server` or the Document Server. The contract
cases for groups and guests mirror the server as it is (design.md).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None.

## Impact

Test files and one MSW handler only:

- `packages/shared/services/encryption/__tests__/` (identity, dse3-tampering,
  ghost-state-notifier), `packages/shared/dialogs/passphrase-modal/__tests__/`,
  `packages/shared/dialogs/key-change-dialog/__tests__/`,
  `packages/shared/__mocks__/handlers/rooms/roomMembers.ts` and its contract
  test
- `packages/client/src/**/__tests__/` (keys-management, EncryptionProviderWrapper,
  InvitePanel, info-panel tabs, apps catalog, filesStore socket, filesActionsStore,
  EmptyContainer, HOCs, contextOptionsStore, uploadDataStore) and the E2E
  specs `private-room-invite`, `private-room-access`, `private-rooms-section`,
  `keys-management-advanced`
- `packages/sdk/src/app/(private)/**` tests,
  `packages/sdk/__tests__/e2e/private/private-security.spec.ts`
- `packages/doceditor/src/hooks/__tests__/useFileEncryptionKeys.test.tsx`
