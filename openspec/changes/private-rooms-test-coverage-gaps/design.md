# Design

## Context

Read on 2026-11-19 at `54bed4b404d` on `release/v4.1.0`, and in `../server`
through CodeGraph and the source files named below. No stashed design
document is involved; the code and the main specs are the reference.

How each gap was confirmed: the scenario name and the code path behind it
were searched in every unit and E2E suite of the package that owns it.
The searches that came back empty, or that found a test of something else:

- encryption-core: `identity.test.ts` rejects a bad KDF id and zero
  Argon2 parameters, nothing above the bounds of `identity.ts` (memory over
  1 GiB, iterations or lanes over 64). `dse3-tampering.test.ts` covers
  swapped, replayed and dropped chunks; nothing appends bytes after the last
  chunk, though `decryptChunked` and `decryptChunkedFromBlob` both check for
  them.
- key-management: `usePasskeyUnlock` has no test; the two
  EncryptionProviderWrapper suites mock it to `{}`. The Keys management
  suite has a "Passkey toggle" case that only reads the toggle's initial
  state; the toasts `Common:PasskeyEnabled`, `Common:PasskeyEnrollFailed`
  and `Common:PasskeyDisabled` appear in no test. The auto-try in
  `PassphraseModal` (once per open) is not asserted; the two cases that pass
  `onPasskeyUnlock` check the reading and Tab order only.
  `reportPotentialGhostState` and `Common:GhostStateDetected` appear in no
  test. No test clicks Forget device: `Common:DeviceUnlockForgotten` is in
  no test, and the E2E case of the remembered device checks only that the
  link is shown. `Common:KeyChangedReasonReplaced` is in no test.
- room-membership: `InvitePanel.privateInvite.test.tsx` mocks
  `ExternalLinks` to `null`, so it cannot see whether the panel renders it,
  and the private-room E2E specs never look for the link controls.
  `InviteInput.js` has no client test (only the SDK copy is asserted).
  The room-members MSW handler answers 403 only for the ids listed in its
  `withoutKeys` option; no contract case sends a group or a guest. The
  info panel tabs suite has "Private room selected in a list" only.
- sidebar-section: `useAppsCatalog` is in no test. The chooser of Rooms is
  asserted through `getCreateRoomTypes` (a list helper), never in the
  dialog. The two live-update cases exist under other names
  ("Administrator outside a new private room", "Private room updated") and
  assert neither the absent message nor the untouched rights.
- file-operations: no test asserts the `immediately` argument of a bulk
  delete in a private room; no test of `EmptyPrivateRoomView` sets a mobile
  device; `withHotkeys` is tested for upload, Alt+Shift+O and Delete, not
  for Shift+D without keys or F2; the "+ New" model is tested with keys
  only and the main button has no test; the quota cascade test uploads a
  plain file.
- sdk-surface: no test imports `AbortOnLockEffect`, `GhostStateToastEffect`,
  `PostUnlockGateResetEffect`, `DisclosureBanner` or
  `BackfillEncryptedRoomEffect`; `RemoveUserConfirmationDialog` has no test;
  `proxy.test.ts` has no `/private` case (taken by another change, see
  Coordination). `usePrivateRoleChangeFlow.test.ts`
  imports nothing but Vitest: it copies the gating and the role-change
  logic into the test file and tests the copy, so a change to the
  components cannot fail it.
- editor-integration: the config of `useFileEncryptionKeys.test.tsx` has no
  `viewUrl`, so `recoverFilenameWithDek` returns before the range request in
  every case.

## Findings that do not hold

- "Back from the editor": the Document Server's back link is the `goback`
  URL of the editor configuration. `Configuration<T>.GetGoBack`
  (`products/ASC.Files/Core/Services/DocumentService/Configuration.cs`)
  builds it with `PathProvider.GetFolderUrl` from the file's parent folder,
  and `GetFolderUrl` (`products/ASC.Files/Core/Helpers/PathProvider.cs`)
  returns `rooms/shared/{id}/filter?folder={id}` for a folder whose root is
  the Rooms root, which is where a private room lives (server-contract,
  root folder type of a private room). The E2E case "Back from the editor"
  of `private-rooms-section.spec.ts` opens exactly that address and asserts
  the `/private` address it lands on. Covered.
- The doceditor `test.skip` is a project condition (`isMobile`), not a
  disabled case.

## Server behaviour behind the group and guest contract cases

