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

import { CategoryType } from "@docspace/shared/constants";
import { FolderType } from "@docspace/shared/enums";
import {
  getCategoryType,
  isPrivateRoomsRoute,
} from "@docspace/shared/utils/common";

import { getClientActiveId } from "../articleNavigation";
import {
  getPrivateAddressOfE2eRoomsAddress,
  getRoomsAddressOfPrivateAddress,
  getSectionAddressCorrection,
  type TSectionDecision,
} from "../privateRoomsSection";
import {
  getCategoryTypeByFolderTypeInSection,
  getCategoryUrl,
} from "../utils";

const categoryOf = (pathname: string) => getCategoryType({ pathname });

describe("Private section addresses", () => {
  it.each([
    ["/private", CategoryType.PrivateRooms],
    ["/private/filter", CategoryType.PrivateRooms],
    ["/private/123", CategoryType.PrivateRoom],
    ["/private/123/filter", CategoryType.PrivateRoom],
    ["/private/archived", CategoryType.PrivateArchive],
    ["/private/archived/filter", CategoryType.PrivateArchive],
  ])("classifies %s", (pathname, category) => {
    expect(isPrivateRoomsRoute(pathname)).toBe(true);
    expect(categoryOf(pathname)).toBe(category);
  });

  it.each([
    ["/rooms/archived/filter", CategoryType.Archive],
    ["/rooms/shared/filter", CategoryType.Shared],
    ["/rooms/shared/123/filter", CategoryType.SharedRoom],
    ["/forms/filter", CategoryType.Forms],
    ["/forms/123/filter", CategoryType.Form],
  ])("keeps %s in its own section", (pathname, category) => {
    expect(isPrivateRoomsRoute(pathname)).toBe(false);
    expect(categoryOf(pathname)).toBe(category);
  });

  it("does not take a path that only starts with the word private", () => {
    expect(isPrivateRoomsRoute("/privateer/filter")).toBe(false);
  });

  it.each([
    [CategoryType.PrivateRooms, undefined, "/private/filter"],
    [CategoryType.PrivateRoom, 123, "/private/123/filter"],
    [CategoryType.PrivateArchive, undefined, "/private/archived/filter"],
  ])("builds the address of category %s", (category, folderId, url) => {
    expect(getCategoryUrl(category, folderId)).toBe(url);
    expect(categoryOf(url)).toBe(category);
  });

  it("opens an archived private room as the archive address with its folder", () => {
    const url = `${getCategoryUrl(CategoryType.PrivateArchive, 123)}?folder=123`;

    expect(url).toBe("/private/archived/filter?folder=123");
    expect(categoryOf(new URL(url, "http://x").pathname)).toBe(
      CategoryType.PrivateArchive,
    );
  });
});

describe("Private section addresses without the section", () => {
  it.each([
    ["/private", "", "/rooms/shared", CategoryType.Shared],
    [
      "/private/filter",
      "?searchArea=Active",
      "/rooms/shared/filter?searchArea=Active",
      CategoryType.Shared,
    ],
    ["/private/123", "", "/rooms/shared/123", CategoryType.SharedRoom],
    [
      "/private/123/filter",
      "?folder=123",
      "/rooms/shared/123/filter?folder=123",
      CategoryType.SharedRoom,
    ],
    ["/private/archived", "", "/rooms/archived", CategoryType.Archive],
    [
      "/private/archived/filter",
      "?folder=123",
      "/rooms/archived/filter?folder=123",
      CategoryType.Archive,
    ],
  ])("open %s%s under Rooms", (pathname, search, address, category) => {
    const roomsAddress = getRoomsAddressOfPrivateAddress({ pathname, search });

    expect(roomsAddress).toBe(address);
    expect(categoryOf(new URL(roomsAddress, "http://x").pathname)).toBe(
      category,
    );
  });
});

describe("Private section in the sidebar", () => {
  const ids = { roomsFolderId: 1, archiveFolderId: 2 };

  it.each([
    ["/private/filter", "private-rooms"],
    ["/private/123/filter", "private-rooms"],
    ["/private/archived/filter", "private-rooms-archive"],
  ])("highlights %s", (pathname, activeId) => {
    expect(getClientActiveId(pathname, ids, "?folder=123")).toBe(activeId);
  });

  it.each([
    ["/rooms/shared/filter", "1"],
    ["/rooms/shared/123/filter", "1"],
    ["/rooms/archived/filter", "2"],
  ])("keeps %s on Rooms", (pathname, activeId) => {
    expect(getClientActiveId(pathname, ids, "")).toBe(activeId);
  });
});

