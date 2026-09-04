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
import TourList from "SRC_DIR/components/Tour/TourList";
import {
  navItemStep,
  elementStep,
  elementGroupStep,
  revealStep,
  sidebarSelector,
  revealQuickActionTile,
  rewindQuickActions,
} from "SRC_DIR/components/Tour/stepBuilders";

const LOG_LABEL = "rooms tour";

// The room-type tiles, in the banner order the quick-actions hook builds them
// (VDR first). The template and AI chat tiles share their container and get a
// step each, so the spotlight covers this run of tiles rather than the banner.
const ROOM_TYPE_TILE_SELECTORS = [
  '[data-testid="quick-vdr-room"]',
  '[data-testid="quick-collaboration-room"]',
  '[data-testid="quick-public-room"]',
  '[data-testid="quick-custom-room"]',
];

// The room-grouping row above the list ("All rooms", the group chips, and the
// button that creates the first group). ui-kit renders it behind three gates —
// the grouping setting, the rooms root, and no active filter — so the step is
// dropped by the start-of-run DOM check whenever it is not on screen.
const GROUPS_SELECTOR = ".group-tags";

// The first room of the list, in whichever view is active (only one of the
// three is mounted at a time).
const FIRST_ITEM_SELECTOR =
  '[data-testid="table-row-0"], [data-testid="files_row_0"], [data-testid="tile_0"]';

// The info panel's outer wrapper (ui-kit Section/InfoPanel keeps this plain
// class alongside its CSS-module one). Only mounted while the panel is open,
// which is why the step that points at it opens it first.
const INFO_PANEL_SELECTOR = ".info-panel";

// The first action of the empty screen, which on the rooms root is "create a
// room" (EmptyViewContainer.helpers builds the list as
// [createRoom, inviteRootRoom, migrationData]). ui-kit's EmptyView gives its
// options no testid of their own, so the anchor is positional.
const EMPTY_SCREEN_CREATE_SELECTOR =
  '[data-testid="empty-view-body"] > *:first-child';

// The empty screen itself, for the closing step of anyone with no action on it
// to point at. Nothing is offered to somebody who cannot create a room, so the
// body may hold no options at all — the screen around them always exists.
const EMPTY_SCREEN_SELECTOR = '[data-testid="empty-view"]';

