# Design

## Context

See proposal.md, "Why". The current state of the code, read on 2026-11-03
and merged into `release/v4.1.0` the same day (PR !798) with the flag in
place:

- **The browser opt-in.** `packages/shared/utils/privateRooms.ts` holds the
  flag (`isPrivateRoomsEnabled`, `PRIVATE_ROOMS_FLAG_KEY`). Since this branch
  it also holds `applyPrivateRoomsOptInFromUrl`, which writes the flag when
  the address carries `?privateRooms=true|1`, and `isPrivateRoomsOptInValue`,
  which the frame and SDK opt-ins use too. The flag is read in:
  - `AppsStore.privateRoomsOptIn`, behind `isPrivateRoomsSectionAvailable` (`packages/client/src/store/AppsStore.ts`);
  - the unreleased-apps map (`packages/client/src/helpers/disabled-apps.ts`);
  - the route tables (`packages/client/src/routes/general.js`, `withPrivateRooms`, evaluated once when the module loads);
  - the profile tabs (`packages/client/src/pages/Profile/Section/Body/index.tsx`);
  - the SDK opt-in helpers (`packages/sdk/src/app/(private)/_utils/private-rooms-opt-in.ts`), which only borrow the parameter name and the value check.
- **Section availability.** `isPrivateRoomsSectionAvailable` returns false
  unless the browser flag or the frame opt-in is set, then follows the E2E
  rooms app. Apps are managed only on standalone portals (`canManageApps` is
  `settingsStore.standalone`), so on SaaS the section follows the opt-in
  alone. The two opt-ins are joined by OR, so the browser flag also opts an
  SDK frame in.
- **The user's keys.** They are loaded for every signed-in user when the
  application starts (`packages/shared/store/AuthStore.ts`, into
  `userStore.encryptionKeys`), so "the user holds a key" is known early.
- **The Beta badge.** `packages/shared/components/beta-badge` renders the
  constant label `BetaLabel` (`public/locales/.constants/consts.json`). Its
  tooltip title is fixed to `Common:BetaBadgeTitle` ("RTL interface") and its
  text defaults to `Common:BetaBadgeDescription`, both about RTL languages,
  followed by `Common:BetaBadgeFeedback` (forum link and support e-mail). Task
  2.1 added a description override; the title has none yet, so the Private
  badges show "RTL interface" as their title today.
- **E2E.**
  - The base fixture writes the flag for every page (`packages/client/__tests__/fixtures/base.ts`), and `private-rooms-hidden.spec.ts` asserts the hidden state.
  - The desktop screenshots already show the Private item with its Beta badge (commit `6f2d07034af`), because the fixture turns the flag on everywhere.
  - `AppsStore.installed.test.ts` writes the raw `"privateRooms"` key, which `tsc` cannot catch.
- **The server.** It has no availability setting, and none is expected for
  this release. Saving a key through `EncryptionLoginProvider.SetKeysAsync`
  calls `AccountLinker.RemoveProviderAsync(userId)` without a provider, which
  deletes the user's first account link of any provider before the encryption
  link is added (read through CodeGraph on `release/v4.1.0` at `d64d3396f5`).
  That is `private-rooms-server-hardening` 12.1, merged there on 2026-11-04
  (`3b9c527a6e`).

## Goals / Non-Goals

**Goals:**
- Every user meets the feature without an opt-in, labelled as a beta.
- Standalone administrators keep a switch, the one apps already have.
- Nothing left that decides availability from browser storage or the address.
- `private-rooms-release-gate` stays the single definition of general
  availability, and owns the portal setting.

**Non-Goals:**
- Changing the views a private room offers, or the editor.
- Per-user or per-group availability.
- A switch on SaaS. It comes with the portal setting at general availability.

## Decisions

1. **The E2E rooms app is the only switch.** On SaaS every app is on, so the
   section is always offered; on standalone an administrator switches the app
   in the apps settings, which already updates the section without a reload.
   This is the owner's decision of 2026-11-03, taken because no server setting
   will ship with the release.
   - *Alternative:* the portal setting of the earlier plan.
   - *Why not:* the server has none; it moves to `private-rooms-release-gate`.
   - *Alternative:* keep the tester flag on SaaS until the setting lands.
   - *Why not:* the owner wants the beta in front of every user now.

2. **Frames and the SDK keep the host opt-in.** A host that embeds the client
   or the SDK has not asked for a beta surface, so it has to request one.
   Inside an SDK frame only the frame configuration opts in; a browser value
   no longer does, which also closes the OR described in Context.
   - *Alternative:* offer the section in every frame.
   - *Why not:* it would show a beta inside third-party products without their consent.

