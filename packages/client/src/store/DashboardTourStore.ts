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

import { makeObservable, observable, action } from "mobx";

import TourStore, { safeGet, safeSet } from "./TourStore";

const WELCOME_SEEN_PREFIX = "dashboard_welcome_seen";

/**
 * Per-user, because a browser is shared: one person having dismissed the
 * welcome says nothing about the next person to sign in on the same machine.
 * The tour's own pending flag is not keyed this way and does not need to be —
 * it is spent within seconds of being set, on the page that set it.
 */
const welcomeKey = (userId: string) => `${WELCOME_SEEN_PREFIX}_${userId}`;

/**
 * The dashboard's tour, plus the welcome that offers it.
 *
 * Two pieces of state that outlive each other in opposite directions. The
 * pending/running pair is inherited and behaves as everywhere else — it is spent
 * the moment the tour starts. `isWelcomeSeen` is the opposite: set once, kept
 * for good, and deliberately untouched by `completeTour`, because "has been
 * offered the tour" is not "has taken the tour" — somebody who dismisses the
 * welcome, or who walks out of the tour halfway, must not be shown the modal
 * again on their next visit.
 *
 * Unlike the section tours, this one is requested and run on the same route, so
 * it never travels through storage: the welcome's button reaches the store
 * directly. The inherited persistence costs nothing and stays available for a
 * request made from elsewhere.
 */
class DashboardTourStore extends TourStore {
  /**
   * Starts `true`, which is the opposite of the truth for a first-time user.
   *
   * The value is only known once `hydrateWelcome` has read storage, and the
   * honest-looking `false` would put the modal on screen for the frame before
   * that — a flash of the welcome for every user who has already dismissed it,
   * on every load. Silence until proven otherwise is the safer default: the
   * cost of being wrong this way is that a first-time user's welcome arrives a
   * frame late, which is invisible.
   */
  isWelcomeSeen = true;

  constructor() {
    super("dashboard_tour_pending");

    makeObservable(this, {
      isWelcomeSeen: observable,
      hydrateWelcome: action,
      dismissWelcome: action,
    });
  }

  /**
   * Reads back whether this user has been shown the welcome. Called with the
   * signed-in user's id, which is only available once the user has loaded — so
   * this runs from the dashboard rather than from the constructor.
   *
   * Lowers the flag as well as raising it, unlike `TourStore.hydratePending`:
   * there is no in-memory request to protect here, and the whole point is to
   * learn that a user has *not* seen the welcome. A `userId` that isn't there
   * yet leaves the flag alone, so nothing is shown before we know who is asking.
   */
  hydrateWelcome = (userId?: string): void => {
    if (!userId) return;
    this.isWelcomeSeen = safeGet(welcomeKey(userId)) === "true";
  };

  /**
   * The user has been shown the welcome — whether they took the tour from it or
   * closed it. Both count: the modal is an offer, and it is made once.
   *
   * With storage unavailable the write silently fails and the in-memory flag
   * still holds for the rest of the session, so the modal does not come back on
   * the next navigation to the dashboard. It will come back on the next full
   * load, which is the most that can be promised without somewhere to write.
   */
  dismissWelcome = (userId?: string): void => {
    this.isWelcomeSeen = true;
    if (userId) safeSet(welcomeKey(userId), "true");
  };
}

export default DashboardTourStore;
