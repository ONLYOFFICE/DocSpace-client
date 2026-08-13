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
  fileItemStep,
  revealStep,
  sidebarSelector,
  type RevealHooks,
} from "SRC_DIR/components/Tour/stepBuilders";
import { DEMO_SPACE_ITEM_IDS } from "SRC_DIR/api/tourDemo/data";

const LOG_LABEL = "forms tour";

// The first form space of the list, in whichever view is active (only one of
// the three is mounted at a time). Same wrappers as the files list — in the
// table view the row has no geometry of its own (`display: contents`), which
// `fileItemStep` handles by falling back to the row's widest cell.
const FIRST_ITEM_SELECTOR =
  '[data-testid="table-row-0"], [data-testid="files_row_0"], [data-testid="tile_0"]';

// The three things inside a stand-in space, addressed by the element id every
// view puts on a row (`folder_{id}` / `file_{id}`). Their positions in the list
// move with the sort order; their ids do not.
const itemSelector = (id: number, isFolder = true) =>
  `#${isFolder ? "folder" : "file"}_${id}`;

const BLANK_FORM_SELECTOR = itemSelector(DEMO_SPACE_ITEM_IDS.form, false);
const IN_PROGRESS_SELECTOR = itemSelector(DEMO_SPACE_ITEM_IDS.inProgress);
const COMPLETE_SELECTOR = itemSelector(DEMO_SPACE_ITEM_IDS.complete);

// The only action of the Forms empty screen, which is "create a room" — the
// dialog it opens is already scoped to a form space (EmptyViewContainer.helpers
// answers [createRoom] for FolderType.Forms). ui-kit's EmptyView gives its
// options no testid of their own, so the anchor is positional.
const EMPTY_SCREEN_CREATE_SELECTOR =
  '[data-testid="empty-view-body"] > *:first-child';

// The empty screen itself, for the closing step of anyone with no action on it
// to point at. Nothing is offered to somebody who cannot create a space, so the
// body may hold no options at all — the screen around them always exists.
const EMPTY_SCREEN_SELECTOR = '[data-testid="empty-view"]';

