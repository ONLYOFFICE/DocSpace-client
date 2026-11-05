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

import { describe, expect, it } from "vitest";

import RoomsFilter from "../api/rooms/filter";
import { CategoryType } from "../constants";
import { RoomPrivacyFilter, RoomSearchArea } from "../enums";

import { getRoomsRequestScope, withRoomsRequestScope } from "./rooms";

describe("getRoomsRequestScope", () => {
  it.each([
    [CategoryType.PrivateRooms, RoomSearchArea.Active],
    [CategoryType.PrivateRoom, RoomSearchArea.Active],
    [CategoryType.PrivateArchive, RoomSearchArea.Archive],
  ])(
    "asks for private rooms in the area of category %s",
    (category, searchArea) => {
      for (const available of [true, false]) {
        expect(getRoomsRequestScope(category, undefined, available)).toEqual({
          privacyFilter: RoomPrivacyFilter.Private,
          searchArea,
        });
      }
    },
  );

  it.each([
    [CategoryType.Shared, RoomSearchArea.Active],
    [CategoryType.SharedRoom, RoomSearchArea.Active],
    [CategoryType.Archive, RoomSearchArea.Archive],
  ])(
    "leaves private rooms out of Rooms category %s while the section is available",
    (category, searchArea) => {
      expect(getRoomsRequestScope(category, searchArea, true)).toEqual({
        privacyFilter: RoomPrivacyFilter.NotPrivate,
      });
      expect(getRoomsRequestScope(category, searchArea, false)).toBeNull();
    },
  );

  it.each([
    RoomSearchArea.Templates,
    RoomSearchArea.Forms,
    RoomSearchArea.AIAgents,
  ])("does not scope a %s search", (searchArea) => {
    expect(getRoomsRequestScope(CategoryType.Shared, searchArea, true)).toBeNull();
  });

  it("does not scope lists outside rooms", () => {
    expect(
      getRoomsRequestScope(CategoryType.Personal, undefined, true),
    ).toBeNull();
    expect(getRoomsRequestScope(CategoryType.Forms, undefined, true)).toBeNull();
  });
});

describe("withRoomsRequestScope", () => {
  it("overrides the address' privacy filter and search area on a copy", () => {
    const filter = RoomsFilter.getDefault();
    filter.searchArea = RoomSearchArea.Active;
    filter.privacyFilter = RoomPrivacyFilter.NotPrivate;

    const scoped = withRoomsRequestScope(
      filter,
      getRoomsRequestScope(CategoryType.PrivateArchive, filter.searchArea, true),
    );

    expect(scoped).not.toBe(filter);
    expect(scoped.privacyFilter).toBe(RoomPrivacyFilter.Private);
    expect(scoped.searchArea).toBe(RoomSearchArea.Archive);
    expect(filter.privacyFilter).toBe(RoomPrivacyFilter.NotPrivate);
    expect(filter.searchArea).toBe(RoomSearchArea.Active);
  });

  it("keeps the search area when the scope names none", () => {
    const filter = RoomsFilter.getDefault();
    filter.searchArea = RoomSearchArea.Archive;

    const scoped = withRoomsRequestScope(filter, {
      privacyFilter: RoomPrivacyFilter.NotPrivate,
    });

    expect(scoped.searchArea).toBe(RoomSearchArea.Archive);
    expect(scoped.privacyFilter).toBe(RoomPrivacyFilter.NotPrivate);
  });

  it("returns the filter itself without a scope", () => {
    const filter = RoomsFilter.getDefault();

    expect(withRoomsRequestScope(filter, null)).toBe(filter);
  });
});
