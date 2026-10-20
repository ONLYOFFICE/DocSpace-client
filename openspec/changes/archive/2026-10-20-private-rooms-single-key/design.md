# Design

## Context

Server facts, looked up with CodeGraph in `../server` and read in the source (paths under `../server/products/ASC.Files/` unless noted):

- A user's envelopes are one encrypted JSON array per user (`Core/Core/Entries/EncryptionKeyPairDto.cs` `Save`, `common/ASC.FederatedLogin/LoginProviders/EncryptionLoginProvider.cs` `SetKeysAsync`). Create appends, replace keeps the slot, delete removes by id; order is insertion order. There is no active or primary marker.
- `date` is set by the server: the request DTO has no date (`Core/ApiModels/RequestDto/EncryptionKeyRequestDto.cs`), the mapped `EncryptionKeyDto` defaults `Date = DateTime.Now` (`Core/ApiModels/ResponseDto/EncryptionKeyDto.cs`), so both create and replace stamp the current time. A legacy single-object record reads back as id `Guid.Empty` with `DateTime.MinValue`.
- Room access (`privacyroom/{roomId}/access`) flattens every stored envelope of every directly shared member, so a member with several keys appears several times (`EncryptionKeyPairDto.cs` `GetUserKeysForRoomAsync`).
- The file-key table holds at most one row per (tenant, file, user) (`Core/Core/EF/DbFileKeys.cs`); a write deletes the listed users' rows and inserts the new ones (`Core/Core/Dao/TeamlabDao/FileDao.cs` `SetFileKey`), so naming one user twice fails the write. The server never checks `publicKeyId` against the user's envelopes and never touches wraps when an envelope is replaced or deleted.
- Deleting the last envelope stores `[]`, not null, so the server's "has keys" guard (`EncryptionLoginProvider.ThrowIfKeysAreNotSetAsync`) still passes for room creation, invitation and owner change; the client has to keep its own key checks.
- The editor configuration carries all of the caller's envelopes (`Server/Api/EditorController.cs`).
- There is no server query for "files wrapped for user X or key Y"; only per file through `GET files/{fileId}/access`.
- Server bug for the server team (not reproduced): every key save calls `accountLinker.RemoveProviderAsync(userId)` without a provider (`EncryptionLoginProvider.cs`), which removes whichever account link comes first and may drop a Google or SSO link.

Client today (from the code): `active-key-preference.ts` picks the stored preference and refuses to pick among two or more keys; `room-member-keys.ts` keeps the last listed key per member; invitation, backfill and owner validation already use one key per member (last listed); the store's `encryptKeysForRoomMembersImpl` and the shared `wrapDekForSelfAndRoom` loop over every member key; `unwrapDekForCurrentUser` tries all own entries with the one unlocked identity (only one entry can exist); `useGenerateKeyFlow` and `useImportKeyFlow` register a second, inactive key when one exists; `useSwitchKeyFlow`, `useRotateIdentityForRooms`, `rotation-runner.ts`, `rotation-state.ts` and `rotateOwnIdentityForRoom` implement switching with room migration.

## Goals / Non-Goals

**Goals:** one key per user on the client; one deterministic key per peer; one wrap per member; the multi-key UI and migration code gone; accounts with leftover keys keep working with the selected key and can clean up.

**Non-Goals:** server enforcement; re-wrapping leftover files; multi-device keys (BL-8).

## Decisions

1. **One selection function, shared.** `selectUserKey(envelopes)` in `services/encryption` returns the envelope with the newest parsed `date`, ties and unparsable dates resolved to the last one in server order, `null` for none. Own key and member keys both use it; `loadRoomMemberKeys` exposes one key per user built with it and drops the all-keys views where nothing needs them. Rationale: the server stamps `date` itself on create and replace, so "newest" is the key the user set last on any device, and every client reaches the same answer without coordination.
2. **Wraps are built per user.** Every fan-out builds its recipient list from the one-key-per-user map, so a write can never name a user twice. Existing-entry de-duplication compares user ids, not `userId:publicKeyId`.
3. **Unwrap keeps the sender search, drops own-key ordering.** Own entries are at most one per file; the `currentPublicKeyId` ordering and the "several own entries" loop are removed. Sender candidates (live keys plus TOFU history) stay, because old wraps name older sender keys.
4. **No migration for leftover keys.** The feature is unreleased behind the `privateRooms` flag, so only test accounts hold several keys. Their files wrapped for an unselected key fail to unwrap and raise the existing ghost-state toast. Keys management shows how many unused keys the server stores and a "delete unused keys" action that deletes every envelope except the selected one, after a warning.
5. **Generate and import only without a key.** The buttons are hidden while a key exists; the create-room dialog already reaches generation only without keys. Change passphrase and recovery PUT the same id. Delete and reset remain; deleting the only key warns that every private-room file becomes unreadable.
6. **TOFU stays multi-key per peer.** A peer can reset and generate a new key, and old wraps name the old sender key, so pin history is still needed; pins compare against the selected peer key.
7. **Archive order.** `private-rooms-upload-fail-closed` modifies the same file-operations requirement; it is archived first and this change's delta is written on top of its text.

## Risks / Trade-offs

- [A test account loses access to files wrapped for an unselected key] → accepted (unreleased feature); ghost-state toast and the cleanup notice explain it.
- [Server clock skew between create and replace on different nodes could reorder `date`] → ties and near-equal dates only matter for accounts with several keys, which the cleanup removes.
- [Removing code that a later server per-key model would need] → BL-8 is withdrawn in server-hardening; per-key wraps would be a new change with its own design.

## Migration Plan

No data migration. Ships behind `privateRooms`. Rollback is a revert of the client change.

## Open Questions

- None blocking. Whether the unused-key cleanup should run automatically after the user confirms once can be revisited after the change lands.
