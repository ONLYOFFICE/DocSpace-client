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

import { safeGet, safeSet } from "SRC_DIR/store/TourStore";

const VISITED_PREFIX = "dashboard_visited";

/**
 * Per-user, because a browser is shared: one person having seen the Overview
 * says nothing about where the next person to sign in should land.
 */
const visitedKey = (userId: string) => `${VISITED_PREFIX}_${userId}`;

/**
 * Whether this user has already landed on the Overview (Dashboard) page.
 *
 * This is what entry routing turns on: the Overview is the introduction to the
 * new design, so it wins the first load, and from then on the user's own
 * Default Homepage setting does. Deliberately *not* the welcome-modal flag —
 * that one means "has been offered the tour", is left unspent on mobile on
 * purpose, and must not decide where anyone lands.
 *
 * Unknown `userId` reads as visited, so a load that has not resolved the user
 * yet never spends the one first-visit Overview on nobody's behalf.
 */
export const isDashboardVisited = (userId?: string): boolean => {
  if (!userId) return true;
  return safeGet(visitedKey(userId)) === "true";
};

/**
 * Records that the user has been on the Overview. Called by the page itself, so
 * that only actually rendering it counts — being redirected past it does not.
 *
 * With storage unavailable the write silently fails and the user keeps landing
 * on the Overview, which is the pre-existing behaviour rather than a new fault.
 */
export const setDashboardVisited = (userId?: string): void => {
  if (userId) safeSet(visitedKey(userId), "true");
};
