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

import { describe, it, expect } from "vitest";
import { FileType } from "@docspace/shared/enums";

import { createTestFilesStore } from "./testHarness";
import type { TItem } from "../types";

const file = (id: number): TItem =>
  ({
    id,
    parentId: 10,
    title: `f${id}.docx`,
    fileExst: ".docx",
    fileType: FileType.Document,
  }) as unknown as TItem;

// wsModifyFolderDelete is one of the socket handlers wired in the constructor.
// The file branch marks the file for a debounced removal (tempActionFilesIds)
// and hides pagination — assert those observable effects.
describe("FilesStore.wsModifyFolderDelete — characterization", () => {
  it("queues a deleted file for removal and hides pagination", () => {
    const store = createTestFilesStore();
    store.files = [file(1), file(2)] as never;

    store.wsModifyFolderDelete({
      type: "file",
      id: 1,
      data: JSON.stringify({ folderId: 999 }),
    } as never);

    expect(store.tempActionFilesIds).toContain(1);
    expect(store.isHidePagination).toBe(true);
  });

  it("ignores a delete for an unknown file id", () => {
    const store = createTestFilesStore();
    store.files = [file(2)] as never;

    store.wsModifyFolderDelete({
      type: "file",
      id: 404,
      data: JSON.stringify({ folderId: 999 }),
    } as never);

    expect(store.tempActionFilesIds).not.toContain(404);
  });
});
