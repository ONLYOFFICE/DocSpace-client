# Proposal

## Why

The E2E mock of a private room reports fewer rights on an encrypted file
than the server does. The server gives the room owner the comment, review
and custom-filter rights, the form-gallery right on documents, spreadsheets,
presentations and PDF forms, and the open-form right on a PDF; the mock
answers all of them with false and leaves six of the 27 right keys out. A
mock that is stricter than the server hides every place where the client
trusts a right the server does grant: until 2026-11-10 it also answered the
history rights with false, and two bypasses of that kind were found only by
reading the code.

One of them is still open. The version comment in the Details view of the
info panel opens for editing on the edit-history right alone. For an
encrypted file the server grants that right to the room owner, and saving
the comment requests the version list and stores the text on the server in
the clear, although version operations are withheld for encrypted files.

A second gap is in the media viewer: when the encrypted file to download is
neither in the folder list nor the previewed file, the download does
nothing and says nothing.

## What Changes

- The mock reports the rights of an encrypted file as the server computes
  them for the room owner: comment, review and custom filter granted in an
  active room; the form-gallery right by the file's category; the open-form
  right on a PDF; the six missing keys present. In an archived room all of
  these are denied, as the server denies them. Contract cases pin each
  value to the server rule behind it.
- Every client and SDK E2E spec that uses the mock is run on it. A menu
  entry, badge or action that appears for an encrypted file only because of
  a newly granted right is a defect of the same class and is fixed in this
  change; a failure that needs work outside this repository is marked
  `test.fixme` with a pointer to the task that owns it. The mock is not
  bent back to make a spec pass.
- The Details view of the info panel shows the version comment of an
  encrypted file as text only: no Edit or Add control, so no version list
  request and no comment write.
- A download from the media viewer that cannot find the encrypted file
  shows `Common:EncryptionDownloadFailed` ("Could not download the
  encrypted file."), an existing key. The ciphertext is still never handed
  to the browser as the download.

No new user-facing string is added.

Out of scope:

- The server. That it grants the edit-history, comment, review,
  custom-filter and form-gallery rights on a file whose content it cannot
  read is recorded for the backend, not changed here and not worked around
  in the mock.
- Rights of members who are not the room owner. The mock keeps answering
  as the owner, as it does today.
- The comment editor of the version history panel: the panel is not
  reachable for an encrypted file.
- Making the media viewer find a file that is in neither list; it only
  stops failing silently.

Decisions that need a human: none open. The owner decided on 2026-11-11
that a mismatch between mock and server is fixed in the mock, and that a
spec failing afterwards on a real defect is marked `test.fixme`.

Depends on: nothing in `../server` or the Document Server. Server
behaviour was read at `a7d94e4b81`; the sources are cited in design.md.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`: "Version operations withheld" gains the
  version comment of the info panel; "Download decrypts on the client"
  gains the media viewer download of a file that cannot be found.
- `private-rooms/server-contract`: a new requirement states the rights the
  server reports on a file of a private room to the room owner.

## Impact

- `packages/shared/__mocks__/handlers/files/encryptedFiles.ts` and its
  contract test; through the shared mocks, the type check of all six
  packages.
- `packages/client/src/pages/Home/InfoPanel/Body/sub-components/CommentEditor.tsx`
  and a new unit test next to it.
- `packages/client/src/pages/Home/MediaViewer/index.js` and its unit test.
- E2E specs that use `encryptedFilesHandlers`: thirteen in the client, one
  in the doceditor, one in the SDK.
- No API, dependency or locale change.
