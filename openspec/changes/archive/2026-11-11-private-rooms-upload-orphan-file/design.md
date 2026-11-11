# Design

## Context

See proposal.md for the motivation. No stashed design document covers this.

Client, as read on 2026-11-11:

- `uploadEncryptedFile`
  (`packages/shared/services/private-room/encrypted-upload-orchestrator.ts`)
  goes through three stages: prepare, upload, wrap. After the chunks are
  sent the file has an id and the stage is "wrap".
- `wrapDekForSelfAndRoom` first wraps the key for the uploader and writes
  that one entry (`setFileEncryptionKeys`), then reads the members' keys
  and writes theirs. A failure of the second part is caught and reported
  as a share failure; a failure of the first, of the wrapping or of its
  write, is thrown and becomes an `EncryptedWrapError`.
- The `finally` of `uploadEncryptedFile` wipes the key. The result carries
  the file id and `failedAt: "wrap"`.
- The client (`chunkUpload.helpers.ts`) lists the stored file, marks the
  row uploaded with an error and shows `Common:EncryptionUploadWrapFailed`.
  The SDK (`useEncryptedUpload.ts`) fails the row with the same message.
- The API client has `deleteFile(fileId, deleteAfter, immediately)`
  (`packages/shared/api/files/index.ts`, `DELETE files/file/{id}`), which
  answers a list of operations. The encrypted-files mock serves the route
  and removes the file at once.

Server, `../server` at `a7d94e4b81`, read on 2026-11-11 (task 1.1):

- `FilesController.DeleteFile`
  (`products/ASC.Files/Server/Api/FilesController.cs`, `HttpDelete
  "file/{fileId}"`) queues a delete operation
  (`fileOperationsManager.Publish`) and answers the operations of the
  caller, narrowed to this one with `returnSingleOperation`. The work is
  done by `FileDeleteOperation`
  (`products/ASC.Files/Core/Services/WCFService/FileOperations/FileDeleteOperation.cs`),
  so the answer can carry an operation that is still running; its outcome
  is read from `GET files/fileops`, the `finished` and `error` fields.
- A refusal is not an HTTP error of the delete request: the operation
  records the message of the failed permission check in its `error`.
- Who may delete, by the remarks of the action: the room admin, a DocSpace
  admin acting as room manager and a content creator acting on their own
  file; editing access alone does not delete. A user who can upload into a
  private room is one of the first three, and the file is their own. The
  rule was read in the action's documentation, not followed into
  `FileSecurity`.
- With `immediately` the file is deleted for good; the remarks add that
  inside a room there is no Trash and deletion is always final.

## Goals / Non-Goals

**Goals:**

- No failure of the uploader's entry leaves an encrypted file on the
  server that the client has not at least tried to remove.
- The user sees a failed upload they can retry, not a stored file they
  must clean up by hand.

**Non-Goals:**

- Guaranteeing removal when the server refuses it. The remaining case is
  reported as today.

## Decisions

1. **Retry only the write, and only a bounded number of times.** The
   wrapping is local and deterministic: when it throws, trying again gives
   the same answer, so only the request is repeated, twice more with a
   short pause. Alternative: retry the whole wrap stage. Rejected: it
   repeats work that cannot change and delays the report.
2. **The cleanup lives in the orchestrator.** It is the one place both the
   client and the SDK go through, and the one that knows the file has no
   entry yet. The result says whether the stored file was removed, so each
   caller only chooses how to show it. Alternative: let each caller delete.
   Rejected: two copies of a safety rule.
3. **A removed upload is reported as a failed upload, without a file id.**
   The client then takes its existing failed-row path, which offers a
   retry, and lists no file. A deletion that fails keeps the id and
   today's "uploaded with error" path.
4. **The deletion is permanent, and its operation is awaited within a
   bound.** Deletion in a private room bypasses the recycle bin (main spec
   `file-operations`, "Deletion bypasses the recycle bin"). The delete
   request only queues an operation (Context), so the orchestrator reads
   the operation until it is finished, for a few seconds at most, and
   counts the file as removed only when it finished without an error. An
   operation that reports an error, does not finish in time or cannot be
   read counts as a failed deletion.
5. **The members' entries keep their path.** With the uploader's entry
   written the file is readable and recoverable; a failed fan-out stays a
   share failure with pending-access marks.
6. **One mock-only switch for the E2E case.** The encrypted-files mock
   gains a handle method that makes the next access writes of a file fail,
   documented as mock-only, since the server has no such mode.

## Risks / Trade-offs

- [The server refuses the deletion to the uploader] → The row stays
  "uploaded with error" with the message that asks for a manual removal;
  task 1.1 says whether this can happen for the roles that may upload.
- [The deletion removes a file that did get its entry, when the write
  succeeded and only the answer was lost] → The entries of the file are
  read before the deletion; a file that has the uploader's entry is kept
  and reported as uploaded.
- [A new message needs 31 translations] → The owner may choose to reuse an
  existing message (proposal.md, decision 1).
