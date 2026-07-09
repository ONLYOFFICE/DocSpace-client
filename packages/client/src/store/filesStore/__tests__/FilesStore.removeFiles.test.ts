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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { FileType } from "@docspace/shared/enums";

import { createTestFilesStore } from "./testHarness";
import type { TItem } from "../types";

const CTX = ["ctx"] as unknown as ReturnType<
  ReturnType<typeof createTestFilesStore>["getFilesContextOptions"]
>;

const file = (id: number): TItem =>
  ({
    id,
    parentId: 10,
    title: `f${id}.docx`,
    fileExst: ".docx",
    fileType: FileType.Document,
    viewAccessibility: {},
  }) as unknown as TItem;

const folder = (id: number): TItem =>
  ({ id, parentId: 10, title: `folder${id}`, isFolder: true } as unknown as TItem);

// removeFiles has three branches; this covers the common
// "total <= filesList.length" path that drops items from state without a
// refetch. It mutates this.files/folders/filter — assert the store reflects
// the removal and the total is decremented.
describe("FilesStore.removeFiles — characterization", () => {
  let store: ReturnType<typeof createTestFilesStore>;

  beforeEach(() => {
    store = createTestFilesStore();
    store.getFilesContextOptions = () => CTX;
    store.files = [file(1), file(2)] as never;
    store.folders = [folder(3)] as never;
    store.filter.total = 3;
  });

  it("removes the given file ids and decrements the total", () => {
    store.removeFiles([1], null, undefined, undefined);

    expect(store.files.map((f) => f.id)).toEqual([2]);
    expect(store.folders.map((f) => f.id)).toEqual([3]);
    expect(store.filter.total).toBe(2);
  });

  it("removes the given folder ids", () => {
    store.removeFiles(null, [3], undefined, undefined);

    expect(store.folders).toHaveLength(0);
    expect(store.files.map((f) => f.id)).toEqual([1, 2]);
    expect(store.filter.total).toBe(2);
  });

  it("removes files and folders together", () => {
    store.removeFiles([1, 2], [3], undefined, undefined);
    expect(store.files).toHaveLength(0);
    expect(store.folders).toHaveLength(0);
    expect(store.filter.total).toBe(0);
  });

  it("runs the showToast callback after removal", () => {
    const toast = vi.fn();
    store.removeFiles([1], null, toast, undefined);
    expect(toast).toHaveBeenCalledTimes(1);
  });

  it("no-ops when destFolderId equals the current folder", () => {
    store.removeFiles([1], null, undefined, store.selectedFolderStore.id);
    expect(store.files.map((f) => f.id)).toEqual([1, 2]); // unchanged
  });
});
