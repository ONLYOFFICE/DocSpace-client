# Spec Delta

## Purpose

Says who is offered which agent action in the redesigned interface, by portal user type (portal owner, DocSpace admin, room admin, User, Guest) and by role in the agent (Agent owner, Agent manager, Member), so that every entry point (a card, a menu, a header, the chat panel, the Info panel) answers the way the server does. The rights themselves are the server's; this capability is about what the interface offers.

Implementation: the room's rights carried with the agent, the context option helpers, the invite panel and the role helpers in the client and shared; the chat store's agent actions in ui-kit.

## ADDED Requirements

### Requirement: Actions follow the agent's rights
Every place that offers an agent action SHALL decide by the rights the server returns for that agent and that user, and SHALL give the same answer everywhere. It SHALL NOT decide by the user's portal type or by the name of their role.

#### Scenario: Same answer everywhere
- **WHEN** a Member looks at the agent's card menu, its page menu and the chat panel's "Agent actions"
- **THEN** none of them offers Edit agent (`Common:EditAgent`)

#### Scenario: Role changed while the page is open
- **WHEN** an Agent manager is changed to Member while the agent's page is open
- **THEN** Edit agent and "Share agent" leave the header and the menus without a reload

### Requirement: Who may create an agent
Creating an agent, through the create control of the AI section, the "AI agent" (`Common:AIAgent`) type of the create dialog or "Save as new agent", SHALL be offered to the portal owner, DocSpace admins and room admins only. Users and Guests SHALL NOT be offered any of the three.

#### Scenario: Room admin
- **WHEN** a room admin opens the Agents list and the chat panel's title menu
- **THEN** the create control and "Save as new agent" are offered

#### Scenario: User
- **WHEN** a User opens the Agents list and the chat panel's title menu
- **THEN** neither a create control nor "Save as new agent" is offered

### Requirement: Roles of an agent
An agent SHALL have three roles: Agent owner (`Common:AgentOwner`), Agent manager (`Common:AgentManager`) and Member, which is the room's Content creator (`access` 11). Agent manager SHALL be offered only for a portal owner, a DocSpace admin or a room admin; a User SHALL be offered Member only. No read-only role (the room's Viewer) SHALL be offered: the server refuses it for an agent (server ecb2d0849a).

#### Scenario: Inviting a room admin
- **WHEN** an Agent manager picks a room admin in the agent's invite panel
- **THEN** Agent manager and Member are offered, with Agent manager preselected

#### Scenario: Inviting a User
- **WHEN** an Agent manager picks a User in the agent's invite panel
- **THEN** Member is the only role that can be chosen, and Agent manager is disabled with the note that only room admins and DocSpace admins can hold it (`Common:UserAgentMaxAvailableRoleWarning`)

### Requirement: Who may be invited to an agent
The agent's invite panel SHALL offer portal users only. It SHALL NOT offer guests, new or existing, groups, an invitation by e-mail, or an invitation link: members are invited by name only. The server refuses a group as a member of an agent in any role (server d2e3fe02c9).

#### Scenario: No guests and no groups
- **WHEN** an Agent manager opens the agent's invite panel and searches for a guest's name and for a group
- **THEN** neither is offered, and there is no Guests tab

#### Scenario: No invitation link
- **WHEN** an Agent manager opens the agent's invite panel
- **THEN** it offers no "Invite via link" section

### Requirement: What the Agent owner is offered
The Agent owner SHALL be offered: the chat, Agent info, Edit agent, Share agent, changing roles and removing members on the Info panel's Members tab, the "Manage ..." rows of the agent's skill sets and knowledge bases, removing a skill set in the slash menu, the model picker of the agent's chat, pin, notifications, change owner and Delete agent. The Agent owner SHALL NOT be offered leave.

#### Scenario: Owner on the agent's page
- **WHEN** the Agent owner opens the agent's page
- **THEN** the header has "Share agent", and the actions menu has change owner and Delete agent (`Common:DeleteAgent`), and neither Edit agent nor leave

### Requirement: What an Agent manager is offered
An Agent manager SHALL be offered: the chat, Agent info, Edit agent, Share agent, changing roles and removing members on the Info panel's Members tab, the "Manage ..." rows of the agent's skill sets and knowledge bases, removing a skill set in the slash menu, the model picker of the agent's chat, pin, notifications and leave. An Agent manager SHALL NOT be offered Delete agent or change owner.

#### Scenario: Manager on the agent's page
- **WHEN** an Agent manager opens the actions menu of the agent
- **THEN** it has Share agent and leave, and neither Edit agent, Delete agent nor change owner

### Requirement: What a Member is offered
A Member SHALL be offered: the chat, Agent info (`Common:AgentInfo`), the agent's skill sets and knowledge bases to read, their own data sources to add and remove, pin, notifications and leave. A Member SHALL NOT be offered Edit agent, Share agent, Delete agent, change owner, role changes, removals, any "Manage ..." row of the agent's skill sets and knowledge bases, or the model picker of the agent's chat.

