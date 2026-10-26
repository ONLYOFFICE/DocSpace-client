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

import { FolderType, RoomsType } from "@docspace/shared/enums";

vi.mock("@docspace/shared/api/files", () => ({
  getFolderPath: vi.fn(async () => {
    throw new Error("a folder of the open room is never looked up");
  }),
}));

import {
  resolvePrivateDropFolder,
  splitPrivateDrop,
} from "./private-drop-zone";

const dropped = (path: string) =>
  Object.assign(new File(["x"], path.split("/").pop() || path), { path });

const OPEN = {
  folderId: 11,
  isPrivate: true,
  roomType: RoomsType.CustomRoom,
  encryptionRoomId: 10,
};

describe("private drop zone", () => {
  it("Files and folders dropped together: the files go, the folders stay out", () => {
    const notes = dropped("notes.txt");

    const { files, refusedFolders } = splitPrivateDrop([
      notes,
      dropped("/Drafts/plan.docx"),
      dropped("/Drafts/Old/plan.docx"),
    ]);

    expect(files).toEqual([notes]);
    expect(refusedFolders).toBe(true);
    expect(splitPrivateDrop([notes]).refusedFolders).toBe(false);
  });

  it("Files dropped on a folder row: they go into that folder of the same room", async () => {
    await expect(
      resolvePrivateDropFolder(OPEN, 12, FolderType.Rooms),
    ).resolves.toEqual({ ...OPEN, folderId: 12 });
    await expect(
      resolvePrivateDropFolder(OPEN, undefined, FolderType.Rooms),
    ).resolves.toEqual(OPEN);
  });
});
