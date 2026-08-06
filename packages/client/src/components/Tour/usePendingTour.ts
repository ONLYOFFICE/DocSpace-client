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

import { useEffect } from "react";

import type TourStore from "SRC_DIR/store/TourStore";

/**
 * How long to let the section settle after it reports itself ready.
 *
 * `useTour` checks every step's anchor against the DOM at the moment the tour
 * starts and drops the steps whose anchor isn't there, so the start has to wait
 * out the last bit of painting the loader flags don't cover (the sticky filter
 * settling, the first rows of a virtualized list).
 */
const SECTION_SETTLE_DELAY = 300;

/**
 * Starts a tour that was requested from outside the section — the app promo on
 * the dashboard arms it with `requestTour`, this runs it once the section it
 * walks through is on screen.
 *
 * `isSectionReady` is the caller's "my section is loaded and showing its root"
 * flag; the tour is only ever started while that holds.
 */
export default function usePendingTour(
  tourStore: TourStore,
  isSectionReady: boolean,
  isMobileView: boolean,
) {
  // The request is made on another route, so it arrives through storage.
  useEffect(() => {
    tourStore.hydratePending();
  }, [tourStore]);

  useEffect(() => {
    if (!tourStore.isPending || tourStore.isRunning) return;

    // No tour on mobile (`useTour` refuses to run there) — drop the request
    // instead of leaving it armed for the next desktop visit.
    if (isMobileView) {
      tourStore.completeTour();
      return;
    }

    if (!isSectionReady) return;

    const timer = setTimeout(() => {
      tourStore.startTour();
    }, SECTION_SETTLE_DELAY);

    return () => clearTimeout(timer);
  }, [
    tourStore,
    tourStore.isPending,
    tourStore.isRunning,
    isSectionReady,
    isMobileView,
  ]);
}
