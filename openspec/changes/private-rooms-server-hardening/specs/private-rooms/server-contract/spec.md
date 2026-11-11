# Spec Delta

## ADDED Requirements

### Requirement: Room metadata features withheld for private rooms
The server SHALL refuse with 400 a private room creation that turns content indexing on or carries a data lifetime or a watermark that is not explicitly disabled, and SHALL refuse with 400 a private room update that turns indexing on or sends an enabled lifetime or watermark, because each of them requires the server to read or transform the document content. Turning any of them off SHALL stay possible.

#### Scenario: Watermark on a private room
- **WHEN** a room update sets a watermark on a private room
- **THEN** the server refuses the update with 400 and the room is unchanged

#### Scenario: Indexing at creation
- **WHEN** a private room is created with indexing enabled
- **THEN** the server refuses the request with 400 and creates no room

#### Scenario: Lifetime without the enabled flag
- **WHEN** a private room is created with a lifetime object that does not say it is disabled
- **THEN** the server refuses the request with 400

#### Scenario: Settings turned off
- **WHEN** an update of a private room sets indexing off and a disabled lifetime and watermark
- **THEN** the update is applied

### Requirement: Encrypted file titles are validated
The server SHALL refuse with 400, when an upload session opens into a private room or a folder of one, a file name that is not an opaque identifier, a lowercase UUID optionally followed by a dot and a lowercase alphanumeric extension, so that no plaintext file name is stored for an encrypted file; an uppercase UUID or extension and a second dot count as readable.

#### Scenario: Plaintext title on an encrypted upload
- **WHEN** an upload session into a private room carries a human-readable title, an uppercase UUID or extension, or a second dot
- **THEN** the server refuses the session with 400 before any chunk

#### Scenario: Opaque title
- **WHEN** the title is a UUID followed by an extension
- **THEN** the upload is accepted

#### Scenario: Opaque title without an extension
- **WHEN** a file without an extension is uploaded encrypted under a bare UUID
- **THEN** the upload is accepted

### Requirement: Upload session abort
The server SHALL abort an open upload session on request, discarding the chunks received so far, and SHALL answer 404 for a session that does not exist, was finalised, aborted or expired. It SHALL refuse with 403 to abort a session another account opened, and SHALL answer 404 for an abort whose folder segment is not the folder the session uploads into, keeping the session open. The client SHALL call it when an encrypted upload is cancelled after its session opened.

#### Scenario: Cancelled encrypted upload
- **WHEN** the user cancels an encrypted upload after the first chunk was sent
- **THEN** the client aborts the session and no partial file remains in the room

#### Scenario: Session of another account
- **WHEN** a user asks to abort an upload session another account opened
- **THEN** the server answers 403 and the session stays open

#### Scenario: Abort through another folder
- **WHEN** an abort request names a folder other than the one the session uploads into
- **THEN** the server answers 404 and the session stays open

### Requirement: Per-file access history
The server SHALL list every stored write of a file's access entries in the file's history and in its folder's history as a "file keys issued" entry with the actor and the time, without the recipients and without the wrap content; the recipients SHALL be recorded in the audit trail only.

#### Scenario: History read
- **WHEN** a reader of an encrypted file requests its history after a key write
- **THEN** the history lists a "file keys issued" entry with the actor and the time and no recipient

#### Scenario: Write with nothing stored
- **WHEN** a key write skips every recipient
- **THEN** no history entry and no audit event is recorded

### Requirement: Administrative recovery of a user's identity
For the B2B launch the server SHALL support organisational recovery: a user MAY enrol by wrapping their private key for a recovery administrator's public key, and a recovery administrator SHALL be able to retrieve that wrap for a user who lost every passphrase and recovery phrase, with every retrieval audited.

#### Scenario: Enrolment
- **WHEN** a user enrols in organisational recovery
- **THEN** the server stores the wrap for the recovery administrator and never the raw private key

