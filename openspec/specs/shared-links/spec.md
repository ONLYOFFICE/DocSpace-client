# shared-links Specification

## Purpose

Defines how the web client shows and manages shared (external) links of files, folders and rooms: where the
link controls appear, how a link is created, copied, changed, revoked or deleted, what the link settings panel
offers, how the portal-wide restriction of external sharing changes all of that, and what a visitor sees when
opening a room link in the browser.

Server counterpart: `../server/openspec/specs/shared-links` (which entity accepts a link, limits, settings by
room type, roles that manage links) and the link operations of `../server/openspec/specs/files-settings`. The
client never decides those rules itself: it shows what the server reports per entity (`canShare`,
`shareSettings`, `availableShareRights`) and per link (`canEditInternal`, `canEditExpirationDate`,
`canEditDenyDownload`, `canRevoke`, `isExpired`). Operations called: `getFileLinks`, `createFilePrimaryExternalLink`,
`setFileExternalLink`, `getFolderLinks`, `createFolderPrimaryExternalLink`, `setFolderPrimaryExternalLink`,
`getRoomsPrimaryExternalLink`, `setRoomLink`, `getExternalShareData`, `applyExternalSharePassword`.

Out of scope: sharing with accounts and groups, Shared with me, Recent and Favorites (`file-sharing`); invitation
links (`invitations`); the administrator's external sharing settings page (`access-settings`); the editor's
share dialog (`editor-integration`); the embed code panel (`sdk-embedding`); links of private rooms
(`private-rooms`); links in the AI rooms (change `ai-chat-agents-design`).

Implementation: `packages/shared/components/share`, `packages/shared/dialogs/EditLinkPanel`,
`packages/shared/services/share-link.service.ts`, the Members view of the info panel
(`packages/client/src/pages/Home/InfoPanel/Body/views/Members`), the copy-link actions of the context options
store, `packages/client/src/pages/PublicRoom`.

## Requirements

### Requirement: Where link controls appear

The client SHALL show the links of a file or folder in the Share tab of the info panel only when the item's
`canShare` is true; otherwise the info panel SHALL fall back to the Details view. The links of a room SHALL be
shown in the Members tab only for a Public, Custom or Form filling room that is not private, only to a user
with the room's `EditAccess`, and not for a room template or while the member search has a value.

#### Scenario: Item that cannot be shared

- **WHEN** the info panel opens on a file whose `canShare` is false
- **THEN** no Share tab content is shown and the Details view opens instead

#### Scenario: Room types without a links block

- **WHEN** a Room manager opens the Members tab of a Collaboration room, a Virtual Data Room or a private room
- **THEN** no links block is shown

#### Scenario: Member without the right to manage access

- **WHEN** a Viewer opens the Members tab of a Public room
- **THEN** the links block is not shown

### Requirement: Creating the first link

When an item that may be shared has no link, the client SHALL offer a single create row: `Common:CreateAndCopy`
for a file or folder, `Files:CreateNewLink` for a room. Activating it SHALL create the primary link, show it in the
list, copy its address and confirm with a toast. In the Share tab the create row SHALL be a keyboard Tab stop
activated by Enter, and the created link's row SHALL take the focus.

#### Scenario: File without links

- **WHEN** a user opens the Share tab of a file that may be shared and has no link
- **THEN** the create row `Common:CreateAndCopy` is shown
- **AND** activating it creates the primary link, lists it and copies its address

#### Scenario: Keyboard creation

- **WHEN** the create row is reached with Tab and Enter is pressed
- **THEN** the link is created and the focus moves into the new link's row

#### Scenario: Creation fails

- **WHEN** the server refuses to create the link
- **THEN** the server's message is shown as an error toast and the list returns to its previous state

### Requirement: Default access of a new link

A link created by the client SHALL carry Read access, except: a PDF form in a Form filling room gets Filling
when available; another PDF form gets Editing when available, else Filling; a folder in a Form filling room gets
Filling.

#### Scenario: Ordinary file

- **WHEN** a user creates a link for a document in My documents
- **THEN** the link is created with Read access

#### Scenario: Form in a Form filling room

- **WHEN** a user creates a link for a PDF form in a Form filling room that allows Filling for links
- **THEN** the link is requested with Filling access

### Requirement: Default audience of a new link

