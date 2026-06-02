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
import { makeAutoObservable } from "mobx";

import type RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomSearchArea } from "@docspace/shared/enums";

// Pure utility helpers (`getPrivateRoomsDefaultFilter`, `applyPrivateRoomsFilter`,
// `isPrivateRoomEntry`) live in `_utils/private-rooms-filter.ts` so RSC pages
// can import them without pulling MobX into the server bundle. Re-export here
// for callers that already import from this store.
export {
  applyPrivateRoomsFilter,
  getPrivateRoomsDefaultFilter,
  isPrivateRoomEntry,
} from "../_utils/private-rooms-filter";
import { getPrivateRoomsDefaultFilter } from "../_utils/private-rooms-filter";

// Exported for unit testing (instantiated directly), mirroring
// PrivateRoomFilesStore. Consumers should use the hook / provider below.
export class PrivateRoomsFilterStore {
  searchArea: RoomSearchArea = RoomSearchArea.Active;
  page = 0;
  pageCount = 100;
  filterValue = "";
  sortBy: RoomsFilter["sortBy"] = "DateAndTime";
  sortOrder: RoomsFilter["sortOrder"] = "descending";

  constructor() {
    makeAutoObservable(this);
  }

  setSearchArea = (area: RoomSearchArea) => {
    this.searchArea = area;
  };

  setPage = (page: number) => {
    this.page = page;
  };

  setSearch = (value: string) => {
    this.filterValue = value;
  };

  setSort = (sortBy: RoomsFilter["sortBy"], sortOrder: RoomsFilter["sortOrder"]) => {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  };

  reset = () => {
    this.searchArea = RoomSearchArea.Active;
    this.page = 0;
    this.pageCount = 100;
    this.filterValue = "";
    this.sortBy = "DateAndTime";
    this.sortOrder = "descending";
  };

  buildFilter = (userId?: string): RoomsFilter => {
    const filter = getPrivateRoomsDefaultFilter(this.searchArea, userId);
    filter.page = this.page;
    filter.pageCount = this.pageCount;
    filter.filterValue = this.filterValue;
    filter.sortBy = this.sortBy;
    filter.sortOrder = this.sortOrder;
    return filter;
  };
}

const PrivateRoomsFilterStoreContext =
  React.createContext<PrivateRoomsFilterStore | null>(null);

export const PrivateRoomsFilterStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new PrivateRoomsFilterStore(), []);
  return (
    <PrivateRoomsFilterStoreContext.Provider value={store}>
      {children}
    </PrivateRoomsFilterStoreContext.Provider>
  );
};

export const usePrivateRoomsFilterStore = (): PrivateRoomsFilterStore => {
  const store = React.useContext(PrivateRoomsFilterStoreContext);
  if (!store) {
    throw new Error(
      "usePrivateRoomsFilterStore must be used within a PrivateRoomsFilterStoreProvider",
    );
  }
  return store;
};
