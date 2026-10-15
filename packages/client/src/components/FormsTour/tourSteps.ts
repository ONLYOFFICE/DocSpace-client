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
  sidebarListStep,
  sidebarSelector,
  elementStep,
  fileItemStep,
  menuStep,
  revealStep,
  NAVIGATION_TARGET_TIMEOUT,
  type RevealHooks,
} from "SRC_DIR/components/Tour/stepBuilders";
import { FORMS_TOUR_LABEL } from "SRC_DIR/components/Tour/logLabels";
import { DEMO_SPACE_ITEM_IDS } from "SRC_DIR/api/tourDemo/data";

const FIRST_ITEM_SELECTOR =
  '[data-testid="table-row-0"], [data-testid="files_row_0"], [data-testid="tile_0"]';

const SECOND_ITEM_SELECTOR =
  '[data-testid="table-row-1"], [data-testid="files_row_1"], [data-testid="tile_1"]';

// Rows inside the stand-in space, by the element id every view puts on them.
const itemSelector = (id: number, isFolder = true) =>
  `#${isFolder ? "folder" : "file"}_${id}`;

const BLANK_FORM_SELECTOR = itemSelector(DEMO_SPACE_ITEM_IDS.form, false);
const BLANK_FORM_MENU_TRIGGER_SELECTOR = `${BLANK_FORM_SELECTOR} [data-testid="context-menu-button"]`;
const CONTEXT_MENU_SELECTOR = ".p-contextmenu";
// ContextMenu renders each entry with the option's own id.
const START_FILLING_OPTION_SELECTOR = "#option_start-filling";
const LAUNCHED_BADGE_SELECTOR = `${BLANK_FORM_SELECTOR} .badge.is-editing`;
const IN_PROGRESS_SELECTOR = itemSelector(DEMO_SPACE_ITEM_IDS.inProgress);
const COMPLETE_SELECTOR = itemSelector(DEMO_SPACE_ITEM_IDS.complete);
const NEW_BUTTON_SELECTOR =
  '#filter_search-input > div:has(> [data-testid="main-button"])';

// The empty screen's only option, "create a room"; it carries no test id.
const EMPTY_SCREEN_CREATE_SELECTOR =
  '[data-testid="empty-view-body"] > *:first-child';

const EMPTY_SCREEN_SELECTOR = '[data-testid="empty-view"]';

