# Proposal

## Why

The icons of the three save actions of the recovery phrase keep the dark
colour drawn into their files, so in the dark theme they cannot be told from
the button behind them and the actions look as if they had no icons.

## What Changes

- The icons of Common:RecoveryKitPrint, Common:Download and
  Common:CopyToClipboard take the colour of their label in every theme and
  state.

Out of scope: the icon files themselves, which other screens use; the icons of
any other dialog.

Decisions that need a human: none.

Depends on: nothing in `../server` or the Document Server.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: the save-action icons of the recovery
  phrase follow the colour of their labels.

## Impact

- Shared: `dialogs/key-generation/RecoveryPhraseDisplayModal.module.scss`.
- Client E2E: one case in `keys-management.spec.ts`.