#### Scenario: Recovery
- **WHEN** a recovery administrator retrieves a user's wrap
- **THEN** an audit event records the administrator, the user and the time

### Requirement: Offboarding revokes private-room access
For the B2B launch the server SHALL, when a user is deprovisioned (SCIM or manual deactivation), remove that user's access entries from every encrypted file and, if the user owned private rooms, require an explicit new owner before the deactivation completes.

#### Scenario: Deprovisioned member
- **WHEN** a member of private rooms is deprovisioned
- **THEN** the user's access entries are removed from every encrypted file in those rooms

#### Scenario: Deprovisioned owner
- **WHEN** the owner of a private room is deprovisioned without a new owner
- **THEN** the deactivation is refused until a new owner with keys is named

### Requirement: Administrator bypass excludes archived private rooms
The server SHALL NOT grant a portal administrator, the portal owner included, who is not a member of an archived private room any right by role alone: no read, copy or download on its files and folders, and no move, delete or index export on the room. This SHALL match an active private room. An administrator who is a member SHALL keep the rights of their own share.

#### Scenario: Non-member administrator reads an archived private room's file
- **WHEN** a portal administrator who is not a member requests a file of an archived private room by id
- **THEN** the server answers as for an entry the caller cannot read and reports no right on it

#### Scenario: Non-member administrator deletes or restores an archived private room
- **WHEN** a portal administrator who is not a member asks to delete an archived private room, or to move it back to Rooms, by id
- **THEN** the server refuses the request and the room stays where it is

#### Scenario: Member administrator
- **WHEN** a portal administrator who was invited to a private room opens it after it was archived
- **THEN** they keep the rights of their share in the room

### Requirement: Private-room events reach members only
The server SHALL send the socket events of a private room, active or archived, and of its entries only to users who can read the room, and SHALL send a webhook payload about an entry of a private room only to the subscriptions whose account can read that entry, judged for each subscription on its own. It SHALL NOT add portal administrators who are not members to the recipients, so the room title reaches no one outside the room.

#### Scenario: Private room renamed
- **WHEN** a private room is renamed or a file is added to it
- **THEN** members receive the event and a portal administrator who is not a member receives none

#### Scenario: Webhook of a folder of a private room
- **WHEN** a folder of a private room changes and a member's subscription is checked before the subscription of an account outside the room
- **THEN** the member's subscription receives the payload and the outside subscription receives none

### Requirement: Public keys of prospective members
The server SHALL return, to a caller who may change the access of an active private room, the public keys of the named portal users, members or not, with no private half on any entry, the caller's own included, so the client can verify an invitee's key before granting access. It SHALL answer 404 for an unknown room, 400 for a room that is not private, a folder inside a room or a malformed id, and 403 for a caller who cannot read the room or may not change its access.

#### Scenario: Invitee with a key
- **WHEN** a caller who may change the access of a private room asks for the keys of a portal user who is not a member and has stored keys
- **THEN** the user's public keys are returned with their ids, without the encrypted private half

#### Scenario: Caller among the candidates
- **WHEN** the caller names their own id
- **THEN** their entry is returned without the encrypted private half

#### Scenario: Caller who may not invite
- **WHEN** a member without the right to change the room's access, a non-member or an administrator who is not a member asks for keys
- **THEN** the request is refused with 403 and no key is returned

#### Scenario: Archived private room
- **WHEN** the owner of an archived private room asks for the keys of a user
- **THEN** the request is refused with 403, because the access of an archived room cannot change

### Requirement: Prospective members who cannot be invited are absent
The server SHALL leave out of the prospective-members answer, without failing the request, a named user who has no stored key or no public key, is a guest, is terminated or does not exist on the portal; a repeated id SHALL count once, and no ids SHALL answer an empty list.

#### Scenario: Invitee without a key
- **WHEN** a named user has never stored a key
- **THEN** the user is absent from the answer and the request still succeeds

