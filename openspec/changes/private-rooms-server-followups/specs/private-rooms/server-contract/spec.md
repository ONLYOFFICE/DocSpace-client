# Spec Delta

## ADDED Requirements

### Requirement: Key check only when access is first granted
The server SHALL demand encryption keys of a user only when the user first gets access to a private room. It SHALL NOT refuse, for want of keys, a leave, a removal or a role change of a member who already has access, nor an owner change because the previous owner has no keys. It SHALL refuse a group as a member of a private room with 403 and a message of its own, and SHALL let a group that a private room still holds be removed.

#### Scenario: Member without keys leaves
- **WHEN** a member of a private room whose key set is empty leaves the room
- **THEN** the leave succeeds and the server MUST NOT answer 403

#### Scenario: Member without keys removed or given another role
- **WHEN** the owner removes a member whose key set is empty, or changes that member's role
- **THEN** the change succeeds

#### Scenario: User without keys invited
- **WHEN** a user without keys is given access to a private room for the first time
- **THEN** the server refuses with 403

#### Scenario: Group added
- **WHEN** a group is added to a private room
- **THEN** the server refuses with 403, and the answer does not carry the type of a refusal for want of keys

#### Scenario: Group removed
- **WHEN** a group that a private room still holds is removed from it
- **THEN** the removal succeeds

#### Scenario: Address without an account invited
- **WHEN** a private room is shared with an e-mail address that names no account
- **THEN** the server refuses as for a user without keys

### Requirement: Key refusals carry a stable reason
The server SHALL mark a refusal caused by missing encryption keys with a reason a client can read without comparing message text, distinct from a refusal by access rights: the answer carries `ASC.Web.Studio.Core.EncryptionKeyNotSetException` in `error.type`.

#### Scenario: Refusal for want of keys
- **WHEN** a request is refused because a user has no encryption keys
- **THEN** the answer is a 403 whose `error.type` is `ASC.Web.Studio.Core.EncryptionKeyNotSetException`, whatever the language of its message

#### Scenario: Refusal by access rights
- **WHEN** the same request is refused because the caller may not change the access
- **THEN** `error.type` of the answer is another one

### Requirement: A user turned into a guest loses private rooms and keys
The server SHALL, when a user is turned into a guest, remove the user from every private room, the rooms the user owned included once they have passed to the new owner, remove the wrapped file keys the user held for the files of those rooms, and delete the user's stored encryption key pair. It SHALL NOT restore any of them when the guest is made a user again.

#### Scenario: Member turned into a guest
- **WHEN** a member of a private room is turned into a guest
- **THEN** the guest is not among the members of the room, holds no file key of it, and the request for the guest's own keys answers with no key

#### Scenario: Owner turned into a guest
- **WHEN** the owner of a private room is turned into a guest and the room passes to another user
- **THEN** the room belongs to the new owner and the previous owner is not among its members

#### Scenario: Guest invited afterwards
- **WHEN** a share request of a private room names a guest who was a user with keys
- **THEN** the server refuses it, since the guest holds no key

#### Scenario: Guest made a user again
- **WHEN** such a guest is made a user again
- **THEN** the user holds no key and is in no private room until a key is created and an invitation is sent

### Requirement: A change to guest is refused while the rooms cannot pass on
The server SHALL refuse to turn a user into a guest, before anything is changed, while the user named to take the user's private rooms holds no encryption key or lacks the key of an encrypted file of one of them.

#### Scenario: New owner cannot take the rooms
- **WHEN** the owner of a private room is turned into a guest and the user named to take the rooms holds no encryption key, or no key of an encrypted file of the room
- **THEN** the server answers 403 with `ASC.Files.Core.Helpers.PrivateRoomOwnershipException` in `error.type`, and the user's type, rooms and keys are as they were

### Requirement: The member update makes no owner of a private room a guest
The server SHALL refuse, before anything is saved, a member update that turns the owner of a private room into a guest, since that request names nobody to take the rooms. It SHALL make any other user turned into a guest by a member update leave the private rooms and lose the keys as the type change does, and SHALL finish an interrupted exit when the request is repeated for that guest.

#### Scenario: Owner of a private room
- **WHEN** a member update asks to make the owner of a private room a guest
- **THEN** the server answers 403 with `ASC.Files.Core.Helpers.PrivateRoomOwnershipException` in `error.type`, and the user's type, rooms and keys are as they were

#### Scenario: Member of a private room
- **WHEN** a member update makes a member of a private room a guest
- **THEN** the guest is not among the members of the room, holds no file key of it and no key pair

### Requirement: A share change of a private room is applied whole or not at all
The server SHALL check, before it stores any share of a request that changes the access to a private room, that every user who would get access for the first time holds an encryption key, and SHALL refuse the whole request when one does not. It SHALL NOT give access to some users of a refused request.

#### Scenario: Invitation with a user without a key
- **WHEN** a request gives access to a private room to a user with a key and to a user without one, in either order
- **THEN** the server refuses the request and neither user is among the members of the room

#### Scenario: Same invitation without that user
- **WHEN** the request names only the user with a key
- **THEN** the user is added to the members

