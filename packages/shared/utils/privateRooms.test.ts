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

import { beforeEach, describe, expect, it } from "vitest";

import { RoomsTypePrivate } from "../enums";

import { RoomsTypeValues } from "./common";
import { getCreateRoomTypes } from "./rooms";
import {
  isPrivateRoomsEnabled,
  isPrivateRoomsOptInValue,
  PRIVATE_ROOMS_FLAG_KEY,
  setPrivateRoomsOptInSource,
} from "./privateRooms";

describe("private rooms feature flag", () => {
  beforeEach(() => {
    localStorage.clear();
    setPrivateRoomsOptInSource(null);
  });

  it("takes the opt-in from an installed source instead of the flag", () => {
    localStorage.setItem(PRIVATE_ROOMS_FLAG_KEY, "true");
    setPrivateRoomsOptInSource(() => false);
    expect(isPrivateRoomsEnabled()).toBe(false);

    localStorage.clear();
    setPrivateRoomsOptInSource(() => true);
    expect(isPrivateRoomsEnabled()).toBe(true);
  });

  it("goes back to the flag when the source is removed", () => {
    setPrivateRoomsOptInSource(() => true);
    setPrivateRoomsOptInSource(null);

    expect(isPrivateRoomsEnabled()).toBe(false);
  });

  it("is off when the installed source throws", () => {
    setPrivateRoomsOptInSource(() => {
      throw new Error("no config");
    });

    expect(isPrivateRoomsEnabled()).toBe(false);
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

  it("is off when the flag was never set", () => {
    expect(isPrivateRoomsEnabled()).toBe(false);
  });

  it("is on for any non-empty flag value", () => {
    localStorage.setItem(PRIVATE_ROOMS_FLAG_KEY, "true");
    expect(isPrivateRoomsEnabled()).toBe(true);

    localStorage.setItem(PRIVATE_ROOMS_FLAG_KEY, "1");
    expect(isPrivateRoomsEnabled()).toBe(true);
  });

  it("is off for an empty flag value", () => {
    localStorage.setItem(PRIVATE_ROOMS_FLAG_KEY, "");
    expect(isPrivateRoomsEnabled()).toBe(false);
  });

  it("Chooser without the flag: hides the private room type", () => {
    expect(getCreateRoomTypes()).not.toContain(RoomsTypePrivate);
  });

  it("Chooser with the flag: still hides the private room type", () => {
    localStorage.setItem(PRIVATE_ROOMS_FLAG_KEY, "true");

    expect(getCreateRoomTypes()).not.toContain(RoomsTypePrivate);
  });

  it("keeps every other room type in both states", () => {
    const withoutFlag = getCreateRoomTypes();

    localStorage.setItem(PRIVATE_ROOMS_FLAG_KEY, "true");
    const withFlag = getCreateRoomTypes();

    expect(withoutFlag).toEqual(
      RoomsTypeValues.filter((type) => type !== RoomsTypePrivate),
    );
    expect(withFlag).toEqual(withoutFlag);
  });
});