#### Scenario: Guest or terminated user named
- **WHEN** a named user is a guest, is terminated or belongs to another portal
- **THEN** the user is absent from the answer and the request still succeeds

#### Scenario: Same user twice
- **WHEN** the same id is named twice
- **THEN** the user's keys are returned once

#### Scenario: No users named
- **WHEN** the request names no user
- **THEN** the answer is an empty list

### Requirement: Missing file keys of a room
The server SHALL report, to a caller who may change the access of an active private room, which of the named users, or of the room's direct members and its creator when none is named, hold no key on which encrypted files of the room, subfolders included, as identifiers only; a user who holds every key SHALL be absent, a file stored in the clear SHALL never be reported, and an id that names nobody on the portal SHALL be ignored. It SHALL apply the access rules of the prospective-members request.

#### Scenario: Member without a key on one file
- **WHEN** the owner asks for the missing keys of a member who holds no key on one encrypted file
- **THEN** the answer lists that member with that file, and lists nothing for them once the key is written

#### Scenario: No users named
- **WHEN** the owner asks without naming users
- **THEN** the room's members are checked and a user outside the room is not reported

#### Scenario: Plain file
- **WHEN** the room holds a file stored in the clear and no encrypted file
- **THEN** the answer is empty

#### Scenario: Caller who may not change access
- **WHEN** a member without that right, an administrator who is not a member, or the owner of an archived private room asks
- **THEN** the request is refused with 403

### Requirement: Saving keys keeps the user's other sign-in links
The server SHALL replace only the user's encryption key record when the user's keys are saved or deleted, and SHALL NOT remove any other account link of the user, such as a Google or SSO sign-in.

#### Scenario: User with a linked sign-in provider saves keys
- **WHEN** a user whose account is linked to a sign-in provider creates or replaces their encryption keys
- **THEN** the keys are saved, the provider link stays, the user can still sign in through it, and the user holds one encryption key record

#### Scenario: User with a linked sign-in provider deletes a key
- **WHEN** a user whose account is linked to a sign-in provider deletes an encryption key
- **THEN** the key is removed and the provider link stays

### Requirement: No external or invitation links on a private room
The server SHALL refuse with 403 to create or update an external link or an invitation link with any access on a private room, active or archived, or on a folder or file inside one, so that a private room is reached through membership only. Revoking a link that exists SHALL stay possible.

#### Scenario: External link requested
- **WHEN** a room manager requests an external link for a private room
- **THEN** the server refuses the request with 403 and the room has no external link

#### Scenario: Invitation link requested
- **WHEN** a room manager requests an invitation link for a private room
- **THEN** the server refuses the request with 403 and no link is created

#### Scenario: Link revoked
- **WHEN** a room manager sets the access of a link that a private room still holds to none
- **THEN** the request is accepted and the link is removed

### Requirement: Room-level copies of a private room are refused
The server SHALL refuse to duplicate a private room, to save it as a room template (403) and to export its index, and SHALL report the copy, duplicate, index-export, AI chat and vectorization rights as unavailable on a private room and on every file and folder inside it, whether the room is active or archived, because each of them carries the room's structure, titles or content outside the room.

#### Scenario: Duplicate requested
- **WHEN** a room manager requests a duplicate of a private room
- **THEN** the server refuses the request and creates no room

#### Scenario: Template requested
- **WHEN** a room manager asks to save a private room as a template
- **THEN** the server refuses the request with 403 and creates no template

#### Scenario: Index export requested
- **WHEN** a caller requests the index export of a private room
- **THEN** the server refuses the request and produces no export

#### Scenario: Rights reported
- **WHEN** the owner reads a private room
- **THEN** its security reports copy, duplicate and index export as false

