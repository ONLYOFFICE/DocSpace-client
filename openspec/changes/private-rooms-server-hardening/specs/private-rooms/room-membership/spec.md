# Spec Delta

## ADDED Requirements

### Requirement: Private room creation needs a Document Server that encrypts
The system SHALL refuse to create a private room, before any request, when the files settings report that the connected Document Server cannot work with encrypted files, and SHALL show Common:PrivateRoomDocServiceNotSupported, as it SHALL when the server refuses the creation for that reason.

#### Scenario: Document Server without encryption
- **WHEN** the user confirms the creation of a private room and the files settings report no encrypted-editing support
- **THEN** no room is created and Common:PrivateRoomDocServiceNotSupported is shown

#### Scenario: Creation refused by the server
- **WHEN** the server refuses the creation of a private room because the Document Server cannot encrypt
- **THEN** Common:PrivateRoomDocServiceNotSupported is shown instead of the server's message

### Requirement: Ownership transfer wraps the candidate's missing files
The system SHALL, before it asks the server to transfer a private room to a verified candidate, read from the server which encrypted files of the room lack the candidate's entry, wrap those for the candidate with the current user's unlocked identity, and ask for the transfer only when no such file remains. Otherwise, and when the server refuses the transfer for a missing entry, the owner SHALL stay and Common:EncryptedReencryptPartialFailure SHALL count the files.

#### Scenario: Missing entries wrapped before the transfer
- **WHEN** the owner transfers a private room to a member who lacks an entry on some of its encrypted files
- **THEN** those files gain the member's entry before the transfer is asked, and the member becomes the owner

#### Scenario: Entries still missing
- **WHEN** some of those files cannot be wrapped for the candidate, because their key was refused, a write failed or the server did not store the entry
- **THEN** the transfer is not asked, the owner stays and Common:EncryptedReencryptPartialFailure counts the files

#### Scenario: Transfer refused by the server
- **WHEN** the server refuses the transfer because the candidate still lacks an entry on an encrypted file, for example one uploaded meanwhile
- **THEN** the owner stays and Common:EncryptedReencryptPartialFailure counts the files the server lists as missing

#### Scenario: Unlock declined
- **WHEN** the owner declines to unlock their identity for the transfer
- **THEN** nothing is read or written, the owner stays and Common:EncryptionUnlockRequired is shown

#### Scenario: Ordinary room
- **WHEN** the owner transfers a room that is not private
- **THEN** no unlock is asked, no file is read and the transfer is asked at once

## MODIFIED Requirements

### Requirement: Backfill re-wraps every member
The system SHALL let a room manager run a backfill sweep, once per room and page session and after each invitation, that reads from the server which current members lack an entry on which encrypted files of the room and wraps exactly those files for those members, with a verified key and other than the manager. When that read fails the sweep SHALL fall back to re-wrapping every encrypted file for every such member.

#### Scenario: Late-registered member
- **WHEN** a member who was invited without a key has since registered one and a room manager opens the room
- **THEN** every encrypted file the server lists as lacking the member's entry gains one, and the member can open the files

#### Scenario: Existing entries are kept
- **WHEN** the sweep runs for a member who already holds an entry on a file
- **THEN** the server does not list the file for them and the entry stays as it was, wrapped by its original sender

#### Scenario: Nothing missing
- **WHEN** the server lists no missing entry for the room
- **THEN** the sweep reads no file and writes nothing

#### Scenario: Existing wraps are replaced
- **WHEN** the missing-keys read fails and the fallback sweep runs for a member who already holds an entry on a file
- **THEN** the entry is replaced by a wrap from the manager, and the member still unwraps the file because the manager's public key is among the file's public keys and the room roster

#### Scenario: Member with a refused key change
- **WHEN** the sweep meets a member whose key differs from its pin
- **THEN** no dialog is shown, no wrap is written for that member, and the member is reconsidered on the next sweep

#### Scenario: Non-manager opens the room
- **WHEN** a member without room-edit rights opens the room
- **THEN** no sweep runs

#### Scenario: Room listed over several pages
- **WHEN** the fallback sweep lists the room and a folder of it holds subfolders and more files than one page of the server's listing returns
- **THEN** the sweep reaches every encrypted file of that folder, not only those on the first page

### Requirement: Removed member loses file access entries
The system SHALL remove a member of a private room through the role update alone, relying on the server to remove the member's wrapped keys from every encrypted file of the room when the share goes, and SHALL NOT rewrite the access entries of the room's files itself; the notice after the removal SHALL report the role update only. Existing ciphertext and file keys SHALL NOT be regenerated.

#### Scenario: Revocation succeeds
- **WHEN** the removal is confirmed and the role update succeeds
- **THEN** the member's keys are gone from the server and the client has written no access entry

#### Scenario: Removed member retains an old copy
- **WHEN** a removed member had already downloaded and decrypted a file
- **THEN** that local copy remains readable; only server-side access is withdrawn

#### Scenario: Removal from a room selected in a list
- **WHEN** a member is removed from the Members tab of a private room selected in the Private or Rooms list
- **THEN** the same role update runs as for a removal from inside the room, and nothing more

### Requirement: Removing a group revokes each member
The system SHALL remove a group from a private room through the role update alone; the server removes the keys of every user the update takes out of the room, and the client SHALL NOT run a revocation of its own.

#### Scenario: Group removed
- **WHEN** a group is removed from a private room
- **THEN** the server removes the keys of every user who loses the room, and the client writes no access entry

### Requirement: Leaving a room revokes own access first
The system SHALL drop the leaver's role without a revocation of its own when a member leaves a private room; the server removes the leaver's wrapped keys with the role, the room's creator excepted.

#### Scenario: Leave succeeds
- **WHEN** a member confirms leaving a private room
- **THEN** the role is dropped and the leaver's keys are gone from every encrypted file of the room

#### Scenario: Cleanup fails
- **WHEN** the role update fails
- **THEN** the member stays in the room with their keys and the failure is shown
