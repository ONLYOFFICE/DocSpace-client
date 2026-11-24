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

import { getQuickActionsSection, isEmptyRoomGroup } from "../quickActions";

describe("getQuickActionsSection — Private section", () => {
  it("Banner on a non-empty Private list: the Private list root has none", () => {
    expect(
      getQuickActionsSection({
        isRoomsFolder: true,
        isPrivateRoomsSection: true,
      }),
    ).toBeNull();
  });

  it("Row link of the Rooms list: a room loaded under the Private list address gets no Private room tile", () => {
    expect(
      getQuickActionsSection({
        isRoom: true,
        isPrivacyFolder: true,
        isRoomsFolder: false,
        isPrivateRoomsSection: true,
      }),
    ).toBe("private");
  });

  it("keeps the room tiles of the Rooms list", () => {
    expect(getQuickActionsSection({ isRoomsFolder: true })).toBe("rooms");
  });

  it("No-access view offers no room types: the rooms root still loaded under a private room address", () => {
    expect(
      getQuickActionsSection({
        isRoomsFolder: true,
        isPrivateRoomsSection: false,
        isPrivateRoute: true,
      }),
    ).toBeNull();
  });

  it("Banner inside a private room: keeps the file tiles", () => {
    expect(
      getQuickActionsSection({ isRoom: true, isPrivacyFolder: true }),
    ).toBe("private");
  });

  it("offers no banner in Private -> Archive", () => {
    expect(
      getQuickActionsSection({
        isArchiveFolder: true,
        isPrivateRoomsSection: false,
      }),
    ).toBeNull();
  });
});

describe("isEmptyRoomGroup", () => {
  it("is an emptied room group in Rooms and in Forms", () => {
    expect(
      isEmptyRoomGroup({
        isEmptyPage: true,
        roomsFilterGroupId: 7,
        isRoomsFolder: true,
      }),
    ).toBe(true);
    expect(
      isEmptyRoomGroup({
        isEmptyPage: true,
        roomsFilterGroupId: "7",
        isFormsSection: true,
      }),
    ).toBe(true);
  });

  it("is not a group with rooms, an empty list without a group, or a group outside Rooms and Forms", () => {
    expect(
      isEmptyRoomGroup({
        isEmptyPage: false,
        roomsFilterGroupId: 7,
        isRoomsFolder: true,
      }),
    ).toBe(false);
    expect(
      isEmptyRoomGroup({
        isEmptyPage: true,
        roomsFilterGroupId: null,
        isRoomsFolder: true,
      }),
    ).toBe(false);
    expect(
      isEmptyRoomGroup({ isEmptyPage: true, roomsFilterGroupId: 7 }),
    ).toBe(false);
  });
});
