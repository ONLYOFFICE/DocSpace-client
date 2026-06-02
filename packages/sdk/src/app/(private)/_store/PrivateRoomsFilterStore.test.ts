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

import { describe, it, expect, beforeEach } from "vitest";
import { RoomSearchArea, RoomsType } from "@docspace/shared/enums";

import { PrivateRoomsFilterStore } from "./PrivateRoomsFilterStore";

// Private rooms are CustomRoom (Type=5) on the wire — see private-rooms-filter.
const CUSTOM_ROOM = String(RoomsType.CustomRoom);

describe("PrivateRoomsFilterStore", () => {
  let store: PrivateRoomsFilterStore;

  beforeEach(() => {
    store = new PrivateRoomsFilterStore();
  });

  describe("buildFilter", () => {
    it("queries CustomRoom + Active by default (the private rooms list)", () => {
      const filter = store.buildFilter();
      expect(filter.type).toBe(CUSTOM_ROOM);
      expect(filter.searchArea).toBe(RoomSearchArea.Active);
    });

    it("switches the search area to Archive but keeps the CustomRoom type", () => {
      store.setSearchArea(RoomSearchArea.Archive);
      const filter = store.buildFilter();
      expect(filter.searchArea).toBe(RoomSearchArea.Archive);
      // The archive view must NOT change the room type — otherwise it would
      // query a different room kind and the archive would come back empty.
      expect(filter.type).toBe(CUSTOM_ROOM);
    });

    it("carries the store's pagination and search text into the filter", () => {
      store.setPage(3);
      store.setSearch("quarterly report");
      const filter = store.buildFilter();
      expect(filter.page).toBe(3);
      expect(filter.filterValue).toBe("quarterly report");
    });
  });

  describe("reset", () => {
    it("restores defaults so a stale area / search / sort cannot leak across navigations", () => {
      store.setSearchArea(RoomSearchArea.Archive);
      store.setSearch("secret");
      store.setPage(5);
      store.setSort("AZ", "ascending");

      store.reset();

      const filter = store.buildFilter();
      expect(filter.searchArea).toBe(RoomSearchArea.Active);
      expect(filter.filterValue).toBe("");
      expect(filter.page).toBe(0);
      expect(filter.sortBy).toBe("DateAndTime");
      expect(filter.sortOrder).toBe("descending");
    });
  });
});
