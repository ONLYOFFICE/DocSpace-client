# Spec Delta

## Purpose

Defines the Info panel of an agent: its tabs Details and Context, the Content tab an agent has on its own page, the Members tab of those who may change its members, and what they show to each role. An agent has no Contacts, History or About tab; members are invited through "Share agent" and listed, re-roled and removed on Members. The Info panel of a skill set, a skill, a knowledge base and a template is in `ai-skill-sets`, `ai-knowledge-bases` and `ai-agents-list`.

Implementation: the Info panel tabs helper, header and views in the client (`helpers/info-panel/tabs.ts`, `InfoPanel/Body/views/AiAgentContext`, `AiAgentContent`); `packages/shared/api/ai/threadFiles.ts`; `app/storage/threadFiles.ts` and `projectAttachments.ts` in ASC.AI.Chat.

## ADDED Requirements

### Requirement: Tabs of an agent
For an agent, selected in the Agents list or opened from "Agent info", the Info panel (`Common:Info`) SHALL have the tabs Details (`Common:SubmenuDetails`) and Context (`Common:Context`), in that order, followed by Content and Members where those requirements give them, and no Contacts, History or plugin tab. An agent is known by its room type. A remembered tab the agent does not have SHALL fall back to Details.

#### Scenario: Card selected
- **WHEN** a Member selects an agent's card with the Info panel open
- **THEN** the tabs are Details and Context, with Details shown

#### Scenario: Contacts was remembered
- **WHEN** a Member who last looked at Contacts of a room selects an agent
- **THEN** the panel shows Details

### Requirement: Members of an agent
For the Agent owner and Agent managers who are members of the agent, the Info panel of the agent SHALL end with a Members tab (`Common:Members`): the room's members list, where a member's role is changed between Agent manager and Member and a member is removed with the confirmation of `ai-agent-access` "Removing a member warns about their conversations". A Member, and a DocSpace admin who is not a member, SHALL NOT be given the tab.

#### Scenario: Agent manager
- **WHEN** an Agent manager opens the Info panel on the agent's page
- **THEN** the tabs are Details, Context, Content and Members, and Members lists the agent's members with their roles

#### Scenario: Member
- **WHEN** a Member opens the Info panel of the agent
- **THEN** there is no Members tab

### Requirement: Context tab
Context SHALL list what the agent draws on in two sections: Skill sets (`Common:SkillSets`) and Knowledge bases. Each section SHALL show its caption, a line saying what the assistant does with it, as the composer's slash menu heads the same list, and the linked rooms the caller can read. The name of a skill set or a knowledge base SHALL open that room.

#### Scenario: Section with no rooms
- **WHEN** a Member opens Context for an agent with no knowledge bases
- **THEN** Knowledge bases shows its caption and the line under it only, with no dash

#### Scenario: Agent with sources
- **WHEN** a Member opens Context for an agent with one skill set and two knowledge bases
- **THEN** the skill set is listed under Skill sets and the two knowledge bases under Knowledge bases

#### Scenario: Room the caller cannot read
- **WHEN** one of the agent's skill sets is no longer available to the caller
- **THEN** it is not listed

### Requirement: Skills of a skill set
On Context a skill set that has skills SHALL unfold to the names of its skills. When the skills cannot be read, the skill sets SHALL still be listed, without the unfold control.

#### Scenario: Unfold a skill set
- **WHEN** a Member unfolds the skill set "Document assistant"
- **THEN** its skills are listed under it

#### Scenario: Skills unavailable
- **WHEN** the skills of the agent cannot be read
- **THEN** the skill sets are listed and none can be unfolded

### Requirement: Data sources on Context
While the chat runs on the agent, on its page or picked in the chat panel, Context SHALL end with a Data sources section for every member: its caption, a line on what the assistant does with them, and the folders and rooms the user connected to that chat, each with a control that disconnects it. The section SHALL end with "Manage sources..." (`Common:ManageSources`), which opens the selector of the composer's menus.

