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

import { waitForElement } from "./waitForElement";

export type TourStepCallbacks = {
  getSignal: () => AbortSignal | undefined;
};

export type TourStepFlags = {
  isDesktop: boolean;
  canCreate: boolean;
  showFilter: boolean;
  // Sidebar anchors: NavMenu renders `data-item-id` per item, the ids of the
  // tree-folder items are their folder ids (null — item is absent).
  myDocumentsId: string | null;
  quickAccessId: string | null;
};

function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === "AbortError";
}

function silenceNonAbort(err: unknown) {
  if (!isAbortError(err) && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn("[files tour] waitForElement failed:", err);
  }
}

function navItemStep(
  selector: string,
  title: string,
  content: string,
  callbacks?: TourStepCallbacks,
  spotlightList = false,
): Step {
  return {
    target: selector,
    spotlightTarget: spotlightList
      ? () => {
          const el = document.querySelector(selector);
          return (el?.closest("ul") as HTMLElement) ?? (el as HTMLElement);
        }
      : undefined,
    spotlightPadding: 4,
    placement: "auto" as const,
    content,
    title,
    skipBeacon: true,
    before: async () => {
      const signal = callbacks?.getSignal();
      await waitForElement(selector, 10000, signal).catch(silenceNonAbort);
      if (!spotlightList) {
        document.querySelector(selector)?.classList.add("tour-outline-item");
      }
    },
    after: () => {
      document
        .querySelector(".tour-outline-item")
        ?.classList.remove("tour-outline-item");
    },
  };
}

function elementStep(
  target: string,
  title: string,
  content: string,
  callbacks?: TourStepCallbacks,
  spotlightPadding = 6,
): Step {
  return {
    target,
    spotlightPadding,
    placement: "auto" as const,
    content,
    title,
    skipBeacon: true,
    before: async () => {
      const signal = callbacks?.getSignal();
      await waitForElement(target, 10000, signal).catch(silenceNonAbort);
    },
  };
}

export function getTourSteps(
  t: TFunction,
  callbacks: TourStepCallbacks | undefined,
  flags: TourStepFlags,
): Step[] {
  const { isDesktop, canCreate, showFilter, myDocumentsId, quickAccessId } =
    flags;

  const navSelector = (id: string) => `[data-item-id="${id}"]`;

  return [
    myDocumentsId &&
      navItemStep(
        navSelector(myDocumentsId),
        t("Common:Files"),
        t("FilesTour:TourMyDocuments"),
        callbacks,
      ),
    // The quick-access block (Shared with me / Recent / Favorites / Trash)
    // is nested under My documents and rendered expanded while the section
    // is active. Skipped on tablet: the collapsed icon-only sidebar flattens
    // sub-items into the main list, so there is no block to spotlight.
    isDesktop &&
      myDocumentsId &&
      quickAccessId &&
      navItemStep(
        navSelector(quickAccessId),
        t("FilesTour:TourQuickAccessTitle"),
        t("FilesTour:TourQuickAccess"),
        callbacks,
        true,
      ),
    canCreate &&
      showFilter &&
      elementStep(
        '[data-testid="quick-actions"]',
        t("FilesTour:TourActionsTitle"),
        t("FilesTour:TourActions"),
        callbacks,
      ),
    showFilter &&
      elementStep(
        "#filter_search-input",
        t("FilesTour:TourSearchTitle"),
        t("FilesTour:TourSearch"),
        callbacks,
      ),
    showFilter &&
      isDesktop &&
      elementStep(
        "#view-switch--row, #view-switch--tile",
        t("FilesTour:TourViewTitle"),
        t("FilesTour:TourView"),
        callbacks,
      ),
    isDesktop &&
      elementStep(
        "#info-panel-toggle--open",
        t("FilesTour:TourInfoPanelTitle"),
        t("FilesTour:TourInfoPanel"),
        callbacks,
      ),
  ].filter(Boolean) as Step[];
}
