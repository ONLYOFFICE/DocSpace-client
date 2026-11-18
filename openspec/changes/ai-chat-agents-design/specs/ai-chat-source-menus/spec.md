# Spec Delta

## Purpose

Defines the composer's two menus for the sources of a chat: the "+" menu's lists of skill sets, knowledge bases and data sources, and the slash menu, which lists the skills and, under them, the knowledge bases and data sources. It covers a chat on the default agent, where the user picks the sources, and a chat that runs on an agent, where skill sets and knowledge bases are the agent's settings.

Implementation: the ai-chat library draws the lists (its composer components and dropdown); ui-kit builds their rows and callbacks in `ai-agent/providers`; the client says through the chat store who manages the sources.

## ADDED Requirements

### Requirement: Composer toolbar
The composer toolbar SHALL hold the "+" menu, the model picker and Send, and nothing else. It SHALL NOT show separate Skill sets, Knowledge bases or Commands buttons, and it SHALL NOT show count badges.

#### Scenario: Two skill sets connected
- **WHEN** a user with two connected skill sets looks at the composer
- **THEN** the toolbar shows "+", the model picker and Send, with no badge and no other button

### Requirement: Sources in the "+" menu
After its file entries the "+" menu SHALL list Prompts, Skill sets (`Common:SkillSets`) and Knowledge bases in one group, Data sources in the next, then the web search switch. On desktop a source entry SHALL open its list beside the menu; on a phone the list SHALL take the menu's place, with a way back.

#### Scenario: Desktop
- **WHEN** a user opens "+" on desktop and points at Data sources
- **THEN** the Data sources list opens beside the menu

### Requirement: Skill sets list
The Skill sets entry SHALL open the same skill list as the slash menu: a "Skill sets" caption, a line saying that the assistant picks a skill itself and that a pick calls one explicitly, then every connected skill set as a group that folds and unfolds, with its skills under it. A connected skill set with no skills SHALL be listed as a group with no rows.

#### Scenario: Two sets
- **WHEN** the chat has the skill sets "Document assistant" and "Sales assistant" connected and the user opens "+" > Skill sets
- **THEN** both are listed as groups under the caption and the hint, each with its skills under it

#### Scenario: Set without skills
- **WHEN** a connected skill set holds no skill
- **THEN** it is listed as a group with no rows

### Requirement: Calling a skill from a list
A click on a skill in the Skill sets list or in the slash menu SHALL add its call to the draft; a click on a skill the draft already calls SHALL take that call out. A called skill SHALL be marked with a tick in both lists, and of several skills with one name only the picked one SHALL be ticked. No "Added" label SHALL be used.

#### Scenario: Pick from the "+" menu
- **WHEN** the user picks "Contract review" in "+" > Skill sets with the draft "Check this"
- **THEN** the draft reads "Check this /contract-review " and the skill is ticked in both lists

#### Scenario: Pick a called skill
- **WHEN** the user picks a ticked skill again
- **THEN** its call leaves the draft and the tick goes

### Requirement: Slash menu
Typing "/" at the start of the draft or after a space SHALL open a menu above the composer. Its "Skill sets" caption and hint SHALL stay on top, and under them one scrolling body SHALL list the skill list with "Manage skill sets...", then a Knowledge bases section with the connected bases and "Manage knowledge bases...", then a Data sources section with the connected folders and rooms and "Manage sources...".

#### Scenario: Open the menu
- **WHEN** a user with two skill sets, one knowledge base and one folder connected types "/"
- **THEN** the menu lists the two sets with their skills, then the knowledge base, then the folder, each section ending with its "Manage ..." row

### Requirement: Filtering the slash menu
What is typed after the slash SHALL narrow the skills by name or description, with every set unfolded, and the knowledge bases and data sources by name. While something is typed the "Manage knowledge bases..." and "Manage sources..." rows SHALL be hidden, and a section left with no rows SHALL be left out.

#### Scenario: Filter
- **WHEN** the user types "/sum" and no knowledge base or data source has "sum" in its name
- **THEN** only the skills whose name or description matches "sum" are listed, under their sets, and neither the Knowledge bases nor the Data sources section is shown

### Requirement: Keyboard in the slash menu
The arrow keys, Enter and Tab SHALL move among and pick the skills only. The rows of knowledge bases and data sources and the "Manage ..." rows SHALL NOT be reached by them, and a click on the row of a knowledge base or a data source SHALL do nothing.

