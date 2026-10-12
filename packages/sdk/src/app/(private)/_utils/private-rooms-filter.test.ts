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

import { describe, it, expect } from "vitest";
import { RoomSearchArea, RoomsType } from "@docspace/shared/enums";
import RoomsFilter from "@docspace/shared/api/rooms/filter";

import {
  applyPrivateRoomsFilter,
  getPrivateRoomsDefaultFilter,
  isPrivateRoomEntry,
} from "./private-rooms-filter";

describe("private-rooms-filter", () => {
  describe("applyPrivateRoomsFilter", () => {
    it("always forces CustomRoom type (private rooms are CustomRoom on the wire)", () => {
      const filter = RoomsFilter.getDefault();
      const result = applyPrivateRoomsFilter(filter);
      expect(result.type).toBe(String(RoomsType.CustomRoom));
    });

    it("defaults to the Active search area", () => {
      const result = applyPrivateRoomsFilter(RoomsFilter.getDefault());
      expect(result.searchArea).toBe(RoomSearchArea.Active);
    });

    it("honors an explicit Archive search area", () => {
      const result = applyPrivateRoomsFilter(
        RoomsFilter.getDefault(),
        RoomSearchArea.Archive,
      );
      expect(result.type).toBe(String(RoomsType.CustomRoom));
      expect(result.searchArea).toBe(RoomSearchArea.Archive);
    });

    it("mutates and returns the same filter instance", () => {
      const filter = RoomsFilter.getDefault();
      expect(applyPrivateRoomsFilter(filter)).toBe(filter);
    });
  });

  describe("getPrivateRoomsDefaultFilter", () => {
    it("produces a CustomRoom filter with the given search area", () => {
      const active = getPrivateRoomsDefaultFilter(RoomSearchArea.Active);
      const archive = getPrivateRoomsDefaultFilter(RoomSearchArea.Archive);
      expect(active.type).toBe(String(RoomsType.CustomRoom));
      expect(active.searchArea).toBe(RoomSearchArea.Active);
      expect(archive.searchArea).toBe(RoomSearchArea.Archive);
    });
  });

  describe("isPrivateRoomEntry", () => {
    it("is true only when private === true", () => {
      expect(isPrivateRoomEntry({ private: true })).toBe(true);
      expect(isPrivateRoomEntry({ private: false })).toBe(false);
      expect(isPrivateRoomEntry({})).toBe(false);
      expect(isPrivateRoomEntry({ private: undefined })).toBe(false);
    });
  });
});