#### Scenario: At the limit
- **WHEN** the chat has as many data sources as it takes
- **THEN** the section has no "Manage sources..." row

#### Scenario: Member on the agent's page
- **WHEN** a Member with the folder "Contracts" connected opens Context on the agent's page
- **THEN** Data sources lists "Contracts" with its remove control, followed by "Manage sources..."

#### Scenario: Agent selected in the list
- **WHEN** a Member selects an agent in the Agents list while the chat runs on no agent
- **THEN** Context has no Data sources section

### Requirement: Managing sources from Context
For those who may edit the agent, the agent owner and Agent managers, each section of Context SHALL end with its own row: Skill sets with "Manage skill sets..." (`Common:ManageSkillSets`) and Knowledge bases with "Manage knowledge bases..." (`Common:ManageKnowledgeBases`). Each row SHALL open the agent's edit form. Everyone else SHALL NOT be offered them.

#### Scenario: Agent manager
- **WHEN** an Agent manager chooses "Manage knowledge bases..." on Context
- **THEN** the agent's edit form opens

#### Scenario: Member
- **WHEN** a Member opens Context
- **THEN** no "Manage ..." row is shown

### Requirement: Context that cannot be read
When the agent cannot be read, Context SHALL say that something went wrong (`Common:SomethingWentWrong`) in place of the sections.

#### Scenario: Agent deleted meanwhile
- **WHEN** Context is opened for an agent that was just deleted
- **THEN** the error text is shown

### Requirement: Content tab on an agent's page
On the page of an agent, where its chat is open, the Info panel of that agent SHALL have a third tab, Content (`Common:Content`), after Context. An agent selected anywhere else SHALL NOT have it.

#### Scenario: Agent's page
- **WHEN** a member opens the Info panel on an agent's page
- **THEN** the tabs are Details, Context and Content

#### Scenario: Card in the list
- **WHEN** a user selects an agent's card in the Agents list
- **THEN** there is no Content tab

### Requirement: Files of the conversation
Content SHALL list the files of the conversation on screen in two sections: Artifacts (`Common:AiArtifacts`), the files its replies produced, and Attachments (`Common:AiAttachments`), the files the user added to it, each the newest first and up to the server's first page of 100. It SHALL follow the conversation, another conversation showing its own files.

#### Scenario: Conversation with files
- **WHEN** a member opens Content in a conversation where they attached a document and the agent generated an image
- **THEN** Artifacts lists the image and Attachments lists the document

### Requirement: Empty screen of Content
A conversation with no file in either list, as a chat not sent yet, SHALL show the Info panel's empty screen in place of the two sections: its illustration, `Common:AiContentEmpty` and `Common:AiContentEmptyDescription`. It SHALL go to its files without blanking once its first message creates the conversation. When only one list has files, both sections SHALL stay and the empty one SHALL read `Common:AiContentEmpty`.

#### Scenario: New chat
- **WHEN** the member starts a new chat with Content open
- **THEN** the empty screen reads "No files yet" over its illustration and neither section is shown

#### Scenario: Only attachments
- **WHEN** the conversation has an attachment and no artifact
- **THEN** both sections are shown and Artifacts reads "No files yet"

### Requirement: Content follows the files the server announces
Content SHALL read both lists again when the server announces a new file of the conversation on screen: `s:modify-thread-files` with `cmd: "create"`, sent to its author in the agent's room `DIR-{projectId}`. The conversation's id SHALL be compared without regard to case, events close together SHALL make one read, and an event for another conversation SHALL be ignored.

#### Scenario: Artifact saved from another device
- **WHEN** the server announces a new artifact of the conversation on screen while Content is open
- **THEN** Artifacts lists it without a reload and without the existing rows blanking

### Requirement: Content follows the rounds of the conversation
A removed file is not announced and an event may be lost, so Content SHALL also read both lists again when a round of the conversation on screen starts, when one of its tool calls returns a result, and when it ends, fails or is stopped. Signals close together SHALL make one read, a signal for another conversation SHALL be ignored, and the rows shown SHALL stay on screen meanwhile. Content SHALL also read again when the browser tab becomes visible, and SHALL NOT read on a timer.

