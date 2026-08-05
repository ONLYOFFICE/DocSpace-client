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

const LOG_LABEL = "forms tour";

// The first form space of the list, in whichever view is active (only one of
// the three is mounted at a time). Same wrappers as the files list — in the
// table view the row has no geometry of its own (`display: contents`), which
// `fileItemStep` handles by falling back to the row's widest cell.
const FIRST_ITEM_SELECTOR =
  '[data-testid="table-row-0"], [data-testid="files_row_0"], [data-testid="tile_0"]';

export type TourStepFlags = {
  // Which tour to build. Admins run collections: they open a form space, put
  // the blank form in it and invite fillers. Users and guests are on the other
  // end — they were let into a space to fill the form out — so the steps about
  // creating spaces, saving templates and emptying Trash are dropped for them
  // and the shared anchors are worded from the filler's side.
  audience: TourAudience;
  isDesktop: boolean;
  canCreate: boolean;
  canUseTemplates: boolean;
  showFilter: boolean;
  // Whether the list has at least one form space — steps that point at a row
  // are skipped on an empty section.
  hasItems: boolean;
  // Table view is the only one that renders a column header (and its column
  // picker); the row/tile views don't.
  isTableView: boolean;
  // Forms sidebar parent item id is the static "forms" id; the quick-access
  // sub-items use static string ids ("forms-recent" etc.).
  hasForms: boolean;
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
    hasForms,
  } = flags;

  // Creating a form space is a room-admin power; everyone else only ever fills
  // in the forms inside the spaces they were added to.
  const isAdmin = audience === "admin";

  // The quick-access sub-items are nested under Forms and rendered expanded
  // while the section is active. Skipped on tablet: the collapsed icon-only
  // sidebar flattens sub-items into the main list.
  const showQuickAccess = isDesktop && hasForms;

  return [
    // 1. Where am I — the mental model that trips people up: this list holds
    // form spaces (one per collection), not individual PDF files. That holds
    // for both audiences; what differs is which side of the collection they
    // are on, so each gets its own framing of the same list.
    hasForms &&
      navItemStep(
        sidebarSelector("forms"),
        t("Common:Forms"),
        isAdmin
          ? {
              text: t("FormsTour:FormsIntro"),
              points: [
                t("FormsTour:FormsIntroSpaces"),
                t("FormsTour:FormsIntroPersonal"),
              ],
            }
          : {
              text: t("FormsTour:FormsIntroFiller"),
              points: [
                t("FormsTour:FormsIntroFillerFill"),
                t("FormsTour:FormsIntroFillerPrivacy"),
              ],
            },
        callbacks,
        LOG_LABEL,
      ),

    // 2. Create — the two ways to start a collection.
    isAdmin &&
      canCreate &&
      showFilter &&
      elementStep(
        '[data-testid="quick-actions"]',
        t("FormsTour:FormsCreateTitle"),
        {
          text: t("FormsTour:FormsCreate"),
          points: [
            t("FormsTour:FormsCreateSpace"),
            t("FormsTour:FormsCreateTemplate"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 3. The form-space tile — the whole collection flow in one step, plus the
    // two result-export options that are set at creation time and are easy to
    // miss (Common:CollectResultsInXlsx / Common:ExportResultsToDatabase).
    isAdmin &&
      canCreate &&
      showFilter &&
      elementStep(
        '[data-testid="quick-form-room"]',
        t("FormsTour:FormsSpaceTitle"),
        {
          text: t("FormsTour:FormsSpace"),
          points: [
            t("FormsTour:FormsSpaceLink"),
            t("FormsTour:FormsSpaceComplete"),
            t("FormsTour:FormsSpaceXlsx"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 4. Space templates — reuse a configured space instead of setting the same
    // options up again. Same admin gate as the banner itself.
    isAdmin &&
      canCreate &&
      showFilter &&
      canUseTemplates &&
      elementStep(
        '[data-testid="quick-form-space-template"]',
        t("FormsTour:FormsTemplatesTitle"),
        {
          text: t("FormsTour:FormsTemplates"),
          points: [
            t("FormsTour:FormsTemplatesKeeps"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 5. A real form space row: the per-space actions users most often want.
    // Inviting people, editing the space and saving it as a template are only
    // in an admin's context menu, so a filler is told what is really in theirs.
    hasItems &&
      fileItemStep(
        FIRST_ITEM_SELECTOR,
        t("FormsTour:FormsItemTitle"),
        {
          text: t("FormsTour:FormsItem"),
          points: [
            t("FormsTour:FormsItemOpen"),
            isAdmin
              ? t("FormsTour:FormsItemContextMenu")
              : t("FormsTour:FormsItemMemberMenu"),
            t("FormsTour:FormsItemPin"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 6. Info panel — members and roles. The Form filler role is the one worth
    // explaining: fillers see only their own submissions
    // (Common:RoleFormFillerFormRoomDescription).
    // For a filler the same panel answers a different question — who is running
    // this collection and whether anyone else can read what they submitted —
    // so the privacy point stays and the role-assigning one goes.
    isDesktop &&
      elementStep(
        "#info-panel-toggle--open",
        isAdmin
          ? t("FormsTour:FormsInfoPanelTitle")
          : t("FormsTour:FormsInfoPanelMemberTitle"),
        isAdmin
          ? {
              text: t("FormsTour:FormsInfoPanel"),
              points: [
                t("FormsTour:FormsInfoPanelFillers"),
                t("FormsTour:FormsInfoPanelPrivacy"),
                t("FormsTour:FormsInfoPanelHistory"),
              ],
            }
          : {
              text: t("FormsTour:FormsInfoPanelMember"),
              points: [
                t("FormsTour:FormsInfoPanelPrivacy"),
                t("FormsTour:FormsInfoPanelHistory"),
              ],
            },
        callbacks,
        LOG_LABEL,
      ),

    // 7. Search — scoped to the space list, so it is worth saying what it
    // does not cover.
    showFilter &&
      elementStep(
        "#filter_search-input",
        t("FormsTour:FormsSearchTitle"),
        {
          text: t("FormsTour:FormsSearch"),
          points: [
            t("FormsTour:FormsSearchScope"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 8. Advanced filter — tags and owner/member. The room-type filter is
    // deliberately absent here (the section is already scoped to form rooms —
    // see Home/Section/Filter `isFormsSection`), so it must not be mentioned.
    showFilter &&
      elementStep(
        "#filter-button",
        t("FormsTour:FormsFilterTitle"),
        {
          text: t("FormsTour:FormsFilter"),
          points: [
            t("FormsTour:FormsFilterTags"),
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
        t("FormsTour:FormsColumnsTitle"),
        t("FormsTour:FormsColumns"),
        callbacks,
        LOG_LABEL,
      ),

    // 10. Recent / Favorites — the shortcuts that save the most clicks once
    // there are several collections running.
    showQuickAccess &&
      navItemStep(
        sidebarSelector("forms-recent"),
        t("FormsTour:FormsQuickAccessTitle"),
        {
          text: t("FormsTour:FormsQuickAccess"),
          points: [
            t("FormsTour:FormsQuickAccessFavorites"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 11. Trash — deleting a space is recoverable, which is worth saying. Only
    // an admin can delete a space, so nobody else needs the step.
    isAdmin &&
      showQuickAccess &&
      navItemStep(
        sidebarSelector("forms-trash"),
        t("FormsTour:FormsTrashTitle"),
        t("FormsTour:FormsTrash"),
        callbacks,
        LOG_LABEL,
      ),
  ].filter(Boolean) as Step[];
}