#### Scenario: Arrow past the skills
- **WHEN** the highlight is on the last skill and the user presses the down arrow
- **THEN** the highlight goes back to the first skill, not to a knowledge base

### Requirement: Knowledge bases and data sources in the slash menu
In the slash menu each knowledge base SHALL end with a bin labelled "Disconnect knowledge base: <name>" and each data source with a bin labelled "Disconnect folder: <name>". Using a bin SHALL disconnect that source and keep the menu open with the input focused. In a chat that runs on an agent the knowledge bases SHALL follow "Lists of a chat on an agent".

#### Scenario: Disconnect a folder from the slash menu
- **WHEN** the user uses the bin of the folder "Contracts 2026" in the slash menu
- **THEN** the folder leaves the menu, the menu stays open, and the next round does not read that folder

### Requirement: Skill calls in the draft
A skill call in the draft SHALL be drawn inline with the text, in the link colour. It SHALL NOT be drawn as a chip above the input.

#### Scenario: Two calls
- **WHEN** the draft calls "/document-summary" and "/draft-proposal"
- **THEN** both are coloured inside the text and no chip row appears above the input

### Requirement: Removing a skill set
Each skill set in the Skill sets list and in the slash menu SHALL end with a bin control labelled "Disconnect room", shown at all times, not only while the row is pointed at or focused. Using it SHALL disconnect the set from the chat, SHALL take the calls of its ticked skills out of the draft, SHALL NOT fold the set, and SHALL keep the list open with the input focused. In a chat that runs on an agent the control SHALL follow "Lists of a chat on an agent".

#### Scenario: Remove from the slash menu
- **WHEN** the user uses the bin of "Sales assistant" in the slash menu
- **THEN** the set and its skills leave the list, the list stays open, and the next round runs without those skills

#### Scenario: A called skill of the removed set
- **WHEN** the draft reads "/ticket-reply hi /" and the user removes the set that holds "Ticket reply"
- **THEN** the draft reads "hi /"

#### Scenario: A call shared with another set
- **WHEN** two sets each hold a ticked skill named "summary" and the user removes one of the sets
- **THEN** one "/summary" call leaves the draft and the other stays

### Requirement: Knowledge bases list
The Knowledge bases entry SHALL list the connected knowledge bases, one row each. In a chat on the default agent each row SHALL offer a "Remove <name>" control that disconnects the base and keeps the list open.

#### Scenario: Remove a base
- **WHEN** the user uses the remove control of "Company policies" in "+" > Knowledge bases
- **THEN** the row goes, the list stays open, and the next round does not search that base

### Requirement: Knowledge bases with vectorization off
While vectorization is off on the portal, neither menu SHALL offer a way to connect a base, nor "Manage knowledge bases..." to those who may edit the agent the chat runs on. Bases connected earlier SHALL stay listed, removable on the default agent, and with none connected the Knowledge bases entry of the "+" menu and the section of the slash menu SHALL be absent.

#### Scenario: One base connected earlier
- **WHEN** vectorization is turned off while the chat has "Company policies" connected
- **THEN** both menus show that base with its remove control and no "Manage knowledge bases..." row

### Requirement: Data sources list
The Data sources entry SHALL list the folders and rooms the user connected as the chat's context, one flat row each, with no further level. A row SHALL carry the room icon for a room and the folder icon for a folder, and a "Remove <name>" control that disconnects it and keeps the list open.

#### Scenario: A room and a folder
- **WHEN** the user connected the room "Design for Marketing" and the folder "Contracts 2026"
- **THEN** the list shows two rows, the first with the room icon and the second with the folder icon, each with its remove control

### Requirement: Data sources limit
A chat SHALL take at most 20 data sources. At the limit neither menu SHALL offer a way to add another until one is removed.

#### Scenario: Twenty connected
- **WHEN** 20 folders and rooms are connected
- **THEN** both menus show them with their remove controls and no "Manage sources..." row

### Requirement: Manage rows
Each of the three lists, in the "+" menu and in the slash menu, SHALL end, directly under its rows, with its own row in the link colour with a gear: "Manage skill sets...", "Manage knowledge bases..." and "Manage sources...". On the default agent they SHALL open the picker of Instructions rooms, of Knowledge rooms, and of folders and rooms, with what the chat uses ticked.