### Requirement: Plaintext never enters a private room
The server SHALL refuse with 403 an upload session into a private room, or into a folder of one, that is not marked encrypted, before any chunk, and SHALL refuse with 403 on the file write path any file inside a private room that is not marked encrypted, whichever route writes it, so that no new way of creating a file stores a plain one there. An ordinary room SHALL keep accepting plain files under any name.

#### Scenario: Session without the encrypted flag
- **WHEN** an upload session into a private room is opened without the encrypted flag
- **THEN** the server refuses it with 403 and no session exists

#### Scenario: Plain file created in the room
- **WHEN** a file is created in the clear in a private room or in one of its subfolders through the file creation route
- **THEN** the server refuses it with 403 and creates no file

#### Scenario: Ordinary room
- **WHEN** a plain file is created or an unencrypted session is opened in a room that is not private
- **THEN** the server accepts it as before

### Requirement: File keys follow the share
The server SHALL remove a user's file keys from every encrypted file of a private room, subfolders included, when the user loses access to it (their share removed or set to none, a leave, a clearing), and from every file on the portal when their personal data is deleted, keeping the keys of the room's current owner and of a share removed before a change of owner; each room revocation SHALL be audited with the room and the users and SHALL NOT appear in the file or folder history.

#### Scenario: Member removed
- **WHEN** a room manager removes a member from a private room
- **THEN** the member's keys are gone from every encrypted file of the room and the other members keep theirs

#### Scenario: Member leaves
- **WHEN** a member leaves a private room
- **THEN** the leaver's keys are gone from every encrypted file of the room

#### Scenario: Member without keys
- **WHEN** a member whose key set is empty leaves a private room, or the owner removes that member or changes their role, through the share request of the room
- **THEN** the server answers 403 with the message "The user does not have an encryption key", the member's share stays as it was and no key is removed

#### Scenario: Key removal fails after the share is written
- **WHEN** a member's share of a private room is removed and the removal of their file keys then fails
- **THEN** the member no longer has access to the room, and their keys stay on the files

#### Scenario: Owner keeps the keys
- **WHEN** the owner clears the room's access, sets their own share to none or has it removed by a manager
- **THEN** the owner keeps their keys and stays the owner

#### Scenario: Personal data deleted
- **WHEN** a user's personal data is deleted
- **THEN** every file key held for that user on the portal is removed

#### Scenario: Owner changed
- **WHEN** ownership of a private room is transferred
- **THEN** the new owner's share removed by the transfer costs them no key, and from then on the new owner is the one whose keys a removal keeps

### Requirement: Clearing the access of a private room
The server SHALL refuse with 403 a portal administrator who is not a member clearing the access of a private room or of an entry inside one, while the clearing of an ordinary room by an administrator stays as it was; whoever loses access to a private room through a clearing SHALL lose their wrapped file keys, the room's creator excepted.

#### Scenario: Access cleared by an administrator outside the room
- **WHEN** a portal administrator who is not a member clears the access of a private room
- **THEN** the server answers 403 and nothing changes

#### Scenario: Members cleared by the owner
- **WHEN** the owner clears the access of a private room
- **THEN** the members lose their keys on every encrypted file of the room and the owner keeps theirs

### Requirement: Private rooms need a Document Server that encrypts
The server SHALL refuse with 403, after the key check, the creation of a private room or a private AI agent, and with 415 the editor configuration of an encrypted file of a private room, while the connected Document Server does not serve the crypto library the browser decrypts with.

#### Scenario: Room created without the library
- **WHEN** a user with encryption keys creates a private room and the Document Server does not serve the crypto library
- **THEN** the server answers 403 and creates no room

#### Scenario: Encrypted file opened without the library
- **WHEN** the editor configuration of an encrypted file of a private room is asked for and the Document Server does not serve the crypto library
- **THEN** the server answers 415

### Requirement: Audit trail names a private room neutrally
The server SHALL show the title of a private room, the titles of its folders and the old title of a renamed one as the neutral label ("Private room") in the audit trail and its report, keeping the users' names, and the history of the room SHALL show its members the real titles. Events written before this rule SHALL keep their titles.

