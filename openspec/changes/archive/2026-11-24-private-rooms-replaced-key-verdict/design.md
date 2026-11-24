# Design

## Context

See proposal.md for the motivation. On the branch today:

- `isWrappedForReplacedKey(info, userId)` in `room-file-access.ts` compares
  the `publicKeyId` of the user's access entry with the ids in `userKeys`.
  Download, copy, move, the media viewer wrapper, the editor hook and name
  recovery call it right after they read the access entries and stop there.
- `useImportKeyFlow.tsx` stores an imported key with
  `id: crypto.randomUUID()`; `applyNewIdentity` pins the key and fills the key
  slot, and touches no access entry. The same key pair thus gets a new id.
- `unwrapDekForCurrentUser` tries the wrap with the user's private key against
  every candidate sender key and throws the last error when none opens it.

Server facts, read in `../server` for the archived change and unchanged: the
access answer (`FilesController.GetEncryptionInfoAsync`) carries the caller's
key list and the caller's file key rows with the `PublicKeyId` the writer
sent; the server does not relate that id to the key list.

## Goals / Non-Goals

**Goals:**

- No file the user's key opens is refused.
- One place that gives the verdict.

**Non-Goals:**

- Keeping the report ahead of the passphrase prompt.

## Decisions

1. **The verdict is given by the failed unwrap.** `unwrapDekForCurrentUser`
   takes the caller's key list as an optional `userKeys`. When no candidate
   opens the wrap and the entry names a key id outside that list, it throws
   `KeyReplacedError` in place of the last error. The id comparison stays a
   private helper of that function and is no longer exported. Alternative:
   compare public keys instead of ids. Not possible: the entry carries only
   the id, and the public key of a deleted pair is nowhere to be read.
2. **Callers pass the key list and drop their early checks.** Each caller
   hands `userKeys` of the access answer to the unwrap and reacts to
   `KeyReplacedError` where it reacted to the early check: the editor hook
   sets `key-replaced`, name recovery records the file, the archives count it,
   the single download and the single copy or move show the message, the
   media viewer gets it through the error text.
3. **The decrypting download reports the cause as a flag.**
   `decryptDownloadedFile` already turns errors into a result object; it adds
   `keyReplaced: true` for this error, and `downloadAndDecryptFileToBuffer`
   passes it on, so the callers need not parse a message.

## Risks / Trade-offs

- [With a locked key the user enters the passphrase and then learns the file
  cannot be opened] → accepted: the verdict needs the key. On a remembered
  device and with an unlocked key there is no prompt.
- [The file content is fetched before the wrap is tried in the download and
  copy paths] → as for every other file that fails to decrypt; reordering
  those paths is not part of this fix.
