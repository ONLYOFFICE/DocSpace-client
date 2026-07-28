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

const LOG_LABEL = "rooms tour";

export type TourStepFlags = {
  isDesktop: boolean;
  canCreate: boolean;
  canUseTemplates: boolean;
  showFilter: boolean;
  // Sidebar anchors. The Rooms parent item id is the tree folder id; the
  // quick-access sub-items use static string ids ("rooms-recent" etc.).
  roomsId: string | null;
};

export function getTourSteps(
  t: TFunction,
  callbacks: TourStepCallbacks | undefined,
  flags: TourStepFlags,
): Step[] {
  const { isDesktop, canCreate, canUseTemplates, showFilter, roomsId } = flags;

  return [
    roomsId &&
      navItemStep(
        sidebarSelector(roomsId),
        t("Common:Rooms"),
        t("RoomsTour:TourRooms"),
        callbacks,
        LOG_LABEL,
      ),
    // Rooms creation banner: room-type tiles (VDR / Collaboration / Public /
    // Custom / Use template). Only when the user can create rooms.
    canCreate &&
      showFilter &&
      elementStep(
        '[data-testid="quick-actions"]',
        t("RoomsTour:TourCreateTitle"),
        t("RoomsTour:TourCreate"),
        callbacks,
        LOG_LABEL,
      ),
    // The Recent / Favorites / Templates / Archive / Trash block nested under
    // Rooms, rendered expanded while the section is active. Skipped on tablet
    // (the collapsed icon-only sidebar flattens sub-items into the main list).
    isDesktop &&
      roomsId &&
      navItemStep(
        sidebarSelector("rooms-recent"),
        t("RoomsTour:RoomsQuickAccessTitle"),
        t("RoomsTour:RoomsQuickAccess"),
        callbacks,
        LOG_LABEL,
        true,
      ),
    isDesktop &&
      canUseTemplates &&
      navItemStep(
        sidebarSelector("rooms-templates"),
        t("RoomsTour:TourTemplatesTitle"),
        t("RoomsTour:TourTemplates"),
        callbacks,
        LOG_LABEL,
      ),
    showFilter &&
      elementStep(
        "#filter_search-input",
        t("RoomsTour:RoomsSearchTitle"),
        t("RoomsTour:RoomsSearch"),
        callbacks,
        LOG_LABEL,
      ),
    showFilter &&
      elementStep(
        "#filter-button",
        t("RoomsTour:TourFilterTitle"),
        t("RoomsTour:TourFilter"),
        callbacks,
        LOG_LABEL,
      ),
    showFilter &&
      isDesktop &&
      elementStep(
        "#view-switch--row, #view-switch--tile",
        t("RoomsTour:RoomsViewTitle"),
        t("RoomsTour:RoomsView"),
        callbacks,
        LOG_LABEL,
      ),
    isDesktop &&
      elementStep(
        "#info-panel-toggle--open",
        t("RoomsTour:RoomsInfoPanelTitle"),
        t("RoomsTour:RoomsInfoPanel"),
        callbacks,
        LOG_LABEL,
      ),
  ].filter(Boolean) as Step[];
}
