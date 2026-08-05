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
  fileItemStep,
  sidebarSelector,
} from "SRC_DIR/components/Tour/stepBuilders";

const LOG_LABEL = "ai agents tour";

// The first agent of the list, in whichever view is active (only one of the
// three is mounted at a time). Same wrappers as the files list — in the table
// view the row has no geometry of its own (`display: contents`), which
// `fileItemStep` handles by falling back to the row's widest cell.
const FIRST_ITEM_SELECTOR =
  '[data-testid="table-row-0"], [data-testid="files_row_0"], [data-testid="tile_0"]';

export type TourStepFlags = {
  // Which tour to build. Admins configure agents — instructions, knowledge
  // base, model, who may use them. Users and guests consume agents somebody
  // else configured, so the creation and Trash steps are dropped for them and
  // the shared anchors describe using an agent rather than owning one.
  audience: TourAudience;
  isDesktop: boolean;
  canCreate: boolean;
  showFilter: boolean;
  // Whether the list has at least one agent — steps that point at a row are
  // skipped on an empty section.
  hasItems: boolean;
  // Table view is the only one that renders a column header (and its column
  // picker); the row/tile views don't.
  isTableView: boolean;
  // Sidebar anchor: the AI Agents parent item id is the tree folder id; the
  // quick-access sub-items use static string ids ("agents-recent" etc.).
  aiAgentsId: string | null;
  // Unlike the Rooms/Forms sections, the agents sub-items are only rendered
  // when the matching portal-wide alias folder exists (ClientArticleSidebar
  // gates each one), so the tour has to mirror that.
  hasRecent: boolean;
  hasTrash: boolean;
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
    isTableView,
    aiAgentsId,
    hasRecent,
    hasTrash,
  } = flags;

  // Creating and deleting agents is a room-admin power; everyone else only
  // uses the agents they were given access to.
  const isAdmin = audience === "admin";

  // The quick-access sub-items are nested under AI Agents and rendered expanded
  // while the section is active. Skipped on tablet: the collapsed icon-only
  // sidebar flattens sub-items into the main list.
  const showQuickAccess = isDesktop && !!aiAgentsId;

  return [
    // 1. Where am I — the mental model: an agent is a configured, reusable
    // assistant with its own chat, knowledge base and results, not a one-off
    // chat window (the three tabs live inside an agent, so they can only be
    // described here, not spotlighted).
    aiAgentsId &&
      navItemStep(
        sidebarSelector(aiAgentsId),
        t("Common:AIAgents"),
        isAdmin
          ? {
              text: t("AiAgentsTour:AgentsIntro"),
              points: [
                t("AiAgentsTour:AgentsIntroTabs"),
                t("AiAgentsTour:AgentsIntroResults"),
                t("AiAgentsTour:AgentsIntroShare"),
              ],
            }
          : {
              // Same mental model, told from the using end: the last point
              // replaces "share it with your team" with where the list they
              // are looking at comes from.
              text: t("AiAgentsTour:AgentsIntroUser"),
              points: [
                t("AiAgentsTour:AgentsIntroTabs"),
                t("AiAgentsTour:AgentsIntroResults"),
                t("AiAgentsTour:AgentsIntroUserAccess"),
              ],
            },
        callbacks,
        LOG_LABEL,
      ),

    // 2. Create — the agents banner holds a single "New agent" tile, so
    // spotlighting the banner is the same as spotlighting the tile. The points
    // name what the create dialog actually asks for: AI Instructions,
    // Knowledge, Profile (model) and MCP.
    isAdmin &&
      canCreate &&
      showFilter &&
      elementStep(
        '[data-testid="quick-actions"]',
        t("AiAgentsTour:AgentsCreateTitle"),
        {
          text: t("AiAgentsTour:AgentsCreate"),
          points: [
            t("AiAgentsTour:AgentsCreateInstructions"),
            t("AiAgentsTour:AgentsCreateKnowledge"),
            t("AiAgentsTour:AgentsCreateModel"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 3. A real agent row: the per-agent actions users most often want.
    hasItems &&
      fileItemStep(
        FIRST_ITEM_SELECTOR,
        t("AiAgentsTour:AgentsItemTitle"),
        {
          text: t("AiAgentsTour:AgentsItem"),
          points: [
            t("AiAgentsTour:AgentsItemOpen"),
            // Editing, inviting and duplicating are admin entries; a user's
            // menu is short, so say what is actually in it.
            isAdmin
              ? t("AiAgentsTour:AgentsItemContextMenu")
              : t("AiAgentsTour:AgentsItemMemberMenu"),
            t("AiAgentsTour:AgentsItemPin"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 4. Info panel — for an agent it offers Members / History / Details (see
    // helpers/info-panel/tabs.ts). Agents have no public external link, only a
    // members link, so the copy must not promise link sharing with outsiders.
    // Granting access is the owner's half of that panel; for everyone else it
    // answers "who else uses this agent and what changed in it".
    isDesktop &&
      elementStep(
        "#info-panel-toggle--open",
        isAdmin
          ? t("AiAgentsTour:AgentsInfoPanelTitle")
          : t("AiAgentsTour:AgentsInfoPanelMemberTitle"),
        isAdmin
          ? {
              text: t("AiAgentsTour:AgentsInfoPanel"),
              points: [
                t("AiAgentsTour:AgentsInfoPanelMembers"),
                t("AiAgentsTour:AgentsInfoPanelViewOnly"),
                t("AiAgentsTour:AgentsInfoPanelHistory"),
              ],
            }
          : {
              text: t("AiAgentsTour:AgentsInfoPanelMember"),
              points: [
                t("AiAgentsTour:AgentsInfoPanelMemberRoles"),
                t("AiAgentsTour:AgentsInfoPanelHistory"),
              ],
            },
        callbacks,
        LOG_LABEL,
      ),

    // 5. Search — scoped to agent names, so it is worth saying what it does
    // not cover.
    showFilter &&
      elementStep(
        "#filter_search-input",
        t("AiAgentsTour:AgentsSearchTitle"),
        {
          text: t("AiAgentsTour:AgentsSearch"),
          points: [
            t("AiAgentsTour:AgentsSearchScope"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 6. Advanced filter — the agents section offers member, owner and tags
    // (Home/Section/Filter `isAIAgentsFolder`); there is no type filter.
    showFilter &&
      elementStep(
        "#filter-button",
        t("AiAgentsTour:AgentsFilterTitle"),
        {
          text: t("AiAgentsTour:AgentsFilter"),
          points: [
            t("AiAgentsTour:AgentsFilterTags"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 7. Table column picker — rendered by the table header only, so this step
    // is skipped in the row/tile views.
    isTableView &&
      isDesktop &&
      elementStep(
        '[data-testid="settings-block"]',
        t("AiAgentsTour:AgentsColumnsTitle"),
        t("AiAgentsTour:AgentsColumns"),
        callbacks,
        LOG_LABEL,
      ),

    // 8. Recent / Favorites — the shortcuts that save the most clicks once
    // there are several agents.
    showQuickAccess &&
      hasRecent &&
      navItemStep(
        sidebarSelector("agents-recent"),
        t("AiAgentsTour:AgentsQuickAccessTitle"),
        {
          text: t("AiAgentsTour:AgentsQuickAccess"),
          points: [
            t("AiAgentsTour:AgentsQuickAccessFavorites"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 9. Trash — deleting an agent is recoverable, which is worth saying. Only
    // an admin can delete one, so nobody else needs the step.
    isAdmin &&
      showQuickAccess &&
      hasTrash &&
      navItemStep(
        sidebarSelector("agents-trash"),
        t("AiAgentsTour:AgentsTrashTitle"),
        t("AiAgentsTour:AgentsTrash"),
        callbacks,
        LOG_LABEL,
      ),
  ].filter(Boolean) as Step[];
}