#### Scenario: Image generated in the open conversation
- **WHEN** a reply in the conversation on screen produces an image while Content is open
- **THEN** Artifacts lists the image once the round ends, without switching conversations and without the existing rows blanking

#### Scenario: File sent with a message
- **WHEN** the member sends a message with a document attached while Content is open
- **THEN** Attachments lists the document once the round starts

#### Scenario: Round in another conversation
- **WHEN** a round ends in a conversation other than the one on screen
- **THEN** Content reads nothing

#### Scenario: Back to the browser tab
- **WHEN** the member returns to the browser tab after a round ended while it was hidden
- **THEN** Content reads both lists again

### Requirement: Reads of Content do not cross
The answer of the latest read of a conversation SHALL win over an earlier read answered later, an answer for a conversation no longer on screen SHALL be dropped, and a read again that fails SHALL keep the lists shown.

#### Scenario: Answers out of order
- **WHEN** two reads of the same conversation are answered in the reverse order
- **THEN** Content shows the answer of the later read

#### Scenario: Conversation switched during a read
- **WHEN** the member opens another conversation while a read of the previous one is pending
- **THEN** the late answer is not shown

#### Scenario: Read again fails
- **WHEN** a read again after a round fails
- **THEN** the files listed before stay on screen

### Requirement: File rows of Content
Each row SHALL show the file's icon, its name and its size, and for an artifact the time it was produced. The name SHALL open the file in a new tab, except an image or a media file, which SHALL open in the media viewer over the agent's page, in the same tab. The attachments are the files kept in the conversation's folder: a file attached where it lies, because it could not be copied there, SHALL NOT be listed.

#### Scenario: Generated image
- **WHEN** a reply produced an image
- **THEN** its row shows the name, the size and the time, and opens the file by its name

### Requirement: Actions of a Content row
Each row SHALL end with an actions menu ("⋮") that offers Download and "Save to room..." (`Common:SaveToRoom`), which copies the file into a room or folder the user picks. It SHALL NOT offer "Open location": the folders of a conversation are internal to the agent and read-only to their author.

#### Scenario: Copying an artifact
- **WHEN** the user chooses "Save to room..." on an artifact's row and picks a room
- **THEN** the file is copied there

#### Scenario: No location to open
- **WHEN** the user opens the actions menu of an attachment's row
- **THEN** it offers Download and "Save to room..." and no "Open location"

### Requirement: Download all artifacts
While Artifacts lists more than one file, its heading SHALL offer "Download all" (`Files:DownloadAll`), which downloads them together as one archive. Attachments SHALL NOT offer it.

#### Scenario: Two artifacts
- **WHEN** the user chooses "Download all" with two artifacts listed
- **THEN** both files are downloaded together

### Requirement: Content is the author's own
Content SHALL show only the files of the caller's own conversation; the server answers both lists to its author only, the agent owner and admins refused. One list that cannot be read SHALL be shown empty without hiding the other; when neither can be read Content SHALL say that something went wrong. The server counts both lists, so the API client hands each over as `{ total, items }`; Content SHALL read the files out of `items`.

#### Scenario: Counted list
- **WHEN** the attachments of the conversation are answered as a counted list of one file
- **THEN** Attachments lists that file

#### Scenario: Artifacts unavailable
- **WHEN** the artifacts of the conversation cannot be read and its attachments can
- **THEN** Artifacts is empty and Attachments lists the files

### Requirement: An agent's contents are not listed
The Files views SHALL list nothing inside an agent, and its Details SHALL show no file or folder count, as the server lists no contents of an agent and reports no counters for it.

#### Scenario: Details of an agent with conversation files
- **WHEN** a member opens Details of an agent whose conversations hold files
- **THEN** no file or folder count is shown
