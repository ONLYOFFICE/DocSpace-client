/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Step } from "react-joyride";
import type { TFunction } from "i18next";

import type { TourStepCallbacks } from "SRC_DIR/components/Tour/useTour";
import type { TourAudience } from "SRC_DIR/components/Tour/audience";
import {
  navItemStep,
  sidebarListStep,
  elementStep,
  elementGroupStep,
  fileItemStep,
  revealStep,
  sidebarSelector,
  type RevealHooks,
  STAND_IN_ROW_SELECTORS,
} from "SRC_DIR/components/Tour/stepBuilders";
import { AI_AGENTS_TOUR_LABEL } from "SRC_DIR/components/Tour/logLabels";
import { DEMO_AGENT_FILE_IDS } from "SRC_DIR/api/tourDemo/data";

export const FIRST_ITEM_SELECTOR =
  '[data-testid="table-row-0"], [data-testid="files_row_0"], [data-testid="tile_0"]';

// Only mounted while the panel is open; the step opens it first.
const INFO_PANEL_SELECTOR = ".info-panel";
// ui-kit Tabs names a tab `${id}_tab`.
const MEMBERS_TAB_SELECTOR = '[data-testid="info_members_tab"]';
const MEMBERS_LIST_SELECTOR = '[data-testid="info_panel_members_list"]';
const MEMBER_ROW_SELECTOR = '[data-testid="info_panel_members_list_item_0"]';

// Each file tab's step waits for its own first file, by element id: a tab
// switch re-renders the list, so the row still on screen may be the old one.
const KNOWLEDGE_TAB_SELECTOR = '[data-testid="knowledge_tab"]';
const OUTPUTS_TAB_SELECTOR = '[data-testid="result_tab"]';
const KNOWLEDGE_FILE_SELECTOR = `#file_${DEMO_AGENT_FILE_IDS.knowledge}`;
const OUTPUTS_FILE_SELECTOR = `#file_${DEMO_AGENT_FILE_IDS.outputs}`;
// The chat's request field and suggestions, in the active chat only: on the
// other tabs the chat stays mounted, hidden.
const CHAT_COMPOSER_SELECTOR =
  '[data-chat-active] [data-testid="composer-root"]';
const CHAT_SUGGESTIONS_SELECTOR =
  '[data-chat-active] [data-testid="suggestions"]';

const SEARCH_SELECTOR = "#filter_search-input .search-input-block";
const FILTER_BUTTON_SELECTOR = "#filter-button";
const NEW_BUTTON_SELECTOR =
  '#filter_search-input > div:has(> [data-testid="main-button"])';

// The empty screen's only option, create or switch AI on; it carries no test id.
const EMPTY_SCREEN_CREATE_SELECTOR =
  '[data-testid="empty-view-body"] > *:first-child';

const EMPTY_SCREEN_SELECTOR = '[data-testid="empty-view"]';

export type TourStepFlags = {
  // Admins configure agents; users and guests only use them.
  audience: TourAudience;
  isDesktop: boolean;
  canCreate: boolean;
  showFilter: boolean;
  hasItems: boolean;
  // The sidebar item's id: the tree folder id.
  aiAgentsId: string | null;
  // Each sub-item is rendered only when its alias folder exists.
  hasRecent: boolean;
  hasFavorites: boolean;
  hasTrash: boolean;
  // Opens the info panel on the first agent's member list, and puts it back.
  infoPanelHooks?: RevealHooks;
  // Whether the list itself is stood in for; only then is there a closing step.
  isStandIn: boolean;
  // What the empty screen offers once the stand-in is dropped; `null` for nothing.
  emptyScreenAction: "create" | "activate" | null;
  demoHooks?: RevealHooks;
  agentHooks?: { chat: RevealHooks; knowledge: RevealHooks; outputs: RevealHooks };
  // Returns the tour to the list; every step anchored outside an agent runs it.
  leaveAgent?: () => void;
};

