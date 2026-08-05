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
  expandQuickActions,
} from "SRC_DIR/components/Tour/stepBuilders";

const LOG_LABEL = "rooms tour";

// The first room of the list, in whichever view is active (only one of the
// three is mounted at a time). Same wrappers as the files list — in the table
// view the row has no geometry of its own (`display: contents`), which
// `fileItemStep` handles by falling back to the row's widest cell.
const FIRST_ITEM_SELECTOR =
  '[data-testid="table-row-0"], [data-testid="files_row_0"], [data-testid="tile_0"]';

export type TourStepFlags = {
  // Which tour to build. Admins get the room-owner story (create a room, pick a
  // type, invite members, archive it when it is done); users and guests get the
  // member's story, where a room is somewhere they were let into and their role
  // decides what they may do. The steps that only exist for one of them are
  // dropped outright, and the anchors both share get their own wording.
  audience: TourAudience;
  isDesktop: boolean;
  canCreate: boolean;
  canUseTemplates: boolean;
  showFilter: boolean;
  // Whether the room list has at least one room — steps that point at a row
  // are skipped on an empty section.
  hasItems: boolean;
  // Table view is the only one that renders a column header (and its column
  // picker); the row/tile views don't.
  isTableView: boolean;
  // Sidebar anchors. The Rooms parent item id is the tree folder id; the
  // quick-access sub-items use static string ids ("rooms-recent" etc.).
  roomsId: string | null;
  archiveId: string | null;
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
    canUseTemplates,
    showFilter,
    hasItems,
    isTableView,
    roomsId,
    archiveId,
  } = flags;

  // Room creation, templates, archiving and the room Trash are room-admin
  // powers; everyone else only ever joins rooms someone else set up.
  const isAdmin = audience === "admin";

  // The quick-access sub-items are nested under Rooms and rendered expanded
  // while the section is active. Skipped on tablet: the collapsed icon-only
  // sidebar flattens sub-items into the main list.
  const showQuickAccess = isDesktop && !!roomsId;

  return [
    // 1. Where am I — a room is not a folder; the difference is members+roles.
    // The admin owns that difference, a member lives with it, so the same
    // anchor carries two different explanations.
    roomsId &&
      navItemStep(
        sidebarSelector(roomsId),
        t("Common:Rooms"),
        isAdmin
          ? {
              text: t("RoomsTour:TourRooms"),
              points: [
                t("RoomsTour:TourRoomsMembers"),
                t("RoomsTour:TourRoomsPersonal"),
              ],
            }
          : {
              text: t("RoomsTour:TourRoomsMember"),
              points: [
                t("RoomsTour:TourRoomsMemberRole"),
                t("RoomsTour:TourRoomsMemberScope"),
              ],
            },
        callbacks,
        LOG_LABEL,
      ),

    // 2. Create — the room-type tiles, named by what each type is for. Picking
    // the right type up front matters: the type fixes what members can do and
    // cannot be changed afterwards.
    isAdmin &&
      canCreate &&
      showFilter &&
      elementStep(
        '[data-testid="quick-actions"]',
        t("RoomsTour:TourCreateTitle"),
        {
          text: t("RoomsTour:TourCreate"),
          points: [
            t("RoomsTour:TourCreateCollaboration"),
            t("RoomsTour:TourCreatePublic"),
            t("RoomsTour:TourCreateCustom"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 3. VDR — the type users least often understand, and the reason to choose
    // Rooms over a plain shared folder for sensitive files.
    isAdmin &&
      canCreate &&
      showFilter &&
      elementStep(
        '[data-testid="quick-vdr-room"]',
        t("RoomsTour:TourVdrTitle"),
        {
          text: t("RoomsTour:TourVdr"),
          points: [
            t("RoomsTour:TourVdrRestrictions"),
            t("RoomsTour:TourVdrWatermark"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 4. Templates tile — creating a room from a template carries the whole
    // setup over (structure, tags, logo, roles), which is the fastest path for
    // teams that spin up similar rooms repeatedly. It is the fifth tile, so it
    // may sit in the clipped second row; expand the banner first.
    isAdmin &&
      canCreate &&
      showFilter &&
      canUseTemplates &&
      elementStep(
        '[data-testid="quick-use-template"]',
        t("RoomsTour:TourTemplatesTitle"),
        {
          text: t("RoomsTour:TourTemplates"),
          points: [
            t("RoomsTour:TourTemplatesSave"),
            t("RoomsTour:TourTemplatesReuse"),
          ],
        },
        callbacks,
        LOG_LABEL,
        6,
        expandQuickActions,
      ),

    // 5. A real room row: the per-room actions users most often hunt for. The
    // context menu is where the audiences part company — inviting, editing and
    // archiving are only in an admin's menu, so the member wording promises
    // nothing they will not find there.
    hasItems &&
      fileItemStep(
        FIRST_ITEM_SELECTOR,
        t("RoomsTour:TourRoomItemTitle"),
        {
          text: t("RoomsTour:TourRoomItem"),
          points: [
            t("RoomsTour:TourRoomItemOpen"),
            isAdmin
              ? t("RoomsTour:TourRoomItemContextMenu")
              : t("RoomsTour:TourRoomItemMemberMenu"),
            t("RoomsTour:TourRoomItemPin"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 6. Info panel — members, roles and the access links all live here. This
    // is the single most useful control in the section. For an admin it is a
    // control panel (invite, change a role, mint a link); for a member it is a
    // read-only "who else is here and what happened" view, so it gets its own
    // title as well as its own body.
    isDesktop &&
      elementStep(
        "#info-panel-toggle--open",
        isAdmin
          ? t("RoomsTour:RoomsInfoPanelTitle")
          : t("RoomsTour:RoomsInfoPanelMemberTitle"),
        isAdmin
          ? {
              text: t("RoomsTour:RoomsInfoPanel"),
              points: [
                t("RoomsTour:RoomsInfoPanelMembers"),
                t("RoomsTour:RoomsInfoPanelLinks"),
                t("RoomsTour:RoomsInfoPanelHistory"),
              ],
            }
          : {
              text: t("RoomsTour:RoomsInfoPanelMember"),
              points: [
                t("RoomsTour:RoomsInfoPanelMemberRoles"),
                t("RoomsTour:RoomsInfoPanelHistory"),
              ],
            },
        callbacks,
        LOG_LABEL,
      ),

    // 7. Search — scoped to the room list, so it is worth saying what it covers.
    showFilter &&
      elementStep(
        "#filter_search-input",
        t("RoomsTour:RoomsSearchTitle"),
        {
          text: t("RoomsTour:RoomsSearch"),
          points: [
            t("RoomsTour:RoomsSearchScope"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 8. Advanced filter — tags are the rooms-specific part worth teaching.
    showFilter &&
      elementStep(
        "#filter-button",
        t("RoomsTour:TourFilterTitle"),
        {
          text: t("RoomsTour:TourFilter"),
          points: [
            t("RoomsTour:TourFilterTags"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 9. Table column picker — rendered by the table header only, so this step
    // is skipped in the row/tile views.
    isTableView &&
      isDesktop &&
      elementStep(
        '[data-testid="settings-block"]',
        t("RoomsTour:RoomsColumnsTitle"),
        t("RoomsTour:RoomsColumns"),
        callbacks,
        LOG_LABEL,
      ),

    // 10. Recent / Favorites — the shortcuts that save the most clicks once
    // the room list grows.
    showQuickAccess &&
      navItemStep(
        sidebarSelector("rooms-recent"),
        t("RoomsTour:RoomsQuickAccessTitle"),
        {
          text: t("RoomsTour:RoomsQuickAccess"),
          points: [
            t("RoomsTour:RoomsQuickAccessFavorites"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 11. Archive — where finished rooms go, and why it is not deletion. Only
    // a room admin can archive, so the step is pointless for anyone else.
    isAdmin &&
      showQuickAccess &&
      archiveId &&
      navItemStep(
        sidebarSelector(archiveId),
        t("RoomsTour:RoomsArchiveTitle"),
        {
          text: t("RoomsTour:RoomsArchive"),
          points: [
            t("RoomsTour:RoomsArchiveRestore"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 12. Trash — deleting a room is recoverable, which is worth saying. Also
    // admin-only: nobody else can delete a room in the first place.
    isAdmin &&
      showQuickAccess &&
      navItemStep(
        sidebarSelector("rooms-trash"),
        t("RoomsTour:RoomsTrashTitle"),
        t("RoomsTour:RoomsTrash"),
        callbacks,
        LOG_LABEL,
      ),
  ].filter(Boolean) as Step[];
}
