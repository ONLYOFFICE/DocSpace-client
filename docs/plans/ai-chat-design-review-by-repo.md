# AI Chat design review: findings by repository

This is a temporary working document. It takes the findings of the AI Chat design review of 2026-11-17 (`docs/plans/ai-chat-design-review-2026-11-17.md`) and groups them by the repository where each one is fixed. Work that the fix also needs in another repository is listed under "Also needs". Code locations were found by reading the code, not by running it, so line numbers are approximate. An item whose location is uncertain is marked "(low confidence)". When several report sections describe the same problem, they are merged into one item that keeps all of their report lines. "Report: lines" points into the review file. Paths are relative to the root of the section's repository unless another repository is named.

| Repository | Items |
|---|---|
| onlyoffice-ai-chat | 17 |
| docspace-ui-kit-react | 18 |
| client | 90 |
| server (C#) | 6 |
| server (ASC.AI.Chat) | 3 |
| **Total** | **134** |

## onlyoffice-ai-chat

### Chat state: connected sources and titles

- [ ] **[bug]** Skill sets, knowledge bases and data sources connected to a new chat are lost on a page reload. After connecting "Contract review" (and, separately, the room "11") and reloading, the slash menu reads "No skills are connected to this chat" and lists no data source. The sets and the knowledge base connected in the first session were gone as well. As a result, an agent saved from such a chat with "Save as new agent" got no skill sets.
  Where: `src/ui/store/create-clouds-store.ts:51-57, 184, 265, 294`: `selectedContextFolders`, `selectedKnowledgeFolders` and `selectedFolderContexts` are memory-only ("not persisted and resets with the widget"). They travel only per round in `actionArgs` (`src/core/actions/types.ts:72-92`) and are never stored with the thread. Persist them per thread and restore them when the thread opens. Save as new agent (client `packages/client/src/components/AiPresetsBridge/index.tsx:499-509` via `aiPresetsStore.savePreset`, fed by ui-kit's `onSavePreset` from the clouds store) takes whatever the clouds store still holds, so this fix covers it too.
  Also needs: docspace-ui-kit-react (`ai-agent/providers/context-room/ContextRoomSync.tsx` calls `clearContextFolder()` on mount when there is no context room, which would wipe anything restored); server (ASC.AI.Chat) (a place to store them, e.g. thread metadata in `app/storage/threadsStorage.ts`, which has no such field today). The client's `packages/client/src/components/AiChatPageBridge/aiChatPageMemory.ts` restores only the page and threadId.
  Report: lines 281-285, 338-339

- [ ] **[bug]** A conversation started with a file uploaded from the device shows "New chat" in the history and in Recent for several minutes. The generated title does arrive later. Only the delay differs from conversations started with text.
  Where: `src/core/services/ai/engine.ts` (~l.478-501): on a new thread `generateTitle` is fed `resolvedMessages`, which is the user message with its attachment refs hydrated to the full file content, so the title request for a message led by a file is slow. `PLACEHOLDER_TITLE` "New chat" (~l.66) stays until the thread-title event arrives. Build the title from the message text plus the attachment names instead of the hydrated file.
  Also needs: server (ASC.AI.Chat) (runs this engine in `app/controllers/aiController.ts`; needs only the library bump)
  Report: lines 474-476, 527-529

### Composer "+" menu

- [ ] **[bug]** The composer's "+" menu opens over the input instead of above it.
  Where: `src/ui/pages/chat/sub-components/ComposerActionAttachments.tsx:536` renders `<DropdownMenu trigger items open onOpenChange>` without `side`. The default Shell in `src/ui/components/dropdown/index.tsx` then picks the side itself (`spaceBelow >= spaceAbove ? "bottom" : "top"`). When the composer is in the upper half of the screen (an empty or fullscreen chat), the menu drops onto the input. Pass `side="top"` and a matching `align` for the "+" menu.
  Report: lines 73

- [ ] **[bug]** With the "+" menu open, pressing Escape and then clicking in the input only closes the menu. The input is not focused, so the text typed next is lost.
  Where: `src/ui/pages/chat/sub-components/ComposerActionAttachments.tsx:536-542` renders the menu through `src/ui/components/dropdown/index.tsx` (Radix `DropdownMenu.Root`, modal by default, no `onCloseAutoFocus`). The modal layer swallows the outside click and focus returns to the "+" trigger. Use `modal={false}` for this menu or move focus to the composer input on close. ui-kit does not override this component.
  Report: lines 304-306

- [ ] **[task 1.5, 1.7]** "+" > Skill sets shows a flat list of the connected rooms, each with the room icon. The board shows the "Skill sets" caption and its hint, with each set as a group that lists its skills.
  Where: `src/ui/pages/chat/sub-components/ComposerSourceMenus.tsx` `useSourceMenus` (skills branch, `toRows`) renders the host list as plain rows, and `ComposerMenuItem` in `src/ui/pages/chat/composer-menu-items.ts` has no caption or hint. Offer the grouped skill list of `ComposerSkillsMenu.tsx` (caption `t("SkillSets")`, hint `t("SkillSetsHint")`, `groupSkillsBySet`) as a dropdown level behind one widget option.
  Also needs: docspace-ui-kit-react (`ai-agent/providers/files/use-composer-sources.ts` `build()` maps the connected rooms to flat rows with icon `btn-room`; switch `composerSkills` to the shared list)
  Report: lines 82-84

- [ ] **[task 1.8]** The rows of the "+" lists (skill sets, knowledge bases, data sources) have no remove control. The board draws one on each connected source.
  Where: `ComposerMenuItem` in `src/ui/pages/chat/composer-menu-items.ts` has no trailing action, and `toRows()` in `ComposerSourceMenus.tsx` maps only `onClick` and `subMenu`. Add a trailing remove action that neither runs the row nor closes the menu (task 1.3).
  Also needs: docspace-ui-kit-react (`ai-agent/providers/files/use-composer-sources.ts` `build()` gives each row only an `onClick` that opens the room, and a data source hides Disconnect in a second-level submenu; pass the remove action there, see the ui-kit item on "+" > Data sources); client (a `Common:RemoveSource` label, task 1.9)
  Report: lines 89

- [ ] **[design]** In the "+" menu the Data sources entry has a folder icon and reads "Data sources". The board uses a sliders icon and "Data Sources".
  Where: `src/ui/pages/chat/sub-components/ComposerSourceMenus.tsx:459-460`: `dataSourcesIcon = "source-context"` is the folder icon (`src/assets/source-context.svg`); switch it to the sliders icon (`btn-settings`). The label is `src/translations/en.json:192` `"DataSources": "Data sources"`. The library uses sentence case, so the capitalisation is a design decision.
  Report: lines 90-91

- [ ] **[design]** The composer's own menus ("+" and its sub-lists) are denser than on the boards: rows are about 27 px high against 34 px, and the text is not semibold. The product's context menu uses rows of about 31 px.
  Where: `src/ui/styles/index.css:52` (`--dropdown-item-height: 26px`), `src/ui/components/dropdown-item/index.tsx:331` (`font-normal`) and `:369` (the row height comes from that variable). Change the defaults here.
  Also needs: docspace-ui-kit-react (alternatively, the chat shell overrides the variable, as `ai-agent/new-chat/NewChat.module.scss:11` does)
  Report: lines 183-185

### Chat messages

- [ ] **[task 8.1-8.5]** No agent logo is shown beside the assistant's replies in an agent's chat.
  Where: `src/ui/pages/chat/sub-components/AssistantMessage.tsx:694-722`: the grid has no avatar or logo cell, and there is no widget option for one. Add the option (task 8.1).
  Also needs: docspace-ui-kit-react (`ai-agent` passes the agent's logo, task 8.4); client (passes the logo of the agent the chat runs on from `packages/client/src/components/AiPresetsBridge`, task 8.5)
  Report: lines 139

- [ ] **[task 8.1-8.5]** A document the agent creates appears as a link in the reply text, not as a document card with "created by ...".
  Where: `src/ui/components/tool-fallback/index.tsx` and `AssistantMessage.tsx:709` (`tools: { Fallback: ToolFallback }`): a host has no hook to draw named tool results (task 8.3). The card also needs a tool result that carries the file, from ASC.AI.Chat or the .NET editor tools.
  Also needs: docspace-ui-kit-react (the card with "created by" in `ai-agent`, task 8.4); client (`Common:CreatedByAgent`, task 8.5)
  Report: lines 139-140

- [ ] **[task 8.2]** The attachment of a sent message is drawn as a separate chip above the message bubble instead of inside the message under the text.
  Where: `src/ui/pages/chat/sub-components/UserMessage.tsx:401-417` (the attachments block sits in its own grid row above the bubble). Add the option that places the attachments inside the bubble under the text, with the larger image preview.
  Also needs: docspace-ui-kit-react (turns the option on, task 8.4)
  Report: lines 315-317

- [ ] **[task 8.3, 8.4]** A generated image is drawn at the full width of the chat column (about 680 px square) as a bare picture: no card, no file name, no Download and no "Save to room…" action.
  Where: `imageSlot` in `src/ui/components/tool-fallback/index.tsx` (~l.176-205): the `isImageGeneration` branch renders a plain `<img className="block max-w-full">`. Wrap it in a card with the file name, a built-in Download and slots for host actions (task 8.3).
  Also needs: docspace-ui-kit-react ("Save to room…", a folder selector plus copy, through that slot; nothing for it exists under `ai-agent/` yet, task 8.4); client (`Common:SaveToRoom`, task 8.5)
  Report: lines 349-352

- [ ] **[task 8.3, 8.4]** When a generated image arrives, the chat does not scroll to the end, so the reply under the image stays off screen until the user scrolls down.
  Where: `src/ui/pages/chat/index.tsx` (`ThreadInner` / `ThreadPrimitive.Viewport`): the runtime's autoscroll follows DOM mutations only. The unsized `<img>` in `src/ui/components/tool-fallback/index.tsx` grows the thread when it loads, which is not a mutation. Reserve the image's size or aspect ratio, or re-pin to the bottom when the image loads (ResizeObserver) while the chat is following.
  Report: lines 351-352

- [ ] **[design]** The two items of the user's message menu use different case: "Save AI Prompt" and "Save AI prompt to folder".
  Where: `src/translations/en.json:114` (`"SaveAIPrompt": "Save AI Prompt"`), used at `src/ui/pages/chat/sub-components/UserMessage.tsx:310`. Change it to sentence case and sync the other languages.
  Report: lines 318-319

### Composer slash menu

- [ ] **[design]** The slash menu draws the connected room "11" with the folder icon, and its bin is labelled "Disconnect folder: 11". The menu does not tell a room from a folder.
  Where: `src/ui/pages/chat/sub-components/ComposerSkillsMenu.tsx:563-569` and `758-768`: `dataSourceRows` use one `icon="source-context"` and `removeLabel` `t("DisconnectFolderContext")` for every row. Once task 1.4 carries the kind of the source in `src/ui/store/create-clouds-store.ts`, pick the icon and the label from it (for example the existing `DisconnectRoom` key).
  Also needs: docspace-ui-kit-react (`ai-agent/providers/files/context-folder-dialog.tsx` must record the kind, room or folder, when it calls `addFolderContext`)
  Report: lines 290-291

- [ ] **[design]** The slash menu is about 300 px high with a scrollbar, where the board shows the whole list. It is also narrower than on the board and sits flush against the input.
  Where: the root div className of `ComposerSkillsMenu` in `src/ui/pages/chat/sub-components/ComposerSkillsMenu.tsx`: `max-h-[var(--chat-skills-menu-max-height,360px)]`, `w-[min(var(--chat-skills-menu-width,320px),calc(100%-2*padding))]`, `mb-[4px]`. Neither ui-kit nor the client overrides these variables, so change the defaults (height, width, gap above the input) here.
  Report: lines 92-94

- [ ] **[design]** The slash menu's "Manage ..." rows (skill sets, knowledge bases, sources) carry a sliders icon. Board 06 draws a gear and board 01 a plus.
  Where: `src/ui/pages/chat/sub-components/ComposerSkillsMenu.tsx`: `<Icon name="btn-settings">` on the "Manage skill sets..." row (~l.735) and in the manage row of `SourcesSection` (~l.262). `btn-settings.svg` is a sliders glyph and there is no gear asset, so add one to `src/assets` and to the ImagesProvider types. The "+" menu's Manage rows need it too.
  Report: lines 94-95

## docspace-ui-kit-react

### Chat panel and fullscreen chat

- [ ] **[bug]** A history list opened in one place opens by itself in the others. Opened in the fullscreen chat, it shows up again on the agent's page and in the room's chat panel.
  Where: there is a single chat with one router. `ai-agent/providers/ai-chat-store/AiChatStoresBridge.tsx` mirrors the router's `currentPage` into AiChatStore, and `ai-agent/new-chat/index.tsx:124` renders the history whenever `currentPage` is "history". `AiChatStore.close()` (l.469), `open()` and `openPreset()`/`openProject()` (l.422-436) never send the router back to "chat". Reset the page (router `goToChat`) when the panel closes or a fresh preset or project opens, e.g. in the `pendingPreset` reaction of `AiChatStoresBridge` and on `isVisible` -> false. The client's reload memory (`AiChatPageBridge`) restores the history on purpose and stays as it is.  Report: lines 71-72

- [ ] **[bug]** The first Escape does not close the agent menu of the chat title, and the next click only closes the menu instead of acting. The Rooms context menu closes on the first Escape.
  Where: `ai-agent/ai-chat-panel/components/ai-chat-agent-picker/index.tsx`: Escape is handled only in `onMenuKeyDown` on the menu's inner div (l.165). After a mouse click (`open(null)`) the focus stays on the trigger, and `onTriggerKeyDown` (l.124) ignores Escape. The outside click goes to DropDown `clickOutsideAction` (l.236), which only closes the menu. Handle Escape on the trigger, or at document level while the menu is open, and let the outside click go on to its target.
  Report: lines 74-76

- [ ] **[conflict, task 4.5 gated]** The panel's "⋮" menu lists Edit agent, Share agent, Agent info and Delete agent, as the spec says. Board 03 lists Share agent, New chat, Save as new agent, Expand and a Chat history list.
  Where: `ai-agent/ai-chat-panel/components/ai-chat-agent-actions/index.tsx` renders only the host's `store.agentActions`. The board's New chat, Expand, and the agent's latest conversations with Show more are task 4.5. That task waits on the conversation scope (3.1/3.2). Reconcile the board and the spec first.
  Also needs: client (`packages/client/src/components/AiPresetsBridge/index.tsx` l.333-388 builds the Edit/Share/Info/Delete actions); server (ASC.AI.Chat) (the agent-scoped thread list)
  Report: lines 108-110

- [ ] **[conflict]** The "AI Chat" title of the fullscreen chat has a menu arrow (the agent menu). Boards 01 and 05 draw a plain title. The ai-chat-agent-menu spec requires the menu, and the client follows the spec.
  Where: `renderTitle()` in `ai-agent/ai-chat-panel/components/ai-chat-panel-header-container/index.tsx` (l.44-51) renders `<AiChatAgentPicker>` whenever `store.hasAgentPicker`. Change it only if the board and the spec (openspec ai-chat-agent-menu) are reconciled toward a plain title.
  Report: lines 99-101

- [ ] **[design]** Board 03: with an agent picked, the room chat panel cuts the agent's name ("Contract Revie..."). The header holds five buttons (history, new chat, agent actions, expand, close), while the board has only "+", "⋮" and "✕".
  Where: `ai-agent/ai-chat-panel/components/ai-chat-panel-header/index.tsx` draws the title, ChatToolbar (`ai-agent/chat-toolbar/index.tsx`: Chat history and New chat), extras (AiChatAgentActions), fullscreen and close. Once the history is in the "⋮" menu (task 4.5), drop the Chat history button while an agent is picked. Move Expand into the menu as the board draws it.
  Report: lines 106-107

### Composer "+" menu

- [ ] **[spec, task 1.8]** In "+" > Data sources, a connected room is drawn with the folder icon and a chevron that opens a further level, and the row has no remove control. ai-chat-source-menus "Data sources list" requires one flat row, the room icon for a room, and a "Remove <name>" control.
  Where: `ai-agent/providers/files/use-composer-sources.ts:152-188`: `composerDataSources` gives every connected folder the icon `source-context` and a nested `items:[Disconnect]` submenu. Make it a flat row with a trailing remove action and a room or folder icon.
  Also needs: onlyoffice-ai-chat (task 1.3: a trailing action and a link tone on a host menu row, `src/ui/components/dropdown-item`; task 1.4: a kind on a connected data source, `src/ui/store/create-clouds-store.ts`)
  Report: lines 286-289

- [ ] **[task 1.8, 1.9]** All three "+" sub-lists (Skill sets, Knowledge bases, Data sources) end with the same "Manage sources" row, after a separator and in the default text colour. The board has "Manage Skill Sets...", "Manage Knowledge Bases..." and "Manage Sources..." in the link colour, each with a gear icon and no separator.
  Where: `ai-agent/providers/files/use-composer-sources.ts`: `manage()` (~l.90-97) and the data-source-add row (~l.172-179) both use `t("Common:ManageSources")`. `build()` (~l.80-82) and `composerDataSources` (~l.170-171) add the separators. Use one key per list and drop the separators.
  Also needs: onlyoffice-ai-chat (`ComposerMenuItem` in `src/ui/pages/chat/composer-menu-items.ts` has no link tone, task 1.3, and its only manage icon, `btn-settings`, is a sliders glyph; there is no gear asset in `src/assets`); client (`public/locales/en/Common.json` has `"ManageSources": "Manage sources"`: add `Common:ManageSkillSets` and `Common:ManageKnowledgeBases`, and reword `ManageSources` with an ellipsis, task 1.9)
  Report: lines 85-88

### Agent page header

- [ ] **[spec]** On an agent's page the header runs name, "⋮", Share agent, and puts Chat history and New chat at the far right. The board and ai-agent-page "Header of an agent's page" want name, Chat history, New chat, "⋮", Share agent.
  Where: the render order in `components/navigation/sub-components/ControlBtn.tsx` (l.200-209). The only host slot, `analyzeResponsesButton`, is drawn last, after the context button and the navigation (Share agent) button. `TControlButtonProps` in `Navigation.types.ts` has no slot before the context button, although task 5.1 is ticked (f5205a33 added only `titleContent`). Add a slot that is drawn before the context button.  Also needs: client (`packages/client/src/pages/Home/Section/Header/index.js:1133-1152` then passes `<ChatToolbar>` there instead of `analyzeResponsesButton`; the `.projectChatToolbar` rules in `packages/shared/styles/SectionHeader.module.scss:65-72` need a check)
  Report: lines 131-133

- [ ] **[design]** At 682 px the header of an agent's page truncates "Share agent" to "Share ag…" and "Try Business" to "Try Busin…". It also moves the "⋮" menu to the far right, after Chat history and New chat.
  Where: `components/navigation/sub-components/ControlBtn.tsx`: below the desktop breakpoint the row is `row-reverse`, and the DOM order (l.200-209: AI chat, plus, context button, info toggle, ..., tariffBar, analyzeResponsesButton, tablet nav button) puts the context button at the trailing edge. The widths and truncation of `.navigation_button` and `.tariffWrapper` are in `components/navigation/Navigation.module.scss`.  Also needs: client (places the agent ChatToolbar in `analyzeResponsesButton` and passes TariffBar, `packages/client/src/pages/Home/Section/Header/index.js` ~l.1120-1145)
  Report: lines 615-618

### Chat file and folder pickers

- [ ] **[check, design]** The chat's selectors ("Add files from storage", the data sources picker opened by "Manage sources..." and "Save as docx") have no title and no close button, so the breadcrumb root "Apps" stands where the title should be. The same selector opened from a knowledge base is titled "Select" and has a close button.
  Where: `ai-agent/providers/files/attach-dialog.tsx` (FilesSelector ~l.168-200), `context-folder-dialog.tsx` (~l.136-170) and `save-dialog.tsx` (~l.210-243) render FilesSelector without `withHeader`/`headerProps`. `context-rooms-dialog.tsx` (~l.111-120) does pass `headerLabel` and `onCloseClick`. Pass `withHeader` with a fitting `headerLabel` and `onCloseClick` in all three. The label of the root crumb comes from `getDefaultBreadCrumb` in `selectors/utils/index.ts` (`getBrandName("ProductName")` = "Apps").
  Report: lines 292-293, 320-321, 455-458

- [ ] **[check]** The AI section of the data sources picker lists the Instructions and Knowledge rooms together. They can be ticked as plain data sources, next to the two lists (Skill sets, Knowledge bases) made for them.
  Where: `ai-agent/providers/files/context-folder-dialog.tsx:136-161` does not pass `withAIRoomsTreeFolder`, which defaults to true (`selectors/Files/index.tsx:63`), so the picker offers the AI root (type 41) with room types 10/11. Pass `withAIRoomsTreeFolder={false}`, or disable those room types.
  Report: lines 294-296

- [ ] **[design]** In the data sources picker, Select is enabled while nothing is ticked.
  Where: `ai-agent/providers/files/context-folder-dialog.tsx:121-133`: `getIsDisabled` disables Select only on first load, or at the root with `pickedCount` 0. Inside any folder Select stays enabled and submits the open folder. Disable it while `pickedCount === 0` in "add" mode.
  Report: lines 297-298

- [ ] **[design]** In the data sources picker, the Files and Forms entries carry the same icon.
  Where: `selectors/Files/hooks/useRootHelper.tsx:31` (`catalogIcons[FolderType.USER] = CatalogDocumentsSvg`) and `:188` (the Forms item uses the avatar `<CatalogDocumentsSvg />`). Give Forms its own catalog icon.
  Report: lines 297-298

- [ ] **[design]** The two room pickers opened from the composer have mismatched titles: the skill set picker reads "Instructions rooms" and the knowledge picker reads "Knowledge bases".
  Where: `ai-agent/providers/files/context-rooms-dialog.tsx:112-119`: `headerLabel` is `t("Common:InstructionsRooms")` for the skills picker and `t("Common:AIProjectKnowledgeRooms")` for the knowledge picker. Use `t("Common:SkillSets")`, which already exists in the client's `public/locales/en/Common.json` (l.2264).
  Also needs: client (the agent form's selector has the same split, `packages/client/src/pages/AiProjects/sub-components/dialogs/CreateEditProjectDialog.tsx` l.472, task 2.2; covered by the client item on the agent form)
  Report: lines 96-97

### Chat attachments

- [ ] **[task 8.2]** The chip of an attached file carries the room-grid (rooms catalog) icon instead of the file-type icon. This happens in the chat panel draft and on a sent message in the fullscreen chat.
  Where: `ai-agent/providers/images-overrides/index.tsx:89-90`: `documents: makeIcon(RoomsIcon)` was meant for a knowledge base chip, but it overrides the file-format image "documents". ai-chat's `getFileIconName` (`src/shared/utils.ts` ~l.137-147) returns that name for every text-document file, and the file chip draws it (`src/ui/components/file-item/index.tsx` ~l.51/125). Drop the `documents` override. No knowledge chip in ai-chat uses that name any more: knowledge rows use `source-knowledge`.
  Report: lines 315-317, 449-450

### Shared components (product-wide)

- [ ] **[product-wide]** Table column headers are cut with an ellipsis when a column is narrow ("Last modifi…"). The column widths are the user's own saved widths.
  Where: `components/table/sub-components/table-header-cell/TableHeaderCell.module.scss:88-95` (`.text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis }`). Change the header here, or widen the default minimum widths in the client.  Also needs: client (the saved widths come from the column storage of the client's `TableStore`)
  Report: lines 210-211

- [ ] **[product-wide]** A room tile without tags shows its room type as a tag: "Custom" in Rooms, "Instructions rooms" on a skill set and "Knowledge rooms" on a knowledge base. The boards draw no such tag.
  Where: the tags `useMemo` in `components/tiles/room-tile/index.tsx` (l.69-108): the else branch at l.97 pushes `{ isDefault: true, label: getRoomTypeName(item.roomType, t) }`. Agents get "No tags" instead (l.89).
  Also needs: client (the label text comes from `getRoomTypeName` in `packages/client/src/helpers/filesUtils.js` l.77-80, `Common:InstructionsRooms` / `Common:KnowledgeRooms`, passed by `TilesView/FileTile.js` l.268)
  Report: lines 216-217

- [ ] **[product-wide]** No item in the product's context menus is red, Delete included. Board 08 draws "Delete agent" in red.
  Where: `ContextMenuType` in `components/context-menu/ContextMenu.types.ts` (l.37) has no danger or destructive flag, and `ContextMenu.module.scss` has no such style. Add a danger variant.
  Also needs: client (set the variant on the delete item, `option_delete` in `packages/client/src/store/contextOptionsStore/filesContextOptions.helpers.ts` l.983)
  Report: lines 224-225

## client

### Chat panel on a picked agent

- [ ] **[spec, task 3.4]** A room's or Files' chat panel can run on an agent picked in its title menu. There, the slash menu shows controls that an agent's chat must not have. Every role gets the bin "Disconnect knowledge base: Contract standards". A Member also gets "Disconnect room", "Manage skill sets..." and "Manage knowledge bases...". ai-chat-source-menus "Lists of a chat on an agent" gives no one a remove control on a knowledge base, and gives Members no remove control and no Manage row. Seen on two agents, for the Agent manager and the Member. On the agent's own page the menu is right. Nobody tested whether the Member's controls change the agent or only the chat.
  Where: `packages/client/src/components/AiPresetsBridge/index.tsx` (`onAgentSelect` ~l.247 and the `pendingApply` reaction ~l.429-449) applies the agent with `aiChatStore.applyPreset()` but never calls `aiChatStore.setSourcesManager()`. Only `packages/client/src/pages/AiProjects/AiProjectView.tsx:285-305`, on the agent's page, does. Without a sources manager, ui-kit's `ai-agent/providers/index.tsx` computes `skillSetsLocked=false` (l.746) and `knowledgeOwned = !!sourcesManager` false (l.761-764; also `owned` in `ai-agent/providers/files/use-composer-sources.ts` ~l.101), and does not pass `hideKnowledgeDisconnect`. ai-chat's `ComposerSkillsMenu.tsx` then shows the set bins (:638), "Manage skill sets..." (:724), and the knowledge bin and Manage row (:557, :561). Fix: while `activePreset` is set outside the agent's page, set a sources manager decided by `activePreset.rights.edit`. For the owner and managers, `onManage` opens the agent form and `onSkillRoomsChange` saves to the agent; for members, use `onManage: null`. Clear the sources manager when the agent is dropped (task 3.4, "owner of the sources").
  Also needs: docspace-ui-kit-react (reads `sourcesManager`; no change expected)
  Report: lines 46-49, 441-443, 548-550, 564-569

- [ ] **[spec, task 3.4 gated]** In a chat panel running on a picked agent, the model picker is still an editable dropdown. ai-agent-conversations "Model of a chat on an agent" requires a label that no role can change, on the agent's page and in the panel alike. The agent's page already shows the label; the panel does not. Seen on a second agent too.
  Where: `packages/client/src/Shell.jsx:1035` passes `profilePickerReadOnly={isInsideAiProject}`, which is true only on the agent's page (`/ai-rooms/` with an open project). It must also be true while `aiPresetsStore.activePreset` is set by AiPresetsBridge. The prop already reaches ai-chat through ui-kit's AiAgentProviders (`ai-agent/providers/index.tsx:1174`) and `WidgetConfig.profilePickerReadOnly`, so only the host flag needs changing.
  Report: lines 50-53, 441-443

- [ ] **[spec, task 3.4 gated]** The chat panel with a picked agent is not scoped to that agent. Picking an agent while the chat already has messages keeps the default agent's conversation on screen under the picked agent's name. ai-agent-conversations "Picking an agent in the chat panel" requires a new conversation on the picked agent. The panel's Chat history also lists the default agent's conversations instead of the agent's own: "Simple Red Circle on White Background" of "QA test agent" is missing. ai-agent-conversations "History of an agent" requires the agent's own history.
  Where: `chatEntityId` in `packages/client/src/Shell.jsx` (~l.915-920) is set only for `isInsideAiProject && aiActiveProject`. `onAgentSelect` (~l.247) and the `pendingApply` reaction (~l.429-449) in `AiPresetsBridge/index.tsx` call `aiChatStore.applyPreset()`. ui-kit applies it in place: `applyPreset` in `ai-agent/providers/ai-chat-store/AiChatStore.ts` (~l.443) sets `pendingPresetFresh=false`. Fix: pass the picked agent's id as `entityId` for `activePreset` and mark it as an agent scope. ui-kit's live re-scope (`ai-agent/providers/index.tsx` ~l.1018-1060, `isAgentRoom`) then resets the thread and lists the agent's threads. The servers can already list threads by scope (`ThreadQueries` in ASC.AI.Integration filters by EntryId; `threadsStorage.ts` in ASC.AI.Chat has the scopes, task 3.2a).
  Also needs: docspace-ui-kit-react (alternatively, an apply mode that starts a fresh conversation without forcing fullscreen)
  Report: lines 433-436, 437-440

- [ ] **[design]** The suggestion chips under an empty chat disappear once an agent is picked in the chat panel. The board keeps them.
  Where: `packages/client/src/Shell.jsx:1045-1051`: `suggestions={isInsideAiProject ? project suggestions : aiPresetContextRooms ? NO_SUGGESTIONS : aiSuggestions}`. With an agent picked (`aiPresetContextRooms`) it passes `NO_SUGGESTIONS`. Pass the section chips or the agent's own suggestions (`files/rooms/{id}/suggestions`) instead.
  Report: lines 111-112

### Fullscreen chat

- [ ] **[bug]** In the fullscreen chat, the address bar and the browser tab title stay those of the Agents list (`/ai-rooms/filter?type=12`, "Agents - ONLYOFFICE").
  Where: `openAiChatPage` in `packages/client/src/components/ClientArticleSidebar/index.tsx` (~l.297-313) navigates to the agents list and opens the chat over it through `dialogsStore.requestAiChatPage`. The chat has no route of its own (recorded in openspec design.md l.181). The tab title stays the one the section fetch set (`setDocumentTitle` in `packages/client/src/store/filesStore/fetch.helpers.ts`). Set the document title while the fullscreen chat is shown, and if wanted, give the chat an address of its own in `packages/client/src/routes`. A good place is `packages/client/src/components/AiChatPageBridge/index.tsx`, where `isChatPage` is computed.
  Report: lines 64-65

- [ ] **[bug]** With a fullscreen chat open in the tab, opening another address of the AI Chat section by URL (the Templates tab, an opened skill set) shows the fullscreen chat over that page instead of the page. ai-agent-conversations "A reload keeps the open chat" covers only a reload of the same page.
  Where: `packages/client/src/components/AiChatPageBridge/index.tsx`: the restore effects (~l.105-128) reopen whatever `readAiChatPage()` returns on any load of the tab. `aiChatPageMemory.ts` (`TAiChatPageMemory {page, threadId}`, a sessionStorage key per user) stores no address. When writing the memory (~l.133-145), remember the pathname and search the chat covered. Reopen the chat only when the loaded address matches; otherwise drop the memory.
  Report: lines 515-519

### Sidebar

- [ ] **[bug]** A skill set or a knowledge base opened by its short address (`/ai-rooms/32/filter?folder=32`, without `type`) highlights Agents in the sidebar instead of Skill sets or Knowledge bases.
  Where: `getClientActiveId` in `packages/client/src/helpers/articleNavigation.ts` (~l.255-258): under `/ai-rooms/` the entry is read only from the `type` query (`AI_HUB_TYPE_ITEM_IDS[getSingleRoomType(search)]`) and falls back to "ai-rooms" (Agents). Pass the open folder's `roomType`/`parentRoomType` (selectedFolderStore) from `ClientArticleSidebar/index.tsx` (`locationActiveId` ~l.350), the way `isTemplatesFolderRoot` is passed. Map InstructionsRoom and KnowledgeRoom to `ai-rooms-skills` and `ai-rooms-knowledge`.
  Report: lines 68-70

- [ ] **[spec]** On an agent's page, the sidebar's Recent lists only that agent's conversations and hides the rest. ai-agent-conversations "Recent in the sidebar" says that Recent lists the conversations that belong to no agent, until the storage can list all conversations together.
  Where: `packages/client/src/components/AiChatPageBridge/index.tsx` (~l.147-176): Recent mirrors the chat's own threads store (`useThreadsStore(s => s.threads)`, `ensureThreads(chatStores.getEntityId())`). On an agent's page that store is scoped to the agent id (`chatEntityId` in `Shell.jsx`). Feed `dialogsStore.setAiChatRecentThreads` from a list read without a scope (`entityId` undefined), kept apart from the current chat's scope. If the client cannot read such a list next to the scoped store, it needs an unscoped list call through ui-kit's `api/ai` or the ai-chat threads service.
  Report: lines 57-60

- [ ] **[spec, task 3.6 gated]** In the sidebar's Recent, a click on a conversation of "QA test agent" opened it in the default agent's fullscreen chat ("AI Chat" title, model dropdown) instead of on the agent's page. This breaks ai-agent-conversations "Opening a conversation of another agent".
  Where: `openAiChatPage` in `packages/client/src/components/ClientArticleSidebar/index.tsx` (~l.296-313) always navigates to the agents list and requests the default chat page. It should open the thread on its agent (`/ai-rooms/{agentId}`), which needs the thread's agent id.  Also needs: onlyoffice-ai-chat (the `Thread` type has no agent id, `src/types.ts` / `src/core/types.ts`, task 3.3); server (ASC.AI.Chat) (must return the agent id in the thread list, `app/storage/threadsStorage.ts`, task 3.2); server (C#) (the thread list without a scope returns only threads with `EntryId == null`, `common/ASC.AI.Integration/Database/ThreadQueries.cs` ~l.110-119)
  Report: lines 523-526

- [ ] **[design]** The sidebar group of recent conversations reads "Recent". The board has "Recents".
  Where: `packages/client/src/components/ClientArticleSidebar/index.tsx` (~l.750-754): item `ai-chat-recent`, label `t("Common:AIChatRecent")`. The value is `"AIChatRecent": "Recent"` in `public/locales/en/Common.json` (l.117). Reword it, then run translate-stale/translate-locales.
  Report: lines 98

- [ ] **[untagged]** The collapsed sidebar shows a logo for every listed agent and puts Skill sets and Knowledge bases as icons below Recent. At a window height of 900 px they can only be reached by scrolling the sidebar.
  Where: `packages/client/src/components/ClientArticleSidebar/index.tsx:708-783` orders the AI Chat children as: Agents, each agent's ProjectLogo `iconNode`, Show more, Recent with its threads, then Skill sets and Knowledge bases last. Reorder these items, or leave out the per-agent rows in icon-only mode.  Also needs: docspace-ui-kit-react (children are rendered icon-only by `components/nav-menu`, `iconOnly`)
  Report: lines 275-277

### Navigation between sections

- [ ] **[bug]** After leaving an opened knowledge base for Files, the Files address keeps the AI list's room-type query `type=11` (`/rooms/personal/filter?folder=4&…&type=11`).
  Where: `packages/shared/api/files/filter.ts`: `getOtherSearchParams` (~l.124-167) copies every query param it does not know from `window.location.search` into `FilesFilter.toUrlParams` (~l.542-546). The AI section's RoomsFilter `type`, set by `getAiWorkspaceTabUrl` in `packages/client/src/helpers/aiWorkspace.ts`, is not on its strip list, so it rides into the room URL and on into Files. Strip `type` (and the AI list's `tab`) there, or build the Files URL without carrying params from another section.
  Report: lines 444-446

- [ ] **[bug]** When the Templates tab is opened by URL right after an opened skill set, it keeps the room's header: a back arrow, "Agents" as a title with a dropdown arrow, and a "⋮" menu. The browser tab title is just the product name.
  Where: on the Templates tab, `packages/client/src/pages/Home/index.js` (~l.775) renders `<AiTemplatesCatalog/>` instead of `<Outlet/>`, so `useFiles` in `pages/Home/View/index.tsx` (~l.222) never fetches the list. `selectedFolder`/`navigationPath` stay the skill set room (the header is in `pages/Home/Section/Header/index.js`), and the files store never sets the document title. On the Templates tab, still load the AI section root (or reset `selectedFolder` to it) and set the document title.
  Report: lines 520-522

### Agent page

- [ ] **[bug]** A file uploaded from the device in the chat on an agent's page makes the page show the Files list's filter row (search, filter, sort and view buttons) between the header and the chat. The row stays until the page is left or reloaded.
  Where: in `packages/client/src/pages/Home/index.js`, `shouldRenderSectionFilter` (~l.674-688) depends only on `!isEmptyPage`. The upload lands in the root of the project room, so the list stops being empty and `Section.SectionFilter` (~l.748-757) renders on the agent's page. Add `!isAiProjectRoomRoot` to the filter condition, as is already done for `isAiTemplatesTab`.
  Report: lines 471-473, 529-530

- [ ] **[spec]** On the "not a member" page, the agent's title has a dropdown arrow that opens the breadcrumb "AI rooms". ai-agent-page "Header for a non-member" asks for the name as plain text.
  Where: `packages/client/src/pages/Home/Section/Header/index.js:949-954` passes `titleContent` (the agent switcher) only when `selectedFolder.inRoom`. For a non-member, ui-kit's Navigation falls back to its default title with ArrowIcon/toggleDropBox (`components/navigation/Navigation.tsx:88-97, 163-205`; `sub-components/Text.tsx`). On an agent's root, pass the name as plain text through `titleContent` for a non-member.
  Report: lines 590-592

- [ ] **[task 2.2]** The empty state of the agent's page labels its source groups "Skills" and "Knowledge" instead of "Skill sets" and "Knowledge bases".
  Where: `packages/client/src/pages/AiProjects/sub-components/project/ProjectIntro.tsx:169` (`t("Common:Skills")`) and `:172` (`t("Common:AiWorkspaceKnowledge")` = "Knowledge"). Use `Common:SkillSets` and a "Knowledge bases" key (`Common:AIProjectKnowledgeRooms`, or a new key in agent wording).
  Report: lines 137-138

- [ ] **[task 2.3]** The "not a member" view reads "You are not a member of this AI project. Only project members can chat in it. Ask a Project manager to invite you." It should use agent wording.
  Where: `packages/client/src/pages/AiProjects/AiProjectView.tsx:330-331` uses `Common:AIProjectNotMember` and `Common:AIProjectNotMemberDescription` (`public/locales/en/Common.json:201-202`). Reword them or switch to agent keys, then run translate-comments and translate-stale.
  Report: lines 593-594

- [ ] **[product-wide]** The header of every opened room starts with a back arrow, an agent's page included. Boards 08-10 draw no back arrow on the agent's page, while boards 12 and 15 (an opened skill set and an opened knowledge base) keep it.
  Where: `packages/client/src/pages/Home/Section/Header/index.js`: `isRoot` (l.548, from `pathParts` at l.1366) is passed as `isRootFolder` to ui-kit's Navigation (l.1031). ui-kit's `components/navigation/Navigation.tsx` (l.290) renders ArrowButton whenever `!isRootFolder`. Hide the arrow only on the agent's page (`isAiProjectRoomRoot`) with a client condition.  Also needs: docspace-ui-kit-react (a new prop, if `isRootFolder` must stay false)
  Report: lines 222-223

### Agent actions menu and dialogs

- [ ] **[bug]** On an agent's page, "Delete room" was confirmed. The agent left the sidebar, but the screen that opened was mixed. It had the Agents title with the My agents/Templates tabs and Agents selected in the sidebar, over the body of the Rooms section (room type tiles, "All rooms", "Add group", room "11"). The address was `/ai-rooms/filter?sortBy=DateAndTime&sortOrder=descending` with no `type`, and the browser tab read "Rooms". The Agents list should open (task 5.5).
  Where: `redirectToParentImpl` in `packages/client/src/store/filesStore/socket.helpers.ts`, case `FolderType.AiHub` (~l.615-623), builds a RoomsFilter with searchArea AiHub and no room type. When the removed room is an agent (roomType 12), navigate to `getAiWorkspaceTabUrl(false, RoomsType.AiProjectRoom, userId)` instead, as `onLeaveRoomImpl` does (`filesActionsStore/rooms.helpers.ts:606-610`). The same applies after `deleteRoomsActionImpl` (`filesActionsStore/delete.helpers.ts:697`).
  Report: lines 598-605

- [ ] **[spec]** The agent's owner is offered "Leave the room" in the agent menu. It opens a dialog that asks the owner to assign another owner first. ai-agent-page "Actions menu of an agent" gives the owner no Leave agent.
  Where: `packages/client/src/store/filesStore/contextOptions.helpers.ts`: the room option list (~l.812, "leave-room") is trimmed for AI projects (~l.884-897: `isAiProject` removes archive, save-as-template and duplicate), but "leave-room" is never removed for the owner. Remove it when `item.roomType === RoomsType.AiProjectRoom` and the current user is the owner (`item.createdBy.id === user.id`).
  Report: lines 490-492

- [ ] **[task 5.3]** The agent's menus keep a room's wording, order and items. On the agent's page, the owner's "⋮" menu reads Edit room, Invite people, Download, Room info, Change room owner, Leave the room, Delete room. For an Agent manager, the card menu reads Select, Open, Pin to top, Disable notifications, Edit room, Invite people, Copy link, Download, Room info, Leave the room. The Agent manager's page menu reads Edit room, Invite people, Copy link, Download, Room info, Leave the room. The items are allowed correctly. They should read Edit agent, Share agent, Agent info, Leave agent, Delete agent, in that order. Download is not in the specs' agent menu (Edit, Share, Agent info, Leave, Delete, plus select/open/pin/notifications).
  Where: the labels are in `packages/client/src/store/contextOptionsStore/filesContextOptions.helpers.ts`: edit-room (~l.467-468, `Common:EditRoom`), invite-users-to-room (476, `Common:InviteContacts`), download (674), room-info (701, `Common:RoomInfo`), change-room-owner (804), leave-room (948, `Common:LeaveTheRoom`), delete (992, `Common:DeleteRoom`). The header reaches them through `getFilesContextOptions` (`headerOptions.helpers.ts:172`). The order and the items are set by `roomOptions` in `packages/client/src/store/filesStore/contextOptions.helpers.ts` (~l.780-815) and the AI project trim (~l.884-908), which keeps "download" whenever `item.security.Download` is true. For `RoomsType.AiProjectRoom`, switch to `Common:EditAgent`, `ShareAgent`, `AgentInfo`, `LeaveTheAgent` and `DeleteAgent`, reorder the items and drop "download". Refresh the contextOptionsStore snapshots afterwards.
  Report: lines 134-136, 380-381, 543-547

- [ ] **[task 5.3]** Notices and dialogs for an agent still use room wording: the toast "Room pinned", the "Leave the room" dialog title, and the owner's text "You are the owner of this room".
  Where: `packages/client/src/store/filesActionsStore/helpers.ts` (~l.137) uses `Common:RoomPinned` / `RoomUnpinned` for an agent. `packages/client/src/components/dialogs/LeaveRoomDialog/index.js` (~l.92-98) uses `LeaveTheRoom` / `LeaveRoomDescription` / `WantLeaveRoom`; switch them to `LeaveTheAgent` / `LeaveAgentDescription` / `WantLeaveAgent`. The menu item's own label (`filesContextOptions.helpers.ts` ~l.948) belongs to the menu item above. Update the context-menu snapshots for the key change.
  Report: lines 488-489

- [ ] **[task 5.3]** Deleting an agent shows the room dialog ("Delete this room?", 'The room "QA test agent" will be permanently deleted') and the notice "Room removed". They should speak of an agent.
  Where: `packages/client/src/components/dialogs/DeleteDialog/index.js`: `getDialogTitle` (l.235-238, `Common:DeleteRoomTitle`), the note text in `getDialogContent`, the warning checkbox (`Common:DeleteRoomWarning`, l.293) and the `onDeleteRoom` translations (l.149-157, `Common:RoomRemoved`). Branch to agent keys on roomType 12, or route to the existing `AiPresetsBridge/DeleteAgentDialog.tsx`.
  Report: lines 606-607

- [ ] **[task 2.1]** On an agent, the menu item reads "Change room owner" and opens a panel titled "Change project owner". Both should speak of the agent.
  Where: `packages/client/src/store/contextOptionsStore/filesContextOptions.helpers.ts` (~l.799-805): `option_change-room-owner` uses the label `Common:ChangeRoomOwner` and has no agent branch. `packages/client/src/components/panels/ChangeRoomOwnerPanel/index.js` (~l.144-146) uses the headerLabel `Common:AIProjectChangeOwner`. Reword both to agent text (task 2.1; design.md "Words change, names in the code do not") and update the menu snapshots.
  Report: lines 493-495

- [ ] **[task 2.1]** The change-owner panel of an agent says "The new owner must be a Apps admin or a room admin". The brand name stands where the user type should be, with the wrong article. The Contacts invite menu calls the same type "Full admin". The text also speaks of a project.
  Where: `packages/client/src/components/panels/ChangeRoomOwnerPanel/index.js` (~l.148-150) passes `productName=getBrandName("ProductName")` ("Apps") into `Common:AIProjectChangeOwnerInfo` (`public/locales/en/Common.json` l.178). Reword the text for agents. Name the user types with the existing `Common:PortalAdmin` ("Full admin") and the Room admin wording instead of the brand.
  Report: lines 493-495

### Agent access and invite panel

- [ ] **[spec, task 3.5]** A DocSpace admin who is a member of no agent sees all ten agents in the agent menu of the Files chat panel and under Agents in the sidebar. ai-agent-conversations "Only members chat with an agent" says such agents are not offered in any agent menu.
  Where: `readPresets` in `packages/client/src/store/AiPresetsStore.ts` (l.206-222) maps every project from `getAiProjects()` into presets with no membership filter. Those presets feed `agents` in `AiPresetsBridge/index.tsx` (l.225) and `recentAiProjects` in `ClientArticleSidebar/index.tsx:891`. Keep only the projects with `inRoom`, or request a list of the user's own agents only.
  Report: lines 585-589

- [ ] **[task 2.1-2.3]** The agent's invite panel still uses project and room wording: "Access to the project rooms", "Everyone invited to this project" and "Add existing members to the room". It names the roles "Project manager" and "Member", and their descriptions speak of "the project".
  Where: `packages/client/src/components/panels/InvitePanel/index.js:923-924` (`Common:AIProjectInviteSourcesAccess`, `AIProjectInviteSourcesAccessDescription`), `InvitePanel/sub-components/InviteInput.js:645` (`Common:InviteToRoomManuallyInfoMembers`), `packages/shared/utils/getAccessOptions.tsx` (~l.197-214: `Common:AIProjectManager`, `AIProjectManagerDescription`, `AIProjectMemberDescription`) and `packages/client/src/pages/Home/InfoPanel/Body/views/Members/Members.utils.ts` (~l.61-66, `Common:AIProjectManager`). The values are in `public/locales/en/Common.json` (l.186-195, 1324). Switch to the kept key `Common:AgentManager` and reword the rest for agents.
  Report: lines 373-376, 504-505

- [ ] **[check]** The invite panel of an agent offers "Invite via link". ai-agent-access still has to decide whether link invites fit an agent (task 9.2).
  Where: `packages/client/src/components/panels/InvitePanel/index.js:928-945` renders `ExternalLinks` for every non-private room, `RoomsType.AiProjectRoom` included (`ExternalLinks.js:177` even has a description for AI projects). If the decision is no link invites, hide it for agents.  Report: lines 382-384

### Agent form and Save as new agent

- [ ] **[bug]** In the Tags field of the agent form, pressing Enter after typing a tag name saves and closes the form and drops the tag. The tag is added only by a click on "Create tag".
  Where: `packages/client/src/pages/AiProjects/sub-components/dialogs/CreateEditProjectDialog.tsx:439-447`: the ModalDialog uses `withForm`, which submits on Enter. `packages/client/src/components/TagInput/index.tsx:122-131` lets an Enter keydown through while the dropdown is open, and `TagDropdown.tsx:77-87` adds the tag only on keyup, after the form has already submitted. Call `preventDefault` on Enter in the tag input, or add the tag on keydown.
  Report: lines 335-337

- [ ] **[task 2.1-2.3]** The agent form uses project and room wording. Opened from the list's create button it is titled "Create AI project", and when editing, "Edit AI project". It labels the skill sets "Instructions rooms" and says "Everyone in the project chats with this model" and "Project owner".
  Where: `packages/client/src/pages/AiProjects/sub-components/dialogs/CreateEditProjectDialog.tsx:489` (`Common:AIProjectCreateTitle` / `Common:AIProjectEditTitle`), `:472` and `:552` (`Common:InstructionsRooms`), `:549` (`Common:AIProjectModelHint`) and `:560` (`Common:AIProjectOwner`). The values are in `public/locales/en/Common.json` (l.180, 183, 196, 203, 1280). Switch the call sites to agent keys (`Common:SkillSets`, `EditAgent`, `AgentOwner`, an agent create title). Do not reword `InstructionsRooms`, which `helpers/filesUtils.js:78` also uses.
  Report: lines 332-334, 373

- [ ] **[task 4.3a]** The "Save as new agent" dialog is titled "Save as AI project" and pre-filled with "New AI project". Its notice reads `AI project "QA test agent" saved`.
  Where: `packages/client/src/components/AiPresetsBridge/index.tsx:503` (`Common:AIProjectSaved`), `:528` (title `Common:SaveAIProject`) and `:530` (startValue `Common:AIProjectDefaultName`). The values are in `public/locales/en/Common.json:181, 204, 2131`. Switch to `Common:SaveAsNewAgent` / `Common:NewAgent` and reword the notice in agent terms.
  Report: lines 329-331

### Info panel: agent

- [ ] **[bug]** On the way Agents list -> agent -> list, the Info panel closes by itself. Rooms keeps it open on the way list -> room.
  Where: in `packages/client/src/pages/Home/Hooks/usePanelExclusivity.ts`, the reaction on `aiChatStore.isVisible` calls `infoPanelStore.setIsVisible(false)`. Opening an agent's page runs `aiChatStore.openProject()` (`packages/client/src/pages/AiProjects/AiProjectView.tsx:116`; ui-kit's `AiChatStore.openPreset` sets `isVisible=true`). So the Info panel closes, although the agent's page draws its chat in the section body, not in the side panel. Leaving the page (`releaseChat` -> close) restores nothing. Skip the exclusivity while the chat belongs to the agent's page (`isAiProjectRoomRoot`), or restore the Info panel's visibility on leaving.
  Report: lines 66-67

- [ ] **[check, task 2.2, 6.5]** An agent's Details show a Model row only for an agent that stores its own model ("QA test agent"). "Contract Reviewer" runs on the portal's model and gets no Model row, although its card names the portal's model. An agent opened on its own page gets no row either.
  Where: `packages/client/src/pages/Home/InfoPanel/Body/views/Details/Details.utils.tsx:259` adds "Model" only when `getAgentModelName()` is set (:461-462; it reads only `aiProject.profile.name` or `agentModelName`). `Details/index.tsx:236-244` fetches the summary model only for a selection without `aiProject`. Fall back to `aiProjectsStore.defaultModelName`, as the tile does (`packages/client/src/pages/Home/Section/Body/TilesView/AiProjectTile.tsx:102`), so the row always shows the model or the portal default.
  Report: lines 144-145, 358-360

- [ ] **[task 2.2]** In an agent's Details, Type reads "AI project" instead of agent wording.
  Where: `getRoomTypeName` in `packages/client/src/helpers/filesUtils.js:82` returns `t("Common:AIProjectRoomTitle")` ("AI project") for `RoomsType.AiProjectRoom`, and `Details.utils.tsx:497` shows it. `packages/shared/components/room-type/RoomType.utils.ts:70` uses the same key. Reword the key or switch to an agent key (`Common:AIAgent`).
  Report: lines 144

- [ ] **[conflict]** The tabs of the agent's Info panel run Details, Context, Content. The board has Context, Content, Details. The ai-agent-info-panel spec matches the client, so either the board or the spec must change.
  Where: `packages/client/src/helpers/info-panel/tabs.ts:116-123` (`tabs = [infoDetails, infoContext]`, then `infoContent` is pushed). If the board wins, reorder here and update the ai-agent-info-panel spec in `openspec/changes/ai-chat-agents-design` and `helpers/info-panel/__tests__/tabs.test.ts`.
  Report: lines 141-143

- [ ] **[design]** The Context tab has one "Manage sources" link at the bottom instead of a "Manage ..." row under each section (skill sets, knowledge bases). Its Data sources section is not built, as the proposal says.
  Where: `packages/client/src/pages/Home/InfoPanel/Body/views/AiAgentContext/index.tsx:218-229` renders a single Link with `t("Common:ManageSources")` after both sections. Add a "Manage skill sets..." or "Manage knowledge bases..." row inside each `section(...)` block. The keys are planned in task 1.9: `Common:ManageSkillSets` and `Common:ManageKnowledgeBases`.
  Report: lines 147-148

- [ ] **[design]** A file row in the Content tab has a download icon button instead of a "⋮" actions menu. The board's "Not saved · 2 min ago" meta line is out of scope.
  Where: `packages/client/src/pages/Home/InfoPanel/Body/views/AiAgentContent/index.tsx:164-171` (an IconButton with `DownloadReactSvgUrl`, `data-test-id` `ai-agent-content-download`). Replace it with a context-menu button that carries Download and the other row actions (task 7.0d: copy to a room).
  Report: lines 149-151

### Info panel: skill sets and skills

- [ ] **[spec]** The Info panel Details of a skill show Type, File extension, Size, Versions and Comments, with no Skill set and no Command row. ai-skill-sets "Skill in the Info panel" requires the opposite.
  Where: `packages/client/src/pages/Home/InfoPanel/Body/views/Details/index.tsx` (~l.256): `new DetailsHelper({...})` passes `skillSetTitle` and `skillName` but never `isSkill`. So the skill branch at `Details.utils.tsx:214` (`if (this.isSkill)`, the property list with "Skill set" and "Command") is never taken, and the generic file list is shown. Commit 4eaf5a477f4 moved the check to the `isSkill` prop without passing it. Add `isSkill: !!skillFile`.
  Report: lines 54-56

- [ ] **[design]** Skills are shown by their file slug ("clause-risk-check") in the agent's Context tab, in a skill set's Details and in the Skill sets tables. The composer slash menu shows a readable title ("Clause risk check").
  Where: `packages/client/src/pages/Home/InfoPanel/Body/views/AiAgentContext/index.tsx:194` (`{skill.name}`), `packages/client/src/pages/Home/InfoPanel/Body/views/Details/sub-components/SkillSetInfo/index.tsx:119-121` (`skill.title.slice(...)`), and `SkillsRowData.js` / `SkillSetsRowData.js` in `packages/client/src/pages/Home/Section/Body/TableView/sub-components/`. The slash menu humanizes the slug with `skillLabel()` in ai-chat (`src/ui/components/markdown/skill-refs.ts:14`). Apply the same label in the client, or drop the humanizing in ai-chat if the slug is meant to win. The ai-skill-sets spec currently says the Name column is the file name without .md.  Also needs: onlyoffice-ai-chat (only if the slug wins)
  Report: lines 355-357

- [ ] **[design]** The skills listed in a skill set's Details have no icon.
  Where: `packages/client/src/pages/Home/InfoPanel/Body/views/Details/sub-components/SkillSetInfo/index.tsx:116-125` renders each skill as its name plus the command text only. Add `<SkillIcon kind="skill">` from `packages/client/src/components/SkillIcon` before the name.
  Report: lines 160

### Skills: editing and creating

- [ ] **[bug]** In Edit skill, a whole line selected by triple click and made Bold gets its closing marks at the start of the next line (`**1. The first thing to do.` / `**2. The next thing to do.`), because the selection includes the line break. A second click removes the marks again.
  Where: the WRAPS branch of `getMarkdownEdit` in `packages/client/src/components/dialogs/EditSkillDialog/markdown.ts` (~l.86-107) wraps `text.slice(from, to)` as is. Trim trailing line breaks and whitespace off the selection before wrapping, and put them back after the closing mark.
  Report: lines 394-397

- [ ] **[spec]** Edit skill opens as a side panel, the form the product uses for its other edit dialogs. The board and ai-skill-sets "Edit skill" call for a modal dialog, so either the code or the spec must change. Task 7a.4 is ticked as "a modal", although the code is an aside.
  Where: `packages/client/src/components/dialogs/EditSkillDialog/index.tsx:174` and `:255` use `displayType={ModalDialogType.aside}`. Switch to `ModalDialogType.modal`, or amend `ai-skill-sets/spec.md` in `openspec/changes/ai-chat-agents-design`.
  Report: lines 161-163

- [ ] **[design]** The instructions editor in Edit skill uses a proportional font. The board shows monospace.
  Where: `packages/client/src/components/dialogs/GenerateSkillDialog/SkillEditor.tsx:62-109` (CodeMirror with githubLight/DarkInit and the extensions `[EditorView.lineWrapping]`), used by `EditSkillDialog/index.tsx:318`. Set a monospace font family with an `EditorView.theme` on `.cm-scroller`/`.cm-content`, or in `.instructions :global(.cm-scroller)` in `EditSkillDialog.module.scss`.
  Report: lines 164-165

- [ ] **[design]** "Create skill with AI" shows the generated result as the raw file, frontmatter included, in a code editor with line numbers, instead of in the Edit skill form.
  Where: `packages/client/src/components/dialogs/GenerateSkillDialog/index.tsx:342` renders `SkillEditor` (`GenerateSkillDialog/SkillEditor.tsx`, @uiw/react-codemirror with line numbers) over `skill.content`. Show the result in the fields of the Edit skill form (`components/dialogs/EditSkillDialog`) instead.
  Report: lines 406-407

- [ ] **[design]** The two ways to create a skill name the file differently. "New skill" keeps the typed name ("QA Pirate hello"), while "Create skill with AI" turns the typed "QA Haiku" into the file "qa-haiku".
  Where: `onSave` in `packages/client/src/components/dialogs/GenerateSkillDialog/index.tsx` (~l.287-296) saves `${skill.name}.md`, where `skill.name` is the slug made by ASC.AI.Chat (`app/skills/generateSkill.ts:238`, `toSkillName(input.title)`). "New skill" goes through `app/skills/createSkill.ts`, which saves `<title>.md`. Save the generated file under the typed title.  Also needs: server (ASC.AI.Chat) (alternatively, make both slugs, in `app/skills/createSkill.ts`)
  Report: lines 402-404

- [ ] **[design]** The "Create skill with AI" form labels its fields "Name:" and "Description:" with colons. The Edit skill form labels them without.
  Where: `packages/client/src/components/dialogs/GenerateSkillDialog/index.tsx:356` (`${t("Common:Name")}:`) and `:372` (`${t("Common:DescriptionLabel")}:`). Drop the appended colons.
  Report: lines 404-406

- [ ] **[product-wide]** Side panels have full-width footer buttons. Board 13 (the Edit skill panel) draws compact ones.
  Where: in the `ModalDialog.Footer` of `packages/client/src/components/dialogs/EditSkillDialog/index.tsx` (l.202-221 and 337-356), both Buttons pass `scale`, which stretches them. Full-width buttons are the product convention for aside dialogs.  Also needs: docspace-ui-kit-react (`.footer` in `components/modal-dialog/ModalDialog.module.scss`, l.226, lays out the footer)
  Report: lines 226-227

### Agents list

- [ ] **[task 2.1-2.3]** On the Agents list, the empty Info panel (nothing selected) reads "See rooms details here", the text of the Rooms list.
  Where: `packages/client/src/pages/Home/InfoPanel/Body/sub-components/NoItem/index.tsx` (l.132) renders NoRoomItem for the AI section (`isRooms`). `NoItem/NoRoomItem.tsx` (l.66) shows `t("RoomsEmptyScreenTent")` (`packages/client/public/locales/en/InfoPanel.json` l.47). Add a variant for the AI section with agent, skill set and knowledge base text.
  Report: lines 116-117

- [ ] **[task 6.1]** The Agents list has no category row under its filter. Even with an agent tagged "QA", no category row is shown.
  Where: not implemented. Add the row under the filter of the Agents list (`packages/client/src/pages/Home/Section/Tabs/AiWorkspaceTabs/index.tsx` / `packages/client/src/pages/Home/Section/Filter/index.js`). Reuse the category control of `packages/client/src/pages/Home/Section/Body/AiTemplatesCatalog/index.tsx` (~l.171, 245), and map a pick onto the rooms filter's tag, kept in the address.
  Report: lines 371-372

- [ ] **[task 6.1]** The agent card has no Category row.
  Where: the rows of `packages/client/src/pages/Home/Section/Body/TilesView/AiProjectTile.tsx` (l.106-110). Add Category, mapped from the room tag, together with the Agents list category row.  Also needs: server (ASC.AI.Chat) (the template install should tag the installed agent with its category; see the server item on template install)
  Report: lines 118-119

- [ ] **[task 6.2]** The agent card has no button that opens a chat with the agent.
  Where: `packages/client/src/pages/Home/Section/Body/TilesView/AiProjectTile.tsx`: neither `topContent` nor `bottomContent` has an action. Add the "Open chat" button for members with `Common:OpenChatWith`.
  Report: lines 118

- [ ] **[task 6.3]** On the agent card, the skill sets and knowledge bases are joined by commas and have no icons. The board lists them one per line with icons.
  Where: `packages/client/src/pages/Home/Section/Body/TilesView/AiProjectTile.tsx` (l.100): `list()` = `names.join(", ")`, used for the skills and knowledge rows. Render one per line with the skill set and knowledge icons, "+N" and a dash. The `DETAIL_ICONS` of AiTemplatesCatalog can be reused.
  Report: lines 119-120

- [ ] **[task 6.3]** On the agent card, the "Knowledge bases" label is cut to "Knowledge…".
  Where: `packages/client/src/pages/Home/Section/Body/TilesView/AiProjectTile.module.scss` (l.74-76): `.wrapper` has `grid-template-columns: minmax(0,1fr) minmax(0,2fr)`, and the label's Text truncates (`AiProjectTile.tsx` l.116). Size the label column to its content (auto/max-content) or widen the card.
  Report: lines 120

- [ ] **[task 6.3]** The Agents list lays the cards out in five narrow columns. The board has two wide columns.
  Where: `getCountTilesInGrid()` in `packages/shared/utils/getCountTilesInRow.ts` uses the rooms tile width (275-350 px) and is called from `packages/client/src/pages/Home/Section/Body/TilesView/sub-components/InfiniteGrid.js` (l.133). Give agent tiles (room type 12) a larger minimum width.  Report: lines 120-121

- [ ] **[check]** The sort menu of the Agents list offers Type, although every row of the list is an agent.
  Where: `getSortData` in `packages/client/src/pages/Home/Section/Filter/index.js` (~l.1598-1616) pushes `roomType` (`Common:Type`) for every `isRooms` view, and `isRooms` includes `isAiSectionFolder` (l.1938-1943). Skip the Type sort for the AI lists.
  Report: lines 380-381

- [ ] **[product-wide]** The My agents and Templates tabs over the Agents list are the product's underlined (primary) tabs. Board 04 draws them as pills.
  Where: `packages/client/src/pages/Home/Section/Tabs/AiWorkspaceTabs/index.tsx` (l.100): `<Tabs items=... withAnimation />` uses the default primary type. ui-kit already has pill tabs (`TabsTypes.Secondary` in `components/tabs/index.tsx`), so passing `type={TabsTypes.Secondary}` would match board 04.
  Report: lines 218-219

- [ ] **[product-wide]** A room logo shows initials on a colour until someone sets a cover, so new agents show initials. The boards give every agent an icon cover.
  Where: `packages/client/src/pages/AiProjects/sub-components/dialogs/CreateEditProjectDialog.tsx` (l.159-166): a new agent gets a random colour and a null `coverIcon`, so ui-kit's room-icon/room-logo falls back to initials. Pick a default cover when an agent is created.  Also needs: docspace-ui-kit-react (alternatively, an icon fallback in `components/room-icon`)
  Report: lines 220-221

### Templates tab

- [ ] **[task 6.0i]** A template card cannot be selected into the Info panel, so there is no "Add to my agents".
  Where: `card()` in `packages/client/src/pages/Home/Section/Body/AiTemplatesCatalog/index.tsx` (l.264-333) has no selection handler, only Install. Add the selection and a template view to the Info panel (`packages/client/src/helpers/info-panel/tabs.ts`): Details with the description, Owner, Type "Template", Category and the "Add to my agents" install, plus Context.
  Report: lines 125-126

- [ ] **[conflict]** On the Templates tab, the categories are chips under the search. The board, which is newer than the spec, has a filter button that opens a Category dropdown. The ai-agents-list spec requires a row of category tabs.
  Where: `packages/client/src/pages/Home/Section/Body/AiTemplatesCatalog/index.tsx`: `tab()` (l.250-262, SelectedItem chips), rendered under SearchInput (l.338-352). Change it only once the board and the spec agree on a filter dropdown or tabs.  Report: lines 122-124

- [ ] **[check]** Installing a template runs on one click with no confirmation and creates three rooms. A second click on the same template creates them all again, with no "Already added" mark (task 6.0j).
  Where: `onInstall` in `packages/client/src/pages/Home/Section/Body/AiTemplatesCatalog/index.tsx` (l.186-205) and the Install button (l.302-305). Add a confirmation, block a repeat install, or both.  Also needs: server (ASC.AI.Chat) and server (C#) (the "Already added" mark needs the server to tie a room to its template; `installTemplate.ts` matches nothing against existing rooms; server item 5 in tasks.md group 11)
  Report: lines 377-379

- [ ] **[check]** A User, who may not create agents, sees the Templates tab with an Install button on each of the nine template cards. Installing creates an agent, and ai-agent-access "Who may create an agent" reserves that for the portal owner, DocSpace admins and room admins. Install was not pressed.
  Where: `packages/client/src/pages/Home/Section/Tabs/AiWorkspaceTabs/index.tsx` (`TEMPLATES_TAB`, l.52-92) and `pages/Home/Section/Body/AiTemplatesCatalog/index.tsx` (Install button l.298-305, `onInstall` l.186) check no rights. Hide or disable them for users who cannot create agents, using the `canCreateProjects` flag that AiPresetsBridge already gets.  Also needs: server (ASC.AI.Chat) (the service checks only `assertAiAccess`, `app/controllers/templatesController.ts:57`, and should refuse such a user as well)
  Report: lines 570-571

- [ ] **[design]** A template card has no "⋮" menu and no green verified tick beside the name.
  Where: `card()` in `packages/client/src/pages/Home/Section/Body/AiTemplatesCatalog/index.tsx`: the actions div holds only the Install IconButton (l.295-306). The `VerifiedReactSvgUrl` mark is rendered only beside the Owner value (l.320-328), not beside `template.name` (l.281-288). Add a ContextMenuButton, and move or add the tick next to the title.
  Report: lines 127

- [ ] **[design]** At a window width of 1000 px, the Templates tab draws its search field partly under the tabs row, so the field's top edge is cut off.
  Where: `packages/client/src/pages/Home/Section/Body/AiTemplatesCatalog/AiTemplatesCatalog.module.scss:36-43`: `.wrapper` has `margin-block-start: -12px` to pull the search up to where the filter sits. At tablet widths the section body's top padding is smaller, so the search slides under `Section/Tabs/AiWorkspaceTabs`. Make the offset depend on the breakpoint, or drop it and align with the tabs' own spacing.
  Report: lines 273-274

### AI section wording: create buttons, create forms, Home card

- [ ] **[task 2.1-2.3, 2.x]** The create button reads "New room", the Rooms list's text, on all three AI lists. It should read "New agent" on Agents and "New" on Skill sets and Knowledge bases.
  Where: `packages/client/src/helpers/getSectionCreateButton.ts` (l.102-116): the `isRoomsFolder || isAiHubFolder` branch uses `t("Common:NewRoom")`. The same key appears in `packages/client/src/pages/Home/Section/Header/index.js` (l.1084-1087, `titles.actions`), `store/contextOptionsStore/folderModel.helpers.ts:479` and `components/EmptyContainer/EmptyAiRoomsContainer.tsx:175`. Use `Common:NewAgent` (Common.json l.1609) on the Agents list and `Common:New` on the other two.
  Report: lines 116-117, 155, 173

- [ ] **[task 2.x]** The create forms of a skill set and a knowledge base are titled "Create room" and show the type "Instructions Room" or "Knowledge Room" instead of skill set and knowledge base wording.
  Where: `packages/client/src/components/dialogs/CreateEditRoomDialog/CreateRoomDialog.js:386-390` (`Common:CreateRoom` for every type that is not a form room) and `packages/shared/components/room-type/RoomType.utils.ts:65-68` (`Common:InstructionsRoomTitle` and `Common:KnowledgeRoomTitle`; `public/locales/en/Common.json:1281, 1370`).
  Report: lines 398-399, 416-417

- [ ] **[task 2.3]** The AI Chat card on Home still describes an "Instructions room", a "Knowledge room" and an "AI project".
  Where: `packages/client/src/pages/Dashboard/hooks/useModuleItems.tsx:237-238` uses `t("Common:AiRoomsCreateDescription")` ("An Instructions room with skills, a Knowledge room the chat searches or an AI project that brings them together"). In `public/locales/en/Common.json`, reword the value to agents, skill sets and knowledge bases, or use a new key. Then run translate-stale.
  Report: lines 181-182

### Skill sets list and opened skill set

- [ ] **[task 7a.7]** A skill set row has no "Use in chat" icon. A copy-link icon sits in its place.
  Where: `packages/shared/components/quick-buttons/index.tsx:119` and `285-299`: the copy-link button for a shareable item that is not a room shows on skill rows. It is wired from `packages/client/src/HOCs/withQuickButtons.js` and rendered by `TableView/sub-components/SkillSetsRowData.js` and `SkillsRowData.js`. Add a "Use in chat" quick button for skill sets and skills that opens a new chat on the default agent with the set connected, and drop the copy link there.
  Report: lines 156-157

- [ ] **[task 2.x]** The breadcrumb of an opened skill set leads to "AI rooms" instead of "Skill sets".
  Where: the crumb title is the server's root folder title (`AiHub` = "AI rooms" in the server's `products/ASC.Files/Core/Resources/FilesUCResource.resx`). The client already relabels root crumbs in `packages/client/src/store/filesStore/fetch.helpers.ts:401-416` (`crumbTitle` for Forms/Private), and can relabel the AiHub root by the room type (`Common:SkillSets` or the knowledge bases key; cf. `getAiWorkspaceTitle` in `helpers/aiWorkspace.ts`).  Also needs: server (C#) (alternatively, reword the `AiHub` resource)
  Report: lines 399-400

- [ ] **[task 2.x]** The first quick action of an empty skill set is labelled "Create a new file", though it opens the New skill form.
  Where: `packages/client/src/components/EmptyContainer/sub-components/EmptyViewContainer/EmptyViewContainer.helpers.tsx:443-450`: `createMarkdown` uses `EmptyView:CreateNewFileTitle`. Use `Common:NewSkill` or a key for skills.
  Report: lines 400-401

- [ ] **[check]** A newly created skill set opens with the Info panel shown on Contacts, even though the panel was closed before.
  Where: `packages/client/src/store/CreateEditRoomStore.ts:880-891`: after creating any room on desktop, it calls `showInfoPanel()` and `openMembersTab()`. Skip this for Instructions (and Knowledge) rooms, or keep the panel's earlier visibility.
  Report: lines 408-409

### Knowledge bases

- [ ] **[task 2.x]** Inside a knowledge base, the create button reads "New" instead of "Add files".
  Where: `packages/client/src/helpers/getSectionCreateButton.ts:146-157`: the default branch returns `t("Common:New")` with the folder model. Add a branch for an open `RoomsType.KnowledgeRoom` that reads "Add files". No `Common:AddFiles` key exists yet.
  Report: lines 173-174

- [ ] **[check]** The indexing states were not checked in the browser, because the portal had no file with an indexing state. Unchecked: the Indexing and Error pills of a knowledge base and its files, the failure note in a file's Details, and the alert icon on a failed file in tiles that ai-knowledge-bases "Indexing state of a file" requires. The code exists; verify it with a real failed file (tasks 7b.4-7b.6).
  Where: `packages/client/src/components/KnowledgeBaseStatusBadge/index.tsx` (`Common:KnowledgeBaseIndexingFailed`, l.84-85), `packages/client/src/pages/Home/InfoPanel/Body/views/Details/index.tsx:251` and `447` (the `isIndexingFailed` note), `packages/shared/components/quick-buttons/index.tsx` (l.144-147, `showFailedVectorizationBadge = isTile && vectorizationStatus === Failed`, and l.391-397, FailedVectorizationBadge) and `packages/shared/components/badges/index.tsx` (l.553, views other than tiles). Today an unreadable file cannot be used to test this, because the server marks it Indexed (see the server (C#) item on indexing status).  Report: lines 175-177, 256-258

- [ ] **[design]** The Knowledge bases list shows coloured room logos with initials, while the board has a grey knowledge-base icon. Skill sets already show their own icon, so the two lists differ.
  Where: `packages/client/src/components/ItemIcon.tsx:117-137` replaces the room logo only when `isSkillSetIconRoom()` is true, and `packages/client/src/components/SkillIcon/index.tsx:58-61` matches only `RoomsType.InstructionsRoom`. Add a knowledge-base icon kind for `RoomsType.KnowledgeRoom`.
  Report: lines 169-170

- [ ] **[design]** The knowledge base form lets the user set a logo, while the skill set form shows a fixed icon.
  Where: `packages/client/src/components/dialogs/CreateEditRoomDialog/sub-components/SetRoomParams.js:368-377`: only `RoomsType.InstructionsRoom` gets the fixed `SkillIcon`, and Knowledge rooms fall through to the logo and cover editor. Align the two to the board.
  Report: lines 418-419

### Chat pickers

- [ ] **[check]** The first level of the data sources picker offers "AI Workspace", while the section is called AI Chat everywhere else.
  Where: the label is `t("AiWorkspace")` in ui-kit's `selectors/Files/hooks/useRootHelper.tsx:156`. In DocSpace its value at runtime comes from the client's `public/locales/en/Common.json:239` (`"AiWorkspace": "AI Workspace"`, plus the other languages); ui-kit's `locales/en/Common.json:75` holds only the fallback. Reword the value to the AI Chat name.  Also needs: docspace-ui-kit-react (alternatively, switch to the `Common:AIChat` key)
  Report: lines 293-294

### Tile and compact views of the AI lists

- [ ] **[untagged]** In the tile view, a skill set or knowledge base tile shows only a logo, a name and the room type tag ("Instructions rooms", "Knowledge rooms"). It has none of the table's columns (skills count, owner, date, indexing state). No board exists to compare it with.
  Where: `packages/client/src/pages/Home/Section/Body/TilesView/FileTile.js` (l.257): every room other than an agent goes to ui-kit's generic RoomTile, while agents get their own AiProjectTile (l.247). A tile for skill sets and knowledge bases, or `customBottomContent`, would have to show `filesCount` (as `SkillSetsRowData.js` l.141 does), the owner, the date and the KnowledgeBaseStatusBadge.
  Report: lines 251-253

- [ ] **[untagged]** In the tile view, a skill shows only the generic code-file thumbnail and its name, with no description and no slash command. The table view shows the description.
  Where: `packages/client/src/pages/Home/Section/Body/TilesView/FileTile.js` (l.305): skills fall through to ui-kit's generic FileTile. A tile for skills would need the description and the command that `TableView/sub-components/SkillsRowData.js` reads (`skill?.description`, l.102).
  Report: lines 254-255

- [ ] **[untagged]** The compact (rows) view of Agents, Skill sets, Knowledge bases, an opened skill set and an opened knowledge base shows only the logo, the name and a date in each row. A skill set has no skills count or owner, a skill has no description, and a knowledge base file has no size or "added by". There is no indexing state.
  Where: `packages/client/src/pages/Home/Section/Body/RowsView/FilesRowContent.js:91-136`: `contentComponent` prints one value picked by the sort field and has no branch for room types 10/11 or their contents. The table view has its own row data for these lists in `TableView/sub-components/SkillSetsRowData.js`, `SkillsRowData.js`, `KnowledgeBasesRowData.js` and `KnowledgeFilesRowData.js`. Add the same secondary info per type to the row content. design.md shows the indexing state in the table view only, so that part may be intended.
  Report: lines 268-272

### Product-wide shared components

- [ ] **[product-wide]** The Info panel tabs are centred in every section, the AI section included. The boards align them to the left.
  Where: `packages/client/src/pages/Home/InfoPanel/Header/Header.module.scss` (l.60: `.tabs { justify-content: center }`; l.67: `.scroll-body > div { justify-content: center }`). To match the boards, switch both to `flex-start`. `InfoPanelHeaderGeneral` in `headerGeneral.tsx` renders ui-kit's Tabs inside that wrapper.
  Report: lines 195-196

- [ ] **[product-wide]** Rooms and files show a Metadata tab in the Info panel. A room has Contacts, History, Details, Metadata; a file has Share, History, Details, Metadata. This includes skill sets, knowledge bases and their files in the AI section. The boards draw no Metadata tab. An agent correctly has none, as its spec requires.
  Where: `getAvailableInfoPanelTabs` in `packages/client/src/helpers/info-panel/tabs.ts` (l.160-162: `if (isMetadataSupported(selection)) tabs.push(InfoPanelView.infoMetadata)`). `UNSUPPORTED_ROOT_TYPES` in `packages/shared/utils/metadata.ts` (l.52) excludes only TRASH, Privacy and AIAgents. To drop the tab in the AI section, add `FolderType.AiHub` there or skip it in `tabs.ts`.
  Report: lines 197-199

- [ ] **[product-wide]** The Info panel repeats the item's logo and name at the top of every tab in every section. The boards draw them on the Details tab only.
  Where: `packages/client/src/pages/Home/InfoPanel/Body/views/FilesView/index.tsx` (l.469): `<ItemTitle .../>` renders before the LoaderWrapper for every `currentView`. Render it only when `currentView === InfoPanelView.infoDetails`.
  Report: lines 200-201

- [ ] **[product-wide]** A room's Details always list the Last modified by and Tags rows, and a file's Details list Comments. This includes skill sets, knowledge bases and their files. The boards draw none of these rows.
  Where: `getNeededProperties` in `packages/client/src/pages/Home/InfoPanel/Body/views/Details/Details.utils.tsx`: room branch l.239-259 ("Last modified by", "Tags"), file branch l.303 ("Comments"). Filter them by `isSkillSet`/`isKnowledgeBase`/`isAIProject`, as the method already does for Type and Storage.
  Report: lines 202-203

- [ ] **[product-wide]** Every date in the product includes the time (for example `11/10/2026 9:30 PM`). The boards write dates without the time, as "8 Nov 2026".
  Where: `getStatusByDate` in `packages/client/src/HOCs/withContent.js` (l.81, `getCorrectDate(locale, date)`), which feeds `updatedDate`/`createdDate` to every table, row and tile, the AI lists included. Also `getItemDateModified`/`created` in `Details.utils.tsx` (l.581-586). Both use ui-kit's default format "L" + "LT" (`utils/date/getCorrectDate.ts` in docspace-ui-kit-react). Pass a date-only format such as "D MMM YYYY" from the client call sites.
  Report: lines 204-205

- [ ] **[product-wide]** The Owner column of a table shows "Me" with an avatar for the current user's items. The boards write the owner's name.
  Where: `packages/client/src/HOCs/withContent.js` (l.106-109): `fileOwner = (viewer?.id === createdBy.id && t("Common:MeLabel")) || createdBy.displayName`, rendered by `TableView/sub-components/AuthorCell.js`. To match the boards, use `createdBy.displayName`.
  Report: lines 206-207

- [ ] **[product-wide]** Every list shows file names without the extension, skills and knowledge base files included. The boards show the extension.
  Where: the display follows the per-user "Display file extension" setting: `packages/client/src/pages/Home/Section/Body/TableView/sub-components/FileNameCell/FileNameCell.helpers.tsx` (l.68, `displayFileExtension ? ... : titleWithoutExt`), `displayFileExtension` in `FilesSettingsStore.ts` (l.128/437), and the toggle in the Profile's `file-management/index.tsx`. Either force the extension in the AI lists or change the server default.  Also needs: server (C#) (the default is off: `DisplayFileExtension` in `products/ASC.Files/Core/Configuration/FilesSettings.cs`, l.68, is not set in `GetDefault`)
  Report: lines 208-209

- [ ] **[product-wide]** The tiles/table view switch is in the filter row of every list, an opened knowledge base included. Board 15 has no view switch there.
  Where: `packages/client/src/pages/Home/Section/Filter/index.js` (l.1828: `viewSelectorVisible={!isContactsPage}`, with `getViewSettingsData` at l.1529-1547). To hide it inside a knowledge base, add a KnowledgeRoom condition there.
  Report: lines 212-213

- [ ] **[product-wide]** The product stores one view choice (tiles or table) for all its lists. Switching the view on Agents, Skill sets or Knowledge bases therefore also switches the other two and Rooms.
  Where: `setViewAs` in `packages/client/src/store/FilesStore.ts` (l.892) stores a single `privateViewAs` under `PersistenceKeys.viewAs` (`packages/client/src/store/utils/persistence.ts` l.54, key "viewAs"). A separate choice per AI list needs a key per list.
  Report: lines 214-215

- [ ] **[product-wide]** On this plan, every section header shows the "Try Business" tariff badge, the AI section included. The boards do not draw it.
  Where: `packages/client/src/components/TariffBar/helpers.js` (l.50, `t("Common:TryBusiness")`). It is passed as `tariffBar={<TariffBar />}` to Navigation in `packages/client/src/pages/Home/Section/Header/index.js` (l.1124).
  Report: lines 228-229

### Banners and dev environment

- [ ] **[check]** The banner about the admin limit ("The limit is reached for the number of admins: 3/3") is also shown to a Room admin, with text telling them to contact the Full admin.
  Where: `packages/client/src/components/MainBar/Bar.js:282-288` and `334-335` show `usersTariff`/`usersTariffLimit` to `isAdmin || isRoomAdmin` on purpose. `MainBar/QuotasBar.js:113-115` then picks `MainBar:UserTariffReached` ("contact the Full admin") for users who are not admins. This is existing, intended behaviour; change it only if product decides that Room admins should not see this bar.  Report: lines 551-552

- [ ] **[environment]** The login app's page does not react on `http://127.0.0.1:8092`, because its dev build accepts only localhost and the machine's LAN addresses. The client also stays blank there after an API sign-in, with no console error. A second session therefore needs the LAN address.
  Where: `getAllLocalIps` in `packages/shared/utils/build.js` (l.56-68) returns only "localhost", "*.dev.localhost" and IPv4 addresses that are not internal, so 127.0.0.1 is missing from Next's `allowedDevOrigins` (`packages/login/next.config.js:245-247`; also sdk, doceditor and management). Add "127.0.0.1". Why the Vite client stays blank on 127.0.0.1 (`packages/client/config/server.ts`) was not found.  Report: lines 628-632

## server (C#)

### Agent permissions

- [ ] **[spec]** For a DocSpace admin who is not a member of the agent, neither menu offers Delete. The card menu is Select, Open, Pin to top, Copy link, Download, Room info, Change room owner, and the page menu is Copy link, Download, Room info, Change room owner. ai-agent-page "Actions menu of an agent" and "Actions menu on a card" give such an admin Delete agent.
  Where: `products/ASC.Files/Core/Core/Security/FileSecurity.cs`: for rooms, the admin bypass for VirtualRooms/AiAgents/AiHub (~l.1789-1860) grants only Move, Pin, ChangeOwner and IndexExport, never Delete. Ordinary rooms get Delete only in Archive (l.2128), and AI projects are never archived. Grant `FilesSecurityActions.Delete` to a DocSpace admin for a `FolderType.AiProjectRoom` room. The client already shows Delete whenever `security.Delete` is true (`packages/client/src/store/filesStore/contextOptions.helpers.ts:762, 898`).
  Report: lines 580-584

### Knowledge base indexing

- [ ] **[check]** A PDF made of random bytes uploaded to a knowledge base gets no mark in the list, and its Details show Status "Indexed". So no failed file could be produced, and the "Error" mark, "Try again" and the failure note stay unchecked.
  Where: `products/ASC.Files/Core/Vectorization/VectorizationTask.cs` (~l.158-195): after `textProcessor.ProcessAsync`, the task sets `VectorizationStatus.Completed` even when no text chunk was extracted (an unreadable PDF yields zero chunks). Count the chunks, and set `VectorizationStatus.Failed` when none were produced or the extraction failed.  Report: lines 477-480

### Agent and AI hub room data

- [ ] **[task 6.4-6.5]** An agent has no description anywhere. The agent card shows none, the agent form has no Description field, and the Details have no Description row, because the server neither stores nor returns an agent's description. Task 6.5 waits on 6.4.
  Where: the room DTOs have no description field: `products/ASC.Files/Core/ApiModels/RequestDto/CreateRoomRequestDto.cs` and, for a room of type 12, `products/ASC.Files/Core/ApiModels/ResponseDto/FolderDto.cs`. Store the description and return it with the agent in the list (tasks.md group 11, "Store an agent's description and return it with the agent in the list").  Also needs: client (task 6.5: carry the description in `packages/shared/api/ai` (projects), add the field to `packages/client/src/pages/AiProjects/sub-components/dialogs/CreateEditProjectDialog.tsx`, a description line to the rows of `packages/client/src/pages/Home/Section/Body/TilesView/AiProjectTile.tsx` (l.106-110), and a row to `Details.utils.tsx`, with `Common:Description`). The report leaves the Access row ("Everyone in DocSpace") out of scope.
  Report: lines 118, 144-146, 332-334

- [ ] **[design, task 7b.7 gated]** The Skill sets and Knowledge bases lists have no Used by column, and the Knowledge bases list has no Last indexed column. Skill sets have no description, and a set's Details have no "Used by agents". The report keeps these out of scope until the server provides the data.
  Where: the links between agents and rooms live in `products/ASC.Files/Core/Core/AI/AiHubService.cs` (linked Instructions and Knowledge rooms), and the time a base was last indexed lives in the ASC.Files vectorization. No room DTO returns "used by", a last-indexed time or a description (tasks.md group 11). Return them.  Also needs: client (the columns in `packages/client/src/pages/Home/Section/Body/TableView/TableHeader.js`, `SkillSetsRowData.js` and `KnowledgeBasesRowData.js`, and the Details row, task 7b.7)
  Report: lines 158-159, 171-172

### Banners (likely expected behaviour)

- [ ] **[check]** A Room admin and a DocSpace admin were added as test users to invite to an agent. Both counted against the plan's admin limit, so the banner "The limit is reached for the number of admins: 3/3" is now shown on every page.
  Where: this is likely expected product behaviour, not an AI Chat defect. Paid seats (the "manager" quota feature, `common/ASC.Core.Common/Quota/Features/CountPaidUserFeature.cs`) count DocSpace admins and room admins. The banner text is `UserTariffLimitHeader` in the client's `packages/client/public/locales/en/MainBar.json`. Confirm with the product owner; otherwise remove the test users. No code change identified. (low confidence)
  Report: lines 506-508

- [ ] **[check]** The test user, created through the API, is shown a banner asking to activate their email on every page.
  Where: the client shows `MainBar/ConfirmEmailBar` (`packages/client/src/components/MainBar/Bar.js:625`) whenever `withActivationBar` in `packages/shared/store/UserStore.ts:209` is true, i.e. when `activationStatus` is Pending or NotActivated. A user created through the People API without email confirmation gets that status on the server. This is most likely a side effect of the test setup, not an AI Chat defect. No change is expected unless users created through the API should count as activated. (low confidence)
  Report: lines 572-573

## server (ASC.AI.Chat)

### Templates

- [ ] **[task 6.1]** Installing a template does not tag the created agent with the template's category: "Formula Helper" was installed without the tag "Tables".
  Where: `app/templates/installTemplate.ts`: `createRoom()` posts only `{ title, roomType }`, and the header comment says the category is not installed. Pass `tags: [template.category]` for the agent room. The C# `CreateRoomRequestDto.Tags` already accepts tags (`products/ASC.Files/Server/ApiModels/RequestDto/CreateRoomRequestDto.cs:99`).
  Report: lines 371-372

### Chat behaviour

- [ ] **[check]** With Permissions set to "Auto approve" in both chats, the document tool asked for confirmation before it ran, while the image tool ran without asking.
  Where: `app/tools/documentAgent.ts:160` declares the document agent tool with `requireApproval: true`, so ai-chat's "auto" mode (`src/core/services/tools/auto-allow.ts`) asks before running it. The built-in `generate_image` runs inside the engine with no approval check at all, whatever the mode (ai-chat `src/core/services/ai/engine.ts:1238` and `:1331`; only system tools need approval). Decide which behaviour is meant. Then align the tool's declaration, the engine's exemption of adapter tools from the permission mode, or both.  Also needs: onlyoffice-ai-chat (the engine's approval exemption, if that side changes)
  Report: lines 361-362

- [ ] **[check]** The reply to the Files quick action "Find large files" names the user's current location by its internal id ("the current location (id 4)") instead of by its name.
  Where: `buildContextFragment` in `app/controllers/aiController.ts` (~l.316-340) tells the model only "You are currently in the folder or room with id ${entityId}". It gives no title and no instruction to keep raw ids out of replies. Resolve the location's title, as `resolveContextFolders` does for context folders (`withContextPrompt` ~l.343). Tell the model to refer to the location by name, never by id. The quick action prompt itself is client text (`FilesFindLargeFilesPrompt` in `packages/client/public/locales/en/AiSuggestions.json`) and needs no change.  Report: lines 447-448