A file or folder link SHALL be requested for DocSpace users only when the portal's default internal-link setting
is on. A room link added from the Members tab SHALL be requested so also when external sharing is restricted for
rooms, except in a Public room, whose links are always requested for anyone.

#### Scenario: Default internal links

- **WHEN** the default internal-link setting is on and a user adds a link to a file in My documents
- **THEN** the link is requested as a link for DocSpace users only

### Requirement: Adding more links and the link limit

Once an item has a link, the header of the links block SHALL offer an add button that creates an additional
link (or the primary link when none exists). The button SHALL be absent when the item's `shareSettings` allow
no additional link, and disabled, with the tooltip `Common:MaximumNumberOfExternalLinksCreated`, once the item
holds as many links as its `shareSettings` allow (additional plus primary).

#### Scenario: Limit reached

- **WHEN** a file already has as many links as its share settings allow
- **THEN** the add button is disabled and its tooltip says `Common:MaximumNumberOfExternalLinksCreated`

#### Scenario: Only one link allowed

- **WHEN** the item's share settings allow no additional link
- **THEN** no add button is shown

### Requirement: Contents of a link row

Each link row SHALL show the link's title with a copy button, the expiration line, the audience selector, the
access selector and an actions menu. A password-protected link SHALL be marked as locked. The audience selector
SHALL be replaced by a static icon when the link's `canEditInternal` is false, and the access selector by a
static icon when only one access is offered.

#### Scenario: File with a link

- **WHEN** a user opens the Share tab of a file that has one link
- **THEN** the link is listed with its title, a copy button, its expiration line and its access

#### Scenario: Copy button by keyboard

- **WHEN** the copy button of a link is reached with Tab and activated
- **THEN** the link is copied once per activation

### Requirement: Access offered for a link

The access selector of a link SHALL offer only the rights the server lists for the item in
`availableShareRights` (the primary list for the primary link, the external list otherwise). A file link SHALL use
the file labels (`Common:Editing`, `Common:Review`, `Common:Comment`, `Common:ReadOnly`, `Common:Filling`,
`Common:CustomFilter`); a folder or room link SHALL use the role labels (`Common:Editor`, `Common:RoleReviewer`,
`Common:Commentator`, `Common:Viewer`, `Common:Filling`).

#### Scenario: Room link roles

- **WHEN** a Room manager opens the access selector of a Custom room link
- **THEN** the options are the room roles available for links, each with its role description

### Requirement: Changing a link from its row

Choosing another access, audience or expiration in a link row SHALL save the link at once and copy its address
with the confirmation toast. Choosing no access SHALL remove the link with `Common:LinkRemoved`; Deny access SHALL
keep it with `Common:LinkAccessDenied`. Changing the access or audience of an expired link SHALL also extend it to
seven days from now.

#### Scenario: Access changed

- **WHEN** a user switches a file link from Read only to Comment
- **THEN** the link is saved with Comment access and copied, and a toast confirms the copy

#### Scenario: Expired link changed

- **WHEN** a user changes the access of an expired link
- **THEN** the link is saved with an expiration seven days from now

### Requirement: Filling access for a form outside the rooms

Choosing Filling for a link of a file outside the rooms SHALL first open the form sharing panel; the access SHALL
change only when that panel is confirmed. Inside the rooms Filling SHALL be applied at once.

#### Scenario: PDF form in My documents

- **WHEN** a user picks Filling for the link of a PDF form in My documents
- **THEN** the form sharing panel opens and the link keeps its access until the panel is confirmed

### Requirement: A current access that is no longer available

When a link carries an access that the item's available rights no longer list, the client SHALL keep that access
selected and shown as disabled, in the link row and in the link settings panel, instead of showing an empty
selector or replacing it. The settings panel SHALL disable saving and show `Common:RoleForLinkNotAvailable` until
an available role is picked.

#### Scenario: Share tab row

- **WHEN** a file link has Read only access and Read is no longer among the available link rights
- **THEN** the row's access selector shows Read only as the selected, disabled option, next to the enabled available ones

#### Scenario: Settings panel

- **WHEN** the settings panel of such a link is opened
- **THEN** the current access is selected and disabled, `Common:RoleForLinkNotAvailable` is shown and Save is disabled
- **AND** picking an available role enables Save

### Requirement: Link expiration in the row