export type TourStepFlags = {
  isDesktop: boolean;
  // Creating a form space and saving one as a template are room-admin powers;
  // everyone else only ever fills in the forms inside spaces they were added
  // to, so those steps are dropped for them.
  canCreate: boolean;
  canUseTemplates: boolean;
  showFilter: boolean;
  // Whether the list has at least one form space — the step that points at a
  // row (and at the panel describing it) is skipped on an empty section.
  hasItems: boolean;
  // Whether the sidebar renders the Forms item at all. Its id is the static
  // "forms"; its quick-access sub-items use static ids ("forms-recent" etc.).
  hasForms: boolean;
  // Whether a stand-in space is available to walk into, which is what the
  // block of steps inside a space needs — only a stand-in space is guaranteed
  // to hold a form and the two folders answers travel between.
  isDemo: boolean;
  // Whether the section's own list is the one being stood in for. Only then
  // does the closing step exist: it drops the stand-in and hands the user over
  // to the real "create" button on the empty screen they are left looking at.
  isStandIn: boolean;
  // Walks into the stand-in space. `reveal` is idempotent — every in-room step
  // calls it, so stepping between them does not navigate again — and `restore`
  // is a no-op, because the way back out belongs to the steps that need the
  // section root (they all `prepare` with `leaveSpace`).
  spaceHooks?: RevealHooks;
  demoHooks?: RevealHooks;
  // Returns the tour to the section root. Every step anchored outside a space
  // runs this first, so walking backwards out of the in-room block lands on a
  // page that has the anchor it is about to point at.
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
    demoHooks,
    leaveSpace,
  } = flags;

  // The quick-access sub-items are nested under Forms and rendered expanded
  // while the section is active. Skipped on tablet: the collapsed icon-only
  // sidebar flattens sub-items into the main list.
  const showQuickAccess = isDesktop && hasForms;

  // The section's sub-items, each named by the sidebar's own label so the
  // wording in the tooltip is the wording on screen. One bullet each; Templates
  // is behind the same admin gate in the sidebar (ClientArticleSidebar) as
  // here, so for everyone else its bullet drops rather than pointing at an item
  // they do not have.
  const places = [
    t("FormsTour:FormsPlacesRecent", {
      recent: t("Common:Recent"),
      favorites: t("Common:Favorites"),
    }),
    canUseTemplates &&
      t("FormsTour:FormsPlacesTemplates", {
        templates: t("Common:Templates"),
      }),
    t("FormsTour:FormsPlacesTrash", { trash: t("Common:TrashSection") }),
  ].filter(Boolean) as string[];

  // The block of steps that runs inside a space. It walks into a stand-in one
  // rather than into the user's: a real space grows its `In progress` and
  // `Complete` folders only once a form has been uploaded and started, so on a
  // portal that already collects forms the tour would be walking into a room
  // whose shape it cannot predict — and on a brand-new one, into an empty
  // room. The stand-in space always holds exactly what these steps are about.
  const showInsideSpace = isDemo && !!spaceHooks;

  return [
    // 1. What this section holds. The mental model that trips people up is
    // that a row here is a whole collection, not a single PDF — so the step
    // that says so is the one pointing at the tile that creates one.
    canCreate &&
      showFilter &&
      elementStep(
        '[data-testid="quick-form-room"]',
        t("FormsTour:FormsSpaceTitle"),
        t("FormsTour:FormsSpace"),
        callbacks,
        LOG_LABEL,
        6,
        leaveSpace,
      ),

    // 2. Space templates — for the collection you run again every quarter.
    canCreate &&
      canUseTemplates &&
      showFilter &&
      elementStep(
        '[data-testid="quick-form-space-template"]',
        t("FormsTour:FormsTemplatesTitle"),
        t("FormsTour:FormsTemplates"),
        callbacks,
        LOG_LABEL,
        6,
        leaveSpace,
      ),

    // 3. A space row — the door into a collection, and the handful of things
    // worth doing to one without opening it.
    hasItems &&
      fileItemStep(
        FIRST_ITEM_SELECTOR,
        t("FormsTour:FormsItemTitle"),
        t("FormsTour:FormsItem"),
        callbacks,
        LOG_LABEL,
        leaveSpace,
      ),

    // 4. Inside the space, on the blank form itself: what everyone who follows
    // the link actually opens, and where the form comes from in the first
    // place. This is the step that walks the tour in — step 3 has just named
    // the row as the door, so a step of its own pointing at the same row again
    // only says the same thing twice.
    showInsideSpace &&
      revealStep(
        BLANK_FORM_SELECTOR,
        t("FormsTour:FormsBlankTitle"),
        t("FormsTour:FormsBlank"),
        callbacks,
        LOG_LABEL,
        spaceHooks,
      ),

    // 5. In progress — the half of the answer nobody sees but its author. A
    // copy per person, saved as they go, so a form left half-filled is not
    // lost and not yet counted. This is also where the privacy of the whole
    // thing is worth saying: a Form filler only ever sees their own copy
    // (Common:RoleFormFillerFormRoomDescription).
    showInsideSpace &&
      revealStep(
        IN_PROGRESS_SELECTOR,
        t("FormsTour:FormsInProgressTitle"),
        t("FormsTour:FormsInProgress", {
          inProgress: t("Common:InProgress"),
          formFiller: t("Common:RoleFormFiller"),
        }),
        callbacks,
        LOG_LABEL,
        spaceHooks,
      ),

    // 6. Complete — where a submission lands, and the spreadsheet that adds up
    // all of them. The two result options are set when the space is created
    // (Common:CollectResultsInXlsx / Common:ExportResultsToDatabase), which is
    // why this is the last thing said about the inside.
    showInsideSpace &&
      revealStep(
        COMPLETE_SELECTOR,
        t("FormsTour:FormsCompleteTitle"),
        t("FormsTour:FormsComplete", { complete: t("Common:Complete") }),
        callbacks,
        LOG_LABEL,
        spaceHooks,
      ),

    // 7. Back out at the section root: the sidebar sub-items, each named by
    // the sidebar's own label so the wording in the tooltip is the wording on
    // screen and the names are not translated twice.
    showQuickAccess &&
      navItemStep(
        sidebarSelector("forms-recent"),
        t("FormsTour:FormsPlacesTitle"),
        createElement(TourList, { items: places }),
        callbacks,
        LOG_LABEL,
        true,
        leaveSpace,
      ),

    // 8. Only when the list was stood in for. The stand-in spaces are the last
    // thing the user saw, and dropping them lands them on the empty screen —
    // so rather than let that happen behind their back, the closing step does
    // it deliberately. `restore` is a no-op either way: the section is the
    // user's own from here on.
    //
    // What it points at, and what it says, is whatever that screen actually
    // offers. Somebody who can create a space is a click away from everything
    // they were just shown, so the step lands on that button. A form filler has
    // no button there at all — the honest ending for them is to name what the
    // empty list means and who fills it, rather than to send them at an action
    // that is not theirs.
    isStandIn &&
      demoHooks &&
      (canCreate
        ? revealStep(
            EMPTY_SCREEN_CREATE_SELECTOR,
            t("FormsTour:FormsCreateFirstTitle"),
            t("FormsTour:FormsCreateFirst"),
            callbacks,
            LOG_LABEL,
            demoHooks,
          )
        : revealStep(
            EMPTY_SCREEN_SELECTOR,
            t("FormsTour:FormsEmptyTitle"),
            t("FormsTour:FormsEmpty"),
            callbacks,
            LOG_LABEL,
            demoHooks,
          )),
  ].filter(Boolean) as Step[];
}
