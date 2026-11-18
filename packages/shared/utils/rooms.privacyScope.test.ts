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
  // Spec: private-rooms/sidebar-section, "Section lists only private rooms"
  it.each([CategoryType.PrivateRooms, CategoryType.PrivateRoom])(
    "List opened (category %s)",
    (category) => {
      expect(getRoomsRequestScope(category, undefined)).toEqual({
        privacyFilter: null,
        searchArea: RoomSearchArea.PrivateRooms,
        lists: "private",
      });
    },
  );

  it.each([RoomSearchArea.Active, RoomSearchArea.Archive])(
    "Address carries another privacy value (searchArea %s)",
    (searchArea) => {
      expect(
        getRoomsRequestScope(CategoryType.PrivateRooms, searchArea),
      ).toEqual({
        privacyFilter: null,
        searchArea: RoomSearchArea.PrivateRooms,
        lists: "private",
      });
    },
  );

  it("Archive address carries the active search area", () => {
    expect(
      getRoomsRequestScope(CategoryType.PrivateArchive, RoomSearchArea.Active),
    ).toEqual({
      privacyFilter: RoomPrivacyFilter.Private,
      searchArea: RoomSearchArea.Archive,
      lists: "private",
    });
  });

  // Spec: private-rooms/sidebar-section, "Rooms section never lists private rooms"
  it.each([
    [CategoryType.Shared, RoomSearchArea.Active],
    [CategoryType.SharedRoom, RoomSearchArea.Active],
    [CategoryType.Shared, undefined],
  ])("Rooms carries no privacy filter (%s, %s)", (category, searchArea) => {
    expect(getRoomsRequestScope(category, searchArea)).toEqual({
      privacyFilter: null,
      lists: "notPrivate",
    });
  });

  it("Section not available: a Rooms address with the section's area lists Rooms", () => {
    expect(
      getRoomsRequestScope(CategoryType.Shared, RoomSearchArea.PrivateRooms),
    ).toEqual({
      privacyFilter: null,
      searchArea: RoomSearchArea.Active,
      lists: "notPrivate",
    });
  });

  it.each([
    [CategoryType.Archive, RoomSearchArea.Archive],
    [CategoryType.ArchivedRoom, RoomSearchArea.Archive],
    [CategoryType.Archive, undefined],
    [CategoryType.Shared, RoomSearchArea.Archive],
  ])(
    "Rooms -> Archive carries the non-private filter (%s, %s)",
    (category, searchArea) => {
      expect(getRoomsRequestScope(category, searchArea)).toEqual({
        privacyFilter: RoomPrivacyFilter.NotPrivate,
        lists: "notPrivate",
      });
    },
  );

  it.each([
    RoomSearchArea.Templates,
    RoomSearchArea.Forms,
    RoomSearchArea.AIAgents,
  ])("does not scope a %s search", (searchArea) => {
    expect(getRoomsRequestScope(CategoryType.Shared, searchArea)).toBeNull();
  });

  it("does not scope lists outside rooms", () => {
    expect(getRoomsRequestScope(CategoryType.Personal, undefined)).toBeNull();
    expect(getRoomsRequestScope(CategoryType.Forms, undefined)).toBeNull();
  });
});

describe("withRoomsRequestScope", () => {
  it("overrides the address' privacy filter and search area on a copy", () => {
    const filter = RoomsFilter.getDefault();
    filter.searchArea = RoomSearchArea.Active;
    filter.privacyFilter = RoomPrivacyFilter.NotPrivate;

    const scoped = withRoomsRequestScope(
      filter,
      getRoomsRequestScope(CategoryType.PrivateArchive, filter.searchArea),
    );

    expect(scoped).not.toBe(filter);
    expect(scoped.privacyFilter).toBe(RoomPrivacyFilter.Private);
    expect(scoped.searchArea).toBe(RoomSearchArea.Archive);
    expect(filter.privacyFilter).toBe(RoomPrivacyFilter.NotPrivate);
    expect(filter.searchArea).toBe(RoomSearchArea.Active);
  });

  it("Address asks Rooms for private rooms", () => {
    const filter = RoomsFilter.getDefault();
    filter.privacyFilter = RoomPrivacyFilter.Private;

    const scoped = withRoomsRequestScope(
      filter,
      getRoomsRequestScope(CategoryType.Shared, filter.searchArea),
    );

    expect(scoped.privacyFilter).toBeNull();
    expect(scoped.toApiUrlParams()).not.toContain("privacyFilter");
  });

  it("List opened: the request names the section's area and no privacy filter", () => {
    const filter = RoomsFilter.getDefault();
    filter.privacyFilter = RoomPrivacyFilter.NotPrivate;

    const scoped = withRoomsRequestScope(
      filter,
      getRoomsRequestScope(CategoryType.PrivateRooms, filter.searchArea),
    );

    expect(scoped.toApiUrlParams()).toContain("searchArea=PrivateRooms");
    expect(scoped.toApiUrlParams()).not.toContain("privacyFilter");
  });

  it("keeps the search area when the scope names none", () => {
    const filter = RoomsFilter.getDefault();
    filter.searchArea = RoomSearchArea.Archive;

    const scoped = withRoomsRequestScope(filter, {
      privacyFilter: RoomPrivacyFilter.NotPrivate,
      lists: "notPrivate",
    });

    expect(scoped.searchArea).toBe(RoomSearchArea.Archive);
    expect(scoped.privacyFilter).toBe(RoomPrivacyFilter.NotPrivate);
  });

  it("returns the filter itself without a scope", () => {
    const filter = RoomsFilter.getDefault();

    expect(withRoomsRequestScope(filter, null)).toBe(filter);
  });
});
