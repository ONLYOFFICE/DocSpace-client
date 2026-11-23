# Spec Delta

## Purpose

Defines the Agents list of the AI section: what it lists for each user, its My agents and Templates tabs, the templates catalog, its category tabs, the agent card and the agent's description.

Implementation: the Home section in the client (the filter, the section's submenu slot, the agent tile), `AiProjectsStore` for what a card shows, and the agent form.

## ADDED Requirements

### Requirement: Agents list
The Agents entry (`Common:Agents`) of the sidebar SHALL open the list of agents, titled "Agents", with search, filter, sort, the view switch and the Info panel toggle. It SHALL list the agents the user is a member of and, for the portal owner and DocSpace admins, every other agent of the portal as well.

#### Scenario: User
- **WHEN** a User who is a Member of two agents opens Agents
- **THEN** those two agents are listed and no other

#### Scenario: DocSpace admin
- **WHEN** a DocSpace admin who is a member of one of five agents opens Agents
- **THEN** all five are listed

### Requirement: My agents and Templates tabs
Over the filter the Agents list SHALL show two tabs, "My agents" (`Common:MyAgents`), selected by default, and "Templates" (`Common:Templates`). Both SHALL stay on the list's address, keep its title and sidebar entry, and be read from the address, so the choice survives a reload. While the section loads the tabs SHALL be drawn as a skeleton, as the header and the filter are.

#### Scenario: Back to the list
- **WHEN** the user chooses "My agents" on the Templates tab
- **THEN** the agents are listed again with the default filter

#### Scenario: Reload on Templates
- **WHEN** the user reloads the page on the Templates tab
- **THEN** the tabs are a skeleton while the section loads, and the Templates tab is shown again

### Requirement: Skill sets and Knowledge bases have no tabs
The Skill sets and Knowledge bases lists SHALL show no tabs over the filter and no templates. A tab named in their address SHALL be ignored and the list shown.

#### Scenario: Address with the Templates tab
- **WHEN** a user opens the Skill sets list at an address that names the Templates tab
- **THEN** the skill sets are listed with their filter, and no catalog is shown

### Requirement: Templates catalog
The Templates tab SHALL show, in place of the list and its filter, the agent templates that the AI service ships, as cards. A card SHALL show a logo, the name, the description cut to two lines, an install control, and rows for Category, the skill sets and knowledge bases the agent brings, and Owner, which names the organization with a verified mark.

#### Scenario: Templates of agents
- **WHEN** the user opens Agents and chooses "Templates"
- **THEN** the shipped agent templates are shown as cards and the title stays "Agents"

### Requirement: Search and categories of the catalog
Above the cards the catalog SHALL have a search field and, under it, a row of category tabs: "All" (`Common:All`), selected by default, then one per category of the listed templates. A tab SHALL narrow the cards to its category, the search SHALL narrow them by name, description or category, and both SHALL combine. With nothing left the catalog SHALL say that nothing was found (`Common:NotFoundTitle`).

#### Scenario: Category
- **WHEN** the user chooses "Presentation"
- **THEN** only the templates of that category are shown

#### Scenario: Category with a search
- **WHEN** the user chooses "Document" and types "review"
- **THEN** only the Document templates that match "review" are shown

### Requirement: Installing a template
Install SHALL create the template in the portal as new rooms through the AI service: the agent together with the skill sets and knowledge bases it brings, and the agent SHALL carry the template's category as its tag. On success the user SHALL be told (`Common:AiTemplateInstalled`) and returned to the My agents tab, or warned of what was skipped; on a refusal the catalog SHALL stay and the error SHALL be shown.

#### Scenario: Agent
- **WHEN** the user installs an agent template and confirms it
- **THEN** the agent, its skill sets and its knowledge bases are created, the agent is tagged with the template's category, a confirmation is shown and the My agents tab is opened

#### Scenario: Installed with warnings
- **WHEN** the installation answers with `instructionsNotSaved` or `modelNotSaved` in its warnings
- **THEN** one warning toast names what was skipped, the instructions first, and no plain confirmation is shown

### Requirement: Confirming a template install
Install SHALL first ask the user to confirm, naming the template and saying that it creates an agent with the skill sets and knowledge bases it brings. While an installation runs, every install control of that template SHALL be disabled.

#### Scenario: Cancelled
- **WHEN** the user chooses Install and then cancels the confirmation
- **THEN** nothing is created

#### Scenario: Second click while installing
- **WHEN** the user clicks Install again while that template is being installed
- **THEN** nothing happens: the controls are disabled until the installation ends

#### Scenario: Refused
- **WHEN** the AI service refuses the installation
- **THEN** the error is shown and the catalog stays open

### Requirement: Model of an installed agent
An installed agent SHALL be given the model the portal chats on at that moment (the profile of the `Chat` action, or of the `Default` slot when that action has none) as its own model, since a template names none. When the portal has no such model, or the model cannot be stored, the agent SHALL still be installed and the answer SHALL say so (`modelNotSaved` in `warnings`).

#### Scenario: Model of an installed agent
- **WHEN** the user installs an agent template on a portal that chats on a model
- **THEN** the agent's own model is that model, and it stays so when the portal's choice changes later

#### Scenario: Portal without a chat model
- **WHEN** the user installs an agent template on a portal with no chat model
- **THEN** the agent is installed without a model and the answer carries `modelNotSaved`

### Requirement: Template in the Info panel
With the Info panel open, a template card SHALL be selectable. The panel SHALL show the template on Details, with its description, Owner, Type "Template" and Category, and SHALL end with "Add to my agents", which installs it as Install does; its Context tab SHALL list the skill sets and knowledge bases it brings.

#### Scenario: Template selected
- **WHEN** a room admin selects the card of "Contract Comparator" with the Info panel open
- **THEN** the panel shows its description, owner, type and category, and "Add to my agents"

### Requirement: Category row
On the My agents tab, under the filter, the list SHALL show a row of categories: "All" (`Common:All`), selected by default, then one per tag carried by the agents the user can see. Exactly one SHALL be selected, and a row wider than the page SHALL scroll sideways. The row is the same control as the category row of the Templates tab.

#### Scenario: Tags in use
- **WHEN** a room admin can see agents tagged "Legal", "Reports" and "HR docs"
- **THEN** the row reads "All", "Legal", "Reports" and "HR docs", with "All" selected

#### Scenario: No tags
- **WHEN** none of the listed agents carries a tag
- **THEN** no category row is shown

### Requirement: Choosing a category
Choosing a category SHALL narrow the list to the agents that carry that tag, and "All" to every agent the user can see. The choice SHALL combine with the search text, SHALL be kept in the page address and SHALL survive a reload.

#### Scenario: Tag with a search
- **WHEN** the user chooses "Legal" and types "review" in the search
- **THEN** only the agents tagged "Legal" whose name matches "review" are listed

### Requirement: Agent card
In the tile view an agent SHALL be a card with its logo and name, its description cut to two lines, an "Open chat" button, the actions menu, and rows for Category (the agent's first tag, when it has one), Model (`Common:AIAgentModel`), Skill sets (`Common:SkillSets`), Knowledge bases and Owner (`Common:Owner`). The owner's name SHALL open the owner's profile.

#### Scenario: Card of an agent
- **WHEN** an agent has a description, a model, two skill sets and one knowledge base
- **THEN** its card shows the logo, the name, two lines of the description, the "Open chat" button, the actions menu and the four rows

### Requirement: Model on a card
The Model row of a card SHALL name the model the agent runs on: its own model, or, for an agent without one, the portal's chat model. It SHALL NOT read "Default"; while no model is known it SHALL show a dash.

#### Scenario: Agent without a model of its own
- **WHEN** an agent stores no model and the portal's chat model is "GLM 5.3 Flash"
- **THEN** the Model row reads "GLM 5.3 Flash"

### Requirement: Skill sets and knowledge bases on a card
The Skill sets and Knowledge bases rows of a card SHALL each name the linked rooms on one line after the kind's icon: the first two of a kind, cut when they do not fit, then "+N" for the rest, which is never cut. A kind with no linked room SHALL show a dash. The cards SHALL be laid out in the columns of the room tiles, and every card of the list SHALL keep the same height, also after the user comes from the Skill sets or Knowledge bases list, whose tiles are lower.

#### Scenario: Four skill sets
- **WHEN** an agent links four skill sets
- **THEN** the Skill sets row of its card names the first two on one line, then "+2"

#### Scenario: No knowledge base
- **WHEN** an agent links no knowledge base
- **THEN** the Knowledge bases row of its card shows a dash

#### Scenario: Coming from Skill sets
- **WHEN** the user opens Agents in the tile view right after Skill sets
- **THEN** the agent cards are drawn at their own height, with no row overlapping the next

### Requirement: Open chat from a card
The "Open chat" button of a card SHALL open the agent's page on its chat. It SHALL be shown only on agents the user is a member of.

#### Scenario: Member
- **WHEN** a Member clicks "Open chat" on the card of "Legal Reviewer"
- **THEN** the page of "Legal Reviewer" opens with its chat

#### Scenario: DocSpace admin outside the agent
- **WHEN** a DocSpace admin looks at the card of an agent they are not a member of
- **THEN** the card has no "Open chat" button

### Requirement: Agent description
An agent SHALL have an optional plain-text description. It SHALL be entered in the agent's create and edit form, shown on the agent's card and on the Details tab of its Info panel. An agent without one SHALL show no description on its card and no Description section on Details.

#### Scenario: Agent manager edits the description
- **WHEN** an Agent manager changes the description in the agent's edit form and saves
- **THEN** the card and the Details tab show the new text

#### Scenario: No description
- **WHEN** an agent has no description
- **THEN** its card shows the name with no description line under it

### Requirement: Who changes the description
The description SHALL be changed only by those who may edit the agent: the agent owner and Agent managers. A Member SHALL read it and SHALL NOT be offered a way to change it.

#### Scenario: Member
- **WHEN** a Member opens the actions menu of an agent
- **THEN** no Edit agent is offered, so the description cannot be changed

### Requirement: No official agents
Every agent SHALL be shown as owned by a portal user. The list, the card and the Info panel SHALL NOT mark an agent as official or verified and SHALL NOT show a provider in place of its owner.

#### Scenario: Owner row
- **WHEN** any agent is listed
- **THEN** its Owner row names the portal user who owns it, with no Verified badge