describe("Private section of a room opened from elsewhere", () => {
  it.each([
    [FolderType.Rooms, 0, CategoryType.PrivateRooms],
    [FolderType.Rooms, 12, CategoryType.PrivateRoom],
    [FolderType.Archive, 12, CategoryType.PrivateArchive],
  ])(
    "opens a private target of folder type %s under the section",
    (folderType, parentId, category) => {
      expect(
        getCategoryTypeByFolderTypeInSection(folderType, parentId, {
          isPrivate: true,
          pathname: "/rooms/shared/filter",
        }),
      ).toBe(category);
    },
  );

  it("leaves a target that is not private where it was", () => {
    expect(
      getCategoryTypeByFolderTypeInSection(FolderType.Rooms, 12, {
        pathname: "/private/12/filter",
      }),
    ).toBe(CategoryType.SharedRoom);
    expect(
      getCategoryTypeByFolderTypeInSection(FolderType.USER, 12, {
        isPrivate: true,
      }),
    ).toBe(CategoryType.Personal);
  });
});

describe("Section decided before the folder is shown", () => {
  const decide = (decision: Partial<TSectionDecision>) =>
    getSectionAddressCorrection({
      pathname: "/rooms/shared/12/filter",
      search: "?folder=12",
      folderId: 12,
      isPrivate: true,
      isSectionAvailable: true,
      isRoomsAppOff: false,
      isFrame: false,
      isDecided: false,
      ...decision,
    });

  it.each([
    ["/rooms/shared/12/filter", "?folder=12", "/private/12/filter?folder=12"],
    ["/rooms/shared/filter", "?folder=12", "/private/filter?folder=12"],
    [
      "/rooms/archived/filter",
      "?folder=12&page=1",
      "/private/archived/filter?folder=12&page=1",
    ],
    ["/rooms/archived/12/filter", "", "/private/archived/filter?folder=12"],
  ])(
    "moves a private room opened at %s%s to the section",
    (pathname, search, address) => {
      expect(decide({ pathname, search })).toBe(address);
    },
  );

  it.each([
    ["/private/12/filter", "?folder=12", "/rooms/shared/12/filter?folder=12"],
    [
      "/private/archived/filter",
      "?folder=12",
      "/rooms/archived/filter?folder=12",
    ],
  ])(
    "moves an ordinary room opened at %s%s to Rooms",
    (pathname, search, address) => {
      expect(decide({ pathname, search, isPrivate: false })).toBe(address);
    },
  );

  it.each([
    ["/private/12/filter", true],
    ["/rooms/shared/12/filter", false],
    ["/rooms/personal/filter", true],
    ["/forms/12/filter", true],
  ])("keeps %s when the room's privacy is %s", (pathname, isPrivate) => {
    expect(decide({ pathname, isPrivate })).toBeNull();
  });

  it.each([
    ["the section is not available", { isSectionAvailable: false }],
    ["the client runs in a frame", { isFrame: true }],
    ["the address was decided already", { isDecided: true }],
  ])("keeps the address while %s", (_, decision) => {
    expect(decide(decision)).toBeNull();
    expect(
      decide({ ...decision, pathname: "/private/12/filter", isPrivate: false }),
    ).toBeNull();
  });

  it.each(["/rooms/shared/12/filter", "/private/12/filter"])(
    "sends an ordinary room at %s to the dashboard while the Rooms app is off",
    (pathname) => {
      expect(decide({ pathname, isPrivate: false, isRoomsAppOff: true })).toBe(
        "/dashboard",
      );
    },
  );

  it("moves a private room while the Rooms app is off", () => {
    expect(decide({ isRoomsAppOff: true })).toBe(
      "/private/12/filter?folder=12",
    );
  });
});

describe("E2E rooms bookmarks", () => {
  it.each([
    ["", "/private/filter"],
    ["?section=rooms", "/private/filter"],
    ["?section=archive", "/private/archived/filter"],
  ])("/e2e-rooms%s opens %s", (search, address) => {
    expect(getPrivateAddressOfE2eRoomsAddress(search)).toBe(address);
  });
});

