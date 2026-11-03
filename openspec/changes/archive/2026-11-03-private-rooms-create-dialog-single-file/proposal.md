# Proposal

## Why

A tester's recording of 2026-11-03 shows two files created by one click. In a
private room, with the profile setting Common:DontAskAgain off, the user chose
"New presentation", ticked Common:DontAskAgain in the name dialog and pressed
Create: two encrypted presentations named "New presentation.pptx" were created
(file ids 16 and 17) and two editor tabs opened. The same steps in an ordinary
room create one file.

The cause is in the client. The dialog saves the setting and starts the
creation at the same moment. In a private room the creation takes longer than
the setting request, because the file is produced and encrypted on the client.
When the setting arrives, the create flow decides a second time whether to ask
for a name, sees the setting on, and creates another file under the default
name. In an ordinary room the dialog has already closed by then.

Every user meets this once `private-rooms-beta-release` removes the tester
flag, so its gate item 0.5 waits for this change.

## What Changes

- One create action in a private room creates exactly one file, under the
  name confirmed in the dialog, whatever happens to the file-name setting
  while the file is being created.
- The name dialog stays open, its Create button loading, until the file is
  created, also when Common:DontAskAgain is ticked.
- No change to the setting itself, the menu entries or the encrypted
  creation path.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`: adds the requirement that one create
  action makes one file, with scenarios for the ticked Common:DontAskAgain
  box and for a typed name.

## Impact

- Client: the create flow in `packages/client/src/components/GlobalEvents`
  (the create event and its name dialog), with a new unit test next to it.
- Form rooms share the race (creation there waits for the server before the
  dialog closes) and are fixed by the same code; OpenSpec does not cover
  them, so they get a regression case in the unit test only.
- Ordinary rooms: no behaviour change.
- Server (`../server`), Document Server, locales: no work.

## Out of scope

- Both editor tabs in the recording stayed at "Loading presentation". Task
  2.2 checks whether a single creation opens normally; if the editor still
  hangs, that is a separate change.
- Other dependencies of the create flow that are read but not listed. They
  can leave stale values, but do not create files and are not touched here.

## Decisions for a human

- None. The fix restores the behaviour the dialog already promises.
