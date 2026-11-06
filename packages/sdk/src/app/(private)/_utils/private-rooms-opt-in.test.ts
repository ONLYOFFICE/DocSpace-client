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

import {
  hasPrivateRoomsOptIn,
  withPrivateRoomsOptIn,
} from "./private-rooms-opt-in";

describe("private rooms opt-in in the frame URL", () => {
  it("is read from the request query and from page search params", () => {
    expect(hasPrivateRoomsOptIn(new URLSearchParams("privateRooms=true"))).toBe(
      true,
    );
    expect(hasPrivateRoomsOptIn({ privateRooms: "1" })).toBe(true);
    expect(hasPrivateRoomsOptIn(new URLSearchParams("theme=Dark"))).toBe(false);
    expect(hasPrivateRoomsOptIn({ privateRooms: "false" })).toBe(false);
    expect(hasPrivateRoomsOptIn(null)).toBe(false);
  });

  it("keeps the opt-in on an internal path", () => {
    const current = new URLSearchParams("privateRooms=true&theme=Dark");

    expect(withPrivateRoomsOptIn("/private/42", current)).toBe(
      "/private/42?privateRooms=true",
    );
    expect(withPrivateRoomsOptIn("/private?folder=7", current)).toBe(
      "/private?folder=7&privateRooms=true",
    );
  });

  it("leaves the path alone without an opt-in", () => {
    expect(withPrivateRoomsOptIn("/private/42", new URLSearchParams())).toBe(
      "/private/42",
    );
  });
});
