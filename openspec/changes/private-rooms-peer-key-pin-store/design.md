# Design

## Context

Read in the client code on 2026-11-19 at `54bed4b404d`. No stashed design
document is available to this change; the main spec
`private-rooms/encryption-core` and the code are the sources. Nothing here
concerns `../server` or the Document Server.

- The pin store is `packages/shared/services/encryption/tofu-store.ts`: one
  IndexedDB database per current user (`docspace-tofu-<userId>`, version 2,
  object store `known_keys` keyed by `userId`), one `TofuStore` instance per
  user from `getTofuStore`, and an in-memory map used when no database is
  available. `checkKey` answers `first-seen`, `match`, `mismatch` or
  `unreadable`; `acceptKey`, `getKeys`, `forgetKey`, `markVerified`,
  `forget`, `list` and `clear` complete the API.
- Peer keys are checked in two places: `verifySenderKeyAgainstTofu` inside
  `unwrapDekForCurrentUser` (`room-file-access.ts`), reached by download,
  copy, preview, filename recovery, the editor, re-wrap and backfill; and
  `verifyMemberKey` / `verifyMemberKeys`
  (`packages/shared/services/private-room/member-key-verification.ts`),
  reached by the upload fan-out (`encrypted-upload-orchestrator.ts`), the
  invitation check `validateMembersForEncryption`, `wrapFilesForMembers`
  (invite and retry re-wrap) and `backfillEncryptedFilesForRoomMembers`
  (`room-encryption.ts`). Both have a refusal branch for `unreadable`,
  which the new outcomes extend.
- Wrapping for several recipients is `wrapDekForRecipients`, one call per
  file with every recipient.
- User-visible outcomes: upload skips are named with
  Common:EncryptedUploadNotSharedWith (client toast and upload panel row,
  SDK toast), a failed fan-out with Common:EncryptedUploadShareFailed;
  invitation skips by reason in `InviteResult` and `room-member-flows.ts`;
  re-wrap gaps through `missingFileIdsByMember` and the pending-access
  store; download, copy and preview errors through `error-i18n.ts`, where
  an `AuthenticationError` gives Common:EncryptionError and also raises the
  ghost-state toast through `reportPotentialGhostState`.
- The own-key pin (`apply-new-identity.ts`, the delete flows of Keys
  management) uses `acceptKey` and `forgetKey` and stays best effort.

## Goals / Non-Goals

**Goals:** the behaviours of the delta, each with unit tests named after
its scenarios, run against an IndexedDB implementation that models
transactions.

**Non-Goals:** a new pin store format or database version; a migration;
an override dialog for an unopenable store (proposal, decision 1); changes
to the key-change dialog itself.

## Decisions

1. **Open outcomes are three, not two.** `openDB` resolves to a database,
   to "unavailable for this page" or to "not open now".
   - Unavailable: no `indexedDB` global, `open()` throwing synchronously, or
     the open failing with `SecurityError` or `InvalidStateError` (storage
     refused to the page, older private modes). Only this outcome selects
     the in-memory store, and it is cached for the session.
   - Not open now: any other open error (`UnknownError`, `VersionError`,
     `QuotaExceededError`, `AbortError`), and a `blocked` open (decision 7).
     The operation gets the "unavailable" check result; `dbPromise` is
     cleared so the next call opens again. A blocked request that later
     succeeds closes its connection; the next call opens its own.
   Alternatives: probing `indexedDB.databases()` to learn whether a store
   exists - rejected, not available in every supported browser and racy;
   treating every open failure as "not open now" - rejected, it would make
   private rooms unusable in a browser that gives the page no storage,
   which the main spec serves from memory.
2. **The first-sight decision is one readwrite transaction.** `checkKey`
   opens one `readwrite` transaction, reads the record and, when there is
   none, puts the new pin in the same transaction; a match updates
   `lastSeenAt` in it too. IndexedDB serialises readwrite transactions on
   one object store across connections, so two operations or two tabs
   cannot both find the record absent. The result is reported from
   `transaction.oncomplete`; `onerror` and `onabort` give "unavailable"
   (for a first sight) or keep the `match` (decision 4). The in-memory store
   reads the record and stores the new pin in one synchronous step, with no
   `await` between them (proposal, decision 4), so its answers obey the same
   rule within the tab.
3. **Writes resolve on commit.** Every write (`putRecord`, `deleteRecord`,
   `clear`, `acceptKey`) resolves on `oncomplete` and reports failure on
   `onerror` / `onabort` / a thrown `transaction()`. `acceptKey` returns
   whether the key is stored; `verifyMemberKey` and the unwrap use the key
   only when it is. The own-key callers do not read the result.
   `acceptKey` reads the peer's record and stores the accepted key in one
   readwrite transaction, as `checkKey` does (decision 2; proposal,
   decision 7), so two keys of one peer accepted at the same time in two
   tabs both stay stored.
   Durability: the default (`relaxed` in Chromium) commit is the acceptance
   point; `strict` durability is not requested, since a lost pin after a
   power cut only means the peer is seen for the first time again, which
   the main spec's limits already cover.
4. **A match stands without its timestamp.** When the transaction that
   updates `lastSeenAt` of a matching key aborts, the result is still
   `match`: the comparison was made against a pin that was read.
