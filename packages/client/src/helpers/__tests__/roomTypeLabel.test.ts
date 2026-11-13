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

vi.mock("SRC_DIR/i18n", () => ({ default: { t: (key: string) => key } }));
vi.mock("../../i18n", () => ({ default: { t: (key: string) => key } }));

import { getRoomTypeLabel } from "../filesUtils";

const t = (key: string) => key;

// Spec: private-rooms/room-membership, "Private room type is labelled Private"
describe("getRoomTypeLabel", () => {
  const privateRoom = { roomType: RoomsType.CustomRoom, private: true };
  const customRoom = { roomType: RoomsType.CustomRoom, private: false };

  it("Type column in the Private section", () => {
    expect(getRoomTypeLabel(privateRoom, t)).toBe("Common:PrivateRoomType");
  });

  it("Info panel", () => {
    expect(getRoomTypeLabel({ ...privateRoom, isRoom: true }, t)).toBe(
      "Common:PrivateRoomType",
    );
  });

  it("Archive holds both kinds", () => {
    expect([privateRoom, customRoom].map((room) => getRoomTypeLabel(room, t))).toEqual([
      "Common:PrivateRoomType",
      "Common:CustomRooms",
    ]);
  });

  it("keeps the label of every other room type", () => {
    expect(getRoomTypeLabel({ roomType: RoomsType.PublicRoom }, t)).toBe(
      "Common:PublicRoom",
    );
    expect(
      getRoomTypeLabel({ roomType: RoomsType.EditingRoom, private: undefined }, t),
    ).toBe("Common:CollaborationRooms");
  });
});