#### Scenario: Manage knowledge bases
- **WHEN** the user chooses "Manage knowledge bases..." on the default agent
- **THEN** the Knowledge room picker opens with the connected bases ticked

### Requirement: Rooms a user can connect
On the default agent the pickers SHALL offer every Instructions room and Knowledge room the user can read, whatever their role in it, and the folders and rooms the user can open.

#### Scenario: Viewer of a skill set
- **WHEN** a user who is a Viewer of the Instructions room "Sales assistant" opens "Manage skill sets..."
- **THEN** "Sales assistant" is offered and can be connected

#### Scenario: Room the user cannot read
- **WHEN** an Instructions room exists that the user is not a member of
- **THEN** the picker does not offer it

### Requirement: Lists of a chat on an agent
In a chat that runs on an agent, the skill sets and knowledge bases of both menus SHALL be the agent's linked rooms. For the agent owner and Agent managers the "Manage ..." rows of the "+" menu and "Manage knowledge bases..." of the slash menu SHALL open the agent's edit form. Members SHALL get no remove control and no such row. No one SHALL get a remove control on a knowledge base.

#### Scenario: Agent manager in the "+" menu
- **WHEN** an Agent manager (`Common:AgentManager`) chooses "Manage skill sets..." in "+" > Skill sets of the agent's chat
- **THEN** the agent's edit form opens, not the room picker

#### Scenario: Member
- **WHEN** a Member opens "+" > Skill sets and the slash menu in the agent's chat
- **THEN** the agent's skill sets and skills are listed with no remove control and no "Manage skill sets..." row

#### Scenario: Agent manager and the knowledge bases of the slash menu
- **WHEN** an Agent manager opens the slash menu in the agent's chat
- **THEN** the agent's knowledge bases are listed with no bin, and "Manage knowledge bases..." opens the agent's edit form

### Requirement: Slash menu of a chat on an agent
For the agent owner and Agent managers the slash menu of an agent's chat SHALL change the agent's skill sets in place: each set SHALL keep its remove control, and "Manage skill sets..." SHALL open the picker of Instructions rooms with the connected sets ticked, not the agent's edit form.

#### Scenario: Agent manager in the slash menu
- **WHEN** an Agent manager opens the slash menu in the agent's chat and chooses "Manage skill sets..."
- **THEN** the Instructions room picker opens with the agent's skill sets ticked, and the slash menu stays open under it

### Requirement: Saving a skill set change to the agent
A skill set removed in the slash menu of an agent's chat, and a pick of its "Manage skill sets..." picker, SHALL be saved to the agent, so every member's chat follows it. Only what changed SHALL be written: the sets connected and the sets disconnected, so a linked room the chat does not list stays linked. A pick that changes nothing SHALL write nothing.

#### Scenario: Remove a set
- **WHEN** the agent owner removes "Sales assistant" in the slash menu of the agent's chat
- **THEN** the room is unlinked from the agent, and another member's chat on that agent stops listing it

#### Scenario: A linked set without skills
- **WHEN** the agent links "Empty set", which holds no skill and is not listed in the chat, and a manager connects "Legal" through "Manage skill sets..."
- **THEN** the agent links both "Empty set" and "Legal"

### Requirement: Order and failure of skill set saves
Skill set changes made in an agent's chat SHALL be saved one after another, each starting from the agent as the one before it left it. When a save is refused the user SHALL see the error and the chat SHALL go back to the skill sets the agent has.

#### Scenario: Two removals in a row
- **WHEN** the manager removes two sets one right after the other
- **THEN** both are unlinked, and neither save restores the set the other removed

#### Scenario: Refused save
- **WHEN** the server refuses the save of a removed set
- **THEN** an error is shown and the set is listed in the chat again

### Requirement: Data sources of a chat on an agent
In a chat that runs on an agent, Data sources SHALL stay the user's own: every member SHALL add and remove them in both menus as on the default agent, they SHALL NOT be saved to the agent, and they SHALL NOT be visible to other members.

#### Scenario: Member adds a folder
- **WHEN** a Member connects a folder through "Manage sources..." in the agent's chat
- **THEN** the folder is used by that Member's rounds only and the agent's settings are unchanged