### Requirement: Private rooms and their folders are not favourites
The server SHALL NOT mark a private room or a folder of a private room as a favourite, as it does not mark an encrypted file, and SHALL NOT list one in the Favourites section.

#### Scenario: Private room sent to the favourites
- **WHEN** a member sends a private room or a folder of one to the favourites, alone or with other entries
- **THEN** it is not marked, the other entries are, and the Favourites listing does not hold it

#### Scenario: Private room marked earlier
- **WHEN** the Favourites are listed by a user who marked a private room or a folder of one before the server stopped marking them
- **THEN** the listing does not hold it

### Requirement: Private rooms are not listed in the Forms area
The server SHALL NOT list a private room in the Forms area or the form-template area of the rooms listing.

#### Scenario: Forms area
- **WHEN** the rooms of the Forms area or of the form-template area are requested on a portal whose data holds a room of the form-filling type with the private setting
- **THEN** that room is not in the answer, and a form-filling room without the setting is

### Requirement: Private section root is titled in the user's language
The server SHALL answer the title of the private section root in the culture of the calling user.

#### Scenario: User with another culture
- **WHEN** a user whose culture is not the default one requests the root folders
- **THEN** the private section root carries the title in that user's language

### Requirement: Version comment refused for an encrypted file
The server SHALL refuse to store a version comment for an encrypted file, since it would hold user text in the clear.

#### Scenario: Comment sent for an encrypted file
- **WHEN** a version comment is sent for a file of a private room
- **THEN** the server refuses and stores nothing

## MODIFIED Requirements

### Requirement: File public keys
The server SHALL return, for one file in a private room, active or archived, the keys of every user holding a share record of their own (not a group or a link) on the file or on any folder above it up to the room, plus the room's owner; it SHALL NOT return a user who no longer has access to the room, the file's creator included. It SHALL skip users without stored keys or a public key, keep the private half only on the caller's entries, and answer 415 outside a private room. Existing access entries are not consulted.

#### Scenario: Keys of a file
- **WHEN** a reader of the file requests its public keys
- **THEN** every user who reaches the file through a user share and has stored keys is returned, whether or not an access entry exists for them

#### Scenario: File in an archived private room
- **WHEN** a reader requests the public keys of a file in an archived private room
- **THEN** the keys are returned as for a file in an active private room, and the server MUST NOT answer 415

#### Scenario: Room owner who did not create the file
- **WHEN** the public keys of a file that another member created are requested, and the room owner has stored keys
- **THEN** the room owner's keys are in the answer

#### Scenario: Creator who left the room
- **WHEN** the public keys of a file are requested after its creator left the room
- **THEN** the creator's keys MUST NOT be in the answer

### Requirement: Owner change requires the new owner's keys
The server SHALL refuse with 403 an ownership change of a private room when the new owner has no encryption keys or an empty key set, and SHALL refuse with 409, leaving the owner as it is, when the new owner, unless they created the room, holds no access entry on some encrypted file of the room, subfolders included; the missing files are read through the missing-file-keys request. It SHALL let a DocSpace admin who is a member of a private room, in any role, change its owner, and SHALL refuse an administrator who is not a member. When the data of a user is removed or reassigned, a private room of that user SHALL go to the user who takes the data when that user holds an encryption key, else to the portal owner when the portal owner holds one, and SHALL otherwise stay with the user; the progress of the operation SHALL name the rooms that stayed in `keptPrivateRoomIds`.

#### Scenario: New owner without keys
- **WHEN** ownership of a private room is given to a user without keys
- **THEN** the change is refused with 403

#### Scenario: New owner with keys
- **WHEN** ownership is given to a user with keys who holds an access entry on every encrypted file
- **THEN** the room owner changes

#### Scenario: New owner missing entries
- **WHEN** ownership is given to a user with keys who lacks an access entry on an encrypted file, in the room or in a subfolder
- **THEN** the server answers 409 and the owner stays, until the entry is written and the change is asked again

#### Scenario: Room without encrypted files
- **WHEN** ownership of a private room holding plain files only is given to a user with keys
- **THEN** the room owner changes

#### Scenario: Previous owner without keys
- **WHEN** an owner whose own key set is empty gives the room to a user with keys
- **THEN** the change succeeds, since keys are demanded only of a user who first gets access

#### Scenario: Rooms of a deleted user
- **WHEN** the rooms of a user being deleted are reassigned to a user with keys who lacks entries
- **THEN** the reassignment completes

#### Scenario: Rooms of a deleted user reassigned to a user without keys
- **WHEN** the rooms of a user being deleted are reassigned to a user without encryption keys, and the portal owner holds one
- **THEN** the private rooms belong to the portal owner, and `keptPrivateRoomIds` of the progress is empty

#### Scenario: Nobody can take the rooms
- **WHEN** the data of a user is removed or reassigned and neither the user who takes it nor the portal owner holds an encryption key
- **THEN** the private rooms stay with the user and `keptPrivateRoomIds` of the progress holds their ids

#### Scenario: Administrator who is a member hands a room over
- **WHEN** a DocSpace admin who is a member of a private room gives it to a user with keys who holds an access entry on every encrypted file
- **THEN** the room owner changes, and the room reports the right to change the owner to that administrator

