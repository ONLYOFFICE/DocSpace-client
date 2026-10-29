# Spec Delta

## Purpose

Defines where an AI chat round takes its sources from — skills from Instructions rooms, a knowledge base from Knowledge rooms, a personal Context folder — how a project overrides them, and how threads are scoped. This is the chat logic shared by the projects page and the chat opened anywhere else.

## ADDED Requirements

### Requirement: Sources of a round
A chat round SHALL take three kinds of sources: any number of Instructions rooms (their skills), any number of Knowledge rooms (searched as one knowledge base) and at most one Context folder (the location the model works in). Instructions and Knowledge rooms SHALL be picked in the composer; standing inside one SHALL NOT connect it as a skills or knowledge source. The Context folder SHALL follow the user's location (see below).

#### Scenario: Several rooms picked
- **WHEN** the user picks two Instructions rooms and three Knowledge rooms in the composer
- **THEN** the round carries the skills of both Instructions rooms and searches all three Knowledge rooms

#### Scenario: Browsing an Instructions room
- **WHEN** the user opens the chat while standing inside an Instructions room
- **THEN** that room is the Context folder of the round, but its skills are not connected until the user picks it

### Requirement: Skills from Instructions rooms
Connecting an Instructions room SHALL read its list of skills once, to show what was connected. Each round SHALL then take the room's current skills from the server (which caches and refreshes them itself), offer them all to the model, and let the model read a skill's body on demand through the built-in `read_skill` tool. Skills SHALL NOT be switched off individually. Reading a skill SHALL use the caller's own rights.

#### Scenario: Skill body on demand
- **WHEN** the model decides a skill applies to the question
- **THEN** it reads that skill's Markdown body through `read_skill` and follows it

#### Scenario: Skill changed between rounds
- **WHEN** a skill is edited after the room was connected
- **THEN** the next round uses the edited skill without reconnecting the room

#### Scenario: Room without skills
- **WHEN** a connected Instructions room has no Markdown file in its root
- **THEN** the round runs without skills from that room

### Requirement: Knowledge search across rooms
When at least one Knowledge room is connected and vectorization is enabled on the portal, the model SHALL get a knowledge-search tool that searches the indexed files of every connected room the caller may use and cites results as document links. A room the caller may not use SHALL be skipped. With vectorization disabled, the composer SHALL NOT offer the knowledge base picker at all, and with no room connected the tool SHALL be absent.

#### Scenario: Search across two rooms
- **WHEN** two Knowledge rooms are connected and the user asks about a policy
- **THEN** the answer cites documents from either room by title

#### Scenario: Vectorization disabled
- **WHEN** vectorization is disabled on the portal
- **THEN** the composer shows no knowledge base picker, and a round with a room connected earlier runs without the knowledge-search tool

### Requirement: Context folder follows the location
Outside a project, the Context folder SHALL be set automatically: the folder or room the user is standing in when they open the chat or send a message, and it SHALL follow the user as they navigate. The user SHALL NOT pick it by hand there. The Context folder SHALL be sent with each round and SHALL be the location the model's file tools work in. It SHALL belong to the user's chat, never to a project or a room.

#### Scenario: Chat opened in a folder
- **WHEN** the user opens the chat while standing in the folder "Q4 drafts" and asks the model to list its files
- **THEN** the file tools act on "Q4 drafts" without the user connecting anything

#### Scenario: Navigation
- **WHEN** the user moves from "Q4 drafts" to "Contracts" with the chat open and sends a message
- **THEN** that round's context is "Contracts"

### Requirement: Context folder inside a project
Inside a project the Context folder SHALL be picked by hand in the Context card, because the project has no location of its own. Until one is picked, and after it is disconnected, the context SHALL be the user's own Files (My documents).

#### Scenario: Project without context
- **WHEN** a Member opens a project and sends a message without picking a Context folder
- **THEN** the round runs on the project's skills and knowledge with the Member's Files as its context

#### Scenario: Context disconnected
- **WHEN** the Member disconnects the folder picked in the Context card
- **THEN** the next round's context is the Member's Files again

#### Scenario: Context picked in a project
- **WHEN** the Member picks "Q4 drafts" in the Context card
- **THEN** their next rounds use "Q4 drafts" as context

### Requirement: Project overrides the sources
When a round is scoped to an AI project (its `entityId` is the project), the server SHALL replace the round's model, Instructions rooms and Knowledge rooms with the project's stored settings — limited to the rooms the caller can read — whatever the composer sent. The Context folder SHALL stay the one the caller picked in the project. A member of a linked room who lost access to it SHALL get the round without that room.

#### Scenario: Composer values ignored
- **WHEN** a client sends a project-scoped round with a different `profileId` and extra rooms
- **THEN** the round runs on the project's model and the project's rooms only

### Requirement: Project refusals
A project-scoped round or thread creation SHALL be refused with 403 when the caller may not chat in the project (not a member), and with 409 `projectModelUnavailable` when the project's model is gone or cannot chat. The client SHALL show the server's message.

#### Scenario: Admin outside the project
- **WHEN** a DocSpace admin who is not a member tries to chat inside a project
- **THEN** the round is refused with 403

### Requirement: Unavailable model asks for a new one
When the client learns that the project's model is unavailable — from the project's `profile.available: false` or from a 409 on a round — the chat SHALL show an error that the model is no longer available and must be changed, instead of a generic failure. For the owner and Project managers the error SHALL offer to open Edit project on the model field; for Members it SHALL say to ask a Project manager. The composer SHALL stay disabled for sending until the model is changed.

#### Scenario: Manager opens a project with a deleted model
- **WHEN** a Project manager opens a project whose profile was deleted
- **THEN** the chat shows "model unavailable, change it" with an action that opens Edit project on the model field

#### Scenario: Member sends a message
- **WHEN** a Member sends a message in a project whose model was deleted meanwhile
- **THEN** the round is refused with 409 and the chat shows that the model must be changed by a Project manager

#### Scenario: Model changed
- **WHEN** the owner picks a new model and saves
- **THEN** the open chats of the project lose the error and can send again

### Requirement: Chats are private
A chat (thread) SHALL belong to the user who started it and SHALL never be visible to anyone else: not to other members of the same project, not to the project owner, not to admins. There SHALL be no way to share, hand over or jointly edit a chat. Deleting a project SHALL delete only the threads scoped to it; leaving a project SHALL keep the user's threads for the case they are invited again.

#### Scenario: Another member's thread
- **WHEN** a Member chats inside a project and another member opens the same project's chat history
- **THEN** the first Member's thread is not listed

#### Scenario: Owner looks for members' chats
- **WHEN** the project owner opens the chat history inside the project
- **THEN** only the owner's own threads are listed

### Requirement: Thread scope
Threads SHALL have one global scope per user. The project or location id a round is scoped to SHALL select the round's context, not a separate thread list, so the chat history shows the user's threads from everywhere. Creating a thread SHALL require that the scoped entity is accessible to the caller and that a chat model is resolvable.

#### Scenario: History inside a project
- **WHEN** a user who has chatted both in Rooms and inside a project opens the chat history inside the project
- **THEN** both threads are listed

### Requirement: Applying a project outside its page
A project applied to a plain chat (from the model picker) SHALL connect its model, available Instructions rooms and available Knowledge rooms in place, keeping the current thread. Closing that chat SHALL drop them all, so the next chat starts on the default model with no project rooms.

#### Scenario: Apply then close
- **WHEN** the user applies a project in the Rooms chat, closes the chat and opens it again
- **THEN** the chat is on the default model with none of the project's rooms connected
