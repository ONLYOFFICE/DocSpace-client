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

import { FolderType, RoomsType } from "@docspace/shared/enums";
import { CategoryType } from "@docspace/shared/constants";

import { getCategoryTypeByFolderTypeInSection } from "../utils";

// Form filling rooms live in the VirtualRooms tree, so the server reports
// rootFolderType = Rooms (14) for them. The sidebar and the breadcrumb resolve
// the active section from the pathname, so routing such a room by
// rootFolderType alone opens /rooms/shared/... and highlights Rooms.
describe("getCategoryTypeByFolderTypeInSection", () => {
  it("keeps a form room in Forms when it is created from another section", () => {
    // Files -> "Fill -> Form data collection" -> "Share in the room":
    // the /forms prefix is not set yet, so only the room type identifies it.
    expect(
      getCategoryTypeByFolderTypeInSection(FolderType.Rooms, 123, {
        roomType: RoomsType.FormRoom,
        pathname: "/rooms/personal/filter",
      }),
    ).toBe(CategoryType.Form);
  });

  it("keeps a form room in Forms when opened from the Forms list", () => {
    expect(
      getCategoryTypeByFolderTypeInSection(FolderType.Rooms, 123, {
        roomType: RoomsType.FormRoom,
        pathname: "/forms/filter",
      }),
    ).toBe(CategoryType.Form);
  });

  it("keeps folders inside a form room in Forms via the route fallback", () => {
    // Subfolders carry no room type of their own.
    expect(
      getCategoryTypeByFolderTypeInSection(FolderType.Rooms, 123, {
        pathname: "/forms/5/filter",
      }),
    ).toBe(CategoryType.Form);
  });

  it("leaves a regular room in Rooms", () => {
    expect(
      getCategoryTypeByFolderTypeInSection(FolderType.Rooms, 123, {
        roomType: RoomsType.CustomRoom,
        pathname: "/rooms/shared/filter",
      }),
    ).toBe(CategoryType.SharedRoom);
  });

  it("leaves a regular room in Rooms when no room type is known", () => {
    expect(
      getCategoryTypeByFolderTypeInSection(FolderType.Rooms, 123, {
        pathname: "/rooms/shared/filter",
      }),
    ).toBe(CategoryType.SharedRoom);
  });

  it("does not touch section roots", () => {
    expect(
      getCategoryTypeByFolderTypeInSection(FolderType.Rooms, 0, {
        pathname: "/rooms/shared/filter",
      }),
    ).toBe(CategoryType.Shared);

    expect(
      getCategoryTypeByFolderTypeInSection(FolderType.Forms, 0, {
        pathname: "/forms/filter",
      }),
    ).toBe(CategoryType.Forms);
  });

  it("does not reroute non-room sections seen from a /forms route", () => {
    expect(
      getCategoryTypeByFolderTypeInSection(FolderType.USER, 0, {
        pathname: "/forms/filter",
      }),
    ).toBe(CategoryType.Personal);
  });
});
