# Spec Delta

## Purpose

Defines the header of an agent's own page, the page that shows one agent's chat when it is opened from the Agents list, the sidebar or a link, and the actions that header offers to each role.

Implementation: the Home section header and the agent view in the client, the navigation component and the agent picker in ui-kit, the room context options for a room of type 12.

## ADDED Requirements

### Requirement: Header of an agent's page
For a member of the agent, the header of its page SHALL show, in this order: the agent's logo and name as the agent switcher, Chat history (`Common:ChatHistory`), New chat (`Common:AINewChat`), the agent's actions menu, the "Share agent" button when the user may share the agent, and the Info panel toggle.

#### Scenario: Agent manager
- **WHEN** an Agent manager opens the page of "Legal Reviewer"
- **THEN** the header shows the logo and name with an arrow, Chat history, New chat, the actions menu, "Share agent" and the Info panel toggle

#### Scenario: Member
- **WHEN** a Member opens the same page
- **THEN** the header shows the same without the "Share agent" button

### Requirement: Header for a non-member
For a portal owner or DocSpace admin who is not a member of the agent, the header SHALL show the agent's name as plain text, the actions menu and the Info panel toggle, with no agent switcher, no Chat history, no New chat and no "Share agent" button.

#### Scenario: DocSpace admin outside the agent
- **WHEN** a DocSpace admin who is not a member opens the page of "Legal Reviewer"
- **THEN** the header has the name, the actions menu and the Info panel toggle only, above the "not a member" view (`Common:AIProjectNotMember`)

### Requirement: Agent switcher
The title of an agent's page SHALL open a menu with "Default AI agent" (`Common:DefaultAIAgent`) and the agents the user is a member of, the open one ticked. Picking another agent SHALL open that agent's page, and picking "Default AI agent" SHALL open the AI Chat page.

#### Scenario: Switch to another agent
- **WHEN** a Member of "Legal Reviewer" and "Data Analyst" picks "Data Analyst" in the title of the page of "Legal Reviewer"
- **THEN** the page of "Data Analyst" opens

#### Scenario: Back to the default agent
- **WHEN** the Member picks "Default AI agent" there
- **THEN** the AI Chat page opens on the default agent

### Requirement: Actions menu of an agent
The actions menu of an agent SHALL list Edit agent (`Common:EditAgent`), Share agent and Agent info (`Common:AgentInfo`) first, then copy link, change owner and Leave agent (`Common:LeaveTheAgent`), and Delete agent (`Common:DeleteAgent`) last after a separator. An item SHALL be present only when the agent's rights allow the action to the user.

#### Scenario: Agent owner on the page
- **WHEN** the agent owner opens the menu on the agent's page
- **THEN** it lists Edit agent, Share agent, Agent info, copy link, change owner and Delete agent, and no Leave agent

#### Scenario: Agent manager on the page
- **WHEN** an Agent manager opens the menu on the agent's page
- **THEN** it lists Edit agent, Share agent, Agent info, copy link and Leave agent, and neither change owner nor Delete agent

#### Scenario: Member on the page
- **WHEN** a Member opens the menu on the agent's page
- **THEN** it lists Agent info, copy link and Leave agent only

#### Scenario: DocSpace admin outside the agent
- **WHEN** a DocSpace admin who is not a member opens the menu on the agent's page
- **THEN** it lists Agent info, copy link, change owner and Delete agent, and no Edit agent, Share agent or Leave agent

### Requirement: Actions menu on a card
On a card of the Agents list the menu of an agent SHALL also offer select and open before its other items, and pin and notifications after Agent info, as the card of a room does. Notifications SHALL be offered to members of the agent only.

#### Scenario: Member on a card
- **WHEN** a Member opens the menu of an agent's card
- **THEN** it lists select, open, Agent info, pin, notifications, copy link and Leave agent

#### Scenario: DocSpace admin outside the agent on a card
- **WHEN** a DocSpace admin who is not a member opens the menu of the agent's card
- **THEN** it lists select, open, Agent info, pin, copy link, change owner and Delete agent, and no notifications

### Requirement: Share agent
"Share agent", as the header button and as the menu item, SHALL open the agent's invite panel. It SHALL be offered to the agent owner and Agent managers only.

#### Scenario: Agent manager shares
- **WHEN** an Agent manager clicks "Share agent"
- **THEN** the agent's invite panel opens

#### Scenario: Member
- **WHEN** a Member looks at the header and the actions menu
- **THEN** neither offers "Share agent"

### Requirement: Agent info
"Agent info" SHALL open the Info panel of the agent on the Details tab (`Common:SubmenuDetails`), for everyone who can open the agent's page.

#### Scenario: Member
- **WHEN** a Member chooses Agent info on the agent's page
- **THEN** the Info panel opens on Details beside the chat

### Requirement: Delete agent from its page
Delete agent SHALL ask for confirmation, delete the agent outright and return the user to the Agents list.

#### Scenario: Owner deletes
- **WHEN** the agent owner confirms Delete agent on the agent's page
- **THEN** the Agents list opens without that agent

### Requirement: Leave agent from its page
Leave agent SHALL ask for confirmation with the warning of `ai-agent-access` "Leaving warns about the user's conversations", and once the server accepts it SHALL return the user to the Agents list, where the agent is no longer listed, and drop it from the agent menus.

#### Scenario: Member leaves from the page
- **WHEN** a Member confirms Leave agent on the agent's page
- **THEN** the Agents list opens without that agent, and the conversations the Member had with it are not listed anywhere

### Requirement: No sources column on the page
The page SHALL NOT show a column or a strip of sources beside the chat. The agent's skill sets, knowledge bases and the user's data sources SHALL be shown in the Info panel's Context tab and in the composer's "+" menu.

#### Scenario: Desktop
- **WHEN** a Member opens an agent's page on desktop with the Info panel closed
- **THEN** the chat fills the section body with no sources column beside it

### Requirement: Conversation files stay out of the Files views
The files an agent's conversations keep inside it SHALL NOT be listed or counted in the Files views, as the server lists an agent as empty. A file the user uploads into the agent from the chat SHALL NOT be added to the Files list, its count or the "file created" analytics, although its socket `create-file` reaches the uploader.

#### Scenario: Upload from the chat
- **WHEN** a Member attaches a file from the device in the chat on an agent's page
- **THEN** the file goes into the agent, and the Files store under the page gains no item and no count

#### Scenario: Agent in the Agents list
- **WHEN** a file is created inside an agent while the Agents list is open
- **THEN** the agent's file count in the list does not change
