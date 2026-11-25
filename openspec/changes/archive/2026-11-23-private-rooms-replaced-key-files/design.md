# Design

## Context

See proposal.md for the motivation. No stashed design document covers this
case; the decisions below come from the code on the branch and from the
server source.

Server facts (read in `../server`, release/v4.1.0 at d6a0764875):

- `GET api/2.0/files/{fileId}/access` is
  `FilesController.GetEncryptionInfoAsync`
  (`products/ASC.Files/Server/Api/FilesController.cs`). It answers a
  `FileEncryptionInfoDto` with `UserKeys`, the caller's key list from
  `EncryptionKeyPairDtoHelper.GetKeyPairAsync()`, and `FileKeys`, the rows
  `FileDao.GetFileKeys(fileId, callerId)` finds for the caller only.
- A `FileKeysDto`
  (`products/ASC.Files/Core/ApiModels/ResponseDto/FileKeysDto.cs`) carries
  `UserId`, `PublicKeyId`, `PrivateKeyEnc`, `TenantId`, `FileId`, `CreateOn`.
  `PublicKeyId` is the value the writer sent (`FileDao.SetFileKey` stores
  `key.PublicKeyId`); the server does not check it against a key list.
- An `EncryptionKeyDto`
  (`products/ASC.Files/Core/ApiModels/ResponseDto/EncryptionKeyDto.cs`)
  carries `Id`; "the all-zero value belongs to a client that stores its keys
  without sending an identifier".
- Deleting a key, `EncryptionKeyPairHelper.DeleteAsync`
  (`products/ASC.Files/Core/Core/Entries/EncryptionKeyPairDto.cs`), removes
  the pair from the caller's key list and saves the list. It does not touch
  the file key rows, so they keep the id of the deleted pair.

Seen on a local stand: after a key was deleted and a new one set up, every
file of the room answered `userKeys[0].id` of the new key and
`fileKeys[0].publicKeyId` of the deleted one.

Client today: `unwrapDekForCurrentUser` takes `fileKeys` only and finds the
mismatch by failing HPKE with every sender key, which ends in an
`AuthenticationError`. Every caller reads the access answer itself
(`getFileEncryptionAccess`) and drops `userKeys`.

## Goals / Non-Goals

**Goals:**

- One place decides "wrapped for a key the user no longer holds", from data
  every caller already has.
- The decision is made before the identity is asked for.

**Non-Goals:**

- Telling this case apart for files whose entry carries no key id.
- A per-row mark in the file list.

## Decisions

1. **A predicate over the access answer, not a new request.**
   `isWrappedForReplacedKey(info, userId)` in
   `services/encryption/room-file-access.ts`: true when the user's own entry
   has a `publicKeyId` that is non-empty and not all-zero, `info.userKeys` is
   a non-empty array, and no listed key has that id (compared
   case-insensitively). Everything else is false and keeps today's paths.
   Alternative: compare with the key list the page holds (`userStore`,
   editor wrapper). Rejected: the access answer carries the list that is
   current at the moment of the read, and the shared services have no store.

2. **A typed error, `KeyReplacedError`, next to `NoAccessError`.**
   Callers that already branch on `NoAccessError` before the unlock
   (`download.helpers.ts`, `copyMove.helpers.ts`, `MediaViewer.tsx`,
   `encrypted-copy.ts`) add the predicate at the same point and raise it.
   `getEncryptionErrorMessage` maps it to Common:EncryptedFileKeyReplaced, so
   the SDK shell gets the text without work of its own.
   `reportPotentialGhostState` returns early for it.
   Alternative: let `unwrapDekForCurrentUser` take `userKeys` and throw.
   Rejected: it runs after the unlock; the spec asks for the answer before
   the prompt.

3. **Editor: status `key-replaced`.** `useFileEncryptionKeys` checks the
   predicate right after the own-entry check and before `requireIdentity`;
   `Editor.tsx` adds the state to `KEY_FLOW_ENDS` with no action.

4. **Room notice fed by filename recovery.** `recoverOneUncached` already
   reads the access answer of every loaded encrypted file. It records the ids
   that match the predicate in a small observable set beside the filename
   cache (same scope and clearing as the cache: user change and lock). The
   files store exposes the count of loaded files in that set;
   `Section/Body/index.js` renders a notice built like
   `PrivateRoomLockedBlock`, under the same private-room condition, when the
   count is above zero and the locked block is not shown.
   Alternative: a dedicated request per room. Rejected: the server has no
   such route, and recovery already pays for the reads.

5. **Texts.** Common:EncryptedFileKeyReplaced: "This file was encrypted for
   an encryption key you no longer have. Your current key cannot open it."
   Common:PrivateRoomReplacedKeyBarTitle: "Some files cannot be opened".
   Common:PrivateRoomReplacedKeyBarText (plural by count): "{{count}} files
   here were encrypted for an encryption key you no longer have. Your
   current key cannot open them." Final wording is the owner's call
   (proposal.md).

## Risks / Trade-offs

- [A wrap written by a client that sent no key id] → the predicate is false;
  the file fails as today. No regression.
- [A user with two listed keys, wrap made for the older one] → the id is in
  the list, the predicate is false, and the unwrap with the selected key
  fails as today. Out of scope: the client works with one selected key.
- [The count covers loaded items only] → the text says "here", and the count
  grows as pages load; the spec states "among the loaded items".
