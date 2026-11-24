# Spec Delta

## ADDED Requirements

### Requirement: SDK private pages are framed only by the portal's own origin
The SDK SHALL let only pages of the portal's own origin frame its private pages, and SHALL send them with same-origin opener and resource policies. In this version the private pages SHALL NOT be offered to embedding hosts of another origin, trusted or not; such hosts get private rooms through the embedded client frame.

#### Scenario: Private page framed by the portal
- **WHEN** a page of the portal's own origin frames `/sdk/private`
- **THEN** the private page renders in the frame

#### Scenario: Private page framed by another origin
- **WHEN** a private route is requested through the SDK proxy
- **THEN** the response allows framing by the portal's own origin alone and carries same-origin opener and resource policies, also when the portal trusts other origins for its SDK

### Requirement: SDK owner change wraps the candidate's missing files
The SDK SHALL transfer a private room to a new owner as the room-membership requirement "Ownership transfer wraps the candidate's missing files" describes: it wraps the files the server lists as missing for the candidate before it asks for the transfer, and counts with Common:EncryptedReencryptPartialFailure the files that stay missing or that the server names when it refuses the transfer.

#### Scenario: Missing entries wrapped before the transfer
- **WHEN** the owner transfers a private room in the SDK to a member who lacks an entry on some of its encrypted files
- **THEN** those files gain the member's entry before the transfer is asked, and the member becomes the owner

#### Scenario: Entries still missing
- **WHEN** some of those files cannot be wrapped for the candidate
- **THEN** the transfer is not asked, the owner stays and Common:EncryptedReencryptPartialFailure counts the files

#### Scenario: Transfer refused by the server
- **WHEN** the server refuses the transfer with 409 because the candidate still lacks an entry on an encrypted file
- **THEN** the owner stays, Common:EncryptedReencryptPartialFailure counts the files the server lists as missing, and no text of the server appears

#### Scenario: Unlock declined
- **WHEN** the owner declines to unlock their identity for the transfer
- **THEN** nothing is read or written, the owner stays and Common:EncryptionUnlockRequired is shown

## MODIFIED Requirements

### Requirement: SDK private surface honours the opt-in
The SDK private routes SHALL render the private-rooms list, room and archive pages only when the host has passed the private-rooms opt-in (the `privateRooms` property of the frame configuration); without it they SHALL render the "feature not available" view.

#### Scenario: Host passes the opt-in
- **WHEN** the host configuration enables private rooms and a signed-in user opens `/sdk/private`
- **THEN** the private rooms list renders

#### Scenario: Flag absent
- **WHEN** the host configuration does not enable private rooms
- **THEN** `/sdk/private`, `/sdk/private/[roomId]` and `/sdk/private/archive` render the not-available view and make no key or room requests

### Requirement: Content security policy for the private surface
The SDK SHALL apply a content security policy to the private routes that allows inline scripts and styles and WebAssembly evaluation, takes every other source from the SDK's own origin, with data and blob addresses only where the page builds them itself, and allows connections to the SDK's own origin and, in production, to any https origin, since encrypted file contents may come from the storage's own address. Development builds also allow plain and socket connections.

#### Scenario: Private page served
- **WHEN** a private route is requested through the SDK proxy
- **THEN** the response carries the private-surface content security policy

#### Scenario: Connections in production
- **WHEN** a private route is requested from a production build
- **THEN** the policy allows connections to the SDK's own origin and to https origins only, and allows no evaluation of strings as scripts

### Requirement: Membership from every entry point
The SDK SHALL run the private-room flows (invite with re-wrap, owner change with key checks and current members as candidates, room edit showing the private badge) from every place they can be started: the private rooms list, the info panel and the header menu of an open private room.

#### Scenario: Invite from the header of an open room
- **WHEN** the user invites a member from the header menu of an open private room
- **THEN** the identity is unlocked first and every encrypted file of the room gains an entry for the invitee

#### Scenario: Owner change from the header of an open room
- **WHEN** the user changes the owner from the header menu of an open private room
- **THEN** only current members are candidates and a candidate without a verified key is refused

#### Scenario: Info panel menu of an open room
- **WHEN** the user picks edit, invite or change owner in the info panel menu of an open private room
- **THEN** the private flow of that action starts, as from the private rooms list

#### Scenario: Edit from the info panel of an open room
- **WHEN** the user picks edit in the info panel menu of an open private room
- **THEN** the private room's edit dialog opens with the private badge

#### Scenario: Invite from the info panel of an open room
- **WHEN** the user picks invite in the info panel menu of an open private room
- **THEN** the private invite panel opens, offering people only

#### Scenario: Owner change from the info panel of an open room
- **WHEN** the user picks change owner in the info panel menu of an open private room
- **THEN** the private owner-change dialog opens with the current members as candidates

### Requirement: Translations needed by the private surface are bundled
The SDK SHALL ship every translation key the private surface renders; no component the private pages render, whichever route group it comes from, SHALL render a raw key. Keys that belonged to other namespaces are moved into Common or their namespace is bundled.

