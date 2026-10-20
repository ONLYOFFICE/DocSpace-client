# Design

## Context

See proposal.md for motivation. Today `persistDeviceUnlock` writes `{ publicKey, wrappingKey, iv, ciphertext, updatedAt }` to IndexedDB and `restoreDeviceUnlock` never reads `updatedAt` (`packages/shared/services/encryption/device-unlock-store.ts:142-206`). `requireIdentity` falls through to `restoreDeviceUnlock` whenever the in-memory slot is empty (`packages/shared/context/encryption/EncryptionContext.tsx:255-271`), while the visibility and idle handlers call only `SecretStorage.lock()` plus the filename-cache clear (`EncryptionContext.tsx:312-313`, `:335-337`); only the explicit `lock()` calls `forgetDeviceUnlock` (`:241`). The stashed SECURITY.md (s6, "Operational notes") states "Auto-lock on visibility hidden bounds the post-XSS exploit window. Keep this enabled", which assumed no device record existed; the device-unlock store and passkey unlock were added after that document and are not described in it.

## Goals / Non-Goals

**Goals:**
- One documented, testable policy for what auto-lock means on a remembered device.
- Bound the lifetime of a remembered record.
- Make the trade-off visible to the user at the moment they tick the option.

**Non-Goals:**
- Protecting the key from same-origin script (that is Web Worker isolation, a separate change).
- Changing passkey unlock, which already requires a user gesture per unlock.
- Server-side enforcement; the record is purely client-side.

## Decisions

**D1. Policy: option A, a remembered device survives auto-lock and the record expires after a maximum age (confirmed by the user on 2026-10-20, with the 30-day age of D2).**
- A. Survive auto-lock, expire after N days. Matches what users expect from "remember this device" in password managers and messengers; auto-lock still protects the key against a shoulder-surfer on a non-remembered device and still drops decrypted filenames. Cost: a device-level attacker with same-origin script access can restore the key at any time within N days, which is already true today, just undocumented.
- B. Auto-lock also forgets the device. Makes "remember" nearly useless with the default 30-minute idle timeout and the tab-hidden lock (every tab switch would forget the device). Rejected.
- C. Require passkey/OS re-auth after auto-lock on a remembered device. Strongest, but only possible where passkey PRF is available; elsewhere it degrades to B. Could be layered later as "remember with passkey". Deferred.

**D2. Maximum age 30 days, read at restore time.** `restoreDeviceUnlock` compares `Date.now() - record.updatedAt` with a constant exported from the store; an expired record (or one with a future timestamp) is deleted exactly like a public-key mismatch is today. A successful passphrase unlock with the option on rewrites the record (already the behaviour of `persistDeviceUnlock`). Alternative: refresh `updatedAt` on every silent restore (sliding window). Rejected, because a device used daily would never re-prompt.

**D3. Copy, not a new control.** The remember checkbox gets a hint line (`Common:RememberDeviceHint`), and the Keys management "Forget device" row states the expiry date (`Common:DeviceUnlockRememberedUntil`). No setting for the age in v1; the constant is enough until someone asks.

**D4. Threat-model text.** When the stashed SECURITY.md is brought into the repo, the operational note becomes: "Auto-lock bounds the post-XSS window on devices that are not remembered; on a remembered device the bound is the record age." Tracked as a task here because this change owns the policy.

## Risks / Trade-offs

- [Users assume auto-lock protects a shared computer] → the hint text names the trade-off; Lock now and Forget device stay one click away in Keys management.
- [Device clock set back or skewed] → a record with `updatedAt` in the future is treated as expired (delete and prompt), never as fresh.
- [Expiry check adds a prompt mid-operation] → the prompt is the existing passphrase dialog, which every encrypted operation already handles.

## Migration Plan

Records written before this change already carry `updatedAt`, so expiry applies to them on the first restore after deploy. No data migration; rollback is removing the age check.

## Open Questions

- Should the age become an admin-configurable portal setting later? It does not affect the specs or tasks now; the constant can move to a setting without changing behaviour.
