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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RoomsTypePrivate } from "../enums";

import { RoomsTypeValues } from "./common";
import { AI_HUB_SECTION_TYPES, getCreateRoomTypes } from "./rooms";
import { isPrivateRoomsOptInValue, PRIVATE_ROOMS_FLAG_KEY } from "./privateRooms";

describe("private rooms opt-in", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("Browser-local flag ignored", async () => {
    window.history.pushState({}, "", "/profile/keys-management?privateRooms=true");
    vi.resetModules();

    const privateRooms = await import("./privateRooms");

    expect(Object.keys(privateRooms).sort()).toEqual([
      "PRIVATE_ROOMS_FLAG_KEY",
      "isPrivateRoomsOptInValue",
    ]);
    expect(localStorage.length).toBe(0);
  });

  it("names the frame property and the URL parameter privateRooms", () => {
    expect(PRIVATE_ROOMS_FLAG_KEY).toBe("privateRooms");
  });

  it("reads true and 1 as an opt-in and nothing else", () => {
    expect([true, "true", "1"].map(isPrivateRoomsOptInValue)).toEqual([
      true,
      true,
      true,
    ]);
    expect(
      [false, "false", "0", "", null, undefined].map(isPrivateRoomsOptInValue),
    ).toEqual([false, false, false, false, false, false]);
  });

  it("Chooser while the section is available: hides the private room type", () => {
    expect(getCreateRoomTypes()).not.toContain(RoomsTypePrivate);
  });

  it("keeps every other room type in the chooser", () => {
    expect(getCreateRoomTypes()).toEqual(
      RoomsTypeValues.filter(
        (type) =>
          type !== RoomsTypePrivate && !AI_HUB_SECTION_TYPES.includes(type),
      ),
    );
  });
});