#### Scenario: Audit trail read by an administrator
- **WHEN** an administrator reads the audit trail or its report for events of a private room
- **THEN** the room and its folders appear as "Private room" and the names of the users are shown

#### Scenario: History of the room
- **WHEN** a member reads the history of the private room
- **THEN** the real titles are shown

#### Scenario: Ordinary room
- **WHEN** an administrator reads the audit trail for events of a room without the private setting
- **THEN** its title is shown

### Requirement: Backup excludes private-room keys
The server SHALL NOT include the wrapped file keys of private rooms or the users' encryption key records in a portal backup, and a restore SHALL NOT keep the ids of files and users. A restored portal therefore holds the encrypted files of its private rooms without a key that opens them.

#### Scenario: Portal restored from a backup
- **WHEN** a portal with a private room is restored from a backup
- **THEN** the private room and its encrypted files are present, no member can open them, and no key import restores that access

### Requirement: Editor configuration hides AI tools for an encrypted file
The server SHALL answer the editor configuration of an encrypted file with the AI tools disabled, whatever the portal's AI access setting, so the editor shows no AI tools for it; a plain file keeps the portal-wide answer.

#### Scenario: Encrypted file
- **WHEN** a member opens the editor configuration of an encrypted file on a portal with AI switched on
- **THEN** the configuration says the AI tools are disabled

#### Scenario: Plain file
- **WHEN** the same member opens the editor configuration of a plain file on that portal
- **THEN** the configuration says the AI tools are enabled

## MODIFIED Requirements

### Requirement: File access entries write
The server SHALL store the submitted entries of the listed users who can read the file, replacing their previous entries and keeping every other user's entry, and SHALL answer the ids of the users it skipped because they cannot read the file. It SHALL do so only when the caller can read the file and create content in its parent room, which is private; otherwise it SHALL answer 403 and store nothing. Each listed user SHALL be checked on a fresh read of the file.

#### Scenario: Authorised replace
- **WHEN** a room member with create rights submits entries for users who can all read the file
- **THEN** the previous entries for those users are replaced by the submitted ones and no id is reported as skipped

#### Scenario: Non-private parent room
- **WHEN** the file's parent room is not private
- **THEN** the write is refused with 403

#### Scenario: Listed user cannot read the file
- **WHEN** one submitted entry names a user without read access to the file, listed before or after a member
- **THEN** the entries of the other users are stored, that user is reported as skipped, and no entry is stored for them

#### Scenario: Every listed user skipped
- **WHEN** no submitted entry names a user who can read the file
- **THEN** nothing is stored, every id is reported as skipped and no audit event is recorded

#### Scenario: User left out of the write
- **WHEN** a write does not list a user who already holds an entry on the file
- **THEN** that user's entry stays as it was

### Requirement: Conversion forbidden for private rooms
The server SHALL refuse a conversion started through the conversion check, the document converter or a document-builder script when the source file, or the folder the result is saved to, lies in a private room, SHALL never convert an encrypted file, and SHALL refuse with 403 the copy-as-with-conversion request when the source file is marked encrypted or lies in a private room, or when the destination lies in a private room.

#### Scenario: Conversion into a private room
- **WHEN** a document-converter or document-builder result would be written into a private room
- **THEN** the operation is refused

#### Scenario: Copy-as into a private room
- **WHEN** a non-private file is copied with conversion into a private room or into a folder inside one
- **THEN** the server answers 403 and stores nothing

#### Scenario: Copy-as out of a private room
- **WHEN** an encrypted file is copied with conversion to a folder outside its room
- **THEN** the server answers 403 and creates no copy

### Requirement: Server-side copy out of a private room is refused
The server SHALL refuse a batch copy of a file or a folder from inside a private room to a folder outside that room, whether the room is active or archived, before the operation is queued, so no copy and no folder tree is created; it SHALL refuse a batch move or copy of a folder from outside into a private room; and only a move within the same private room SHALL pass the private-room check. A refusal before the operation is queued is a 403 with the message "Access denied".

