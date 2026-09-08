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

import { FolderType } from "@docspace/shared/enums";
import { ROOMS_SECTION_FOLDER_TYPES } from "@docspace/shared/utils/rooms";

import { getSectionTrashUrl } from "../articleNavigation";

const TRASH_FOLDER_ID = 2;

const parse = (url: string) => {
  const [path, search] = url.split("?");
  const params = new URLSearchParams(search);

  return {
    path,
    folder: params.get("folder"),
    folderType: params.getAll("folderType").map(Number),
  };
};

// Bug 83666: the "moved to Trash" toast links to the trash folder, which is
// the same folder for every section, so the link has to be scoped by the
// section it was raised from instead of opening the Files trash aggregate.
describe("getSectionTrashUrl", () => {
  it("opens the Rooms trash for an item deleted inside a room", () => {
    const { path, folder, folderType } = parse(
      getSectionTrashUrl(TRASH_FOLDER_ID, "/rooms/shared/12345/filter"),
    );

    expect(path).toBe("/rooms/trash/filter");
    expect(folder).toBe(String(TRASH_FOLDER_ID));
    expect(folderType).toEqual(ROOMS_SECTION_FOLDER_TYPES);
  });

  it("opens the Forms trash for an item deleted inside a form room", () => {
    const { path, folderType } = parse(
      getSectionTrashUrl(TRASH_FOLDER_ID, "/forms/12345/filter"),
    );

    expect(path).toBe("/forms/trash/filter");
    expect(folderType).toEqual([FolderType.FormRoom]);
  });

  it("opens the AI agents trash for an item deleted inside an AI room", () => {
    const { path, folderType } = parse(
      getSectionTrashUrl(TRASH_FOLDER_ID, "/ai-agents/12345/filter"),
    );

    expect(path).toBe("/ai-agents/trash/filter");
    expect(folderType).toEqual([FolderType.AIAgent]);
  });

  it("opens the My Documents trash for an item deleted in the personal section", () => {
    const { path, folderType } = parse(
      getSectionTrashUrl(TRASH_FOLDER_ID, "/rooms/personal/filter"),
    );

    expect(path).toBe("/files/trash/filter");
    expect(folderType).toEqual([FolderType.USER]);
  });
});