3. **Keys management stays for users who hold a key**, as in decision 3 of
   `private-rooms-release-gate`. A user with existing private rooms must be
   able to unlock, export or reset their key after an administrator switches
   the app off.

4. **The keys routes are registered unconditionally and guarded by a route
   component.** `withPrivateRooms` in `general.js` runs once when the module
   loads, before the apps list and the keys arrive. A guard in the style of
   `PrivateRoomsSectionRoute` waits for them, then renders the page or falls
   back to the profile.

5. **`BetaBadge` takes an optional description and an optional title**, used
   in place of `Common:BetaBadgeDescription` and `Common:BetaBadgeTitle`. The
   feedback part and the label stay as they are. Private rooms pass
   `Common:PrivateRoomsBetaTitle` and `Common:PrivateRoomsBetaDescription`.
   - *Alternative:* a separate private-rooms badge component.
   - *Why not:* it would duplicate the tooltip, the device placement and the feedback links.

6. **The browser flag and its URL parameter are deleted. The frame opt-in
   value check and the parameter name stay**, because frames and the SDK still
   use them (decision 2). The module keeps only those.

7. **The E2E suite needs no setting.** The mocked apps list has the E2E rooms
   app on and the default settings are SaaS-like, so every spec sees the
   section without a fixture option. The screenshots committed in
   `6f2d07034af` already show that state, so removing the flag from the
   fixture moves none of them. The app-off spec mocks a standalone portal
   with the app off.

8. **Spreadsheets and presentations are a gate item, not part of this
   change.** If the Document Server build closes DS-17 and DS-19
   (`private-rooms-editor-contract` 4.7), nothing is restricted. Otherwise a
   separate change opens them view-only and withholds their creation. That
   change modifies `file-operations`, `sdk-surface` and `editor-integration`,
   which this change does not touch. The doceditor already switches to view
   mode for `action=view` (`packages/doceditor/src/utils/actions.ts:777,833`),
   and the client already passes it for previews
   (`packages/client/src/store/filesStore/actions.helpers.ts:163`).

9. **`private-rooms-release-gate` owns the portal setting again.** Revised a
   first time by task 1.1, it is revised a second time with this decision: it
   adds the server setting, the administrator control and the availability
   rule on top of the app, and still removes the Beta badges.

10. **The account-link loss is an accepted beta risk.** The owner decided on
    2026-11-03 to merge without waiting for `private-rooms-server-hardening`
    12.1 and without a client guard. The beta release notes name it. The fix
    merged on the server on 2026-11-04 (`3b9c527a6e`), so the notes now name
    the server build that carries it instead of warning every user.
