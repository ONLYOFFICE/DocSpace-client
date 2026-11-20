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

vi.mock("@onlyoffice/apps-ui-kit/selectors/Files/FilesSelector.utils", () => ({
  getFilterParams: () => ({}),
}));

import { FolderType } from "@docspace/shared/enums";

import { loadFilesSelectorProps, type FilesSelectorDeps } from "./loadData";

const ROOMS_ROOT = 2;
const MY = 100;
const PRIVATE_ROOM = { id: 7001, title: "Private", roomType: 5, private: true };

const deps = {
  getFoldersTree: vi.fn(async () => [
    { id: ROOMS_ROOT, rootFolderType: FolderType.Rooms },
    { id: MY, rootFolderType: FolderType.USER },
  ]),
  getFolderPath: vi.fn(),
  getFilesSettings: vi.fn(async () => ({ extsWebEdited: [] })),
  getSettings: vi.fn(async () => ({})),
  getRooms: vi.fn(async () => ({
    folders: [],
    files: [],
    total: 0,
    current: { id: ROOMS_ROOT, rootFolderType: FolderType.Rooms },
    pathParts: [{ id: ROOMS_ROOT, title: "Rooms" }],
  })),
  getFolder: vi.fn(async (id: number) => ({
    folders: [],
    files: [],
    total: 0,
    current: { id, rootFolderType: FolderType.Rooms },
    pathParts: [{ id, title: "Folder" }],
  })),
};
const load = (id?: number) =>
  loadFilesSelectorProps(
    deps as unknown as FilesSelectorDeps,
    id === undefined ? {} : { id },
  );

describe("loadFilesSelectorProps", () => {
  beforeEach(() => {
    deps.getFolderPath.mockReset();
    deps.getFolder.mockClear();
    deps.getRooms.mockClear();
  });

  it("Private folder named to the file selector", async () => {
    deps.getFolderPath.mockResolvedValue([
      { id: ROOMS_ROOT, title: "Rooms" },
      PRIVATE_ROOM,
      { id: 7020, title: "Drafts" },
    ]);

    expect(await load(7020)).toEqual({ privateTarget: true });
    expect(await load(7001)).toEqual({ privateTarget: true });
    expect(deps.getFolder).not.toHaveBeenCalled();
  });

  it("Folder outside private rooms", async () => {
    deps.getFolderPath.mockResolvedValue([
      { id: ROOMS_ROOT, title: "Rooms" },
      { id: 50, title: "Shared", roomType: 6, private: false },
    ]);

    const props = await load(50);

    expect(props).toHaveProperty("currentFolderId", 50);
    expect(deps.getFolder).toHaveBeenCalledTimes(1);
  });

  it("Room of the folder cannot be read: nothing is listed", async () => {
    deps.getFolderPath.mockRejectedValue(new Error("403"));

    await expect(load(7020)).rejects.toThrow();
    expect(deps.getFolder).not.toHaveBeenCalled();
  });

  it("the Rooms view and a section root make no path request", async () => {
    await load();
    await load(ROOMS_ROOT);
    await load(MY);

    expect(deps.getFolderPath).not.toHaveBeenCalled();
    expect(deps.getRooms).toHaveBeenCalledTimes(2);
  });
});