From `FileSharingAceHelper.SetAceObjectAsync` in
`products/ASC.Files/Core/Utils/FileSharing.cs` (last changed 2026-11-13,
`e9d58b4577`): for every non-link subject of a room share, unless the
subject already holds a group share there, a room with `SettingsPrivate`
calls `EncryptionLoginProvider.ThrowIfKeysAreNotSetAsync` with the id of
`userManager.GetUsersAsync(w.Id, false)`. For a group id that call returns
`Constants.LostUser` (`common/ASC.Core.Common/Users/Constants.cs`), which
has no stored key; a guest has none either, because the key write refuses
a guest (`DemandKeyOwnerAsync`, already a contract case). The check throws
`InvalidOperationException("The user does not have an encryption key")`
(`common/ASC.FederatedLogin/LoginProviders/EncryptionLoginProvider.cs`),
which `ResponseWrapper` (`common/ASC.Api.Core/Middleware/ResponseWrapper.cs`)
answers with 403. The handler's existing `noKeyResponse` already has that
shape; the handler only has to apply it to a group subject and to a guest
without a key, in the order the server walks the invitations (ordered by
`SubjectGroup`, descending).

## Decisions

1. **Test names are scenario names.** Where the requirement has no
   scenario for the case (the shell effects other than the four named
   ones, the Share tab of a folder), the case is named after the
   requirement and the effect, e.g. "Shell side effects: banner dismissed".
   No spec scenario is added: the change carries no delta.
2. **Unit level first.** The E2E cases added are the ones only a browser
   can show (link controls absent in the real panel, the prompt after
   Forget device, the chooser of Rooms, the create entries of a key-less
   user). Everything else is a unit case.
3. **`[ENCRYPTION]` console errors.** A unit test fails on a
   `console.error` containing `[ENCRYPTION]`. The thrown branch of the
   doceditor name recovery logs one; its case spies on `console.error` and
   asserts the call instead of letting it fail the suite. The not-ok
   response branch logs nothing.
4. **Ghost-state gate without a handler.** `reportPotentialGhostState`
   returns before touching the session gate when no handler is registered.
   The notifier test asserts that order, so a report before the toast is
   wired does not use up the one toast of the session.
5. **The role-change copy is replaced, not kept.** The cases of
   `usePrivateRoleChangeFlow.test.ts` move to tests that render
   `PrivateMembersView` and `PrivateMemberUser`; the file is deleted. If
   rendering proves too heavy, moving the `canChangeRole` derivation into
   `PrivateMembersView.utils.ts` (already tested) is an allowed refactor
   with no behaviour change.
6. **SDK fixme cases.** Blockers A (unlock) and B (session cookie) of the
   security spec are solved by the helpers of `private-rooms.spec.ts`, as
   its header says; `private-rooms-sdk-private-pages-only` moves the
   security spec onto them. Blocker C (CSP not served by the test server)
   goes away with the proxy unit cases of
   `private-rooms-sdk-embedding-and-parity`. Of the rest, two need no
   browser at all: "auto-lock-tamper" is covered by the shared unit case
   "Tampered auto-lock value" and "tofu-migration" by "migrates a v1
   single-key record to the multi-key shape" of `tofu-store.test.ts`.
   These two are deleted here, after the move. The "change-owner" case of
   `private-rooms.spec.ts` names texts that no longer exist
   (`Common:PrivateRoomChangeOwnerNoKey`, `...KeyMismatch`), and the unit
   case "Owner change from the header of an open room" of
   `PrivateChangeOwnerDialog.test.tsx` covers the key check; it is left to
   `private-rooms-sdk-embedding-and-parity`, which reworks that flow.

## Coordination

- `private-rooms-lock-state-everywhere` modifies "Remember this device" and
  "Shell side effects". The Forget device scenario keeps its wording there,
  so task 2.2 and 2.15 stand; the cross-tab lock is left to that change.
- `private-rooms-remove-dead-api-calls` owns the desktop bridge test.
- `private-rooms-sdk-embedding-and-parity` owns the proxy cases, the
  "csp-headers" and "change-owner" fixme cases.
- `private-rooms-sdk-private-pages-only` owns the move, the header and the
  frame-bridge cases of the SDK security spec; task 3.4 waits for its 4.2.
- `private-rooms-invite-and-upload-robustness` changes what the invite
  panel sends (its task 5.2, in `InvitePanel/index.js` and
  `InvitePanel.privateInvite.test.tsx`); task 2.5 here tests the invite
  input, a different file, and task 2.4 a separate suite.
