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
  fileItemStep,
  sidebarSelector,
  expandQuickActions,
} from "SRC_DIR/components/Tour/stepBuilders";

const LOG_LABEL = "files tour";

// The first item of the file list, in whichever view is active (only one of
// the three is mounted at a time).
//
// In the table view neither row wrapper has geometry: both the row
// (TableRow.module.scss `.tableRow`) and the drag wrapper
// (StyledTable.module.scss `.styledDragAndDrop`) are `display: contents`, so a
// naive spotlight lands on a 0x0 point in the corner. `fileItemStep` detects
// that and falls back to the row's widest cell.
const FIRST_ITEM_SELECTOR =
  '[data-testid="table-row-0"], [data-testid="files_row_0"], [data-testid="tile_0"]';

export type TourStepFlags = {
  isDesktop: boolean;
  canCreate: boolean;
  showFilter: boolean;
  // Whether the file list has at least one item — steps that point at a row
  // are skipped on an empty folder.
  hasItems: boolean;
  // Table view is the only one that renders a column header (and its column
  // picker); the row/tile views don't.
  isTableView: boolean;
  // Sidebar anchors: NavMenu renders `data-item-id` per item, the ids of the
  // tree-folder items are their folder ids (null — item is absent).
  myDocumentsId: string | null;
  sharedId: string | null;
  recentId: string | null;
  favoritesId: string | null;
  trashId: string | null;
};

export function getTourSteps(
  t: TFunction,
  callbacks: TourStepCallbacks | undefined,
  flags: TourStepFlags,
): Step[] {
  const {
    isDesktop,
    canCreate,
    showFilter,
    hasItems,
    isTableView,
    myDocumentsId,
    sharedId,
    recentId,
    favoritesId,
    trashId,
  } = flags;

  // The quick-access sub-items are nested under My documents and rendered
  // expanded while the section is active. Skipped on tablet: the collapsed
  // icon-only sidebar flattens sub-items into the main list.
  const showQuickAccess = isDesktop && !!myDocumentsId;

  return [
    // 1. Where am I — the personal space, and how it differs from Rooms.
    myDocumentsId &&
      navItemStep(
        sidebarSelector(myDocumentsId),
        t("Common:Files"),
        {
          text: t("FilesTour:TourMyDocuments"),
          points: [
            t("FilesTour:TourMyDocumentsPrivate"),
            t("FilesTour:TourMyDocumentsShare"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 2. Create — the quick-action tiles, named by what they produce. Upload
    // is mentioned here too: the header "+" button only renders on an empty
    // page (isPlusButtonVisible), so it can't be spotlighted in this tour.
    canCreate &&
      showFilter &&
      elementStep(
        '[data-testid="quick-actions"]',
        t("FilesTour:TourActionsTitle"),
        {
          text: t("FilesTour:TourActions"),
          points: [
            t("FilesTour:TourActionsFormats"),
            t("FilesTour:TourActionsPdfForm"),
            t("FilesTour:TourActionsDragDrop"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 3. AI chat tile — the least discoverable, most differentiating feature.
    // It is the fifth tile, so it may sit in the clipped second row; expand
    // the banner first so the spotlight lands on something visible.
    canCreate &&
      showFilter &&
      elementStep(
        '[data-testid="quick-ai-chat"]',
        t("FilesTour:TourAiChatTitle"),
        t("FilesTour:TourAiChat"),
        callbacks,
        LOG_LABEL,
        6,
        expandQuickActions,
      ),

    // 4. A real file row: the per-item actions users most often hunt for.
    hasItems &&
      fileItemStep(
        FIRST_ITEM_SELECTOR,
        t("FilesTour:TourFileItemTitle"),
        {
          text: t("FilesTour:TourFileItem"),
          points: [
            t("FilesTour:TourFileItemOpen"),
            t("FilesTour:TourFileItemContextMenu"),
            t("FilesTour:TourFileItemSelect"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 5. Info panel — sharing, versions and activity all live here.
    isDesktop &&
      elementStep(
        "#info-panel-toggle--open",
        t("FilesTour:TourInfoPanelTitle"),
        {
          text: t("FilesTour:TourInfoPanel"),
          points: [
            t("FilesTour:TourInfoPanelShare"),
            t("FilesTour:TourInfoPanelHistory"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 6. Search — scoped, so it is worth saying what it covers.
    showFilter &&
      elementStep(
        "#filter_search-input",
        t("FilesTour:TourSearchTitle"),
        {
          text: t("FilesTour:TourSearch"),
          points: [
            t("FilesTour:TourSearchFilters"),
            t("FilesTour:TourSearchContent"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 7. Advanced filter — narrowing by type/author, not just by name.
    showFilter &&
      elementStep(
        "#filter-button",
        t("FilesTour:TourFilesFilterTitle"),
        {
          text: t("FilesTour:TourFilesFilter"),
          points: [
            t("FilesTour:TourFilesFilterTypes"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 8. Sorting, and the column/tile layout switch next to it.
    showFilter &&
      isDesktop &&
      elementStep(
        "#sort-by-button",
        t("FilesTour:TourSortTitle"),
        {
          text: t("FilesTour:TourSort"),
          points: [
            t("FilesTour:TourSortView"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),

    // 9. Table column picker — rendered by the table header only, so this
    // step is skipped in the row/tile views.
    isTableView &&
      isDesktop &&
      elementStep(
        '[data-testid="settings-block"]',
        t("FilesTour:TourColumnsTitle"),
        t("FilesTour:TourColumns"),
        callbacks,
        LOG_LABEL,
      ),

    // 10. Shared with me — files other people gave you access to.
    showQuickAccess &&
      sharedId &&
      navItemStep(
        sidebarSelector(sharedId),
        t("FilesTour:TourSharedTitle"),
        t("FilesTour:TourShared"),
        callbacks,
        LOG_LABEL,
      ),

    // 11. Recent + Favorites — the two shortcuts that save the most clicks.
    showQuickAccess &&
      recentId &&
      navItemStep(
        sidebarSelector(recentId),
        t("FilesTour:TourRecentTitle"),
        {
          text: t("FilesTour:TourRecent"),
          points: favoritesId
            ? [
                t("FilesTour:TourRecentFavorites"),
              ]
            : undefined,
        },
        callbacks,
        LOG_LABEL,
      ),

    // 12. Trash — restore, and the fact that it empties itself.
    showQuickAccess &&
      trashId &&
      navItemStep(
        sidebarSelector(trashId),
        t("FilesTour:TourTrashTitle"),
        {
          text: t("FilesTour:TourTrash"),
          points: [
            t("FilesTour:TourTrashAutoClean"),
          ],
        },
        callbacks,
        LOG_LABEL,
      ),
  ].filter(Boolean) as Step[];
}
