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

const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* noop */
  }
};

const safeRemove = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
};

/**
 * Per-section onboarding tour state.
 *
 * A tour never opens on its own. It is asked for from outside the section — the
 * app promo on the dashboard — via `requestTour`, and the section's tour host
 * starts it once the section it walks through is on screen. That request is
 * persisted because it is made on another route, so it has to survive the
 * navigation (including a full page load) to the section; concrete stores
 * (files/rooms/…) supply the storage key so each section is tracked
 * independently.
 */
class TourStore {
  isRunning = false;

  /** The user asked for this tour; the section host starts it when ready. */
  isPending = false;

  private _pendingKey: string;

  constructor(pendingKey: string) {
    this._pendingKey = pendingKey;
    makeObservable(this, {
      isRunning: observable,
      isPending: observable,
      hydratePending: action,
      requestTour: action,
      startTour: action,
      completeTour: action,
    });
  }

  // Only ever raises the flag: with storage unavailable (private mode) the
  // write in `requestTour` silently fails, and the in-memory request — which
  // survives an in-app navigation on its own — must not be cleared by the
  // read-back finding nothing.
  hydratePending = (): void => {
    if (safeGet(this._pendingKey) === "true") this.isPending = true;
  };

  requestTour = () => {
    this.isPending = true;
    safeSet(this._pendingKey, "true");
  };

  startTour = () => {
    this.isPending = false;
    safeRemove(this._pendingKey);
    this.isRunning = true;
  };

  completeTour = () => {
    this.isRunning = false;
    this.isPending = false;
    safeRemove(this._pendingKey);
  };
}

export default TourStore;