#### Scenario: Copy out of an archived private room
- **WHEN** a member requests a batch copy of an encrypted file from an archived private room to My documents
- **THEN** the server refuses the request with 403 "Access denied", queues no operation and creates no file

#### Scenario: Copy out of an active private room
- **WHEN** a member requests a batch copy of an encrypted file from an active private room to My documents
- **THEN** the server refuses the request with 403 "Access denied" and creates no file

#### Scenario: Copy within the same private room
- **WHEN** a member requests a batch copy of an encrypted file into a subfolder of the same private room
- **THEN** the server refuses the request and creates no file

#### Scenario: Move into another private room
- **WHEN** a member of two private rooms requests a batch move of an encrypted file from one into the other
- **THEN** the server refuses the request with 403 "Access denied" and moves nothing

#### Scenario: Subfolder moved out
- **WHEN** the owner requests a batch move of a subfolder of a private room to a folder in My documents
- **THEN** the folder stays in the room and nothing appears outside

#### Scenario: Open folder moved in
- **WHEN** the owner requests a batch move of a folder from My documents into a private room
- **THEN** the folder stays outside and the room is unchanged

#### Scenario: Subfolder moved within the room
- **WHEN** the owner requests a batch move of a subfolder of a private room into another folder of the same room
- **THEN** the folder is moved

#### Scenario: Subfolder copied out of an archived private room
- **WHEN** the owner requests a batch copy of a subfolder of an archived private room to a folder outside it
- **THEN** no folder, not even an empty one, lands outside

### Requirement: File public keys
The server SHALL return, for one file in a private room, active or archived, the keys of every user holding a share record of their own (not a group or a link) on the file or on any folder above it up to the room, plus the file's creator even without a record; it SHALL skip users without stored keys or a public key, keep the private half only on the caller's entries, and answer 415 outside a private room. Existing access entries are not consulted.

#### Scenario: Keys of a file
- **WHEN** a reader of the file requests its public keys
- **THEN** every user who reaches the file through a user share and has stored keys is returned, whether or not an access entry exists for them

#### Scenario: File in an archived private room
- **WHEN** a reader requests the public keys of a file in an archived private room
- **THEN** the keys are returned as for a file in an active private room, and the server MUST NOT answer 415

#### Scenario: Room owner who did not create the file
- **WHEN** the public keys of a file that another member created are requested, and the room owner holds no share record of their own
- **THEN** the room owner's keys are not in the answer

#### Scenario: Creator who left the room
- **WHEN** the public keys of a file are requested after its creator left the room
- **THEN** the creator's keys are still in the answer

### Requirement: Copy right inside archived private rooms
The server SHALL deny the copy right on a private room, on a file inside it and on a subfolder of it, to every user, room owner included, whether the room is active or archived. In an archived private room the other rights follow the rules of every archived room.

#### Scenario: File in an active private room
- **WHEN** the owner of an active private room lists its encrypted files
- **THEN** each file reports the copy right as false

#### Scenario: File in an archived private room
- **WHEN** the owner, a room manager, a content creator or an editor lists the encrypted files of an archived private room
- **THEN** each file reports the copy right as false, as it does editing, renaming, moving and deleting

### Requirement: Owner change requires the new owner's keys
The server SHALL refuse with 403 an ownership change of a private room when the new owner has no encryption keys or an empty key set, and SHALL refuse with 409, leaving the owner as it is, when the new owner, unless they created the room, holds no access entry on some encrypted file of the room, subfolders included; the missing files are read through the missing-file-keys request. The reassignment of a deleted user's rooms SHALL apply neither check.

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
- **THEN** the change is refused with 403, since the share the previous owner gets in exchange passes the same key check as any new share

