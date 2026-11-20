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

import type { TFolder } from "@docspace/shared/api/files/types";
import { FolderType } from "@docspace/shared/enums";

import { getPrivateRoomAddress } from "./private-room-address";

const room = (isPrivate: boolean) =>
  ({ id: 10, roomType: 6, private: isPrivate, rootFolderType: FolderType.Rooms }) as unknown as TFolder;
const folder = (id: number) => ({ id, title: `f${id}` }) as unknown as TFolder;

describe("getPrivateRoomAddress", () => {
  it("Folder named with a search text", async () => {
    const loadPath = vi.fn(async () => [room(true), folder(11)]);

    const address = await getPrivateRoomAddress(
      { id: 11 },
      { folder: "11", search: "secret plan", sortBy: "Title", privateRooms: "true" },
      loadPath,
    );

    expect(loadPath).toHaveBeenCalledTimes(1);
    expect(loadPath).toHaveBeenCalledWith(11);
    expect(address).toBe("/private/10?folder=11&sortBy=Title&privateRooms=true");
  });

  it("Folder named with a search text: the room itself", async () => {
    const address = await getPrivateRoomAddress(
      { id: 10 },
      { folder: "10", search: "plan" },
      async () => [room(true)],
    );

    expect(address).toBe("/private/10");
  });

  it("Room of the folder cannot be read", async () => {
    await expect(
      getPrivateRoomAddress({ id: 11 }, {}, async () => {
        throw new Error("403");
      }),
    ).rejects.toThrow();
  });

  it("Folder outside private rooms", async () => {
    expect(
      await getPrivateRoomAddress({ id: 11 }, { search: "plan" }, async () => [
        room(false),
        folder(11),
      ]),
    ).toBeNull();
  });

  it("Folder outside private rooms: a section outside the rooms needs no path", async () => {
    const loadPath = vi.fn(async () => [room(true)]);

    expect(
      await getPrivateRoomAddress(
        { id: 5, rootFolderType: FolderType.USER },
        {},
        loadPath,
      ),
    ).toBeNull();
    expect(loadPath).not.toHaveBeenCalled();
  });
});