#### Scenario: Member in the agent's chat
- **WHEN** a Member opens the agent's page
- **THEN** the chat works, the header has no "Share agent", and the actions menu has Agent info, copy link and Leave agent (`Common:LeaveTheAgent`) only

#### Scenario: Member reads a skill
- **WHEN** a Member who is not a member of the linked skill set opens one of its skills from the agent's Info panel
- **THEN** the skill opens for reading

### Requirement: What an admin outside the agent is offered
A portal owner or DocSpace admin who is not a member of an agent SHALL be offered: the agent in the Agents list, Agent info, pin, copy link, change owner and Delete agent. They SHALL NOT be offered the chat, the agent in any agent menu, Edit agent, Share agent, notifications, leave, role changes or removals.

#### Scenario: DocSpace admin opens someone else's agent
- **WHEN** a DocSpace admin who is not a member opens an agent from the Agents list
- **THEN** the "not a member" view is shown in place of the chat, and the actions menu has Agent info, copy link, change owner and Delete agent

#### Scenario: Room admin outside the agent
- **WHEN** a room admin is not a member of an agent
- **THEN** the agent is not in their Agents list, and its address answers with the server's error

### Requirement: Guests have no AI chat
The AI chat SHALL NOT be available to a Guest: a Guest SHALL NOT be offered the chat panel, an agent menu, the chat of an agent or any way to create an agent.

#### Scenario: Guest signs in
- **WHEN** a Guest opens a room they were invited to
- **THEN** no AI chat button, chat panel or agent menu is offered

### Requirement: Who may own an agent
Change owner SHALL offer as the new owner only users who may own an agent: the portal owner, DocSpace admins and room admins. The former owner SHALL stay in the agent as Agent manager, keeping their conversations, unless they choose to leave it. For the current owner, who may tick Leave agent, the panel SHALL say that leaving deletes their conversations and their files (`Common:AIProjectChangeOwnerLeaveInfo`); an admin changing another's agent sees `Common:AIProjectChangeOwnerInfo`.

#### Scenario: Hand over to a room admin
- **WHEN** the Agent owner hands the agent to a room admin and chooses to stay
- **THEN** the room admin is the Agent owner and the former owner is an Agent manager

#### Scenario: User as the new owner
- **WHEN** the Agent owner opens the change-owner list
- **THEN** no User and no Guest is offered

#### Scenario: Hand over and leave
- **WHEN** the Agent owner opens the change-owner panel of an agent
- **THEN** the panel says that leaving the agent as well deletes their conversations with it and the files in them, and when they hand it over with Leave agent ticked, their conversations with the agent are gone

#### Scenario: Admin changes another's owner
- **WHEN** a DocSpace admin who is not the owner opens the change-owner panel of an agent
- **THEN** the panel shows the note on who may own an agent and no warning about conversations

### Requirement: Removing a member warns about their conversations
On the Members tab of the agent's Info panel (`ai-agent-info-panel` "Members of an agent"), removing a member SHALL first ask for confirmation, titled `People:RemoveUser`, saying that the member's conversations with this agent and their files will be permanently deleted and not restored by a new invitation (`Common:RemoveAgentMemberWarning`), as the server deletes them. Nothing SHALL be sent before it is confirmed. Private and form-filling rooms keep their own removal texts.

#### Scenario: Agent manager removes a Member
- **WHEN** an Agent manager chooses to remove a Member from the agent's members list
- **THEN** the confirmation with the conversation warning opens, and the Member keeps access until it is confirmed

#### Scenario: Removal cancelled
- **WHEN** the Agent manager cancels that confirmation
- **THEN** no share change is sent and the Member stays

### Requirement: Leaving warns about the user's conversations
Leave agent SHALL ask for confirmation. For an Agent manager or a Member it SHALL say that their conversations with the agent and their files will be permanently deleted, and that a new invitation from an Agent manager lets them join again without them (`Common:LeaveAgentConversationsWarning`). The Agent owner, who cannot leave, SHALL be told to change the owner first (`Common:LeaveAgentDescription`). `Common:WantLeaveAgent` stays with the SDK's legacy agents.

#### Scenario: Member leaves
- **WHEN** a Member chooses Leave agent
- **THEN** the confirmation says their conversations with the agent and the files in them will be deleted and not restored by a new invitation

#### Scenario: Plain room
- **WHEN** a member of an ordinary room chooses to leave it
- **THEN** the confirmation keeps the room's text and says nothing about conversations

### Requirement: No portal-wide access
An agent SHALL be reachable by its members and, as the list of `ai-agents-list` says, visible to the portal owner and DocSpace admins. The interface SHALL NOT offer a way to make an agent available to everyone on the portal and SHALL NOT show an Access value such as "Everyone in DocSpace".

#### Scenario: Share an agent
- **WHEN** an Agent manager opens "Share agent"
- **THEN** the panel invites named portal users and offers no audience switch