When the link's `canEditExpirationDate` is true, the row SHALL show when the link expires or that it is unlimited,
with a menu of 12 hours, 1 day, 7 days, Unlimited and Custom (a calendar). Otherwise the row SHALL show
`Common:NoTimeLimit`. An expired link SHALL show `Common:LinkExpired` with `Common:ReactivateLink`, which saves the
link again with an expiration seven days from now.

#### Scenario: Primary link of a Public room

- **WHEN** the primary link of a Public room is listed
- **THEN** its row shows `Common:NoTimeLimit` and offers no expiration menu

#### Scenario: Reactivating

- **WHEN** a user activates `Common:ReactivateLink` on an expired link
- **THEN** the link is saved with an expiration seven days from now

### Requirement: Copying a link

Activating a link's title or copy button SHALL copy its address and show `Common:LinkCopiedToClipboard` with a
text that names the audience, the access, a password and a download restriction when set, and the expiration.
Copying an expired link SHALL copy nothing and show `Common:LinkExpired`.

#### Scenario: Copy an expired link

- **WHEN** a user activates the copy button of an expired link
- **THEN** nothing is copied and the error `Common:LinkExpired` is shown

### Requirement: Copying the shared link from the file list

The copy-link quick button and the context menu item `Common:CopySharedLink` of an item that may be shared SHALL
copy its primary link, creating it when missing, with the same toast; the toast SHALL offer a link that opens the
item's Share or Members tab unless that tab already shows the item. From the context menu an expired primary link
SHALL be refused with an error instead of being copied.

#### Scenario: Toast opens the share tab

- **WHEN** a user copies the shared link of a file from Shared with me and activates the link in the toast
- **THEN** the info panel opens on the file

### Requirement: Link actions menu

A link's actions menu SHALL offer `Common:LinkSettings`, `Common:CopySharedLink`, `Common:Embed` and, for a room
link, `Files:CopyLinkPassword` (enabled only for a password-protected link), then `Common:RevokeLink` when the
link's `canRevoke` is true or `Common:Delete` otherwise. Embed SHALL be disabled for an item without the Embed
right and for an expired room link. A room in the Archive SHALL show its links without the actions menu.

#### Scenario: Room link with a password

- **WHEN** a Room manager opens the actions menu of a password-protected Public room link
- **THEN** `Files:CopyLinkPassword` is enabled and copies the password with `Common:PasswordSuccessfullyCopied`

#### Scenario: Archived room

- **WHEN** a user opens the Members tab of an archived room that has a primary link
- **THEN** the link is listed without an actions menu and its access and expiration controls are disabled

### Requirement: Revoking and deleting a link

Revoke SHALL replace the link with a new one at the same place and report `Common:GeneralLinkRevokedAndCreatedSuccessfully`;
Delete SHALL remove the link from the list and report `Common:LinkRemoved`. For a room link both SHALL first ask
for confirmation in the delete-link dialog.

#### Scenario: Deleting an additional file link

- **WHEN** a user deletes an additional link of a file from its actions menu
- **THEN** the link disappears from the list and `Common:LinkRemoved` is shown

### Requirement: Link settings panel

The link settings panel SHALL offer the role (when more than one is available or the current one is unavailable),
the link name, the audience (when `canEditInternal`), password protection, the download restriction (not in a
Form filling room; switched on and locked when `canEditDenyDownload` is false) and the time limit (only when
`canEditExpirationDate`; otherwise a note for Public and Form filling rooms).

#### Scenario: Single role available

- **WHEN** the panel opens for a link whose item offers one access
- **THEN** the role block is not shown

#### Scenario: Several roles available

- **WHEN** the panel opens for a link whose item offers several accesses
- **THEN** the role block is shown

### Requirement: Saving the link settings

Save SHALL be enabled only when something changed, the name is not empty, the selected role is available and the
chosen expiration lies in the future. An empty or invalid password with protection on SHALL be refused in the
panel. Enter SHALL save from a text field or with nothing focused, and leave Enter on other controls to them. A
successful save SHALL close the panel; a failed one SHALL keep it open with the edited values and the server's
message.

#### Scenario: Save succeeds

- **WHEN** a user changes the link name and saves
- **THEN** the link is saved and the panel closes

#### Scenario: Save fails

- **WHEN** the server refuses the save
- **THEN** the panel stays open with the edited values and the error is shown

#### Scenario: Enter on a control

