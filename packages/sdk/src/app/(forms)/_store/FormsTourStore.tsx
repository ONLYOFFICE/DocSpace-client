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

"use client";

import React from "react";
import { makeAutoObservable, runInAction } from "mobx";

import {
  externalStorageGet,
  externalStorageSet,
  isExternalStorageAvailable,
} from "@/utils/externalStorage";

const TOUR_COMPLETED_KEY = "forms_tour_completed";
const EXT_TOUR_KEY = "aiforms.tour";

const tourKey = (userKey?: string) =>
  userKey ? `${TOUR_COMPLETED_KEY}_${userKey}` : TOUR_COMPLETED_KEY;

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

class FormsTourStore {
  isRunning = false;
  tourCompleted = false;
  isHydrated = false;

  private _userKey: string | undefined = undefined;

  constructor() {
    makeAutoObservable(this, {
      _userKey: false,
    } as Record<string, false>);
  }

  get isDemo() {
    return this.isRunning;
  }

  get showMockItems() {
    return this.isRunning;
  }

  get forceShowAiChat() {
    return this.isRunning;
  }

  hydrateForUser = async (userKey: string): Promise<void> => {
    if (!userKey) return;
    this._userKey = userKey;

    const scopedSync = safeGet(tourKey(userKey));
    if (scopedSync !== null) {
      runInAction(() => {
        this.tourCompleted = scopedSync === "true";
      });
    }

    try {
      if (await isExternalStorageAvailable()) {
        const ext = await externalStorageGet<boolean>(EXT_TOUR_KEY);
        if (ext !== null) {
          runInAction(() => {
            this.tourCompleted = ext;
          });
          return;
        }

        if (scopedSync !== null) {
          void externalStorageSet(EXT_TOUR_KEY, scopedSync === "true");
          return;
        }

        const legacy = safeGet(TOUR_COMPLETED_KEY);
        if (legacy !== null) {
          const parsed = legacy === "true";
          runInAction(() => {
            this.tourCompleted = parsed;
          });
          safeSet(tourKey(userKey), legacy);
          safeRemove(TOUR_COMPLETED_KEY);
          void externalStorageSet(EXT_TOUR_KEY, parsed);
        }
        return;
      }

      if (scopedSync !== null) return;

      const legacy = safeGet(TOUR_COMPLETED_KEY);
      if (legacy !== null) {
        runInAction(() => {
          this.tourCompleted = legacy === "true";
        });
        safeSet(tourKey(userKey), legacy);
        safeRemove(TOUR_COMPLETED_KEY);
      }
    } finally {
      runInAction(() => {
        this.isHydrated = true;
      });
    }
  };

  startTour = () => {
    this.isRunning = true;
  };

  completeTour = () => {
    this.isRunning = false;
    this.tourCompleted = true;
    safeSet(tourKey(this._userKey), "true");
    void externalStorageSet(EXT_TOUR_KEY, true);
  };

  resetTour = () => {
    this.tourCompleted = false;
    safeRemove(tourKey(this._userKey));
    safeRemove(TOUR_COMPLETED_KEY);
    void externalStorageSet(EXT_TOUR_KEY, false);
  };
}

export const FormsTourStoreContext = React.createContext<FormsTourStore>(
  null as unknown as FormsTourStore,
);

export const FormsTourStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new FormsTourStore(), []);
  return (
    <FormsTourStoreContext.Provider value={store}>
      {children}
    </FormsTourStoreContext.Provider>
  );
};

export const useFormsTourStore = () => {
  return React.useContext(FormsTourStoreContext);
};
