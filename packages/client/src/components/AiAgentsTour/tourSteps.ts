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
  elementStep,
  elementGroupStep,
  fileItemStep,
  revealStep,
  sidebarSelector,
  type RevealHooks,
} from "SRC_DIR/components/Tour/stepBuilders";

const LOG_LABEL = "ai agents tour";

// The first agent of the list, in whichever view is active (only one of the
// three is mounted at a time). Same wrappers as the files list — in the table
// view the row has no geometry of its own (`display: contents`), which
// `fileItemStep` handles by falling back to the row's widest cell.
const FIRST_ITEM_SELECTOR =
  '[data-testid="table-row-0"], [data-testid="files_row_0"], [data-testid="tile_0"]';

// The info panel's outer wrapper (ui-kit Section/InfoPanel keeps this plain
// class alongside its CSS-module one). Only mounted while the panel is open,
// which is why the step that points at it opens it first.
const INFO_PANEL_SELECTOR = ".info-panel";

// The search box and the advanced filter beside it. One step covers both: they
// are the same errand — finding an agent again once there are more than a
// handful — and separating them costs a step the budget does not have.
const SEARCH_SELECTOR = "#filter_search-input";
const FILTER_BUTTON_SELECTOR = "#filter-button";

// The single action of the agents empty screen — "create an agent" on a portal
// with AI on, the way to switch it on otherwise (EmptyViewContainer.helpers,
// FolderType.AIAgents). ui-kit's EmptyView gives its options no testid of their
// own, so the anchor is positional either way.
const EMPTY_SCREEN_CREATE_SELECTOR =
  '[data-testid="empty-view-body"] > *:first-child';

