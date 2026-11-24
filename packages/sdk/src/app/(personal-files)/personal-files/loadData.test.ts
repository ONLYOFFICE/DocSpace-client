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

import { beforeEach, describe, expect, it, vi } from "vitest";

import { FolderType } from "@docspace/shared/enums";

import { loadPersonalFilesData, type PersonalFilesDeps } from "./loadData";

const MY = 100;
const ROOMS_SECTION = { id: 2, title: "Rooms" };
const PRIVATE_ROOM = { id: 7001, title: "Private", roomType: 5, private: true };
const DRAFTS = { id: 7020, title: "Drafts" };

const deps = {
  getFoldersTree: vi.fn(async () => [
    { id: MY, rootFolderType: FolderType.USER },
    { id: 101, rootFolderType: FolderType.Favorites },
  ]),
  getFolderPath: vi.fn(),
  getFolder: vi.fn(async () => ({ files: [], folders: [], total: 0 })),
  getFilesSettings: vi.fn(async () => ({})),
  getSettings: vi.fn(async () => ({})),
  getSelf: vi.fn(async () => undefined),
};
const load = (params: Record<string, string>, canonicalize = true) =>
  loadPersonalFilesData(deps as unknown as PersonalFilesDeps, params, {
    canonicalize,
  });

describe("loadPersonalFilesData with a folder of a private room", () => {
  beforeEach(() => {
    deps.getFolderPath.mockReset();
    deps.getFolder.mockClear();
    deps.getFolderPath.mockResolvedValue([ROOMS_SECTION, PRIVATE_ROOM, DRAFTS]);
  });

  it("Folder of a private room opened in personal files: with the session cookie", async () => {
    expect(await load({ folder: "7020", privateRooms: "true" })).toEqual({
      redirectTo: "/private/7001?folder=7020&privateRooms=true",
    });
    expect(deps.getFolder).not.toHaveBeenCalled();
  });

  it("Folder of a private room opened in personal files: under OAuth", async () => {
    expect(await load({ folder: "7001", auth: "oauth" }, false)).toEqual({
      notAvailable: true,
    });
    expect(deps.getFolder).not.toHaveBeenCalled();
  });

  it("Folder named with a search text", async () => {
    expect(await load({ folder: "7020", search: "plan" })).toEqual({
      redirectTo: "/private/7001?folder=7020",
    });
    expect(deps.getFolderPath).toHaveBeenCalledTimes(1);
    expect(deps.getFolderPath).toHaveBeenCalledWith("7020");
    expect(deps.getFolder).not.toHaveBeenCalled();
  });

  it("Room of the folder cannot be read", async () => {
    deps.getFolderPath.mockRejectedValue(new Error("403"));

    expect(await load({ folder: "7020" })).toEqual({ notFound: true });
    expect(deps.getFolder).not.toHaveBeenCalled();
  });

  it("Folder outside private rooms", async () => {
    deps.getFolderPath.mockResolvedValue([
      ROOMS_SECTION,
      { id: 50, roomType: 6, private: false },
    ]);

    const result = await load({ folder: "50", search: "plan" });

    expect(result).toHaveProperty("data");
    expect(deps.getFolder).toHaveBeenCalledWith(
      "50",
      expect.objectContaining({ search: "plan" }),
    );
  });

  it("a section alias or its id makes no path request", async () => {
    await load({ folder: "@my" });
    await load({ folder: String(MY) });
    await load({});

    expect(deps.getFolderPath).not.toHaveBeenCalled();
  });
});