- **WHEN** Enter is pressed on a toggle or a calendar day in the panel
- **THEN** that control acts and the panel is not saved

### Requirement: External links blocked by the administrator

When the administrator has switched external sharing off and the restriction applies to the area of the item
(rooms for items in Rooms, documents otherwise), a link for anyone SHALL show `Common:BlockedByAdmin`, hide its
expiration line, show its access as a static icon and offer only `Common:CopyLink` and Revoke or Delete in its
actions menu. Links for DocSpace users only SHALL stay unchanged.

#### Scenario: Blocked label

- **WHEN** external sharing is off for documents and a file in My documents has a link for anyone
- **THEN** the link shows `Common:BlockedByAdmin` and its actions menu offers only Copy link and Delete or Revoke

#### Scenario: Existing links allowed

- **WHEN** external sharing is off for documents with existing links allowed
- **THEN** a link for anyone still shows `Common:BlockedByAdmin`

#### Scenario: Restriction for another area

- **WHEN** external sharing is off for rooms only
- **THEN** links of files in My documents are not marked as blocked

### Requirement: Copying a blocked link

When the administrator blocks existing external links, copying a link for anyone in the restricted area SHALL copy
nothing and show `Common:LinkBlockedByAdminWarning`, from the link row, the quick button and the context menu
alike. When existing links are allowed, such a link SHALL be copied as usual.

#### Scenario: Quick button on a restricted room

- **WHEN** external sharing is off for rooms with existing links blocked and a user presses the copy-link quick button of a Public room
- **THEN** nothing is copied and `Common:LinkBlockedByAdminWarning` is shown

#### Scenario: Context menu on a file inside a restricted room

- **WHEN** the same restriction is on and a user chooses `Common:CopySharedLink` for a file inside a Public room
- **THEN** nothing is copied and `Common:LinkBlockedByAdminWarning` is shown

### Requirement: New links while external sharing is restricted

While external sharing is restricted for the area, the audience option "anyone with the link" SHALL be disabled
with the tooltip `Common:ExternalLinksDisabledByAdmin` in the row and in the settings panel. No link SHALL be offered
for creation in a Public room, nor for a file inside a Public room when existing links are blocked. A room that has
external links SHALL show `Common:ExternalLinksDisabledForGuests` above its links.

#### Scenario: Link type selector

- **WHEN** external sharing is off for documents and a user opens the audience selector of a file link
- **THEN** "anyone with the link" is disabled and its tooltip says `Common:ExternalLinksDisabledByAdmin`

#### Scenario: Public room

- **WHEN** external sharing is off for rooms and a Room manager opens the Members tab of a Public room
- **THEN** no add-link button is shown

#### Scenario: Documents-only restriction

- **WHEN** external sharing is off for documents only
- **THEN** a Public room still offers the add-link button and shows no restriction bar

### Requirement: Public rooms while external sharing is restricted for rooms

While external sharing is restricted for rooms, the create-room dialog SHALL offer the Public room type as
disabled, and a Public room that has external links SHALL carry a warning badge in the room list instead of the
public badge. A restriction for documents only SHALL change neither.

#### Scenario: Create room dialog

- **WHEN** external sharing is off for rooms and a user opens the create-room dialog
- **THEN** the Public room type is disabled

#### Scenario: Room list badge

- **WHEN** external sharing is off for rooms and the room list shows a Public room with external links
- **THEN** the room carries the restricted badge

### Requirement: Opening a room link in the browser

Opening a room link SHALL validate its key with `getExternalShareData`: a valid key SHALL show the room's
contents to a visitor and take a signed-in user to the room in the regular view; a password-protected link SHALL ask for the password and
check it with `applyExternalSharePassword`; an invalid or expired key SHALL show an error page; a link for DocSpace
users only SHALL send an anonymous visitor to sign in and return to the link afterwards.

#### Scenario: Password form

- **WHEN** a visitor opens a password-protected room link
- **THEN** the password form is shown; an empty password is refused with `Common:RequiredField` and a wrong one with `Common:IncorrectPassword`

#### Scenario: Expired link

- **WHEN** a visitor opens an expired room link
- **THEN** an error page is shown and no room content is loaded

#### Scenario: Internal link opened anonymously

- **WHEN** an anonymous visitor opens a link for DocSpace users only
- **THEN** the sign-in page opens and, after signing in, the visitor returns to the link
