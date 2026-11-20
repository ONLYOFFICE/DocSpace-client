# Proposal

## Why

The main spec of room membership says the info panel never shows the Share
tab for a private room, a folder inside it, or an encrypted file. The
client gate covers the room and the encrypted file through flags of the
selected item, and relies on the share right the server reports for a
folder inside a private room. This change makes the client hold the
requirement for that folder on its own, whatever the server reports, and
adds the scenario to the spec so a test pins it.

## What Changes

- Client: the info panel tab list leaves out Share for any item selected
  while the open folder is a private room or lies inside one, whatever
  `canShare` the item carries.
- A unit test for the new scenario, and a check that an ordinary folder
  with the share right still gets the tab.

Out of scope:

- The SDK info panel of the private section: it never offers Share
  (`getPrivateAvailableTabs`), so nothing changes there.
- A folder of a private room listed outside the room (Favorites, search):
  the folder DTO carries no mark of its room, and the server reports no
  share right for it (design.md). Not changed here.
- Server work: none. The change depends on no server or Document Server
  change.

No decision needs a human.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/room-membership`: "Share tab hidden for private items"
  gains the scenario of a folder inside a private room, independent of the
  share right the server reports.

## Impact

- `packages/client/src/helpers/info-panel/tabs.ts`
  (`getAvailableInfoPanelTabs`) and its test
  `packages/client/src/helpers/info-panel/__tests__/tabs.test.ts`.
- Coordination: `private-rooms-test-coverage-gaps` covers the encrypted
  file scenario of the same requirement and leaves the folder case to this
  change.
