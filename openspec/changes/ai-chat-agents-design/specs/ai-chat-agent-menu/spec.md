# Spec Delta

## Purpose

Defines the title of the chat panel when the chat is open outside an agent's page: the menu of agents, saving the chat as a new agent, and the actions and history offered for the picked agent. What a pick does to the conversation is in `ai-agent-conversations`; who is offered what is in `ai-agent-access`.

Implementation: ui-kit's `ai-agent/ai-chat-panel` (header, agent picker) and chat store; the client's `AiPresetsBridge` and `AiPresetsStore` supply the agents, the rights and the actions.

## ADDED Requirements

### Requirement: Agent menu in the panel title
The title of the chat panel SHALL open a menu with "Default AI agent" (`Common:DefaultAIAgent`) and, under an "Agents" (`Common:Agents`) caption, the agents the user is a member of, the most recently active first, up to 100, with the one the chat runs on ticked. The first five agents SHALL show and the rest SHALL scroll.

#### Scenario: Member of two agents
- **WHEN** a user who is a member of two agents opens the title menu in the Rooms section
- **THEN** the menu lists "Default AI agent", ticked, and both agents with their logos

### Requirement: Agent list is kept current
The agents of the menu SHALL be read when the user signs in and again each time the chat panel or the menu opens. A failed read SHALL keep the last list.

#### Scenario: Invited meanwhile
- **WHEN** a user is invited to an agent while the chat panel is closed and then opens the menu
- **THEN** the new agent is listed

### Requirement: Title of the panel
The title SHALL read "AI Chat" (`Common:AIChatButton`) while the chat runs on the default agent, and the agent's logo followed by its name while it runs on an agent.

#### Scenario: Agent picked
- **WHEN** the user picks "Legal Reviewer" in the menu
- **THEN** the title shows the logo of "Legal Reviewer" and its name

### Requirement: Save as new agent
For a user who may create agents, the agent menu SHALL end, after a separator, with "Save as new agent" (`Common:SaveAsNewAgent`), a row in the link colour with a plus. Choosing it SHALL close the menu and ask for a name, pre-filled with "New agent" (`Common:NewAgent`), and create an agent from the chat's model and its DocSpace skill sets and knowledge bases, which SHALL then open on its own page. The panel header SHALL have no save button.

#### Scenario: Room admin saves the chat
- **WHEN** a room admin with a model and two connected DocSpace rooms chooses "Save as new agent" and names it "Research"
- **THEN** an agent "Research" is created with that model and those rooms, a notice names it, and the agent opens on its own page

#### Scenario: User
- **WHEN** a User opens the title menu
- **THEN** it lists the default agent and the agents, with no "Save as new agent"

### Requirement: Menu of a user with no agents
A user who may create agents and is a member of none SHALL still get the title as a menu, with "Default AI agent" and "Save as new agent" and no "Agents" caption. A user who may not create agents and is a member of none SHALL get a plain "AI Chat" title.

#### Scenario: Room admin without agents
- **WHEN** a room admin who is a member of no agent opens the chat panel
- **THEN** the title opens a menu with "Default AI agent" and "Save as new agent", and no "Agents" caption

#### Scenario: User without agents
- **WHEN** a User who is a member of no agent opens the chat panel
- **THEN** the title is plain text and opens nothing

### Requirement: Agent actions in the panel
With an agent picked, the panel header SHALL show an "Agent actions" (`Common:AgentActions`) menu with Edit agent (`Common:EditAgent`), Share agent (`Common:ShareAgent`), Agent info (`Common:AgentInfo`) and, after a separator, Delete agent (`Common:DeleteAgent`). An item SHALL be present only when the agent's rights allow the action to the user. The menu SHALL NOT hold Expand or "Save as new agent": the header's button and the title menu offer them.

#### Scenario: Agent owner
- **WHEN** the agent owner opens "Agent actions" on desktop
- **THEN** Edit agent, Share agent, Agent info and Delete agent are listed, and neither Expand nor "Save as new agent"

#### Scenario: Agent manager
- **WHEN** an Agent manager opens "Agent actions"
- **THEN** Edit agent, Share agent and Agent info are listed, and Delete agent is not