#### Scenario: Administrator outside the room
- **WHEN** a DocSpace admin who is not a member of a private room asks to change its owner
- **THEN** the server answers 403

### Requirement: File rights reported to the owner of a private room
The server SHALL report on a file of an active private room, to the room's owner, the comment and review rights as granted, and SHALL deny the rights of operations that do not work on encrypted content: rename, the history rights, lock, copy-link, custom-filter, form-gallery, form filling, AI, conversion, embedding and vectorization. It SHALL deny the AI right on a private room. It SHALL deny rename, the history rights, lock, copy-link, custom-filter and form-gallery on an encrypted file in an archived private room as well.

#### Scenario: Spreadsheet in an active private room
- **WHEN** the owner of an active private room lists an encrypted spreadsheet in it
- **THEN** the file reports Comment and Review as true, and Rename, ReadHistory, EditHistory, Lock, CopyLink, CustomFilter, SubmitToFormGallery, FillForms, StartFilling, FillingStatus, ResetFilling, StopFilling, OpenForm, AskAi, Convert, Embed and Vectorization as false

#### Scenario: PDF in an active private room
- **WHEN** the owner of an active private room of the custom type lists an encrypted PDF in it
- **THEN** the file reports OpenForm as true, and FillForms and SubmitToFormGallery as false

#### Scenario: Image in an active private room
- **WHEN** the owner of an active private room lists an encrypted image in it
- **THEN** the file reports SubmitToFormGallery and OpenForm as false

#### Scenario: File in an archived private room
- **WHEN** the owner of an archived private room lists an encrypted file in it
- **THEN** the file reports Comment, Review, Rename, ReadHistory, EditHistory, Lock, CopyLink, CustomFilter, SubmitToFormGallery and OpenForm as false

#### Scenario: AI right on a private room
- **WHEN** the owner lists a private room
- **THEN** the room reports CanUseAi as false

### Requirement: The E2E rooms app gates private rooms
The server SHALL serve private rooms only while the E2E rooms app of the portal is on. While the app is off, `GET files/@private` answers 404, the root folders request leaves the Private root out, no rooms listing holds a private room whatever area or filter it names, the creation of a private room is refused with 403, and a request that names an existing private room, a folder or a file of it by id is refused: its content, its download, its opening in the editors, its members and share changes, and the keys of the room and of its files. The routes of the caller's own encryption key pair SHALL NOT depend on the app. Switching the app off SHALL NOT delete anything: with the app on again the rooms, their files, their members and their keys are as they were.

#### Scenario: App off, section requested
- **WHEN** the E2E rooms app is off and a client requests `GET files/@private`
- **THEN** the server answers 404

#### Scenario: App off, root folders
- **WHEN** the E2E rooms app is off and a client requests the root folders
- **THEN** the response has no Private root

#### Scenario: App off, rooms listing
- **WHEN** the E2E rooms app is off and a member with keys lists rooms with the private rooms area or the private filter
- **THEN** the answer holds no private room

#### Scenario: App off, private room created
- **WHEN** the E2E rooms app is off and a user with keys creates a private room
- **THEN** the server answers 403 and creates nothing

#### Scenario: App off, private room requested by id
- **WHEN** the E2E rooms app is off and a member requests a private room, a folder or a file of it by id, downloads an encrypted file, opens it in the editors or reads the keys of the room or of the file
- **THEN** the server answers 404 for the room, the folder, the file and its opening in the editors, refuses the other requests, and answers with nothing of the room

#### Scenario: App off, other private-room routes
- **WHEN** the E2E rooms app is off and a user who holds a key reads, replaces or deletes the user's own key pair
- **THEN** the server handles the request as while the app is on

#### Scenario: App off on a portal that is not standalone
- **WHEN** the E2E rooms app is off, or is not listed in the configuration of the installation, whatever kind of installation it is
- **THEN** the server answers as in the scenarios above

#### Scenario: App switched on again
- **WHEN** the E2E rooms app is switched on after it was off
- **THEN** every private room, its files, its members and its keys are served as before the app was switched off

### Requirement: New-items counts include private rooms
The server SHALL count new items of private rooms under the Private root: that root's new-items count, its news listing and mark-as-read on it. The Rooms root's count, news listing and mark-as-read SHALL NOT cover private rooms. When the marks of an entry of a private room are cleared for a user, the server SHALL send that user the new-items event of the Private root with the root's count after the clearing.

#### Scenario: New file in a private room
- **WHEN** a member uploads a file into a private room
- **THEN** the Private root's new-items count of the other members grows, the Rooms root's does not, and the Private root's news listing includes the file

#### Scenario: Marks of a private room cleared
- **WHEN** the new-items marks of a file or a folder of a private room are cleared for a user
- **THEN** the user receives the new-items event of the Private root carrying the count left over the user's private rooms, rooms with notifications switched off left out

## RENAMED Requirements

- FROM: `### Requirement: The E2E rooms app gates the private section`
- TO: `### Requirement: The E2E rooms app gates private rooms`
