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
import {
  navItemStep,
  elementStep,
  sidebarSelector,
} from "SRC_DIR/components/Tour/stepBuilders";

const LOG_LABEL = "ai agents tour";

export type TourStepFlags = {
  isDesktop: boolean;
  canCreate: boolean;
  showFilter: boolean;
  // Sidebar anchor: the AI Agents parent item id is the tree folder id; the
  // quick-access sub-items use static string ids ("agents-recent" etc.).
  aiAgentsId: string | null;
};

export function getTourSteps(
  t: TFunction,
  callbacks: TourStepCallbacks | undefined,
  flags: TourStepFlags,
): Step[] {
  const { isDesktop, canCreate, showFilter, aiAgentsId } = flags;

  return [
    aiAgentsId &&
      navItemStep(
        sidebarSelector(aiAgentsId),
        t("Common:AIAgents"),
        t("AiAgentsTour:AgentsIntro"),
        callbacks,
        LOG_LABEL,
      ),
    // Agent creation banner: the single "New agent" tile.
    canCreate &&
      showFilter &&
      elementStep(
        '[data-testid="quick-actions"]',
        t("AiAgentsTour:AgentsCreateTitle"),
        t("AiAgentsTour:AgentsCreate"),
        callbacks,
        LOG_LABEL,
      ),
    // The Recent / Favorites / Trash block nested under AI Agents, rendered
    // expanded while the section is active. Skipped on tablet (the collapsed
    // icon-only sidebar flattens sub-items into the main list).
    isDesktop &&
      aiAgentsId &&
      navItemStep(
        sidebarSelector("agents-recent"),
        t("AiAgentsTour:AgentsQuickAccessTitle"),
        t("AiAgentsTour:AgentsQuickAccess"),
        callbacks,
        LOG_LABEL,
        true,
      ),
    showFilter &&
      elementStep(
        "#filter_search-input",
        t("AiAgentsTour:AgentsSearchTitle"),
        t("AiAgentsTour:AgentsSearch"),
        callbacks,
        LOG_LABEL,
      ),
    showFilter &&
      isDesktop &&
      elementStep(
        "#view-switch--row, #view-switch--tile",
        t("AiAgentsTour:AgentsViewTitle"),
        t("AiAgentsTour:AgentsView"),
        callbacks,
        LOG_LABEL,
      ),
    isDesktop &&
      elementStep(
        "#info-panel-toggle--open",
        t("AiAgentsTour:AgentsInfoPanelTitle"),
        t("AiAgentsTour:AgentsInfoPanel"),
        callbacks,
        LOG_LABEL,
      ),
  ].filter(Boolean) as Step[];
}
