# Design

## Context

See proposal.md. Each fix brings the code to a requirement the main spec
already states; none comes from a stashed design document. Found on
2026-11-02:

- Pins: `TofuStore.acceptKey` appends a new key to the peer's record and
  `checkKey` matches any key of the record
  (`packages/shared/services/encryption/tofu-store.ts:322-385`), a
  behaviour the unit test "acceptKey appends; previously trusted keys stay
  trusted" fixes (`__tests__/tofu-store.test.ts:254`). It is deliberate:
  the server may list several key pairs for one user, files are wrapped by
  any of them, and `room-file-access.test.ts` ("sender listed with several
  keys", `:325-408`) requires that an already accepted key never prompts.
  A pin that held only the newest key made the dialog flip between a
  sender's old and new files (tried on 2026-11-02, three tests failed). `getRecord` answers
  `null` both when there is no record and when the read fails (`:241-251`,
  test `:654`), so a failed read is taken as a first sight and the record is
  overwritten. Callers of `checkKey` and `acceptKey`: `room-file-access.ts`
  (unwrap), `member-key-verification.ts` (wraps), `apply-new-identity.ts`.
- Duplicate: `duplicateEncryptedFileImpl` passes the open folder's
  `rootFolderType` (`packages/client/src/store/filesActionsStore/copyMove.helpers.ts:176-185`);
  opened from Recent, `resolveFolderTarget` sees a section outside the rooms
  and answers a plain target for the file's own folder
  (`packages/shared/services/private-room/upload-target.ts:140-145`).
- SDK drops: the private room page passes no upload override in an archived
  room (`(private)/private/[roomId]/page.client.tsx:310-313`); the outer
  drop zone is disabled there, but a row's drop goes through the drag
  context to `uploadFilesToFolder`, which falls back to the generic
  uploader (`(personal-files)/_hooks/useDocsActions.ts:477-482`) and its
  `checkIsFileExist` and `startUploadSession` calls (`:357`, `:451`).
- Owner change: `ChangeRoomOwnerPanel` returns the candidate to the edit
  dialog before `getNewOwnerKeyRefusal` runs (`index.js:90-94`), and
  `CreateEditRoomStore` saves it with `changeRoomOwner` (`:377`).
- Fan-out: `wrapDekForSelfAndRoom` writes the uploader's own entry first,
  then catches every error of the room fan-out and answers no skipped
  members (`encrypted-upload-orchestrator.ts:575-578`), so the upload is
  reported as a plain success.
- Room file listing: `getEncryptedFilesInRoom` stops when a page holds fewer
  than 100 files (`room-encryption.ts:97-121`). The server pages folders
  first and fills the page with files (`EntryManager.GetEntriesAsync`,
  `products/ASC.Files/Core/Utils/EntryManager.cs:622-657`) and returns the
  folder and file total (`:705`), so a folder with subfolders and more
  files than one page loses the rest. Backfill, invitation and revocation
  all list through it.
- Passphrase change: `KeyRotationDialog` checks length and difference only
  (`keys-management/modals/KeyRotationDialog.tsx:99-148`);
  `passphrase-strength.ts` and its meter in `PassphraseModal` are not used.
- Names: `SecretStorage.getCached` drops an expired identity without
  clearing the name cache (`secret-storage.ts:126-135`); the explicit,
  idle and hidden-tab locks of `EncryptionContext` clear it themselves.
- Download: a single download without file keys or an own entry returns
  without a message (`filesActionsStore/download.helpers.ts:356-364`).

Checked on the stand on 2026-11-02 (task 2.1; local stack on the server
checkout `e9cfda8d43`, Document Server 10.0.2.5, signed in as the owner of
private room 10): encrypted files never reach Recent. The server adds the
Recent tag only through `EntryManager.MarkAsRecent`, which returns at once
for an encrypted file (`products/ASC.Files/Core/Utils/EntryManager.cs:2117-2120`);
on the stand Recent stayed empty although this account had opened files 7,
40 and 42 in the editor, and `POST files/file/7/recent` answered 200 and
left it empty. A Duplicate of an encrypted file from Recent is therefore not
reachable today; the fix of task 2.2 stays, so the Duplicate takes its
target from the file whatever list offers it.

Checked on 2026-11-02 for the suspicions (tasks 8.1, 8.2):

- Copy to from Recent: the selector decides the source by the open
  folder (`treeFoldersStore.isPrivacyFolder`,
  `packages/client/src/components/FilesSelector/index.tsx:909`), so an
  encrypted file opened from Recent is planned as a plain server copy, and
  the menu offers Copy to for an encrypted file without the copy right
  (`filesStore/contextOptions.helpers.ts:534`). No ciphertext leaves the
  room: the server refuses to copy a private-room file out of it
  (`CompliesPrivateRoomRulesAsync`,
  `products/ASC.Files/Core/Services/WCFService/FileOperations/CopyPermissionsCheck.cs:823-845`),
  so the user gets a server error instead of a decrypted copy. The path is
  not reachable today, because encrypted files never reach Recent (task
  2.1, above); no fix is made for it.
- Idle auto-lock after a recovery: the recovery caches the identity in the
  secret storage but re-wraps the same key pair, so only `privateKeyEnc`
  changes, and the context re-read the unlocked state on a new public key
  or user only (`EncryptionContext.tsx:185-198`); the idle timer, which
  runs while the context counts as unlocked, never started. Fixed by
  re-reading it on a new `privateKeyEnc` too.

## Goals / Non-Goals

**Goals:**
- Each modified requirement holds in the code, with a test named after its
  new scenario.
- Fixes stay local to the code path that drifted.

**Non-Goals:**
- Changing what a pin record stores or migrating stored records.
- A server-side check of any of these paths.

## Decisions

1. **Accepted keys stay trusted (decided 2026-11-02 by the feature
   owner).** The code keeps matching every pinned or accepted key; the spec
   is corrected instead, and the re-listed earlier key becomes an accepted
   v1 limitation ("Accepted peer keys stay trusted"). Alternatives: a pin
   of the newest key only, rejected because users with several key pairs
   on the server would meet the dialog on every switch between their files;
   trusting an earlier key only while the server lists it next to the
   newest one, rejected as more machinery than the risk it narrows.

2. **An unreadable pin is a refused key change.** The store tells a missing
   record from a failed read; `checkKey` answers a distinct result for the
   failed read, which each caller handles as it handles a refused mismatch
   (unwrap fails before decryption, the member is skipped for the wrap), and
   `acceptKey` writes nothing when its read fails. The in-memory fallback
   for an IndexedDB that cannot be opened stays as it is. Alternative: show
   the key-change dialog; rejected because the dialog would claim a change
   that did not happen.

3. **Duplicate resolves its target from the file.** The encrypted Duplicate
   passes the file's own section, so the target is found on the file's
   folder path; the open folder decides only when the copy lands in it, as
   `resolveCopyDestination` already does. Alternative: withhold Duplicate
   outside the room's lists; rejected because the fix makes it correct
   wherever the server offers it.

4. **A private page never falls back to the generic uploader.** In the
   docs layout of a private page, a drop uploads only through the page's
   encrypted override and only into a folder the user can create in (the
   open folder, or the folder row it is dropped on); otherwise the drop is
   ignored before any request or unlock prompt. Alternative: pass a refusing
   override from the archive page; rejected because the create right of an
   active room's folder needs the same guard.

5. **The owner check runs where the candidate is picked.** The owner panel
   runs `getNewOwnerKeyRefusal` for a private room before it hands the
   candidate to the edit dialog, so the dialog only ever holds a checked
   candidate. Alternative: check again at save in the store; rejected
   because the user should learn it while picking, as in the panel.

6. **A failed fan-out is a result, not a swallowed error.** The fan-out
   reports failure together with the recipients whose keys it read; the
   orchestrator marks them as pending access for the file and flags the
   result, and the client upload store and the SDK upload report show
   Common:EncryptedUploadShareFailed with the file names. When even the
   room keys could not be read, no member can be named, and the backfill
   sweep is the fallback. An abort still throws.

7. **The room listing follows the server total.** The listing pages on
   until it has read as many entries as the folder's `total`, whatever the
   split between folders and files on each page.

8. **One strength gate for both dialogs.** The passphrase change dialog
   uses `checkPassphraseStrength` and `isPassphraseAcceptable` and shows the
   same meter as the creation prompt; the meter moves to a component both
   dialogs render.

9. **The secret storage clears names whenever it drops the identity.** The
   lock and the expiry path of the secret storage clear the name cache
   themselves, so every lock does, whoever triggers it; caching a fresh
   unlock does not clear it.

10. **No own entry is a failed download.** The single download shows
    Common:EncryptionDownloadFailed when the file has no keys or none for
    the user, as the requirement's localized error demands; no new key is
    needed.

## Risks / Trade-offs

- [An earlier key whose private half leaked is used without a dialog when
  the server lists it again] → accepted v1 limitation; it needs the server
  to list that key for the user, and the release notes name it.
- [A failing IndexedDB read blocks wraps and unwraps instead of passing
  silently] → visible and local; the store keeps working once reads
  succeed, and the open failure still falls back to memory.
- [After a failed fan-out only members whose keys were read are marked] →
  the backfill sweep re-wraps every member on a room manager's next visit.
- [The stricter gate refuses a passphrase change the user could make
  before] → it applies to the new passphrase only; the current one is
  unchanged.

## Migration Plan

No data migration: stored pin records keep their key lists and meaning. Behind the `privateRooms` flag.
Rollback by revert.

## Open Questions

None for the fixes. The three suspicions of the proposal are verified by
their own tasks before any code changes.
