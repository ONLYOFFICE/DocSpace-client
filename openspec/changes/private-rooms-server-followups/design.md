# Design

## Context

See proposal.md for the motivation. No stashed design document covers this.

Server source: `../server`, read through CodeGraph on 2026-11-11 at
`a7d94e4b81` and on 2026-11-16 at `6fb6dfb17a`. Stand:
`tests.onlyoffice.io`, DocSpace 4.1.0.12351 with Document Server 10.0.3.19
on 2026-11-10, DocSpace 4.1.0.12366 on 2026-11-11.

### Section root title

- Stand, 2026-11-10: the root of the private section came titled "Private"
  for a user whose culture is Russian.
- Code: the root is found or created by
  `FolderDao.GetFolderIDPrivateRoomsAsync`
  (`products/ASC.Files/Core/Core/Dao/TeamlabDao/FolderDao.cs`, line 2283).
  Where its title is resolved for the answer was not traced.

### Not confirmed

- File keys of permanently deleted files. `FileDao.DeleteFilesAsync`
  (`products/ASC.Files/Core/Core/Dao/TeamlabDao/FileDao.cs`, line 1154)
  removes them with `DeleteFileKeysByFileIdsAsync` in the same transaction
  as the file rows; the single-file delete goes through it. Nothing is
  asked.

### Hand-over to the backend team

The owner handed the open Backend tasks of this change to the backend team
on 2026-11-16, as one document with the open server tasks of
`private-rooms-server-hardening` and the portal setting of
`private-rooms-release-gate`: tasks 1.1 to 1.4, 1.6, 2.1 to 2.3 and 2.5,
each with what is asked, what is expected and how it is accepted. No reply
is recorded yet. Tasks 1.7 and 2.6 and an addition to 1.6 were added to
the document later that day.

### Read at `0396e6910f` (2026-11-16)

The pull of 2026-11-16 brought 37 commits after `6fb6dfb17a`. No code of
private rooms changed; none of the tasks of this change has landed.

- The server now carries OpenSpec specs of its own, 30 capabilities under
  `../server/openspec/specs` with a register of known deviations
  (`openspec/deviations.md`), and routes behaviour changes through them.
  `private-rooms` holds 55 requirements.
- Four test files of `Tests/08_Private` are new or longer: who may read
  the encryption information of a file, the metadata filter of the private
  section, the revocation of a link on a private room, and an
  administrator outside a room who sees it in no area.
- The server's register lists the backup without keys (PR4) and the
  neutral title in the default culture only (PR6, hardening 4.5).
- Two requirements of the server's `private-rooms` spec, on the
  reassignment of a deleted user's rooms and on the room types that can be
  private, are to be compared with task 1.4 here and
  `private-rooms-server-hardening` 12.8 and raised with the backend team
  against its spec.

## Goals / Non-Goals

**Goals:**

- Every server behaviour asked has one task with the behaviour and an
  acceptance check, or a record that it needs none.

**Non-Goals:**

- Choosing the implementation for the backend team.
- Client work before the server merges.

## Decisions

1. **One change for all new server tasks.** They share an owner and a
   reader. Tasks that already exist elsewhere keep their place and only
   gain the observation.
2. **The delta states the behaviour asked, as MODIFIED requirements where
   the main spec already has a requirement on the subject.** The two meet
   when the work lands and this change is archived. Alternative: editing
   the main spec now. Rejected: it would describe a server that does not
   exist.
3. **Comment and review stay granted on an encrypted file (decided by the
   owner on 2026-11-11).** They are
   editor permissions for work inside the encrypted document, which the
   server does not need to read. The rights of the operations that do not
   work on encrypted content are reported as false.
4. **Questions are tasks too.** A behaviour is asked only after the
   server has been read or the backend team has answered. The access and
   the keys of a user turned into a guest and the routes behind the app
   switch were such questions until 2026-11-16 (decisions 6 and 7).
5. **A client task follows each server task that changes an answer.** It
   mirrors the merged behaviour in the mocks with contract cases and
   removes what the client no longer needs, on the pattern of
   `private-rooms-server-hardening` 16.1 and 16.2.

6. **A user turned into a guest loses the private rooms and the keys
   (decided by the owner on 2026-11-16).** The type change passes the
   private rooms the user owns to the new owner, removes the user's share
   in every private room, which removes the wrapped file keys, and then
   deletes the stored key pair. What is expected afterwards: the
   guest is in no private room and opens no encrypted file; the guest holds
   no key, so the key check refuses an invitation with no rule about guests;
   the rooms the user owned belong to the new owner, without the old owner
   among the members; and a guest made a user again starts with no key,
   creates one and is invited again. Alternative: keep the keys and refuse
   a guest by a rule of its own. Rejected: the main spec already says a
   guest holds no encryption key.

7. **The switched-off E2E rooms app closes private rooms on the server
   (decided by the owner on 2026-11-16).** Hidden means not reachable: no
   rooms listing holds a private room, none can be created, and an existing
   one, its folders and its files are refused by id, with their download,
   their opening in the editors, their members and their keys. The routes
   of a user's own key pair stay open, because the Keys management tab
   stays for a key holder (main `key-management`, "Keys management tab
   follows the Private section"). Nothing is deleted, so switching the app
   on brings everything back.

8. **A share change is whole or nothing, and private rooms are not
   favourites (decided by the owner on 2026-11-16).** A request that names
   a user without a key gives access to nobody, so the answer of the
   request and the members of the room always agree. A private
   room and its folders stay out of the favourites as an encrypted file
   does, so a private room is listed in the Private section only.
   Alternative for the invitation: add the
   users who hold keys and report the others. Rejected: the answer of a
   share change has no place for a list of refused users, and the invite
   panel already leaves them out before it sends.

## Risks / Trade-offs

- [The server denies Rename or Lock on an encrypted file and a client path
  that reads the right for another purpose changes] → Task 3.2 runs the
  private-room specs on the mirrored mock before anything is removed.
- [The reason of a refusal lands under another name than the client
  expects] → Task 3.1 reads the merged server before it touches the client.
- [A user is turned into a guest by mistake and loses the keys for good] →
  Accepted with decision 6: the files stay readable to the other members,
  and the user is invited again after a new key. The server cannot keep the
  pair aside, since only its holder can open it.
- [An administrator switches the app off while members work in a private
  room] → Accepted with decision 7: their requests are refused from then
  on, and nothing stored is lost. What happens to an editing session that
  is open at that moment is not asked here and is for the backend team to
  state when it takes 2.5.
- [The tasks age while the server moves] → Each Backend task states the
  behaviour asked and its acceptance, which do not depend on the server's
  code.

## Open Questions

- Whether the server applies task 1.6 once to the guests who were users
  before it lands, with the change or by a migration, is for the backend
  team to say when it takes 1.6.