export type TourStepFlags = {
  isDesktop: boolean;
  // Room-admin powers; everyone else only fills forms in.
  canCreate: boolean;
  canUseTemplates: boolean;
  showFilter: boolean;
  hasItems: boolean;
  hasForms: boolean;
  isDemo: boolean;
  // Whether the list itself is stood in for; only then is there a closing step.
  isStandIn: boolean;
  // Walks into the stand-in space; idempotent, `restore` is a no-op.
  spaceHooks?: RevealHooks;
  // Fakes the launch of the stand-in form on its row, and undoes it.
  launchHooks?: { reveal: () => void; restore: () => void };
  demoHooks?: RevealHooks;
  // Returns the tour to the section root; every step outside a space runs it.
  leaveSpace?: () => void;
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
    hasForms,
    isDemo,
    isStandIn,
    spaceHooks,
    launchHooks,
    demoHooks,
    leaveSpace,
  } = flags;

  // The collapsed tablet sidebar has no sub-items to point at.
  const showQuickAccess = isDesktop && hasForms;

  // One bullet per sub-item, named by the sidebar's own labels; Templates is
  // admin-only there too.
  const places = [
    t("FilesTour:TourPlacesRecent", { sectionName: t("Common:Recent") }),
    t("FilesTour:TourPlacesFavorites", { sectionName: t("Common:Favorites") }),
    canUseTemplates &&
      t("FormsTour:FormsPlacesTemplates", {
        templates: t("Common:Templates"),
      }),
    t("FilesTour:TourPlacesTrash", { sectionName: t("Common:TrashSection") }),
  ].filter(Boolean) as string[];

  // Always a stand-in space: only it is sure to hold a form and both folders.
  const showInsideSpace = isDemo && !!spaceHooks;

  return [
    // 0. The section, on its sidebar item.
    hasForms &&
      navItemStep(
        sidebarSelector("forms"),
        t("FormsTour:FormsOverviewTitle"),
        t("FormsTour:FormsOverview"),
        callbacks,
        FORMS_TOUR_LABEL,
        false,
        leaveSpace,
      ),

    // 1. What a form space is, on the tile that creates one.
    canCreate &&
      showFilter &&
      elementStep(
        '[data-testid="quick-form-room"]',
        t("FormsTour:FormsSpaceTitle"),
        t("FormsTour:FormsSpace"),
        callbacks,
        FORMS_TOUR_LABEL,
        6,
        leaveSpace,
      ),

    // 2. Space templates.
    canCreate &&
      canUseTemplates &&
      showFilter &&
      elementStep(
        '[data-testid="quick-form-space-template"]',
        t("FormsTour:FormsTemplatesTitle"),
        t("FormsTour:FormsTemplates"),
        callbacks,
        FORMS_TOUR_LABEL,
        6,
        leaveSpace,
      ),

    // 3. The sample notice, only when the whole list is one, as in Rooms.
    showInsideSpace &&
      isStandIn &&
      hasItems &&
      fileItemStep(
        SECOND_ITEM_SELECTOR,
        t("FormsTour:FormsDemoPreviewTitle"),
        t("FormsTour:FormsDemoPreview"),
        callbacks,
        FORMS_TOUR_LABEL,
        leaveSpace,
      ),

    // 4. A space row; a filler gets other wording.
    hasItems &&
      fileItemStep(
        FIRST_ITEM_SELECTOR,
        canCreate
          ? t("FormsTour:FormsItemTitle")
          : t("FormsTour:FormsItemMemberTitle"),
        canCreate ? t("FormsTour:FormsItem") : t("FormsTour:FormsItemMember"),
        callbacks,
        FORMS_TOUR_LABEL,
        leaveSpace,
      ),

    // 5. The blank form inside the space; this step walks the tour in.
    showInsideSpace &&
      revealStep(
        BLANK_FORM_SELECTOR,
        t("FormsTour:FormsBlankTitle"),
        t("FormsTour:FormsBlank"),
        callbacks,
        FORMS_TOUR_LABEL,
        spaceHooks,
      ),

    // 6. The blank form's menu, with Start filling in it; never chosen.
    showInsideSpace &&
      menuStep(
        BLANK_FORM_MENU_TRIGGER_SELECTOR,
        CONTEXT_MENU_SELECTOR,
        t("FormsTour:FormsShareTitle"),
        t("FormsTour:FormsShare", { formFiller: t("Common:RoleFormFiller") }),
        callbacks,
        FORMS_TOUR_LABEL,
        [],
        4,
        spaceHooks.reveal,
        NAVIGATION_TARGET_TIMEOUT,
        START_FILLING_OPTION_SELECTOR,
      ),

    // 7. The form as Start filling leaves it: faked for the step, undone after.
    showInsideSpace &&
      launchHooks &&
      revealStep(
        LAUNCHED_BADGE_SELECTOR,
        t("FormsTour:FormsFillYourselfTitle"),
        t("FormsTour:FormsFillYourself", {
          inProgress: t("Common:InProgress"),
        }),
        callbacks,
        FORMS_TOUR_LABEL,
        {
          reveal: () => {
            spaceHooks.reveal();
            launchHooks.reveal();
          },
          restore: launchHooks.restore,
          navigates: true,
        },
      ),

    // 8. In progress.
    showInsideSpace &&
      revealStep(
        IN_PROGRESS_SELECTOR,
        t("FormsTour:FormsInProgressTitle"),
        t("FormsTour:FormsInProgress", {
          inProgress: t("Common:InProgress"),
          formFiller: t("Common:RoleFormFiller"),
        }),
        callbacks,
        FORMS_TOUR_LABEL,
        spaceHooks,
      ),

    // 9. Complete.
    showInsideSpace &&
      revealStep(
        COMPLETE_SELECTOR,
        t("FormsTour:FormsCompleteTitle"),
        t("FormsTour:FormsComplete", { complete: t("Common:Complete") }),
        callbacks,
        FORMS_TOUR_LABEL,
        spaceHooks,
      ),

    // 10. Back at the section root: the sidebar sub-items.
    showQuickAccess &&
      sidebarListStep(
        "forms-recent",
        t("FormsTour:FormsPlacesTitle"),
        places,
        callbacks,
        FORMS_TOUR_LABEL,
        leaveSpace,
      ),

    // 11. Closing: drop the stand-in list and point at the empty screen's
    // create button, or name the empty list for a filler; else the New button.
    isStandIn && demoHooks
      ? canCreate
        ? revealStep(
            EMPTY_SCREEN_CREATE_SELECTOR,
            t("FormsTour:FormsCreateFirstTitle"),
            t("FormsTour:FormsCreateFirst"),
            callbacks,
            FORMS_TOUR_LABEL,
            demoHooks,
          )
        : revealStep(
            EMPTY_SCREEN_SELECTOR,
            t("FormsTour:FormsEmptyTitle"),
            t("FormsTour:FormsEmpty"),
            callbacks,
            FORMS_TOUR_LABEL,
            demoHooks,
          )
      : canCreate &&
        showFilter &&
        isDesktop &&
        elementStep(
          NEW_BUTTON_SELECTOR,
          t("FormsTour:FormsCreateFirstTitle"),
          t("FormsTour:FormsCreateFirst"),
          callbacks,
          FORMS_TOUR_LABEL,
          6,
          leaveSpace,
        ),
  ].filter(Boolean) as Step[];
}
