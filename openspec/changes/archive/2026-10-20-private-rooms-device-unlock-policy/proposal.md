# Proposal

## Why

"Remember this device" keeps the private key in IndexedDB with no expiry, and the auto-lock paths (tab hidden, idle timeout) only wipe the in-memory copy. The next identity request restores the key from the device record without any prompt, so auto-lock is cosmetic on a remembered device. Nobody decided whether that is the intended trade-off; the stashed SECURITY.md still argues that auto-lock bounds the post-XSS window, which is no longer true. The policy must be decided and enforced before the feature can be released.

## What Changes

- Define the device-unlock policy: a remembered device survives auto-lock **by design**, but the device record gets a maximum age (default 30 days) after which the user is re-prompted for the passphrase (or passkey) and the record is refreshed.
- Auto-lock keeps wiping the in-memory key and the filename cache; on a remembered device the identity is restored on the next operation without a prompt while the record is within its age limit.
- "Lock now" and "Forget device" keep deleting the record (unchanged).
- The unlock dialog and Keys management state what "remember this device" means (survives auto-lock, expires after N days) so the trade-off is visible.
- Rewrite the threat-model text: auto-lock bounds the XSS window only on devices that are not remembered.
- **Decision needed from the user** before apply: confirm option A (survive auto-lock with expiry) over B (auto-lock forgets the device) or C (re-auth with passkey/OS after auto-lock). See design.md.

Out of scope: Web Worker isolation of the key (separate change), passkey behaviour (unchanged), server-side session policies.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `private-rooms/key-management`: "Remember this device" gains an expiry and a visible explanation; "Auto-lock timeout presets" states what happens on a remembered device; "Lock now" is restated against the new policy.
- `private-rooms/encryption-core`: "Remembered device keeps the key in IndexedDB" gains the maximum record age and the restore-after-auto-lock rule; "Unlocked identity lives in memory with idle expiry" clarifies that idle expiry does not touch the device record.

## Impact

- `packages/shared/services/encryption/device-unlock-store.ts` (record age check on restore), `packages/shared/context/encryption/EncryptionContext.tsx` (no change for option A beyond the restore path; option B would change the auto-lock handlers), `packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx` and the Keys management page (copy), `public/locales/*/Common.json` (two new keys).
- No server or Document Server dependency.
- Threat-model documentation: the sentence "auto-lock bounds the post-XSS exploit window" in the stashed, uncommitted SECURITY.md must be rewritten when that document is brought into the repo.
