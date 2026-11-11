# Proposal

## Why

The editor page resolves the key of an encrypted file in steps: it reads
the user's key list, the file's access entries, unlocks the identity and
unwraps the file key. Whatever goes wrong in any step ends in one state,
and the page shows Common:SomethingWentWrong with nothing to press. A user
who dismissed the unlock dialog by accident must reload the page; a user
whose request failed is told nothing about the connection; a user for whom
the file is not wrapped yet is not told to ask for access (review card C8).

The page also reads a failed request for the user's key list as an empty
list, the defect `private-rooms-key-list-unknown-state` removed from the
client: a key holder whose request failed is treated as a user without a
key.

## What Changes

The key flow of the editor page tells five outcomes apart, each with its
own message, and three of them can be retried without a page reload:

| Outcome | Message | Action |
|---------|---------|--------|
| The user dismissed the unlock dialog | new: Common:EncryptedFileUnlockToOpen | Common:UnlockKey raises the dialog again |
| The file's access entries hold no wrap for the user | new: Common:EncryptedFileNoAccessYet | none |
| The user holds no key | Common:EncryptionKeysNotConfigured | none |
| A request failed: the user's key list or the file's access entries | Common:EncryptionKeysLoadFailed | Common:TryAgain repeats the failed step |
| Anything else: a refused key change, a file key that does not unwrap | Common:SomethingWentWrong, as today | none |

The editor is still not mounted in any of them.

New user-facing strings, English, for the owner's approval before they are
translated:

| Key | Text |
|-----|------|
| `Common:EncryptedFileUnlockToOpen` | Unlock your encryption key to open this file. |
| `Common:EncryptedFileNoAccessYet` | You do not have access to this encrypted file yet. Ask a room manager to open the room: access is granted when they do. |

Reused as they are: Common:UnlockKey ("Unlock"), Common:TryAgain,
Common:EncryptionKeysLoadFailed, Common:EncryptionKeysNotConfigured and
Common:SomethingWentWrong.

Out of scope:

- Error -82 of the Document Server and what the editor itself reports
  after it is mounted (cards B2 and D2).
- The wording of Common:EncryptionKeysNotConfigured, card C10.
- The SDK's editor entry, which goes through the same page.
- Telling a failed request from a refusal by its status code: the change
  does not rely on which status the server answers with.

Decisions that need a human:

1. The two texts above. The second one names the way access appears
   today: a room manager who opens the room re-wraps the file keys for the
   members who have a key (main spec `room-membership`, backfill on room
   entry). A shorter alternative without the advice: "You do not have
   access to this encrypted file yet."

Depends on: nothing in `../server` or the Document Server. The change
states nothing about server behaviour.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/editor-integration`: "Editor loads the caller's key
  envelopes before opening an encrypted file", "Editor fetches the file's
  access entries", "Identity unlock precedes key unwrap" and "Editor not
  mounted until keys are ready" name the separate outcomes and the retry.

## Impact

- `packages/doceditor/src/hooks/useFileEncryptionKeys.ts`,
  `packages/doceditor/src/components/EncryptionProviderWrapper.tsx` and
  `packages/doceditor/src/components/Editor.tsx`, with their unit tests.
- Two keys in `public/locales/*/Common.json` with metadata, translated
  into the 31 other languages after approval.
- No API or dependency change.
