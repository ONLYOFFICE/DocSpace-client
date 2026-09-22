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
  elementStep,
  elementGroupStep,
  fileItemStep,
  menuStep,
  hoverRevealStep,
  revealStep,
  sidebarListStep,
  revealQuickActionTile,
  rewindQuickActions,
  type RevealHooks,
} from "SRC_DIR/components/Tour/stepBuilders";
import { FILES_TOUR_LABEL } from "SRC_DIR/components/Tour/logLabels";

// The AI chat tile shares the banner and gets a step of its own.
const CREATE_TILE_SELECTORS = [
  '[data-testid="quick-docx"]',
  '[data-testid="quick-xlsx"]',
  '[data-testid="quick-pptx"]',
  '[data-testid="quick-pdf"]',
];

// The test id covers the label alone; the plus belongs to the wrapper around it.
const NEW_BUTTON_SELECTOR =
  '#filter_search-input > div:has(> [data-testid="main-button"])';
// MainButton keeps its click handler one level inside the test id.
const NEW_BUTTON_TRIGGER_SELECTOR = '[data-testid="main-button"] > *';
const NEW_MENU_SELECTOR = ".p-contextmenu";

// The field, not the block around it: the "New" button lives in there too.
const SEARCH_SELECTOR = "#filter_search-input .search-input-block";

// One selector per view; the first match wins, so a row without the button is
// stepped over. The table view hides it until the row is hovered.
const SHARE_ICON_SELECTOR = [
  '[data-testid^="table-row-"] .badge.copy-link',
  '[data-testid^="files_row_"] .badge.copy-link',
  '[data-testid^="tile_"] .badge.copy-link',
].join(", ");

// One selector per view; the table row is `display: contents`, which
// `fileItemStep` resolves around.
const FIRST_ITEM_SELECTOR =
  '[data-testid="table-row-0"], [data-testid="files_row_0"], [data-testid="tile_0"]';

// Each column twice, heading and first cell, so the spotlight reaches the
// values. Table view only; the other two carry no columns.
const TABLE_HEADER_SELECTOR = '[data-testid="table-header"]';
const SHARED_COLUMN_SELECTORS = [
  '[data-testid="column-SharedByShareWithMe"]',
  '[data-testid="column-AccessLevelShareWithMe"]',
  '[data-testid="shared-with-me-cell-shared-by-0"]',
  '[data-testid="shared-with-me-cell-access-level-0"]',
];

const EMPTY_SCREEN_SELECTOR = '[data-testid="empty-view"]';

const EMPTY_SCREEN_CREATE_SELECTOR = '[data-testid="empty-view-body"]';

export type TourStepFlags = {
  audience: TourAudience;
  // A guest has no personal space, so Shared with me is their Files root and
  // gets a step list of its own.
  isSharedWithMe: boolean;
  isDesktop: boolean;
  canCreate: boolean;
  showFilter: boolean;
  hasItems: boolean;
  // Sidebar `data-item-id`s: folder ids, or "files" for a guest's section item.
  sectionId: string | null;
  sharedId: string | null;
  recentId: string | null;
  favoritesId: string | null;
  trashId: string | null;
  // The list the tour walks is stood in for, so a step can hand it back.
  isDemo?: boolean;
  demoHooks?: RevealHooks;
};

/** Search, with the filter, sort and view controls beside it. */
function searchStep(
  t: TFunction,
  callbacks: TourStepCallbacks | undefined,
): Step {
  return elementStep(
    SEARCH_SELECTOR,
    t("FilesTour:TourFindFastTitle"),
    t("FilesTour:TourFindFast"),
    callbacks,
    FILES_TOUR_LABEL,
  );
}

/** The sidebar shortcuts, named by the sidebar's own labels. */
function placesStep(
  t: TFunction,
  callbacks: TourStepCallbacks | undefined,
  flags: TourStepFlags,
): Step | null {
  const { isDesktop, sectionId, sharedId, recentId, favoritesId, trashId } =
    flags;

  // The collapsed tablet sidebar flattens the sub-items away.
  if (!isDesktop || !sectionId) return null;

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

  // Any sub-item works: the spotlight covers the list they share.
  const anchorId = sharedId ?? recentId ?? favoritesId ?? trashId;

  if (!anchorId || places.length === 0) return null;

  return sidebarListStep(
    anchorId,
    t("FilesTour:TourPlacesTitle"),
    places,
    callbacks,
    FILES_TOUR_LABEL,
  );
}

