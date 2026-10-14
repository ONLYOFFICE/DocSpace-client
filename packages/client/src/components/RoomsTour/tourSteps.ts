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

import { createElement } from "react";
import type { Step } from "react-joyride";
import type { TFunction } from "i18next";

import type { TourStepCallbacks } from "SRC_DIR/components/Tour/useTour";
import {
  sidebarListStep,
  elementStep,
  elementGroupStep,
  revealStep,
  revealQuickActionTile,
  rewindQuickActions,
} from "SRC_DIR/components/Tour/stepBuilders";
import { ROOMS_TOUR_LABEL } from "SRC_DIR/components/Tour/logLabels";
import TourList from "SRC_DIR/components/Tour/TourList";

// Banner order; the template and AI chat tiles get steps of their own.
const ROOM_TYPE_TILE_SELECTORS = [
  '[data-testid="quick-vdr-room"]',
  '[data-testid="quick-collaboration-room"]',
  '[data-testid="quick-public-room"]',
  '[data-testid="quick-custom-room"]',
];

// Rendered only with grouping on, at the rooms root and with no filter active.
export const GROUPS_SELECTOR = ".group-tags";

// One selector per view; the host waits on it before the members step.
export const FIRST_ITEM_SELECTOR =
  '[data-testid="table-row-0"], [data-testid="files_row_0"], [data-testid="tile_0"]';

// Only mounted while the panel is open.
const INFO_PANEL_SELECTOR = ".info-panel";
// ui-kit Tabs names the tab `${InfoPanelView.infoMembers}_tab`.
const MEMBERS_TAB_SELECTOR = '[data-testid="info_members_tab"]';
const MEMBERS_LIST_SELECTOR = '[data-testid="info_panel_members_list"]';

// The "New room" button of the filter bar; the test id covers its label alone.
const NEW_BUTTON_SELECTOR =
  '#filter_search-input > div:has(> [data-testid="main-button"])';

// EmptyView gives its options no test id, so "create a room" is positional.
const EMPTY_SCREEN_CREATE_SELECTOR =
  '[data-testid="empty-view-body"] > *:first-child';

const EMPTY_SCREEN_SELECTOR = '[data-testid="empty-view"]';

export type TourStepFlags = {
  isDesktop: boolean;
  canCreate: boolean;
  canUseTemplates: boolean;
  showFilter: boolean;
  hasItems: boolean;
  // Sidebar `data-item-id` of the Rooms item: its tree folder id.
  roomsId: string | null;
  infoPanelHooks?: { reveal: () => void; restore: () => void };
  // The closing step exists only when the list is stood in for.
  isDemo: boolean;
  demoHooks?: { reveal: () => void; restore: () => void };
};