#### Scenario: Rooms of a deleted user
- **WHEN** the rooms of a user being deleted are reassigned to a user who lacks entries or has no keys at all
- **THEN** the reassignment completes, and the private rooms are owned by that user

### Requirement: Audit log scope for private rooms
The server SHALL write audit events for key envelope creation, update and deletion, for every stored file access-entry write (actor, file, the recipients whose entries were stored) and for every member revocation from a private room.

#### Scenario: Key events logged
- **WHEN** a user creates, replaces or deletes a key envelope
- **THEN** a matching audit event is recorded

#### Scenario: Access entries written
- **WHEN** a client writes a file's access entries and at least one recipient's entry is stored
- **THEN** an audit event records the actor, the file and the stored recipients

#### Scenario: Member revoked
- **WHEN** a member's access entries are removed from a room's files
- **THEN** an audit event records the actor, the room and the revoked user

### Requirement: Invitation e-mails carry the room title
The server SHALL NOT include the plaintext title of a private room or of its folders in invitation e-mails or in the letters and pushes about the room and its content; it SHALL name the room with a neutral label ("Private room") and a folder of it with another ("Private folder"), next to the link that resolves the title in the portal.

#### Scenario: Invite to a private room
- **WHEN** an invitation e-mail to a private room is sent or resent
- **THEN** the e-mail contains a link to the room and the neutral label, and not the room title

#### Scenario: Address invited without a user id
- **WHEN** the share request of a private room names an e-mail address and no user id
- **THEN** the server answers 403, since the key check runs before the address is resolved; no account is created and no letter is sent

#### Scenario: Room notices
- **WHEN** a file or folder is created or uploaded in a private room, a member's access or role changes, or the room is archived or removed
- **THEN** the letter or push names the room with the neutral label and not its title, and a folder it names with the folder label and not the folder's title

#### Scenario: What's-new letter
- **WHEN** the what's-new letter lists events of a private room
- **THEN** it names the room and its folders with the neutral label

#### Scenario: Ordinary room
- **WHEN** the same letters are sent for a room without the private setting
- **THEN** they carry its title

### Requirement: Private room creation requires keys
The server SHALL refuse with 403 a room creation request that sets the private flag when the caller has no stored key record or an empty key set, and SHALL refuse with 400 the private flag on a room created on third-party storage, with or without keys, and on the AI hub room types (Knowledge, Instructions and AI project rooms). It SHALL otherwise store the room with the requested room type and the private setting.

#### Scenario: Caller without keys
- **WHEN** a user without encryption keys creates a private room
- **THEN** the server answers 403

#### Scenario: Caller who deleted all keys
- **WHEN** a user whose key set is empty creates a private room
- **THEN** the server answers 403

#### Scenario: Caller with keys
- **WHEN** a user with encryption keys creates a private room
- **THEN** the room is created with the requested room type and the private setting

#### Scenario: Third-party room created as private
- **WHEN** a user, with or without encryption keys, creates a room on a connected third-party storage as private
- **THEN** the server answers 400, creates no room, and the connection can still back an ordinary room

#### Scenario: AI hub room created as private
- **WHEN** a Knowledge, Instructions or AI project room creation request sets the private flag
- **THEN** the server answers 400 and creates no room

#### Scenario: AI agent created as private
- **WHEN** a user with encryption keys creates an AI agent with the private flag while the Document Server encrypts
- **THEN** the agent is created with the private setting

#### Scenario: Public or form-filling room created as private
- **WHEN** a room creation request sets the private flag with the public or the form-filling room type, whose rooms exist through an external link
- **THEN** the server answers 400 and creates no room

## REMOVED Requirements

### Requirement: No recovery or offboarding endpoints
**Reason**: Replaced by the administrative recovery, offboarding and per-file access history requirements above.
**Migration**: Implement the endpoints on the server; the client enrolment and recovery flows follow in the keys-management tab.