export function getTourSteps(
  t: TFunction,
  callbacks: TourStepCallbacks | undefined,
  flags: TourStepFlags,
): Step[] {
  const {
    audience,
    isDesktop,
    canCreate,
    showFilter,
    hasItems,
    aiAgentsId,
    hasRecent,
    hasFavorites,
    hasTrash,
    infoPanelHooks,
    isStandIn,
    emptyScreenAction,
    demoHooks,
    agentHooks,
    leaveAgent,
  } = flags;

  const isAdmin = audience === "admin";

  // Anchored on whichever sub-item the sidebar built; the collapsed tablet
  // sidebar has none.
  const quickAccessAnchor =
    (hasRecent && "agents-recent") ||
    (hasFavorites && "agents-favorites") ||
    (hasTrash && "agents-trash") ||
    null;
  const showQuickAccess = isDesktop && !!quickAccessAnchor;

  // One bullet per sub-item the sidebar built, worded as in the Files tour.
  const places = [
    hasRecent &&
      t("FilesTour:TourPlacesRecent", { sectionName: t("Common:Recent") }),
    hasFavorites &&
      t("FilesTour:TourPlacesFavorites", {
        sectionName: t("Common:Favorites"),
      }),
    hasTrash &&
      t("FilesTour:TourPlacesTrash", { sectionName: t("Common:TrashSection") }),
  ].filter(Boolean) as string[];

  return [
    // 1. What an agent is, on the sidebar item; a user hears the using end.
    aiAgentsId &&
      navItemStep(
        sidebarSelector(aiAgentsId),
        t("AiAgentsTour:AgentWhatIsTitle"),
        isAdmin
          ? t("AiAgentsTour:AgentWhatIs")
          : t("AiAgentsTour:AgentWhatIsShared"),
        callbacks,
        AI_AGENTS_TOUR_LABEL,
        false,
        leaveAgent,
      ),

    // 2. Creating one, on the tile.
    isAdmin &&
      canCreate &&
      showFilter &&
      elementStep(
        '[data-testid="quick-new-agent"]',
        t("AiAgentsTour:AgentBuildTitle"),
        t("AiAgentsTour:AgentBuild"),
        callbacks,
        AI_AGENTS_TOUR_LABEL,
        6,
        leaveAgent,
      ),

    // 3. The sample notice, only when the whole list is one, as in Rooms.
    isStandIn &&
      hasItems &&
      elementGroupStep(
        FIRST_ITEM_SELECTOR,
        STAND_IN_ROW_SELECTORS,
        t("AiAgentsTour:AgentDemoPreviewTitle"),
        t("AiAgentsTour:AgentDemoPreview"),
        callbacks,
        AI_AGENTS_TOUR_LABEL,
        4,
        leaveAgent,
        true,
      ),

    // 4. An agent row; a user gets other wording.
    hasItems &&
      fileItemStep(
        FIRST_ITEM_SELECTOR,
        t("AiAgentsTour:AgentRowTitle"),
        isAdmin ? t("AiAgentsTour:AgentRow") : t("AiAgentsTour:AgentRowMember"),
        callbacks,
        AI_AGENTS_TOUR_LABEL,
        leaveAgent,
      ),

    // 5. The chat, in the user's own agent only: a stand-in cannot serve one.
    hasItems &&
      !isStandIn &&
      agentHooks &&
      revealStep(
        CHAT_COMPOSER_SELECTOR,
        t("AiAgentsTour:AgentChatTitle"),
        t("AiAgentsTour:AgentChat"),
        callbacks,
        AI_AGENTS_TOUR_LABEL,
        agentHooks.chat,
        [CHAT_SUGGESTIONS_SELECTOR],
      ),

    // 6. Knowledge: a stand-in waits for its first file, an own agent for the tab.
    hasItems &&
      agentHooks &&
      revealStep(
        isStandIn ? KNOWLEDGE_FILE_SELECTOR : KNOWLEDGE_TAB_SELECTOR,
        t("AiAgentsTour:AgentKnowledgeBaseTitle"),
        t("AiAgentsTour:AgentKnowledgeBase"),
        callbacks,
        AI_AGENTS_TOUR_LABEL,
        agentHooks.knowledge,
        isStandIn
          ? [KNOWLEDGE_TAB_SELECTOR]
          : [FIRST_ITEM_SELECTOR, EMPTY_SCREEN_SELECTOR],
        undefined,
        4,
        undefined,
        true,
      ),

    // 7. Chat outputs, the same way.
    hasItems &&
      agentHooks &&
      revealStep(
        isStandIn ? OUTPUTS_FILE_SELECTOR : OUTPUTS_TAB_SELECTOR,
        t("AiAgentsTour:AgentOutputsTitle"),
        t("AiAgentsTour:AgentOutputs"),
        callbacks,
        AI_AGENTS_TOUR_LABEL,
        agentHooks.outputs,
        isStandIn
          ? [OUTPUTS_TAB_SELECTOR]
          : [FIRST_ITEM_SELECTOR, EMPTY_SCREEN_SELECTOR],
        undefined,
        4,
        undefined,
        true,
      ),

    // 8. Who may use the agent: the info panel, opened on the first agent.
    hasItems &&
      isDesktop &&
      infoPanelHooks &&
      revealStep(
        MEMBER_ROW_SELECTOR,
        isAdmin
          ? t("RoomsTour:RoomsMembersTitle")
          : t("AiAgentsTour:AgentAccessMemberTitle"),
        isAdmin
          ? t("AiAgentsTour:AgentAccess")
          : t("AiAgentsTour:AgentAccessMember"),
        callbacks,
        AI_AGENTS_TOUR_LABEL,
        infoPanelHooks,
        [MEMBERS_TAB_SELECTOR, MEMBERS_LIST_SELECTOR],
        FIRST_ITEM_SELECTOR,
        4,
        INFO_PANEL_SELECTOR,
        true,
      ),

    // 9. Search and the filter, as one step.
    showFilter &&
      elementGroupStep(
        SEARCH_SELECTOR,
        [SEARCH_SELECTOR, FILTER_BUTTON_SELECTOR],
        t("AiAgentsTour:AgentFindTitle"),
        t("AiAgentsTour:AgentFind"),
        callbacks,
        AI_AGENTS_TOUR_LABEL,
        6,
        leaveAgent,
      ),

    // 10. The sidebar sub-items.
    showQuickAccess &&
      places.length > 0 &&
      sidebarListStep(
        quickAccessAnchor as string,
        t("AiAgentsTour:AgentPlacesTitle"),
        places,
        callbacks,
        AI_AGENTS_TOUR_LABEL,
        leaveAgent,
      ),

    // 11. Closing: drop the stand-in list and point at the empty screen's
    // button, create or switch AI on, or name the empty list for a non-admin;
    // else the New button.
    isStandIn && demoHooks
      ? emptyScreenAction
        ? revealStep(
            EMPTY_SCREEN_CREATE_SELECTOR,
            emptyScreenAction === "create"
              ? t("RoomsTour:RoomsCreateFirstTitle")
              : t("AiAgentsTour:AgentSwitchOnTitle"),
            emptyScreenAction === "create"
              ? t("AiAgentsTour:AgentStart")
              : t("AiAgentsTour:AgentSwitchOn"),
            callbacks,
            AI_AGENTS_TOUR_LABEL,
            demoHooks,
          )
        : !isAdmin &&
          revealStep(
            EMPTY_SCREEN_SELECTOR,
            t("AiAgentsTour:AgentEmptyTitle"),
            t("AiAgentsTour:AgentEmpty"),
            callbacks,
            AI_AGENTS_TOUR_LABEL,
            demoHooks,
          )
      : isAdmin &&
        canCreate &&
        showFilter &&
        isDesktop &&
        elementStep(
          NEW_BUTTON_SELECTOR,
          t("RoomsTour:RoomsCreateFirstTitle"),
          t("AiAgentsTour:AgentStart"),
          callbacks,
          AI_AGENTS_TOUR_LABEL,
          6,
          leaveAgent,
        ),
  ].filter(Boolean) as Step[];
}