export type TourStepFlags = {
  // Which tour to build. Admins configure agents — instructions, knowledge
  // base, model, who may use them. Users and guests consume agents somebody
  // else configured, so the creation step is dropped for them and the shared
  // anchors describe using an agent rather than owning one.
  audience: TourAudience;
  isDesktop: boolean;
  canCreate: boolean;
  showFilter: boolean;
  // Whether the list has at least one agent — steps that point at a row are
  // skipped on an empty section.
  hasItems: boolean;
  // Sidebar anchor: the AI Agents parent item id is the tree folder id; the
  // quick-access sub-items use static string ids ("agents-recent" etc.).
  aiAgentsId: string | null;
  // Unlike the Rooms section, the agents sub-items are only rendered when the
  // matching portal-wide alias folder exists (ClientArticleSidebar gates each
  // one), so the tour has to mirror that — both to find an anchor at all and to
  // avoid naming a shortcut that is not on screen.
  hasRecent: boolean;
  hasFavorites: boolean;
  hasTrash: boolean;
  // Opens the info panel on the first agent's member list, and puts back what
  // it changed. Supplied by the host component, which holds the stores.
  infoPanelHooks?: RevealHooks;
  // Whether the section's own list is the one being stood in for. Only then is
  // there a closing step: it drops the stand-in and hands the user over to the
  // real button on the empty screen they are left looking at.
  isStandIn: boolean;
  // Which button that is, once the pretence is dropped — and so what the
  // closing step is for. A portal that has AI on is sent at "create an agent";
  // one that has not is sent at the button that switches it on, which is the
  // thing standing between the user and everything they were just shown.
  // `null` when the empty screen offers nothing and there is no step to make.
  emptyScreenAction: "create" | "activate" | null;
  demoHooks?: RevealHooks;
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
  } = flags;

  // Creating an agent is a room-admin power; everyone else only uses the agents
  // they were given access to.
  const isAdmin = audience === "admin";

  // The quick-access sub-items are nested under AI Agents and rendered expanded
  // while the section is active. Skipped on tablet: the collapsed icon-only
  // sidebar flattens sub-items into the main list. Anchored on whichever of
  // them the sidebar actually built — the spotlight covers the sub-list they
  // share, so any of the three lights up the same block.
  const quickAccessAnchor =
    (hasRecent && "agents-recent") ||
    (hasFavorites && "agents-favorites") ||
    (hasTrash && "agents-trash") ||
    null;
  const showQuickAccess = isDesktop && !!quickAccessAnchor;

  // One sentence per shortcut, read as a single paragraph, each named by the
  // sidebar's own label so the wording in the tooltip is the wording on screen.
  // Only the ones that exist are named.
  const places = [
    (hasRecent || hasFavorites) &&
      t("AiAgentsTour:AgentPlacesRecent", {
        recent: t("Common:Recent"),
        favorites: t("Common:Favorites"),
      }),
    hasTrash &&
      t("AiAgentsTour:AgentPlacesTrash", { trash: t("Common:TrashSection") }),
  ].filter(Boolean) as string[];

  return [
    // 1. What an agent is, which is the one thing everything else rests on: not
    // a chat window you open and lose, but a thing you set up and keep. The
    // three tabs live inside an agent, so they can only be described here — the
    // tour never opens one.
    aiAgentsId &&
      navItemStep(
        sidebarSelector(aiAgentsId),
        t("AiAgentsTour:AgentWhatIsTitle"),
        // The same mental model either way — but somebody who cannot add to the
        // list is told where the list they are looking at comes from instead of
        // what an agent keeps for them.
        isAdmin
          ? t("AiAgentsTour:AgentWhatIs")
          : t("AiAgentsTour:AgentWhatIsShared"),
        callbacks,
        LOG_LABEL,
      ),

    // 2. Create. The agents banner holds a single "New agent" tile, so
    // spotlighting the banner is the same as spotlighting the tile. The step
    // names what the create dialog actually asks for: AI Instructions,
    // Knowledge, Profile (model) and MCP tools.
    isAdmin &&
      canCreate &&
      showFilter &&
      elementStep(
        '[data-testid="quick-actions"]',
        t("AiAgentsTour:AgentBuildTitle"),
        t("AiAgentsTour:AgentBuild"),
        callbacks,
        LOG_LABEL,
      ),

    // 3. An agent row: the per-agent actions people reach for most, none of
    // which need the agent opened. Editing, inviting and duplicating are admin
    // entries; a user's menu is short, so it is described separately.
    hasItems &&
      fileItemStep(
        FIRST_ITEM_SELECTOR,
        t("AiAgentsTour:AgentRowTitle"),
        isAdmin ? t("AiAgentsTour:AgentRow") : t("AiAgentsTour:AgentRowMember"),
        callbacks,
        LOG_LABEL,
      ),

    // 4. Who may use the agent. The step opens the info panel on the first
    // agent's member list and lights up the row and the panel together, rather
    // than pointing at the button that would have opened it — an agent has no
    // public link, only a members one, so what the panel is for has to be seen
    // to land. For everyone else the same panel answers "who else uses this,
    // and what changed in it".
    hasItems &&
      isDesktop &&
      infoPanelHooks &&
      revealStep(
        INFO_PANEL_SELECTOR,
        isAdmin
          ? t("AiAgentsTour:AgentAccessTitle")
          : t("AiAgentsTour:AgentAccessMemberTitle"),
        isAdmin
          ? t("AiAgentsTour:AgentAccess")
          : t("AiAgentsTour:AgentAccessMember"),
        callbacks,
        LOG_LABEL,
        infoPanelHooks,
        [FIRST_ITEM_SELECTOR],
        FIRST_ITEM_SELECTOR,
      ),

    // 5. Finding one again. Search and the advanced filter share a step because
    // they share an errand, and the spotlight covers the pair rather than the
    // whole filter bar around them.
    showFilter &&
      elementGroupStep(
        SEARCH_SELECTOR,
        [SEARCH_SELECTOR, FILTER_BUTTON_SELECTOR],
        t("AiAgentsTour:AgentFindTitle"),
        t("AiAgentsTour:AgentFind"),
        callbacks,
        LOG_LABEL,
      ),

    // 6. The sidebar sub-items, in one paragraph.
    showQuickAccess &&
      places.length > 0 &&
      navItemStep(
        sidebarSelector(quickAccessAnchor as string),
        t("AiAgentsTour:AgentPlacesTitle"),
        places.join(" "),
        callbacks,
        LOG_LABEL,
        true,
      ),

    // 7. Only when the list was stood in for. The stand-in agents are the last
    // thing the user saw, and dropping them lands them on the empty screen — so
    // rather than let that happen behind their back, the closing step does it
    // deliberately and points at the button that starts the real thing.
    //
    // Which button that is decides what the step says. A portal with AI already
    // on is a step away from its first agent. A portal without it has just been
    // shown a section it cannot have yet, and the honest ending is to name the
    // one thing standing in the way rather than to pretend it was never
    // pretending. `restore` is a no-op either way: the section is the user's
    // own from here on.
    isStandIn &&
      !!emptyScreenAction &&
      demoHooks &&
      revealStep(
        EMPTY_SCREEN_CREATE_SELECTOR,
        emptyScreenAction === "create"
          ? t("AiAgentsTour:AgentStartTitle")
          : t("AiAgentsTour:AgentSwitchOnTitle"),
        emptyScreenAction === "create"
          ? t("AiAgentsTour:AgentStart")
          : t("AiAgentsTour:AgentSwitchOn"),
        callbacks,
        LOG_LABEL,
        demoHooks,
      ),
  ].filter(Boolean) as Step[];
}
