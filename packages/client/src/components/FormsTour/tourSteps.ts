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

const LOG_LABEL = "forms tour";

export type TourStepFlags = {
  isDesktop: boolean;
  canCreate: boolean;
  canUseTemplates: boolean;
  showFilter: boolean;
  // Forms sidebar parent item id is the static "forms" id; the quick-access
  // sub-items use static string ids ("forms-recent" etc.).
  hasForms: boolean;
};

export function getTourSteps(
  t: TFunction,
  callbacks: TourStepCallbacks | undefined,
  flags: TourStepFlags,
): Step[] {
  const { isDesktop, canCreate, canUseTemplates, showFilter, hasForms } = flags;

  return [
    hasForms &&
      navItemStep(
        sidebarSelector("forms"),
        t("Common:Forms"),
        t("FormsTour:FormsIntro"),
        callbacks,
        LOG_LABEL,
      ),
    // Forms creation banner: collect forms (Form Filling Room) + from template.
    canCreate &&
      showFilter &&
      elementStep(
        '[data-testid="quick-actions"]',
        t("FormsTour:FormsCreateTitle"),
        t("FormsTour:FormsCreate"),
        callbacks,
        LOG_LABEL,
      ),
    // The Recent / Favorites / Templates / Trash block nested under Forms,
    // rendered expanded while the section is active. Skipped on tablet (the
    // collapsed icon-only sidebar flattens sub-items into the main list).
    isDesktop &&
      hasForms &&
      navItemStep(
        sidebarSelector("forms-recent"),
        t("FormsTour:FormsQuickAccessTitle"),
        t("FormsTour:FormsQuickAccess"),
        callbacks,
        LOG_LABEL,
        true,
      ),
    isDesktop &&
      canUseTemplates &&
      navItemStep(
        sidebarSelector("forms-templates"),
        t("FormsTour:FormsTemplatesTitle"),
        t("FormsTour:FormsTemplates"),
        callbacks,
        LOG_LABEL,
      ),
    showFilter &&
      elementStep(
        "#filter_search-input",
        t("FormsTour:FormsSearchTitle"),
        t("FormsTour:FormsSearch"),
        callbacks,
        LOG_LABEL,
      ),
    showFilter &&
      elementStep(
        "#filter-button",
        t("FormsTour:FormsFilterTitle"),
        t("FormsTour:FormsFilter"),
        callbacks,
        LOG_LABEL,
      ),
    showFilter &&
      isDesktop &&
      elementStep(
        "#view-switch--row, #view-switch--tile",
        t("FormsTour:FormsViewTitle"),
        t("FormsTour:FormsView"),
        callbacks,
        LOG_LABEL,
      ),
    isDesktop &&
      elementStep(
        "#info-panel-toggle--open",
        t("FormsTour:FormsInfoPanelTitle"),
        t("FormsTour:FormsInfoPanel"),
        callbacks,
        LOG_LABEL,
      ),
  ].filter(Boolean) as Step[];
}
