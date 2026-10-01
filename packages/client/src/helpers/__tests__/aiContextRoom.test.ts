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

import { describe, expect, it, vi } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

vi.mock("SRC_DIR/api/tourDemo/data", () => ({
  isTourDemoId: (id: number | string) => String(id).startsWith("tour-"),
}));

import { getAiContextRoom } from "../aiContextRoom";

const inRoomRoot = (roomType: RoomsType | null) => ({
  id: 12,
  title: "Sales",
  isRoom: true,
  roomType,
  navigationPath: [],
});

describe("getAiContextRoom", () => {
  it("names the room the user stands in", () => {
    expect(getAiContextRoom(inRoomRoot(RoomsType.CustomRoom))).toEqual({
      id: "12",
      name: "Sales",
    });
  });

  it("finds the room from one of its subfolders", () => {
    expect(
      getAiContextRoom({
        id: 40,
        title: "Q3",
        isRoom: false,
        roomType: null,
        navigationPath: [
          { id: 14, title: "Rooms", isRoom: false },
          { id: 12, title: "Sales", isRoom: true, roomType: RoomsType.PublicRoom },
          { id: 30, title: "Reports", isRoom: false },
        ],
      }),
    ).toEqual({ id: "12", name: "Sales" });
  });

  it.each([
    RoomsType.CustomRoom,
    RoomsType.PublicRoom,
    RoomsType.VirtualDataRoom,
    RoomsType.EditingRoom,
  ])("accepts room type %s", (roomType) => {
    expect(getAiContextRoom(inRoomRoot(roomType))).not.toBeNull();
  });

  it.each([RoomsType.AIRoom, RoomsType.FormRoom, null])(
    "skips a room of type %s, which cannot hold a .ai folder",
    (roomType) => {
      expect(getAiContextRoom(inRoomRoot(roomType))).toBeNull();
    },
  );

  it("is null outside rooms", () => {
    expect(
      getAiContextRoom({
        id: 5,
        title: "My documents",
        isRoom: false,
        roomType: null,
        navigationPath: [{ id: 3, title: "Folder", isRoom: false }],
      }),
    ).toBeNull();
  });

  it("skips a tour stand-in room the server does not know", () => {
    expect(
      getAiContextRoom({ ...inRoomRoot(RoomsType.CustomRoom), id: "tour-1" }),
    ).toBeNull();
  });
});