/** Personal space (My documents). */
function getPersonalSteps(
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
    isDemo,
    demoHooks,
  } = flags;

  // `showFilter` is `!isEmptyPage`: an empty page renders neither the banner
  // nor the filter bar.
  const canCreateFiles = audience !== "guest" && canCreate && showFilter;
  const canOpenNewMenu = canCreateFiles && isDesktop;

  return [
    // 1. Create tiles. Rewind the carousel: stepping back from the AI chat tile
    // leaves it scrolled.
    canCreateFiles &&
      elementGroupStep(
        '[data-testid="quick-actions"]',
        CREATE_TILE_SELECTORS,
        t("FilesTour:TourCreateAnythingTitle"),
        t("FilesTour:TourCreateAnything"),
        callbacks,
        FILES_TOUR_LABEL,
        6,
        rewindQuickActions,
      ),

    // 2. AI chat tile is the last one and may sit past the carousel fold.
    canCreateFiles &&
      elementStep(
        '[data-testid="quick-ai-chat"]',
        t("FilesTour:TourAiAssistantTitle"),
        t("FilesTour:TourAiAssistant", { sectionName: t("Common:Files") }),
        callbacks,
        FILES_TOUR_LABEL,
        6,
        revealQuickActionTile('[data-testid="quick-ai-chat"]'),
      ),

    // 3. Upload lives in the "New" menu.
    canOpenNewMenu &&
      menuStep(
        NEW_BUTTON_TRIGGER_SELECTOR,
        NEW_MENU_SELECTOR,
        t("FilesTour:TourBringFilesTitle"),
        t("FilesTour:TourBringFiles"),
        callbacks,
        FILES_TOUR_LABEL,
        [NEW_BUTTON_SELECTOR], // spotlight the button together with the menu
      ),

    // 4. Search and filter bar.
    showFilter && searchStep(t, callbacks),

    // 5. Share badge on a row; the table view shows it only on hover.
    hasItems &&
      hoverRevealStep(
        SHARE_ICON_SELECTOR,
        t("FilesTour:TourShareTitle"),
        t("FilesTour:TourShare"),
        callbacks,
        FILES_TOUR_LABEL,
        4,
      ),

    // 6. Sidebar shortcuts.
    placesStep(t, callbacks, flags),

    // 7. Closing action: the empty screen's options, or the "New" button.
    isDemo && demoHooks
      ? revealStep(
          EMPTY_SCREEN_CREATE_SELECTOR,
          t("RoomsTour:RoomsCreateFirstTitle"),
          t("FilesTour:TourCreateFirstEmpty"),
          callbacks,
          FILES_TOUR_LABEL,
          demoHooks,
        )
      : canOpenNewMenu &&
        elementStep(
          NEW_BUTTON_SELECTOR,
          t("RoomsTour:RoomsCreateFirstTitle"),
          t("FilesTour:TourCreateFirst"),
          callbacks,
          FILES_TOUR_LABEL,
        ),
  ].filter(Boolean) as Step[];
}

/** Shared with me: no banner, no "New" button, nothing of the user's own. */
function getSharedWithMeSteps(
  t: TFunction,
  callbacks: TourStepCallbacks | undefined,
  flags: TourStepFlags,
): Step[] {
  const { showFilter, hasItems, isDemo, demoHooks } = flags;

  return [
    // 1. What the section is, anchored on the first row.
    hasItems &&
      fileItemStep(
        FIRST_ITEM_SELECTOR,
        t("FilesTour:TourSharedListTitle"),
        t("FilesTour:TourSharedList", {
          sectionName: t("Common:SharedWithMe"),
        }),
        callbacks,
        FILES_TOUR_LABEL,
      ),

    // 2. The two columns no other file list has.
    hasItems &&
      elementGroupStep(
        TABLE_HEADER_SELECTOR,
        SHARED_COLUMN_SELECTORS,
        t("FilesTour:TourSharedAccessTitle"),
        t("FilesTour:TourSharedAccess", {
          sharedBy: t("Common:SharedBy"),
          accessLevel: t("Common:AccessLevel"),
        }),
        callbacks,
        FILES_TOUR_LABEL,
      ),

    // 3. Search and filter bar.
    showFilter && searchStep(t, callbacks),

    // 4. Sidebar shortcuts.
    placesStep(t, callbacks, flags),

    // 5. Demo only: drop the stand-in files and name the empty screen.
    isDemo &&
      demoHooks &&
      revealStep(
        EMPTY_SCREEN_SELECTOR,
        t("FilesTour:TourSharedEmptyTitle"),
        t("FilesTour:TourSharedEmpty"),
        callbacks,
        FILES_TOUR_LABEL,
        demoHooks,
      ),
  ].filter(Boolean) as Step[];
}

export function getTourSteps(
  t: TFunction,
  callbacks: TourStepCallbacks | undefined,
  flags: TourStepFlags,
): Step[] {
  return flags.isSharedWithMe
    ? getSharedWithMeSteps(t, callbacks, flags)
    : getPersonalSteps(t, callbacks, flags);
}

