# Spec Delta

## Purpose

Fixes the words the interface uses after the redesign: a room of type 12, which the `ai-projects` change called an AI project, is an agent everywhere a user can read it, its roles are agent roles, and the rooms linked to it are skill sets and knowledge bases. Internal names, routes and stored data are not part of this capability.

Implementation: the English values of the `Common` keys with `AIProject` in their name, the agent keys kept from the removed AI Agents feature, their translations, and the labels passed to ui-kit.

## ADDED Requirements

### Requirement: An AI project is called an agent
Every text the interface shows for a room of type 12 SHALL call it an agent: "AI agent" (`Common:AIAgent`) as the room type, "Agents" (`Common:Agents`) for the list, and "agent" in dialogs, menus, notices, hints and empty views. No text the interface composes SHALL call it an "AI project" or a "project".

#### Scenario: Create dialog
- **WHEN** a room admin opens the create dialog of the AI section
- **THEN** the third type is titled "AI agent", and picking it opens a form titled "Create agent" (`Common:CreateAgent`)

#### Scenario: Notice after saving
- **WHEN** a room admin saves a chat as the agent "Research"
- **THEN** the notice says that the agent "Research" was saved, with no "project" in it

#### Scenario: Not a member
- **WHEN** a DocSpace admin opens an agent they are not a member of
- **THEN** the view says they are not a member of this agent and tells them to ask an Agent manager for an invitation

### Requirement: Agent dialogs use the agent texts
The dialogs of an agent SHALL use agent wording: the form asks for the "Agent name" (`Common:AgentName`), leaving is "Leave agent" (`Common:LeaveTheAgent`) with a confirmation that speaks of the agent and of the conversations leaving deletes (`Common:LeaveAgentConversationsWarning`, see `ai-agent-access`), and deleting asks "Delete this agent?" (`Common:DeleteAIAgentTitle`).

#### Scenario: Delete confirmation
- **WHEN** the Agent owner chooses Delete agent
- **THEN** the confirmation is titled "Delete this agent?" and names the agent

#### Scenario: Leave confirmation
- **WHEN** a Member chooses Leave agent
- **THEN** the confirmation asks whether they really want to leave this agent and says that their conversations with it will be deleted

### Requirement: Agent role names
The roles of an agent SHALL be named "Agent owner" (`Common:AgentOwner`), "Agent manager" (`Common:AgentManager`) and "Member" wherever a role is shown or chosen: the invite panel, Contacts, the role descriptions and the change-owner dialog. "Project manager" and "Project owner" SHALL NOT be shown.

#### Scenario: Role menu on Contacts
- **WHEN** the Agent owner opens the role menu of a member on Contacts
- **THEN** it offers "Agent manager" and "Member"

### Requirement: Skill sets and knowledge bases of an agent
In the chat, the sidebar, the Skill sets and Knowledge bases lists and the Info panel of their rooms and files, and an agent's form, card and Info panel, an Instructions room SHALL be called a skill set and a Knowledge room a knowledge base. The room types SHALL keep the names "Instructions room" and "Knowledge room" in the create dialog and in the type filter.

#### Scenario: Agent form
- **WHEN** an Agent manager opens the agent's edit form
- **THEN** the two room selectors are labelled "Skill sets" (`Common:SkillSets`) and "Knowledge bases"

#### Scenario: Create dialog
- **WHEN** a room admin opens the create dialog of the AI section
- **THEN** the first two types are still titled "Instructions room" and "Knowledge room"

#### Scenario: Skill in the Info panel
- **WHEN** a user selects a skill with the Info panel open on Details
- **THEN** the room it lies in is named under "Skill set" (`Common:SkillSet`)

### Requirement: Server texts are shown as they come
The interface SHALL show the texts the server composes (error messages, notification e-mails, history entries) as they come, and SHALL NOT replace words in them.

#### Scenario: Refused save
- **WHEN** the server refuses to save an agent with a message of its own
- **THEN** the notice shows the server's message unchanged

### Requirement: Addresses keep their form
Renaming SHALL NOT change the addresses of the AI section: an agent SHALL stay at the address its room has, and a link copied before the renaming SHALL open the same agent after it.

#### Scenario: Link copied earlier
- **WHEN** a member opens a link to an agent that was copied before the renaming
- **THEN** the agent's page opens
