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
  menuStep,
  hoverRevealStep,
  sidebarSelector,
  expandQuickActions,
} from "SRC_DIR/components/Tour/stepBuilders";

const LOG_LABEL = "files tour";

// The quick-action tiles for the four file formats, in banner order. The AI
// chat tile shares their container and gets a step of its own, so the spotlight
// covers this run of tiles rather than the whole banner.
const CREATE_TILE_SELECTORS = [
  '[data-testid="quick-docx"]',
  '[data-testid="quick-xlsx"]',
  '[data-testid="quick-pptx"]',
  '[data-testid="quick-pdf"]',
];

// The "New" button in the filter bar, and the menu it opens.
//
// MainButton keeps its click handler on the box inside the test-id wrapper, so
// the trigger points one level in while the spotlight takes the whole button.
// The menu is portalled to the body and only mounted while open (ContextMenu
// unmounts on exit) — with the tour blocking every other interaction it is the
// only one that can be up.
const NEW_BUTTON_SELECTOR = '[data-testid="main-button"]';
const NEW_BUTTON_TRIGGER_SELECTOR = '[data-testid="main-button"] > *';
const NEW_MENU_SELECTOR = ".p-contextmenu";

// The search field itself. Not `#filter_search-input`: SearchInput puts that id
// on the block around the field, and the "New" button lives in there too — a
// spotlight on the block would light up the button along with the search line.
const SEARCH_SELECTOR = "#filter_search-input .search-input-block";

// The share button of the first file that has one, in whichever view is active
// (only one of the three is mounted at a time). `querySelector` takes the first
// match in document order, so a leading row without the button — a folder, an
// item this user cannot share — is stepped over instead of dropping the step.
//
// In the table view an unshared file keeps this button hidden until the row is
// hovered, which is why the step that points at it is a `hoverRevealStep`.
const SHARE_ICON_SELECTOR = [
  '[data-testid^="table-row-"] .badge.copy-link',
  '[data-testid^="files_row_"] .badge.copy-link',
  '[data-testid^="tile_"] .badge.copy-link',
].join(", ");

export type TourStepFlags = {
  // Which tour to build. Files is the one section where an admin and a paid
  // user get exactly the same page — a personal space is a personal space — so
  // the wording never forks here. Guests are the odd ones out: they have no
  // personal space and no Trash at all, which is why the section is normally
  // out of their reach entirely. The audience is threaded through anyway so a
  // guest who does land here is not offered things they cannot do.
  audience: TourAudience;
  isDesktop: boolean;
  canCreate: boolean;
  showFilter: boolean;
  // Whether the file list has at least one item — steps that point at a row
  // are skipped on an empty folder.
  hasItems: boolean;
  // Sidebar anchors: NavMenu renders `data-item-id` per item, the ids of the
  // tree-folder items are their folder ids (null — item is absent).
  //
  // `sectionId` is the top-level Files item. For everyone with a personal
  // space that is `myDocumentsId`; a guest has none, so the sidebar falls back
  // to the literal id "files" and points the item at Shared with me
  // (ClientArticleSidebar). Anchoring on `sectionId` is what keeps the guest's
  // quick-access steps reachable — `myDocumentsId` is null for them.
  sectionId: string | null;
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
    audience,
    isDesktop,
    canCreate,
    showFilter,
    hasItems,
    sectionId,
    sharedId,
    recentId,
    favoritesId,
    trashId,
  } = flags;

  // Guests own no files, so nothing that creates applies to them.
  const canOwnFiles = audience !== "guest";

  // The quick-access sub-items are nested under the Files section item and
  // rendered expanded while the section is active. Skipped on tablet: the
  // collapsed icon-only sidebar flattens sub-items into the main list.
  //
  // Anchored on the section item, not on My documents: a guest's section has
  // no personal folder, but it does have the Shared/Recent/Favorites children
  // the closing step is about.
  const showQuickAccess = isDesktop && !!sectionId;

  // The section's sub-items, each named by the sidebar's own label so the
  // wording in the tooltip is the wording on screen. One sentence each, read as
  // a single paragraph; an item the sidebar doesn't render (a guest has no
  // Trash) drops its sentence.
  const places = [
    sharedId &&
      t("FilesTour:TourPlacesShared", {
        sectionName: t("Common:SharedWithMe"),
      }),
    recentId &&
      t("FilesTour:TourPlacesRecent", { sectionName: t("Common:Recent") }),
    favoritesId &&
      t("FilesTour:TourPlacesFavorites", {
        sectionName: t("Common:Favorites"),
      }),
    trashId &&
      t("FilesTour:TourPlacesTrash", {
        sectionName: t("Common:TrashSection"),
      }),
  ].filter(Boolean) as string[];

  // Any one of the sub-items will do as the tooltip's anchor: the spotlight
  // covers the whole sub-list they share (`spotlightList`).
  const placesAnchorId = sharedId ?? recentId ?? favoritesId ?? trashId;

  return [
    // 1. Create — the four format tiles, named by what they produce.
    canOwnFiles &&
      canCreate &&
      showFilter &&
      elementGroupStep(
        '[data-testid="quick-actions"]',
        CREATE_TILE_SELECTORS,
        t("FilesTour:TourCreateAnythingTitle"),
        t("FilesTour:TourCreateAnything"),
        callbacks,
        LOG_LABEL,
      ),

    // 2. AI chat tile — the least discoverable, most differentiating feature.
    // It is the fifth tile, so it may sit in the clipped second row; expand the
    // banner first so the spotlight lands on something visible.
    canOwnFiles &&
      canCreate &&
      showFilter &&
      elementStep(
        '[data-testid="quick-ai-chat"]',
        t("FilesTour:TourAiAssistantTitle"),
        t("FilesTour:TourAiAssistant", { sectionName: t("Common:Files") }),
        callbacks,
        LOG_LABEL,
        6,
        expandQuickActions,
      ),

    // 3. Uploading, which lives in the "New" menu — so the step opens it and
    // spotlights the menu rather than the button that hides it.
    canOwnFiles &&
      canCreate &&
      showFilter &&
      isDesktop &&
      menuStep(
        NEW_BUTTON_TRIGGER_SELECTOR,
        NEW_MENU_SELECTOR,
        t("FilesTour:TourBringFilesTitle"),
        t("FilesTour:TourBringFiles"),
        callbacks,
        LOG_LABEL,
        // The button and its menu read as one thing, so they share a spotlight.
        [NEW_BUTTON_SELECTOR],
      ),

    // 4. Search, with the filter, sort and view controls that sit beside it.
    showFilter &&
      elementStep(
        SEARCH_SELECTOR,
        t("FilesTour:TourFindFastTitle"),
        t("FilesTour:TourFindFast"),
        callbacks,
        LOG_LABEL,
      ),

    // 5. The share button on a row — the per-item action users hunt for most.
    hasItems &&
      hoverRevealStep(
        SHARE_ICON_SELECTOR,
        t("FilesTour:TourShareTitle"),
        t("FilesTour:TourShare"),
        callbacks,
        LOG_LABEL,
        4,
      ),

    // 6. The sidebar sub-items: what each of the section's shortcuts holds.
    showQuickAccess &&
      placesAnchorId &&
      places.length > 0 &&
      navItemStep(
        sidebarSelector(placesAnchorId),
        t("FilesTour:TourPlacesTitle"),
        places.join(" "),
        callbacks,
        LOG_LABEL,
        true,
      ),
  ].filter(Boolean) as Step[];
}