export type TourStepFlags = {
  isDesktop: boolean;
  // Room creation and templates are room-admin powers; everyone else only ever
  // joins rooms someone else set up, so those steps are dropped for them.
  canCreate: boolean;
  canUseTemplates: boolean;
  showFilter: boolean;
  // Whether the room list has at least one room — the step that points at a
  // row (and at the panel describing it) is skipped on an empty section.
  hasItems: boolean;
  // Sidebar anchor: the Rooms parent item id is the tree folder id, and its
  // quick-access sub-items use static string ids ("rooms-recent" etc.).
  roomsId: string | null;
  // Opens the info panel on the first room's member list, and puts back what
  // it changed. Supplied by the host component, which holds the stores.
  infoPanelHooks?: { reveal: () => void; restore: () => void };
  // Whether the section the tour is walking through is stood in for. The
  // closing step exists only then: it drops the stand-in and hands the user
  // over to the real "create a room" button on the empty screen they are
  // about to be left looking at.
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

  // The quick-access sub-items are nested under Rooms and rendered expanded
  // while the section is active. Skipped on tablet: the collapsed icon-only
  // sidebar flattens sub-items into the main list.
  const showQuickAccess = isDesktop && !!roomsId;

  return [
    // 1. The room types, named by what each one is for. Picking the right type
    // up front matters: the type fixes what members can do and cannot be
    // changed afterwards. The banner is a carousel, so every tile step scrolls
    // its target into the strip before measuring anything.
    canCreate &&
      showFilter &&
      elementGroupStep(
        '[data-testid="quick-actions"]',
        ROOM_TYPE_TILE_SELECTORS,
        t("RoomsTour:RoomsTypesTitle"),
        // Each type is named by the label its own tile carries (the same
        // Common keys `useQuickActions` builds the banner from), so the
        // tooltip and the tiles under the spotlight never drift apart.
        t("RoomsTour:RoomsTypes", {
          collaboration: t("Common:CollaborationRoomTitle"),
          vdr: t("Common:VirtualDataRoom"),
          publicRoom: t("Common:PublicRoom"),
          custom: t("Common:CustomRoomTitle"),
        }),
        callbacks,
        LOG_LABEL,
        6,
        rewindQuickActions,
      ),

    // 2. Templates — the fastest path for teams that spin up similar rooms
    // repeatedly, and the least obvious of the tiles.
    canCreate &&
      canUseTemplates &&
      showFilter &&
      elementStep(
        '[data-testid="quick-use-template"]',
        t("RoomsTour:RoomsTemplatesTitle"),
        t("RoomsTour:RoomsTemplates"),
        callbacks,
        LOG_LABEL,
        6,
        revealQuickActionTile('[data-testid="quick-use-template"]'),
      ),

    // 3. AI chat — the same tile, and the same thing to say about it, as in the
    // files tour; the wording is shared rather than duplicated per namespace.
    showFilter &&
      elementStep(
        '[data-testid="quick-ai-chat"]',
        t("FilesTour:TourAiAssistantTitle"),
        t("FilesTour:TourAiAssistant", { sectionName: t("Common:Rooms") }),
        callbacks,
        LOG_LABEL,
        6,
        revealQuickActionTile('[data-testid="quick-ai-chat"]'),
      ),

    // 4. Room groups — the row of chips above the list.
    showFilter &&
      elementStep(
        GROUPS_SELECTOR,
        t("RoomsTour:RoomsGroupsTitle"),
        t("RoomsTour:RoomsGroups"),
        callbacks,
        LOG_LABEL,
      ),

    // 5. Members — the single most useful thing in the section, and the one
    // that makes a room a room. The step opens the info panel on the first
    // room's member list and lights up the row and the panel together.
    hasItems &&
      isDesktop &&
      infoPanelHooks &&
      revealStep(
        INFO_PANEL_SELECTOR,
        t("RoomsTour:RoomsMembersTitle"),
        t("RoomsTour:RoomsMembers"),
        callbacks,
        LOG_LABEL,
        infoPanelHooks,
        [FIRST_ITEM_SELECTOR],
        FIRST_ITEM_SELECTOR,
      ),

    // 6. The sidebar sub-items: what each of the section's shortcuts holds.
    // Each is named by the sidebar's own label, so the wording in the tooltip
    // is the wording on screen and the names are not translated twice.
    //
    // Bulleted rather than one paragraph: the three things this step covers
    // (the file shortcuts, templates, the archive) are unrelated to each
    // other, and running them together buried the sidebar names the user is
    // meant to spot. The wording of each is unchanged.
    showQuickAccess &&
      navItemStep(
        sidebarSelector("rooms-recent"),
        t("RoomsTour:RoomsPlacesTitle"),
        createElement(TourList, {
          items: [
            t("RoomsTour:RoomsPlacesFiles", {
              recent: t("Common:Recent"),
              favorites: t("Common:Favorites"),
              trash: t("Common:TrashSection"),
            }),
            t("RoomsTour:RoomsPlacesTemplates", {
              templates: t("Common:Templates"),
            }),
            t("RoomsTour:RoomsPlacesArchive", {
              archive: t("Common:Archive"),
            }),
          ],
        }),
        callbacks,
        LOG_LABEL,
        true,
      ),

    // 7. Only when the section was stood in for. The stand-in rooms are the
    // last thing the user saw, and dropping them lands them on the empty
    // screen — so rather than let that happen behind their back, the closing
    // step does it deliberately. `restore` is a no-op either way: the section
    // is the user's own from here on.
    //
    // What it points at, and what it says, is whatever that screen actually
    // offers. Somebody who can create a room is a click away from everything
    // they were just shown, so the step lands on that button. Somebody who
    // cannot has no button there at all — the honest ending for them is to name
    // what the empty list means and who fills it, rather than to send them at
    // an action that is not theirs.
    isDemo &&
      demoHooks &&
      (canCreate
        ? revealStep(
            EMPTY_SCREEN_CREATE_SELECTOR,
            t("RoomsTour:RoomsCreateFirstTitle"),
            t("RoomsTour:RoomsCreateFirst"),
            callbacks,
            LOG_LABEL,
            demoHooks,
          )
        : revealStep(
            EMPTY_SCREEN_SELECTOR,
            t("RoomsTour:RoomsEmptyTitle"),
            t("RoomsTour:RoomsEmpty"),
            callbacks,
            LOG_LABEL,
            demoHooks,
          )),
  ].filter(Boolean) as Step[];
}