11. **The Archive keeps the non-private filter while the app is off.** The
    server leaves private rooms out of the Rooms area by itself, but the
    shared Archive holds both kinds and takes the filter as given ("Rooms
    list while the app is off"). The owner decided on 2026-11-11 to send the
    non-private filter with Rooms → Archive whether the section is available
    or not, in task 4.5, rather than wait for the listing task of
    `private-rooms-server-section`, so "listed nowhere" holds now.

## Risks / Trade-offs

- **Saving a key can delete a Google, SSO or other sign-in link** (Context,
  "The server"). → Accepted by the owner (decision 10). The release notes
  tell users on an older server build with an external sign-in to set a
  password before they create a key; `private-rooms-server-hardening` 12.1
  fixed it on the server on 2026-11-04.
- **No switch on SaaS.** Every SaaS user is offered the beta. → Accepted for
  the beta; the portal setting arrives with general availability.
- **Every user now meets the defects of the beta.** → The verified blockers of
  the second pre-PR review and the duplicate file of the name dialog are fixed
  by their own changes before the flag is removed (gate items 0.3 and 0.5).
- **Testers lose the console toggle.** → They need none: the section is shown.
  `.claude/rules/private-rooms.md` says so in the same change.
- **The Document Server build lacks the crypto add-on.** Encrypted files then
  fail to open in the editor. → Accepted by proposal decision 6: gate items
  0.1 and 0.2 stay open and are named in the release notes instead of
  holding back the flag removal.

## Migration Plan

1. Revise `private-rooms-release-gate` (decision 9).
2. Commit the Beta badge title, the availability read, the keys guard, the
   removal of the flag and the E2E changes directly on `release/v4.1.0`
   (proposal decision 5). Tasks 3.1 to 3.3 remove the flag once 0.3 and 0.5
   of tasks.md hold (0.1 and 0.2 no longer hold them back, proposal
   decision 6); 4.1, 4.2, 4.4, 5.2 and group 6 follow them. 2.4, 4.3
   and 5.1 may land earlier, while the flag still hides the section.
3. Run the pre-push gate and the full client E2E under Docker, and the SDK
   private E2E.
4. Rollback: revert the client changes of this change. The flag and the
   hidden mode come back with the revert.

## Rooms list while the app is off (read 2026-11-11 at `a7d94e4b81`)

Read through CodeGraph and in the source of `../server`, and checked on
`tests.onlyoffice.io` the same day (DocSpace 4.1.0.12366).

- `VirtualRoomsCommonController.GetRoomsFolder` reads a missing search area
  as `Active` (`products/ASC.Files/Server/Api/VirtualRoomsController.cs:1494`).
- `FileSecurity.GetVirtualRoomsAsync`
  (`products/ASC.Files/Core/Core/Security/FileSecurity.cs:2981-2993`) reads
  `Active` with the private filter as the private rooms section, then forces
  the filter by area: the section means private, `Active` means not private
  whatever the request says, and every other area keeps the filter it was
  given. `SearchAreaExtensions.MatchesRoom`
  (`products/ASC.Files/Core/Core/VirtualRooms/SearchArea.cs:90-99`) splits
  the rooms the same way, and
  `PrivateRoomSectionTests.RoomsArea_LeavesPrivateRoomsOut` covers it.
- The E2E rooms app takes no part in the listing: it closes only the root
  listing and the section route (`private-rooms/server-contract`, "The E2E
  rooms app gates only the private section listing").
- On the stand `searchArea=Active` answered 95 rooms and no private one,
  and the same area with the private filter answered the two private rooms
  of the portal. The portal had no archived private room, so the Archive
  half is read in the source only.

So with the app off the Rooms list shows no private room without any
filter, while Rooms → Archive, asked without a filter, would still list
archived private rooms (decision 11).

## Open Questions

- The wording of `Common:PrivateRoomsBetaTitle` and
  `Common:PrivateRoomsBetaDescription`. Product may reword them; the
  behaviour does not change.

## Local stand run (2026-11-03, before task 6.2)

Not the staging run of task 6.2: local standalone stand (`localhost:8092`),
client `release/v4.1.0` at `59e3090d4c9` served by the Vite dev server,
DocSpace server 3.1.0, Document Server 10.0.2.5 (not the build of gate item
0.1). Administrator holding one key.

- With the browser's leftover `privateRooms` entry removed, Rooms shows the
  Private item with its Beta badge; the badge tooltip is titled "Private
  rooms" and the Keys management tab carries the badge too.
- The tooltip glued the description to the bug-report sentence ("...safe.If
  you have found a bug"); fixed in the shared BetaBadge (`2c2564cffcd`). The
  support address was empty on this stand.
- The administrator switched the Private app off in the apps settings: the
  Private section went without a reload, the private room "Pirate room" was
  listed in Rooms with its private badge, and the Keys management tab and
  page stayed, also after a full load of `/profile/keys-management`. The app
  was switched back on afterwards. Since the server's Private section
  (`c866c055e1`, 2026-11-06) the Rooms list leaves private rooms out, and the
  owner decided the same day to hide them while the section is not available
  (`private-rooms-server-section`, proposal decision 5): with the app off a
  private room is reached by its address only.

## Release stand check (2026-11-06, SaaS, part of task 6.2)

The owner's SaaS stand `tests.onlyoffice.io`: DocSpace `4.1.0.12300`
(`standalone: false`), Document Server `10.0.3.19` at `doc-eu.onlyoffice.io`,
the user the portal owner, holding one key. Read through the API and the
browser, no data changed:

- `GET files/settings` answers `docServiceEncryptionSupported: true`, and
  `doc-eu.onlyoffice.io/sdkjs/common/crypto/onlyoffice-crypto.js` is served
  (HPKE 1.10.1, `VERSION_HPKE_WRAP = 2`, `VERSION_IDENTITY = 2`, the DSE3
  constants), so gate item 0.1 is met for SaaS: the release's Document
  Server carries the add-on and reads container version 2, as the client
  writes. The standalone package build stays the Document Server team's
  question (`private-rooms-editor-contract`, Open Questions).
- The Private item carries the Beta badge, the list shows the owner's
  private room with its Private tag, and the Keys management tab carries
  the badge with the key card (Active, X25519), the device remembered and
  auto-lock off.
- The E2E rooms app is on (`e2e-rooms`, enabled); no switch is offered on
  SaaS, so the app-off half of task 6.2 needs a standalone portal.
- The server carries every backend commit through `b562fc3fb1`: the
  candidates and missing-keys routes answer, the room and its files report
  Copy, Duplicate, IndexExport, UseChat, Vectorization, AskAi, Convert and
  Embed false, and the audit trail masks the room title (see
  `private-rooms-server-hardening`, "Release stand check").
- Later the same day, with the owner's go-ahead: the API probes passed as
  the server contract says (an upload session without the encrypted flag
  403, a readable name 400, an opaque name opens, its cancel through
  another folder 404 with the session kept and through its own 200, copy-as
  of an encrypted file 403, a private room with indexing 400, an external
  link on a private room 403). A new private room, an encrypted document
  created in it and opened on the first try; after one edit and a save the
  document **cannot be reopened** (Document Server error -82), the known
  open item 6.2 of `private-rooms-editor-contract` reproduced on the
  release build. That is a beta blocker: every document edited in a
  private room becomes unopenable while the Document Server holds its
  session. Details in that change's design.md, "Release stand check of
  2026-11-06".
- With a second user holding a key ("User Test", `fenran@yandex.ru`, a
  user of the User type, key created by the owner at 12:38), the member
  flows from the owner's side, each checked through the API after the UI:
  - an invitee without a key (a User-type account) is refused before the
    grant: the invite result shows Common:EncryptedUploadNotSharedWith-style
    wording ("Could not share encrypted files with ...: they have not set
    up encryption keys yet") and the room's member list stays unchanged;
  - the invitee with a key is added as Viewer and the file keys are
    written for them at once ("File keys issued for ... to: <owner>,
    <member>" in the audit trail, `access/missing` empty, both users in
    the file's public keys);
  - a role change (Viewer to Editor) keeps the keys ("appointed: Editor",
    no revocation);
  - removal through the Members panel shows the warning dialog and the
    server revokes the keys: "File keys in the room "Private room" removed
    for: <member>" in the audit trail, the file's public keys back to the
    owner alone, `access/missing?userIds=<member>` naming the file;
  - a second invitation re-keys the returning member (keys issued again,
    `access/missing` empty);
  - archiving moves the room under the Archive root, lists it under
    Private → Archive, the client stays in the Private section, the
    room reports Copy, CopyTo, Duplicate, IndexExport and UseChat false and
    its file Copy and Duplicate false with Download true, the file's
    public keys still answer; restoring puts it back under the Rooms root
    and the empty Archive state offers "Go to Private";
  - the file's context menu offers Select, Edit, Preview, Move or copy,
    Download, File info and Delete, with no rename, links, duplicate or
    AI entries, and the History tab lists no file-keys entry.
- The owner change: the Change room owner panel admits room
  administrators and portal administrators only ("No members found" while
  the second user was of the User type), so the owner had the account
  raised to Room admin in Contacts; the panel then listed the user, and
  "Assign Owner" with "Leave the room" ticked transferred the room and
  left it ("You have left the room"). The client found no missing key to
  wrap, the server accepted the transfer, and the leave revoked the old
  owner's keys on the server ("File keys in the room "Private room"
  removed for: <old owner>", then "Deleted user: <old owner>"). Afterwards
  the room and its file answer the portal owner 403, who is no longer a
  member, and the Private list shows the other room only.
- Two observations for the client and the server:
  - the room's row stayed in the Private list after the owner change that
    left the room, until the page was reloaded: the leave helper keeps
    the row for a portal administrator, who keeps reading an ordinary
    room after leaving it, while the server refuses them a private room
    (`private-rooms-admin-leave`);
  - the audit row of the owner change carries an empty action text next
    to the revocation and the leave rows (server, `DocumentsActionMapper`
    or the room-owner-changed resource, to check).
- The member's side (the letter wording, opening the room as the new
  owner, the download that decrypts, the reopen of the saved document)
  is the owner's to check in the member's browser.
- A deep link to a private room without its `/filter` segment
  (`/private/9064440`) was rewritten by the client to
  `/private/undefined/filter?...` and showed the Private list instead of
  the room. `/rooms/shared/5735991` does the same
  (`/rooms/shared/undefined/filter?...`), so it is the client's handling
  of a bare room address in every section, not a private-rooms matter;
  the addresses the client builds carry `/filter`.
