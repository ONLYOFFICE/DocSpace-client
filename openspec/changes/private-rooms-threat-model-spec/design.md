# Design

## Context

Spec-only change. Every statement of the deltas was read in the client code
on 2026-11-12 at `dea2897a64d`; the server was not read, because no
statement is about it. No stashed design document was consulted: the
stashed `SECURITY.md` is not available on this machine, and the code wins
where they would disagree.

| Statement | Where it was read |
| --- | --- |
| The server names the recipients of a file key | `packages/shared/services/private-room/encrypted-upload-orchestrator.ts`: the member key list and the room's encryption info are requested and every listed member becomes a recipient |
| A key seen for the first time is pinned unasked | `packages/shared/services/encryption/tofu-store.ts`, `checkKey`: no record gives `first-seen` and stores the key |
| No out-of-band verification | `tofu-store.ts`, `markVerified`: no caller outside tests under `packages/` |
| Metadata in the clear | `packages/shared/services/encryption/streaming-encryption.ts` and `types.ts`: the 33-byte header carries flags, chunk count and name length; each chunk adds a 12-byte IV and a 16-byte tag; room and folder titles are sent by the ordinary room and folder requests |
| Passphrase composition | `packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx`, `PASSPHRASE_SETTINGS`: `[A-Z]`, a digit and an ASCII punctuation range; the confirm button needs these rules passed, and `isPassphraseAcceptable` on submit |
| Key pair kept | `generateIdentityKeyPair` is called by the key generation flow only (`packages/shared/dialogs/key-generation/useGenerateKeyFlow.tsx`) |
| Forget device | `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/KeysManagement.tsx`, `handleForgetDevice`: removes the device record and shows the toast; the in-memory key is not locked |
| Search limit and scope | `packages/client/src/store/filesStore/clientSearch.helpers.ts`: `CLIENT_SEARCH_MAX_ITEMS = 10_000`, pages of the open folder only, `clientSearchCapped` shown by `ClientSearchProgress.tsx` as Files:ClientSearchPartialResults |
| Name sort | `applyClientSearchImpl` in the same file sorts the items it is given, which are the loaded ones |
| Zip in memory | `packages/shared/services/private-room/encrypted-download.ts`, `createZipFromBuffers`: all entries and the output as byte arrays |
| No resume | `encrypted-download.ts` fetches the download URL whole; a range request exists only for the name recovery |

## Goals / Non-Goals

Goals: the four points of review card P6 each have a requirement with a
scenario in the main specs; criterion 1.21 of `private-rooms-release-gate`
can be ticked.

Non-goals: changing any behaviour; describing the server; mobile and
desktop clients.

## Decisions

1. New requirements where possible, a modified one only where the main spec
   says something untrue. "Passphrase strength gate", "Change passphrase"
   and "Client-side search over decrypted names" stay as they are and get
   companions, so no long requirement is copied and none grows past the
   500-character rule. Only "Remember this device" is modified, because its
   scenario "Forget device" promises a prompt that does not come.
2. The active-server limitation is one requirement with three scenarios,
   including the case that is protected (a replaced key for a pinned
   member), so the boundary of the limitation is testable from both sides.
3. The visible extension keeps its own existing requirement; the new
   metadata requirement does not repeat it.
4. The auto-lock preset picked while unlocked is left out (proposal,
   decision 4): the hidden-tab rule reads the preset at the event, the idle
   timer when its effect next restarts, so there is no single rule to state.

## Risks / Trade-offs

- The scenarios of the limitations have no automated test in this change;
  they describe code paths that existing unit tests cover only in part
  (first-seen pinning, the search cap). Accepted: the change records, a
  later change that lifts a limit brings its tests.
- A limit written as SHALL NOT can be read as a goal. The Purpose of
  `encryption-core` already says that such requirements are accepted v1
  limitations.