#### Scenario: Member who is a User
- **WHEN** a Member whose portal type is User opens "Agent actions"
- **THEN** only Agent info is listed

### Requirement: What the panel's agent actions open
Edit agent SHALL open the agent's edit form and Share agent the agent's invite panel, over the page the user is on. Delete agent SHALL ask for confirmation, delete the agent and return the chat to the default agent.

#### Scenario: Edit from a room
- **WHEN** an Agent manager in the room "Design for Marketing" chooses Edit agent for the picked agent
- **THEN** the agent's edit form opens over the room

#### Scenario: Delete from the panel
- **WHEN** the agent owner confirms Delete agent in the chat panel
- **THEN** the agent is deleted, the title reads "AI Chat" and the agent leaves the menu

### Requirement: Agent info from the panel
Agent info SHALL open the Info panel on the agent, on Details, in place of the chat panel and without leaving the page the user is on. Closing that Info panel SHALL bring the chat panel back on the same agent. On a page that has no Info panel, Agent info SHALL open the agent's page with the Info panel instead.

#### Scenario: Agent info from a room
- **WHEN** a Member in the room "Design for Marketing" chooses Agent info for the picked agent
- **THEN** the user stays in "Design for Marketing", the chat panel gives way to the Info panel, and it shows the agent on Details (`Common:SubmenuDetails`)

#### Scenario: Closing the Info panel of Agent info
- **WHEN** the user closes the Info panel that Agent info opened
- **THEN** the chat panel opens again, still on that agent, and the Files list has its own selection back

#### Scenario: Agent info from a page without the Info panel
- **WHEN** a Member on a settings page chooses Agent info for the picked agent
- **THEN** the agent's page opens with the Info panel on the agent

### Requirement: Saving a picked agent as a new one
From a picked agent, "Save as new agent" in the title menu SHALL create a new agent with the picked agent's model, skill sets and knowledge bases under the name the user enters, with the user as its owner. The picked agent SHALL stay unchanged.

#### Scenario: Copy of an agent
- **WHEN** a room admin who manages the rooms linked to "Legal Reviewer" saves it as "Legal Reviewer (EU)"
- **THEN** a new agent "Legal Reviewer (EU)" owned by the room admin exists with the same model and rooms, and "Legal Reviewer" is as it was

### Requirement: Rooms the user may not link
When the user who saves a chat as a new agent may not link one of its skill sets or knowledge bases to an agent, the agent SHALL still be created without that room, and a notice SHALL say what was left out.

#### Scenario: Member saves an agent whose rooms they only read
- **WHEN** a room admin who is a Member of "Legal Reviewer" and reads its rooms only through the agent saves it as a new agent
- **THEN** the new agent is created with the model and without those rooms, and a notice says the rooms were not linked

### Requirement: Panel header by agent
On the default agent the header SHALL show the title, Chat history, New chat, then Expand and Close. With an agent picked it SHALL show the title, New chat, "Agent actions", then Expand and Close; Chat history SHALL then be reached through "Agent actions" and SHALL NOT have a button of its own. Expand SHALL keep its button, on desktop, with or without an agent picked.

#### Scenario: Default agent
- **WHEN** the chat runs on the default agent on desktop
- **THEN** the header has the title, Chat history, New chat, Expand and Close

#### Scenario: Agent picked
- **WHEN** the user picks an agent
- **THEN** the header has the title, New chat, "Agent actions", Expand and Close

### Requirement: Chat history in the agent's menu
Under a "Chat history" (`Common:ChatHistory`) caption, "Agent actions" SHALL list the user's five most recent conversations with the agent, the one on screen marked, each with its conversation actions, and "Show more" (`Common:ShowMore`) when there are more. A click on a conversation SHALL open it, and "Show more" SHALL open the agent's full history.

#### Scenario: Seven conversations
- **WHEN** a Member with seven conversations with the agent opens "Agent actions"
- **THEN** the five latest are listed, the current one marked, followed by "Show more"

#### Scenario: No conversations yet
- **WHEN** a Member who has not chatted with the agent opens "Agent actions"
- **THEN** no "Chat history" caption and no conversation is shown