#### Scenario: Key from another namespace
- **WHEN** a private-surface component references a key that used to live outside Common (for example the remove-member dialog title)
- **THEN** the translated text is shown in the user's language, never the raw key

#### Scenario: Quota tooltip
- **WHEN** an upload in the SDK private surface fails on quota
- **THEN** the tooltip text is translated, not a raw key

#### Scenario: Room limit reached
- **WHEN** a user starts creating a room on the SDK private rooms list while the portal is at or near its room limit
- **THEN** the quota warning shows its title, text and buttons translated, and no raw key

### Requirement: Private room creation waits for a known key list
The SDK SHALL treat a key list that is not loaded, or failed to load, as one that may hold a key: the private-room dialog SHALL NOT offer key generation or import until the list is known to be empty. Creating a room while the list is unknown SHALL load it first, or wait for the load already running; a load that fails SHALL show Common:EncryptionKeysLoadFailed and create nothing.

#### Scenario: Key list still loading
- **WHEN** a user who holds a key opens the private-room dialog before the key list has loaded
- **THEN** the dialog offers no key generation, and its Create button creates the room once the list has loaded

#### Scenario: Create pressed during the load
- **WHEN** a user who holds a key presses Create in the private-room dialog while the key list is being loaded
- **THEN** the room is created once that load ends with the key, and Common:EncryptionKeysLoadFailed is not shown

#### Scenario: Key list failed to load
- **WHEN** the key list fails to load and the user presses Create in the private-room dialog
- **THEN** Common:EncryptionKeysLoadFailed is shown, no key is generated and no room is created

#### Scenario: Key list known to be empty
- **WHEN** the key list has loaded and holds no key
- **THEN** the dialog offers key generation as before

### Requirement: Upload panel follows encrypted uploads
The SDK upload panel SHALL show each encrypted upload's progress and its encrypting phase, SHALL take a file the user cancels, from its row or in the name-clash dialog, out of the panel and its progress, SHALL fail a file stopped by a lock of the identity with Common:EncryptionLockedUpload, SHALL stop every running upload on "Cancel all", and SHALL warn with Common:EncryptedUploadNotSharedWith when a member was left out because their key change was refused.

#### Scenario: Encrypting phase
- **WHEN** a file is being encrypted before it is sent
- **THEN** its row in the upload panel shows the encrypting label and then its progress

#### Scenario: Member left out
- **WHEN** a member's key change is refused during an upload
- **THEN** the file is uploaded for the other members and Common:EncryptedUploadNotSharedWith names the member

#### Scenario: Name clash cancelled
- **WHEN** the user cancels the name-clash dialog of an upload into a private room
- **THEN** the files of that upload leave the panel and its progress, nothing of them is sent, and the upload button does not report them as uploaded

#### Scenario: Identity locked during an upload
- **WHEN** the identity is locked while files are uploading into a private room
- **THEN** each file not yet stored fails with Common:EncryptionLockedUpload and the upload button shows the failure

#### Scenario: Cancel all with two uploads running
- **WHEN** two uploads into private rooms are running and the user presses "Cancel all"
- **THEN** both stop, no further byte of either is sent, and no file of either keeps uploading out of sight of the panel

### Requirement: SDK explains a refused access change in a private room
The SDK SHALL show Common:EncryptedAccessChangeRefused when the server refuses with 403 a leave, a member's removal or a member's role change in a private room, MUST NOT show the server's own message text for it, and SHALL close its leave dialog after a refused leave, as the client does. A leave refused after an owner change SHALL close the owner-change dialog, since the transfer took place. Any other failure SHALL be shown as before, the leave dialog staying open.

#### Scenario: Leave refused
- **WHEN** a member confirms leaving a private room in the SDK and the server answers 403
- **THEN** Common:EncryptedAccessChangeRefused is shown, the dialog closes, and no text of the server appears

#### Scenario: Removal or role change refused
- **WHEN** a manager removes a member of a private room or changes the member's role in the SDK and the server answers 403
- **THEN** Common:EncryptedAccessChangeRefused is shown, the member stays as listed, and no text of the server appears

#### Scenario: Leave fails for another reason
- **WHEN** a member confirms leaving a private room in the SDK and the request fails without a 403
- **THEN** the failure is shown and the dialog stays open

#### Scenario: Leave after an owner change refused
- **WHEN** the owner hands a private room over in the SDK with the leave option and the server answers 403 to the leave
- **THEN** Common:EncryptedAccessChangeRefused is shown once, the owner-change dialog closes, the room shows its new owner, and no text of the server appears

### Requirement: Members grouped without groups and guests
The SDK members view of a private room SHALL bucket members into administrators, users and expected members, and SHALL NOT list groups or guests because they hold no encryption identity. A search of the members SHALL list only members the grouped view would list.

#### Scenario: Members listed
- **WHEN** the members panel of a private room opens
- **THEN** three sections are shown: administrators, users and expected

#### Scenario: Members searched
- **WHEN** the user searches the members of a private room and the matches include a member the grouped view leaves out, such as a guest or a disabled user who is not the owner
- **THEN** that member is not listed in the results
