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

import api from "@docspace/shared/api";

class RoomsTagsStore {
  tags: string[] = [];

  isLoading = false;

  isLoaded = false;

  private inflight: Promise<unknown> | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  fetchTags = async (): Promise<void> => {
    if (this.isLoaded) return;
    const pending = this.inflight;
    if (pending !== null) {
      await pending;
      return;
    }

    runInAction(() => {
      this.isLoading = true;
    });

    this.inflight = Promise.resolve(api.rooms.getTags())
      .then((tags) => {
        runInAction(() => {
          const serverTags = Array.isArray(tags) ? tags : [];
          const set = new Set(this.tags);
          for (const t of serverTags) set.add(t);
          this.tags = Array.from(set);
          this.isLoaded = true;
        });
      })
      .catch(() => {
        runInAction(() => {
          // Keep whatever was upserted; just mark not-loaded to allow retry.
        });
      })
      .finally(() => {
        runInAction(() => {
          this.isLoading = false;
        });
        this.inflight = null;
      });

    await this.inflight;
  };

  upsertTags = (newTags: string[]) => {
    if (!Array.isArray(newTags) || newTags.length === 0) return;
    const set = new Set(this.tags);
    let changed = false;
    for (const t of newTags) {
      if (!t) continue;
      if (!set.has(t)) {
        set.add(t);
        changed = true;
      }
    }
    if (changed) this.tags = Array.from(set);
  };
}

const RoomsTagsStoreContext = React.createContext<RoomsTagsStore | null>(null);

export const RoomsTagsStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new RoomsTagsStore(), []);
  return (
    <RoomsTagsStoreContext.Provider value={store}>
      {children}
    </RoomsTagsStoreContext.Provider>
  );
};

export const useRoomsTagsStore = () => {
  const store = React.useContext(RoomsTagsStoreContext);
  if (!store)
    throw new Error(
      "useRoomsTagsStore must be used within RoomsTagsStoreContextProvider",
    );
  return store;
};

export default RoomsTagsStore;