5. **The check result names one failure kind.** `unreadable` becomes
   `unavailable` and covers a read error, a write that did not commit and a
   store that is not open. `verifyMemberKey` maps it to a new verification
   kind `key-unchecked` (skipped reason `key-unchecked`), separate from
   `key-mismatch-refused`; it is never added to the batch refusal set. The
   unwrap throws a new `KeyCheckUnavailableError`, a subclass of
   `AuthenticationError` so the existing catch blocks still fail closed;
   `error-i18n.ts` maps it to Common:EncryptedKeyCheckFailed and
   `reportPotentialGhostState` returns early for it.
6. **Comparison before unwrap.** `unwrapDekForCurrentUser` first reads the
   sender's pins once (read-only) and splits the candidates: keys matching
   a pin, then (when the sender has no record) unpinned keys, then changed
   keys. Matching keys are unwrapped without a write beyond the timestamp.
   Unpinned keys are unwrapped one by one; the first that opens the wrap
   goes through `checkKey`, and the DEK is returned only on `first-seen` or
   `match` (on `mismatch` - another tab pinned another key meanwhile - the
   resolver is asked with the DEK still held, and it is wiped on refusal;
   on `unavailable` it is wiped and `KeyCheckUnavailableError` thrown).
   Changed keys are tried last, like unpinned ones: the first that opens
   the wrap is put to the resolver with the DEK held, which is returned
   only once the user accepted the key and `acceptKey` stored it, and wiped
   on a refusal, a missing resolver or a key that was not stored (proposal,
   decision 6). A pin read that fails throws
   `KeyCheckUnavailableError` before any unwrap. The TOFU fallback for a
   sender who left the room yields pinned keys only and joins the first
   group.
   Alternative: compare and pin before unwrapping every candidate -
   rejected, a listed key that does not open the wrap would then be pinned
   and the real key would raise a key-change dialog.
   Alternative: ask about each changed key before unwrapping with it -
   implemented first, then rejected on 2026-11-19. The server keeps every
   pair a user ever created and lists them all:
   `EncryptionKeyPairDtoHelper.CreateKeyPairAsync` appends a pair, and
   `GetKeyPairForRoomAsync` and `GetKeyPairAsync(fileId)` return each
   member's whole list
   (`products/ASC.Files/Core/Core/Entries/EncryptionKeyPairDto.cs`). With
   two unpinned keys of one sender listed, the user was asked about a key
   that opens nothing and, on accepting, trusted it.
7. **Blocked open.** A `blocked` open refuses the waiting operation at
   once as "not open now" (proposal, decision 3). The database version
   stays 2 in this change, so an open is blocked only while a tab of an
   older build holds version 1; a wait limit belongs to the change that
   next raises the version.
   Alternative: wait 5 seconds for the other tab - rejected on 2026-11-19,
   a timer and its test for a path no current build reaches.
8. **Unusable keys are filtered before the pin check.** A key is usable
   when it decodes from base64 to exactly 32 bytes. `verifyMemberKey` gives
   a new kind `key-unusable` for any other key without touching the pin
   store; `wrapDekForRecipients` wraps per recipient and returns the wraps
   it produced with the recipients it could not wrap for, instead of
   failing the whole call; the decode in the unwrap loop moves inside the
   per-candidate `try`. Callers map the outcome: upload adds the member to
   `failedFor` (Common:EncryptedUploadShareFailed, pending access), and does
   the same for `key-unchecked` (proposal, decision 5);
   invitation skips the invitee with Common:EncryptedInviteFailed;
   re-wrap records the member's files in `missingFileIdsByMember`; backfill
   leaves the member for the next sweep.
9. **Texts.** One new key in `Common.json`, `EncryptedKeyCheckFailed`
   ("The sender's encryption key could not be checked on this device.
   Reload the page and try again."). The final English wording is reviewed
   with the `.meta` comment written by `/translate-comments`. The upload
   reuses Common:EncryptedUploadShareFailed (proposal, decision 5), the
   invitation Common:EncryptedInviteFailed and the re-wrap
   Common:EncryptedReencryptPartialFailure, so no new text there.
   Alternative: an upload text of its own, `EncryptedUploadKeyCheckFailed`,
   saying to reload - rejected on 2026-11-19, a second key in every
   language for one extra sentence of advice.
10. **Test IndexedDB.** `fake-indexeddb` (Apache-2.0) as a devDependency of
    `packages/shared` (proposal, decision 2), imported per test file from
    `fake-indexeddb` with a fresh `IDBFactory` per test. Failures are
    injected by spying on `IDBObjectStore.prototype.put` / `get` and
    `IDBDatabase.prototype.transaction`, or by aborting the transaction from
    a spy; the blocked open by holding a version-1 connection open without
    an `onversionchange` close. Two connections to the same database stand
    for two tabs. The hand-written mock of `tofu-store.test.ts` stays for
    the cases that do not need transactions, or is replaced if it becomes
    redundant.

## Risks / Trade-offs

- [A device whose pin store stays unopenable cannot open or share private
  files] → the texts say to reload; no override is offered (proposal,
  decision 1).
- [The classification of open errors misses a browser-specific error
  name] → an unknown name counts as "not open now", the fail-closed side.
- [The first-sight unwrap holds a DEK while the pin is written] → the DEK
  is wiped on every path that does not return it, covered by the cases of
  task 2.2.
- [`acceptKey` returning a result changes a shared signature] → the own-key
  callers are compiled in client, sdk and doceditor by `tsc` in every
  package.

## Migration Plan

None: the database name, version and record shape stay the same. Rollback
is a revert of the commits.