export function getTourSteps(
  t: TFunction,
  callbacks: TourStepCallbacks | undefined,
  flags: TourStepFlags,
): Step[] {
  const {
    isDesktop,
    canCreate,
    canUseTemplates,
    showFilter,
    hasItems,
    roomsId,
    infoPanelHooks,
    isDemo,
    demoHooks,
  } = flags;

  // The collapsed tablet sidebar has no sub-items to point at.
  const showQuickAccess = isDesktop && !!roomsId;

  return [
    // 1. Room types. The banner is a carousel, so each tile step scrolls first.
    canCreate &&
      showFilter &&
      elementGroupStep(
        '[data-testid="quick-actions"]',
        ROOM_TYPE_TILE_SELECTORS,
        t("RoomsTour:RoomsTypesTitle"),
        // Each type is named by its own tile's label.
        createElement(TourList, {
          items: [
            t("RoomsTour:RoomsTypesCollaboration", {
              roomType: t("Common:CollaborationRoomTitle"),
            }),
            t("RoomsTour:RoomsTypesVdr", {
              roomType: t("Common:VirtualDataRoom"),
            }),
            t("RoomsTour:RoomsTypesPublic", {
              roomType: t("Common:PublicRoom"),
            }),
            t("RoomsTour:RoomsTypesCustom", {
              roomType: t("Common:CustomRoomTitle"),
            }),
          ],
        }),
        callbacks,
        ROOMS_TOUR_LABEL,
        6,
        rewindQuickActions,
      ),

    // 2. Templates.
    canCreate &&
      canUseTemplates &&
      showFilter &&
      elementStep(
        '[data-testid="quick-use-template"]',
        t("RoomsTour:RoomsTemplatesTitle"),
        t("RoomsTour:RoomsTemplates"),
        callbacks,
        ROOMS_TOUR_LABEL,
        6,
        revealQuickActionTile('[data-testid="quick-use-template"]'),
      ),

    // 3. AI chat tile, worded as in the Files tour.
    showFilter &&
      elementStep(
        '[data-testid="quick-ai-chat"]',
        t("FilesTour:TourAiAssistantTitle"),
        t("FilesTour:TourAiAssistant", { sectionName: t("Common:Rooms") }),
        callbacks,
        ROOMS_TOUR_LABEL,
        6,
        revealQuickActionTile('[data-testid="quick-ai-chat"]'),
      ),

    // 4. Room groups.
    showFilter &&
      elementStep(
        GROUPS_SELECTOR,
        t("RoomsTour:RoomsGroupsTitle"),
        t("RoomsTour:RoomsGroups"),
        callbacks,
        ROOMS_TOUR_LABEL,
      ),

    // 5. Members: the Contacts tab and the list, kept inside the panel.
    hasItems &&
      isDesktop &&
      infoPanelHooks &&
      revealStep(
        MEMBERS_LIST_SELECTOR,
        t("RoomsTour:RoomsMembersTitle"),
        t("RoomsTour:RoomsMembers"),
        callbacks,
        ROOMS_TOUR_LABEL,
        infoPanelHooks,
        [MEMBERS_TAB_SELECTOR],
        FIRST_ITEM_SELECTOR,
        4,
        INFO_PANEL_SELECTOR,
      ),

    // 6. Sidebar shortcuts, named by the sidebar's own labels.
    showQuickAccess &&
      sidebarListStep(
        "rooms-recent",
        t("RoomsTour:RoomsPlacesTitle"),
        [
          t("FilesTour:TourPlacesRecent", { sectionName: t("Common:Recent") }),
          t("FilesTour:TourPlacesFavorites", {
            sectionName: t("Common:Favorites"),
          }),
          t("FilesTour:TourPlacesTrash", {
            sectionName: t("Common:TrashSection"),
          }),
          t("RoomsTour:RoomsPlacesTemplates", {
            templates: t("Common:Templates"),
          }),
          t("RoomsTour:RoomsPlacesArchive", { archive: t("Common:Archive") }),
        ],
        callbacks,
        ROOMS_TOUR_LABEL,
      ),

    // 7. Closing action: what the empty screen offers once the stand-in rooms
    // are dropped (`restore` puts them back), or the "New room" button.
    isDemo && demoHooks
      ? canCreate
        ? revealStep(
            EMPTY_SCREEN_CREATE_SELECTOR,
            t("RoomsTour:RoomsCreateFirstTitle"),
            t("RoomsTour:RoomsCreateFirst"),
            callbacks,
            ROOMS_TOUR_LABEL,
            demoHooks,
          )
        : revealStep(
            EMPTY_SCREEN_SELECTOR,
            t("RoomsTour:RoomsEmptyTitle"),
            t("RoomsTour:RoomsEmpty"),
            callbacks,
            ROOMS_TOUR_LABEL,
            demoHooks,
          )
      : canCreate &&
        showFilter &&
        isDesktop &&
        elementStep(
          NEW_BUTTON_SELECTOR,
          t("RoomsTour:RoomsCreateFirstTitle"),
          t("RoomsTour:RoomsCreateFirst"),
          callbacks,
          ROOMS_TOUR_LABEL,
        ),
  ].filter(Boolean) as Step[];
}
